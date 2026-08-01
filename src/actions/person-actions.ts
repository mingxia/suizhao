"use server";

import { and, count, eq, inArray, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { familyMembers, timelines, user, yearPhotos } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { getLatestAvailableAge } from "@/lib/age";
import { timelineSchema } from "@/lib/validation";
import { requirePersonOwner } from "@/lib/permissions";
import type { ActionResult } from "@/types/action-result";

export async function createPerson(_: unknown, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = timelineSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: { code: "INVALID_INPUT", message: "请检查照见资料" } };

  const db = await getDb();
  const memberIds = [...new Set(formData.getAll("memberIds").filter((value): value is string => typeof value === "string" && value.length > 0))];
  const [account] = await db
    .select({ membership: user.membership, timelineCount: count(timelines.id) })
    .from(user)
    .leftJoin(timelines, eq(timelines.ownerId, user.id))
    .where(eq(user.id, session.user.id))
    .groupBy(user.id)
    .limit(1);
  if (!account) return { success: false, error: { code: "UNAUTHORIZED", message: "登录状态无效，请重新登录" } };
  if (parsed.data.type === "family" && account.membership !== "lifetime") {
    return { success: false, error: { code: "MEMBERSHIP_LIMIT", message: "只有终身会员才能创建家庭照见。" } };
  }
  if (parsed.data.type === "family") {
    const [families] = await db
      .select({ count: count(timelines.id) })
      .from(timelines)
      .where(and(eq(timelines.ownerId, session.user.id), eq(timelines.type, "family")));
    if ((families?.count ?? 0) >= 1) {
      return { success: false, error: { code: "MEMBERSHIP_LIMIT", message: "每位终身会员只能创建一个家庭照见。" } };
    }
  }
  if (account.membership === "free" && account.timelineCount >= 1) {
    return { success: false, error: { code: "MEMBERSHIP_LIMIT", message: "免费会员只能创建一个个人照见，升级终身会员后可创建家庭照见及更多照见。" } };
  }

  if (parsed.data.type === "family" && !(await areOwnedPersonalTimelines(db, memberIds, session.user.id))) {
    return { success: false, error: { code: "INVALID_INPUT", message: "关联人物中包含无效的个人照见，请重新选择。" } };
  }

  const now = new Date();
  const id = crypto.randomUUID();
  await db.insert(timelines).values({ id, ownerId: session.user.id, ...parsed.data, nickname: parsed.data.nickname || null, createdAt: now, updatedAt: now });
  if (parsed.data.type === "family" && memberIds.length) await db.insert(familyMembers).values(memberIds.map((personId) => ({ familyId: id, personId, createdAt: now })));
  revalidatePath("/dashboard");
  return { success: true, data: { id } };
}

export async function updatePerson(personId: string, formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const person = await requirePersonOwner(personId, session.user.id);
  // Timeline type is immutable after creation, so edit forms cannot turn a personal timeline into a family timeline.
  formData.set("type", person.type);
  const parsed = timelineSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: { code: "INVALID_INPUT", message: "请检查照见资料" } };
  const db = await getDb();
  const memberIds = [...new Set(formData.getAll("memberIds").filter((value): value is string => typeof value === "string" && value.length > 0))];
  if (person.type === "family" && !(await areOwnedPersonalTimelines(db, memberIds, session.user.id))) return { success: false, error: { code: "INVALID_INPUT", message: "关联人物中包含无效的个人照见，请重新选择。" } };
  const [highest] = await db.select({ age: max(yearPhotos.age) }).from(yearPhotos).where(eq(yearPhotos.personId, personId));
  if ((highest?.age ?? 0) > getLatestAvailableAge(parsed.data.birthday)) return { success: false, error: { code: "INVALID_INPUT", message: `修改后的${person.type === "family" ? "结婚" : "出生"}日期与现有年份照片不一致，请先处理相关照片。` } };
  await db.update(timelines).set({ ...parsed.data, nickname: parsed.data.nickname || null, updatedAt: new Date() }).where(eq(timelines.id, personId));
  if (person.type === "family") {
    await db.delete(familyMembers).where(eq(familyMembers.familyId, personId));
    if (memberIds.length) await db.insert(familyMembers).values(memberIds.map((linkedPersonId) => ({ familyId: personId, personId: linkedPersonId, createdAt: new Date() })));
  }
  revalidatePath(`/persons/${personId}`);
  return { success: true, data: undefined };
}

async function areOwnedPersonalTimelines(db: Awaited<ReturnType<typeof getDb>>, ids: string[], ownerId: string) {
  if (!ids.length) return true;
  const rows = await db.select({ id: timelines.id }).from(timelines).where(and(eq(timelines.ownerId, ownerId), eq(timelines.type, "person"), inArray(timelines.id, ids)));
  return rows.length === ids.length;
}

export async function createPersonFromForm(formData: FormData): Promise<void> { await createPerson(undefined, formData); }
export async function updatePersonFromForm(personId: string, formData: FormData): Promise<void> { await updatePerson(personId, formData); }
