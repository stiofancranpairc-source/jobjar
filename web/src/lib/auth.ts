import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "jobjar_session_user";

export async function getSessionUserId() {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionUserId(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function requireSessionUserId(nextPath = "/") {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return userId;
}

export async function getSessionRole() {
  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }
  const household = await prisma.household.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      members: {
        where: { userId },
        select: { role: true },
        take: 1,
      },
    },
  });
  return household?.members[0]?.role ?? null;
}

export async function requireAdmin(nextPath = "/admin") {
  await requireSessionUserId(nextPath);
  const role = await getSessionRole();
  if (role !== "admin") {
    redirect("/");
  }
}

export function getHouseholdPasscode() {
  return process.env.HOUSEHOLD_PASSCODE || "jobjar";
}
