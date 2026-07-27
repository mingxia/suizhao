import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { witnesses, yearPhotos } from "@/db/schema";
import { getPhotosBucket } from "@/lib/r2";
import { isWitnessActive } from "@/lib/witness-access";

export async function GET(request: Request, { params }: { params: Promise<{ token: string; photoId: string }> }) {
  const { token, photoId } = await params;
  const [row] = await (await getDb()).select({ photo: yearPhotos, witness: witnesses }).from(yearPhotos)
    .innerJoin(witnesses, and(eq(witnesses.personId, yearPhotos.personId), eq(witnesses.token, token)))
    .where(eq(yearPhotos.id, photoId)).limit(1);
  if (!row || !isWitnessActive(row.witness)) return new Response("Not found", { status: 404 });
  const variant = new URL(request.url).searchParams.get("variant") === "large" ? "large" : "thumbnail";
  const key = variant === "large" ? row.photo.largeKey : row.photo.thumbnailKey;
  const object = await (await getPhotosBucket()).get(key, { onlyIf: { etagDoesNotMatch: request.headers.get("if-none-match") ?? undefined } });
  if (!object) return new Response("Not found", { status: 404 });
  if (object instanceof Response) return object;
  return new Response(object.body, { headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", ETag: object.httpEtag, "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" } });
}
