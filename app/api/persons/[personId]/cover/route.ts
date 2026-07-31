import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { timelines } from "@/db/schema";
import { validateImageFile } from "@/lib/image-signature";
import { requirePersonOwner } from "@/lib/permissions";
import { coverKey, getPhotosBucket } from "@/lib/r2";
import { getSession } from "@/lib/session";

export async function GET(request: Request, { params }: { params: Promise<{ personId: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const person = await requirePersonOwner((await params).personId, session.user.id);
  if (!person.coverKey) return new Response("Not found", { status: 404 });
  const object = await (await getPhotosBucket()).get(person.coverKey, { onlyIf: { etagDoesNotMatch: request.headers.get("if-none-match") ?? undefined } });
  if (!object) return new Response("Not found", { status: 404 });
  if (object instanceof Response) return object;
  return new Response(object.body, { headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=3600", "ETag": object.httpEtag, "X-Content-Type-Options": "nosniff" } });
}

export async function POST(request: Request, { params }: { params: Promise<{ personId: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ message: "请先登录" }, { status: 401 });
  const person = await requirePersonOwner((await params).personId, session.user.id);
  const cover = (await request.formData()).get("cover");
  if (!(cover instanceof File) || !cover.size) return Response.json({ message: "请选择封面图" }, { status: 400 });
  if (await validateImageFile(cover, 5 * 1024 * 1024)) return Response.json({ message: "图片格式或大小不符合要求" }, { status: 400 });

  const bucket = await getPhotosBucket();
  const key = coverKey(session.user.id, person.id);
  try {
    await bucket.put(key, cover.stream(), { httpMetadata: { contentType: "image/webp" } });
    await (await getDb()).update(timelines).set({ coverKey: key, updatedAt: new Date() }).where(eq(timelines.id, person.id));
    if (person.coverKey) bucket.delete(person.coverKey).catch((error: unknown) => console.warn("r2_cleanup_failed", { key: person.coverKey, error: String(error) }));
    return Response.json({ success: true });
  } catch (error) {
    await bucket.delete(key).catch(() => undefined);
    console.warn("cover_upload_failed", { error: String(error) });
    return Response.json({ message: "封面图上传失败，请重新尝试。" }, { status: 500 });
  }
}
