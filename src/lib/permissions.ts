import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { timelineMembers, timelines, type TimelineRole } from "@/db/schema";

export class PermissionError extends Error {
  constructor(public code: "NOT_FOUND" | "FORBIDDEN", message: string) { super(message); }
}

export async function getTimelineAccess(timelineId: string, userId: string) {
  const db = await getDb();
  const [timeline] = await db.select().from(timelines).where(eq(timelines.id, timelineId)).limit(1);
  if (!timeline) return null;
  if (timeline.ownerId === userId) return { timeline, role: "owner" as const };
  const [membership] = await db.select().from(timelineMembers).where(and(
    eq(timelineMembers.timelineId, timelineId), eq(timelineMembers.userId, userId), eq(timelineMembers.status, "accepted"),
  )).limit(1);
  return membership ? { timeline, role: membership.role } : null;
}

export async function requireTimelineRole(timelineId: string, userId: string, roles: readonly TimelineRole[]) {
  const access = await getTimelineAccess(timelineId, userId);
  if (!access) throw new PermissionError("NOT_FOUND", "照见不存在或你无权访问");
  if (!roles.includes(access.role)) throw new PermissionError("FORBIDDEN", "当前成员角色无权执行此操作");
  return { ...access.timeline, role: access.role };
}

export const requireTimelineViewer = (id: string, userId: string) => requireTimelineRole(id, userId, ["owner", "collaborator", "viewer"]);
export const requireTimelineEditor = (id: string, userId: string) => requireTimelineRole(id, userId, ["owner", "collaborator"]);
export const requirePersonOwner = (id: string, userId: string) => requireTimelineRole(id, userId, ["owner"]);
