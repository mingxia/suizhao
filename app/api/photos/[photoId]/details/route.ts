import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { yearPhotos } from "@/db/schema";
import { PermissionError, requireTimelineEditor } from "@/lib/permissions";
import { getSession } from "@/lib/session";
import { yearDetailsSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ photoId: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ message: "请先登录" }, { status: 401 });
  const db = await getDb();
  const { photoId } = await params;
  const [photo] = await db.select({ personId: yearPhotos.personId }).from(yearPhotos).where(eq(yearPhotos.id, photoId)).limit(1);
  if (!photo) return Response.json({ message: "没有找到这一年的照片。" }, { status: 404 });
  try {
    await requireTimelineEditor(photo.personId, session.user.id);
  } catch (error) {
    if (error instanceof PermissionError) return Response.json({ message: error.message }, { status: error.code === "FORBIDDEN" ? 403 : 404 });
    throw error;
  }
  const parsed = yearDetailsSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ message: parsed.error.issues[0]?.message ?? "请检查填写内容" }, { status: 400 });
  await db.update(yearPhotos).set({ locationName: parsed.data.locationName || null, yearHighlight: parsed.data.yearHighlight || null, updatedAt: new Date() }).where(eq(yearPhotos.id, photoId));
  return Response.json({ success: true });
}
