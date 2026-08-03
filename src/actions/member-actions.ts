"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { notifications, timelineActivity, timelineInvitations, timelineMembers, timelines, user, type TimelineRole } from "@/db/schema";
import { requirePersonOwner } from "@/lib/permissions";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "@/types/action-result";

type InvitableRole = "viewer" | "collaborator";
const allowedRoles = new Set<InvitableRole>(["viewer", "collaborator"]);

export async function inviteTimelineMember(timelineId: string, _: unknown, form: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const timeline = await requirePersonOwner(timelineId, session.user.id);
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const relation = String(form.get("relation") ?? "").trim();
  const role = String(form.get("role") ?? "") as InvitableRole;
  if (!email || !relation || !allowedRoles.has(role)) return { success: false, error: { code: "INVALID_INPUT", message: "请填写注册邮箱、关系和成员类型" } };
  const db = await getDb();
  const [invitee] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (!invitee) return { success: false, error: { code: "NOT_FOUND", message: "未找到使用该邮箱注册的照见用户" } };
  if (invitee.id === session.user.id) return { success: false, error: { code: "INVALID_INPUT", message: "所有者无需邀请自己" } };
  const [existing] = await db.select({ id: timelineInvitations.id }).from(timelineInvitations).where(and(eq(timelineInvitations.timelineId, timelineId), eq(timelineInvitations.inviteeUserId, invitee.id), eq(timelineInvitations.status, "pending"))).limit(1);
  if (existing) return { success: false, error: { code: "INVALID_INPUT", message: "该用户已有待处理邀请" } };
  const now = new Date(), invitationId = crypto.randomUUID();
  await db.batch([
    db.insert(timelineInvitations).values({ id: invitationId, timelineId, inviterUserId: session.user.id, inviteeUserId: invitee.id, role, relation, status: "pending", createdAt: now }),
    db.insert(notifications).values({ id: crypto.randomUUID(), userId: invitee.id, timelineId, type: "timeline_invitation", content: `${session.user.name}邀请你${role === "collaborator" ? "共同维护" : "关注"}“${timeline.name}”`, createdAt: now }),
    db.insert(timelineActivity).values({ id: crypto.randomUUID(), timelineId, userId: session.user.id, action: "invite_member", targetId: invitationId, createdAt: now }),
  ]);
  revalidatePath(`/persons/${timelineId}/settings`);
  return { success: true, data: undefined };
}

export async function respondToTimelineInvitation(invitationId: string, accept: boolean): Promise<ActionResult> {
  const session = await requireSession();
  const db = await getDb();
  const [invitation] = await db.select().from(timelineInvitations).where(and(eq(timelineInvitations.id, invitationId), eq(timelineInvitations.inviteeUserId, session.user.id), eq(timelineInvitations.status, "pending"))).limit(1);
  if (!invitation) return { success: false, error: { code: "NOT_FOUND", message: "邀请不存在或已处理" } };
  const now = new Date();
  if (!accept) await db.update(timelineInvitations).set({ status: "declined" }).where(eq(timelineInvitations.id, invitationId));
  else await db.batch([
    db.update(timelineInvitations).set({ status: "accepted", acceptedAt: now }).where(eq(timelineInvitations.id, invitationId)),
    db.insert(timelineMembers).values({ id: crypto.randomUUID(), timelineId: invitation.timelineId, userId: session.user.id, role: invitation.role, relation: invitation.relation, invitedBy: invitation.inviterUserId, status: "accepted", createdAt: now, acceptedAt: now }).onConflictDoUpdate({ target: [timelineMembers.timelineId, timelineMembers.userId], set: { role: invitation.role, relation: invitation.relation, invitedBy: invitation.inviterUserId, status: "accepted", acceptedAt: now, revokedAt: null } }),
  ]);
  revalidatePath("/my");
  return { success: true, data: undefined };
}

export async function revokeTimelineMember(timelineId: string, memberId: string): Promise<ActionResult> {
  const session = await requireSession();
  await requirePersonOwner(timelineId, session.user.id);
  await (await getDb()).update(timelineMembers).set({ status: "revoked", revokedAt: new Date() }).where(and(eq(timelineMembers.id, memberId), eq(timelineMembers.timelineId, timelineId)));
  revalidatePath(`/persons/${timelineId}/settings`);
  return { success: true, data: undefined };
}

export async function revokeTimelineMemberFromForm(timelineId: string, memberId: string): Promise<void> {
  await revokeTimelineMember(timelineId, memberId);
}
