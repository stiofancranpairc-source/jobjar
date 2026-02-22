import { PrismaClient, RecurrenceType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "owner@jobjar.app" },
    update: {},
    create: {
      email: "owner@jobjar.app",
      displayName: "House Admin",
    },
  });

  const existingHousehold = await prisma.household.findFirst({
    where: {
      ownerUserId: owner.id,
      name: "Demo Household",
    },
    include: { rooms: true },
  });

  const household =
    existingHousehold ??
    (await prisma.household.create({
      data: {
        name: "Demo Household",
        timezone: "Europe/Dublin",
        ownerUserId: owner.id,
        members: {
          create: {
            userId: owner.id,
            role: "admin",
          },
        },
        rooms: {
          create: [
            { name: "Kitchen", designation: "Food + surfaces", sortOrder: 1 },
            { name: "Living Room", designation: "Shared comfort space", sortOrder: 2 },
            { name: "Garden", designation: "Outdoor maintenance", sortOrder: 3 },
          ],
        },
      },
      include: { rooms: true },
    }));

  const kitchen = household.rooms.find((room) => room.name === "Kitchen");
  const livingRoom = household.rooms.find((room) => room.name === "Living Room");
  const garden = household.rooms.find((room) => room.name === "Garden");

  if (!kitchen || !livingRoom || !garden) {
    throw new Error("Expected seed rooms are missing");
  }
  const now = new Date();

  const taskDefs = [
    {
      roomId: kitchen.id,
      title: "Mop floors",
      estimatedMinutes: 20,
      recurrenceType: RecurrenceType.weekly,
      daysOfWeek: [6],
      timeOfDay: "18:00",
    },
    {
      roomId: livingRoom.id,
      title: "Hoover rug",
      estimatedMinutes: 15,
      recurrenceType: RecurrenceType.weekly,
      daysOfWeek: [0, 3],
      timeOfDay: "12:00",
    },
    {
      roomId: garden.id,
      title: "Water plants",
      estimatedMinutes: 10,
      recurrenceType: RecurrenceType.daily,
      daysOfWeek: [],
      timeOfDay: "08:00",
    },
  ];

  for (const entry of taskDefs) {
    const existingTask = await prisma.task.findFirst({
      where: {
        roomId: entry.roomId,
        title: entry.title,
      },
    });
    if (existingTask) {
      continue;
    }

    const task = await prisma.task.create({
      data: {
        roomId: entry.roomId,
        title: entry.title,
        estimatedMinutes: entry.estimatedMinutes,
        graceHours: 12,
        schedule: {
          create: {
            recurrenceType: entry.recurrenceType,
            daysOfWeek: entry.daysOfWeek,
            timeOfDay: entry.timeOfDay,
            nextDueAt: now,
          },
        },
      },
    });

    await prisma.taskOccurrence.create({
      data: {
        taskId: task.id,
        dueAt: now,
        status: "pending",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
