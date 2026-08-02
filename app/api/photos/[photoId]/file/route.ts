import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { yearPhotos } from "@/db/schema";
import { requireTimelineViewer } from "@/lib/permissions";
import { getPhotosBucket } from "@/lib/r2";
import { getSession } from "@/lib/session";
export async function GET(request:Request,{params}:{params:Promise<{photoId:string}>}){const session=await getSession();if(!session)return new Response("Unauthorized",{status:401});const {photoId}=await params;const url=new URL(request.url);const variant=url.searchParams.get("variant")==="large"?"large":"thumbnail";const [photo]=await (await getDb()).select().from(yearPhotos).where(eq(yearPhotos.id,photoId)).limit(1);if(!photo)return new Response("Not found",{status:404});await requireTimelineViewer(photo.personId,session.user.id);const row={photo};if(!row)return new Response("Not found",{status:404});const key=variant==="large"?row.photo.largeKey:row.photo.thumbnailKey;const obj=await (await getPhotosBucket()).get(key,{onlyIf:{etagDoesNotMatch:request.headers.get("if-none-match")??undefined}});if(!obj)return new Response("Not found",{status:404});if(obj instanceof Response)return obj;return new Response(obj.body,{headers:{"Content-Type":"image/webp","Cache-Control":"private, max-age=3600","ETag":obj.httpEtag,"X-Content-Type-Options":"nosniff"}})}
