import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { yearPhotos } from "@/db/schema";
import { getCurrentAge, getFirstSeenYear, getYearForAge } from "@/lib/age";
import { validateImageFile } from "@/lib/image-signature";
import { requirePersonOwner } from "@/lib/permissions";
import { getPhotosBucket, yearPhotoKeys } from "@/lib/r2";
import { getSession } from "@/lib/session";
import { uploadSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ personId: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ code: "UNAUTHORIZED", message: "请先登录" }, { status: 401 });
  const person = await requirePersonOwner((await params).personId, session.user.id);
  const form = await request.formData();
  const parsed = uploadSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return Response.json({ code: "INVALID_INPUT", message: "请检查上传信息" }, { status: 400 });
  const { stage } = parsed.data;
  const age = stage === "age" ? parsed.data.age! : null;
  if (age !== null && age > getCurrentAge(person.birthday)) return Response.json({ code: "AGE_LOCKED", message: "这个年龄尚未解锁" }, { status: 400 });
  const thumb = form.get("thumbnail"), large = form.get("large");
  if (!(thumb instanceof File) || !(large instanceof File)) return Response.json({ code: "INVALID_IMAGE", message: "请选择照片" }, { status: 400 });
  const thumbErr = await validateImageFile(thumb, 1024 * 1024);
  const largeErr = await validateImageFile(large, 5 * 1024 * 1024);
  if (thumbErr || largeErr) return Response.json({ code: thumbErr || largeErr, message: "图片格式或大小不符合要求" }, { status: 400 });
  const db = await getDb();
  const stageCondition = age === null ? isNull(yearPhotos.age) : eq(yearPhotos.age, age);
  const [old] = await db.select().from(yearPhotos).where(and(eq(yearPhotos.personId, person.id), eq(yearPhotos.stage, stage), stageCondition)).limit(1);
  if (old && !parsed.data.replace) return Response.json({ code: "PHOTO_EXISTS", message: "每一年只能留下一个瞬间。" }, { status: 409 });
  const bucket = await getPhotosBucket();
  const keys = yearPhotoKeys(session.user.id, person.id, stage, age);
  try {
    await bucket.put(keys.thumbnailKey, thumb.stream(), { httpMetadata: { contentType: "image/webp" } });
    await bucket.put(keys.largeKey, large.stream(), { httpMetadata: { contentType: "image/webp" } });
    const now = new Date();
    if (old) {
      await db.update(yearPhotos).set({ ...keys, mimeType: "image/webp", note: parsed.data.note || old.note, takenAt: parsed.data.takenAt, updatedAt: now }).where(eq(yearPhotos.id, old.id));
      bucket.delete(old.thumbnailKey).catch((error: unknown) => console.warn("r2_cleanup_failed", { key: old.thumbnailKey, error: String(error) }));
      bucket.delete(old.largeKey).catch((error: unknown) => console.warn("r2_cleanup_failed", { key: old.largeKey, error: String(error) }));
      return Response.json({ id: old.id, ...keys });
    }
    const id = crypto.randomUUID();
    const year = stage === "first_seen" ? getFirstSeenYear(person.birthday) : getYearForAge(person.birthday, age!);
    await db.insert(yearPhotos).values({ id, personId: person.id, stage, age, year, ...keys, mimeType: "image/webp", note: parsed.data.note || null, takenAt: parsed.data.takenAt, createdAt: now, updatedAt: now });
    return Response.json({ id, ...keys });
  } catch (error) {
    await Promise.allSettled([bucket.delete(keys.thumbnailKey), bucket.delete(keys.largeKey)]);
    console.warn("photo_upload_failed", { error: String(error) });
    return Response.json({ code: "UPLOAD_FAILED", message: "照片上传失败，请重新尝试。" }, { status: 500 });
  }
}
