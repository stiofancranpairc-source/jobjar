export type RagStatus = "green" | "amber" | "red";

export type TaskStatus = "pending" | "done" | "skipped";

export type TaskItem = {
  id: string;
  roomId: string;
  title: string;
  dueAt: string;
  graceHours: number;
  estimatedMinutes: number;
  status: TaskStatus;
  lastCompletedAt?: string;
};

export type Room = {
  id: string;
  name: string;
  designation: string;
};
