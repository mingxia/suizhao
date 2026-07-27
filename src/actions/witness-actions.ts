"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { witnesses, witnessMessages, yearPhotos } from "@/db/schema";
import { requirePersonOwner } from "@/lib/permissions";
import { requireSession } from "@/lib/session";
import { witnessDurationSchema, witnessMessageSchema, witnessSchema } from "@/lib/validation";
import { isWitnessActive, witnessExpiration } from "@/lib/witness-access";

export type WitnessActionState = { error?: string; token?: string; createdName?: string };

function createToken() {
  return `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function createWitness(personId: string, _: WitnessActionState, formData: FormData): Promise<WitnessActionState> {
  const session = await requireSession();
  await requirePersonOwner(personId, session.user.id);
  const parsed = witnessSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "请完整填写见证者信息。" };
  const db = await getDb();
  const [total] = await db.select({ value: count() }).from(witnesses).where(eq(witnesses.personId, personId));
  if ((total?.value ?? 0) >= 3) return { error: "免费版最多可邀请3位见证者。" };
  const token = createToken();
  const { duration, ...details } = parsed.data;
  await db.insert(witnesses).values({
    id: crypto.randomUUID(), personId, token, ...details, status: "active", expiresAt: witnessExpiration(duration), createdAt: new Date(),
  });
  revalidatePath(`/persons/${personId}`);
  return { token, createdName: parsed.data.name };
}

export async function pauseWitness(personId: string, witnessId: string) {
  const session = await requireSession();
  await requirePersonOwner(personId, session.user.id);
  await (await getDb()).update(witnesses).set({ status: "paused", pausedAt: new Date() })
    .where(and(eq(witnesses.id, witnessId), eq(witnesses.personId, personId)));
  revalidatePath(`/persons/${personId}`);
}

export async function reactivateWitness(personId: string, witnessId: string, formData: FormData) {
  const session = await requireSession();
  await requirePersonOwner(personId, session.user.id);
  const duration = witnessDurationSchema.safeParse(formData.get("duration"));
  if (!duration.success) return;
  await (await getDb()).update(witnesses).set({
    token: createToken(), status: "active", expiresAt: witnessExpiration(duration.data), pausedAt: null,
  }).where(and(eq(witnesses.id, witnessId), eq(witnesses.personId, personId)));
  revalidatePath(`/persons/${personId}`);
}

export async function deleteWitness(personId: string, witnessId: string) {
  const session = await requireSession();
  await requirePersonOwner(personId, session.user.id);
  await (await getDb()).delete(witnesses).where(and(eq(witnesses.id, witnessId), eq(witnesses.personId, personId)));
  revalidatePath(`/persons/${personId}`);
}

export type MessageActionState = { success?: boolean; error?: string };

export async function leaveWitnessMessage(_: MessageActionState, formData: FormData): Promise<MessageActionState> {
  const parsed = witnessMessageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "留言内容不正确。" };
  const db = await getDb();
  const [witness] = await db.select().from(witnesses).where(eq(witnesses.token, parsed.data.token)).limit(1);
  if (!witness || !isWitnessActive(witness) || witness.permission === "readonly") return { error: "这份成长记录目前不能留言。" };
  const yearPhotoId = parsed.data.yearPhotoId || null;
  if (yearPhotoId) {
    const [photo] = await db.select({ id: yearPhotos.id }).from(yearPhotos).where(and(eq(yearPhotos.id, yearPhotoId), eq(yearPhotos.personId, witness.personId))).limit(1);
    if (!photo) return { error: "没有找到这一年的照片。" };
  }
  await db.insert(witnessMessages).values({ id: crypto.randomUUID(), witnessId: witness.id, personId: witness.personId, yearPhotoId, content: parsed.data.content, createdAt: new Date() });
  revalidatePath(`/witness/${witness.token}`);
  return { success: true };
}
