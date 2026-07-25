import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { yearPhotos } from "@/db/schema";
import { getYearForAge } from "@/lib/age";
import { requirePersonOwner } from "@/lib/permissions";
import { requireSession } from "@/lib/session";
import { PhotoUploadForm } from "./photo-upload-form";
export default async function PhotoDetail({params}:{params:Promise<{personId:string;age:string}>}){const {personId,age}=await params;const numericAge=Number(age);const s=await requireSession();const person=await requirePersonOwner(personId,s.user.id);const photos=await (await getDb()).select().from(yearPhotos).where(eq(yearPhotos.personId,personId)).orderBy(asc(yearPhotos.age));const photo=photos.find(p=>p.age===numericAge);const idx=photos.findIndex(p=>p.age===numericAge);return <main className="container"><div className="card" style={{padding:24}}><a href={`/persons/${personId}`}>← 返回成长页</a><h1>{age}岁 / {getYearForAge(person.birthday,numericAge)}</h1>{photo&&<><img src={`/api/photos/${photo.id}/file?variant=large`} alt={`${person.name}${age}岁的照片`} style={{maxWidth:"100%",maxHeight:"70vh"}}/>{photo.note&&<p>{photo.note}</p>}<nav>{photos[idx-1]&&<a href={`/persons/${personId}/photos/${photos[idx-1].age}`}>上一岁</a>} {photos[idx+1]&&<a href={`/persons/${personId}/photos/${photos[idx+1].age}`}>下一岁</a>}</nav></>}<h2>{photo?"替换这一岁的照片":"添加这一岁的照片"}</h2><PhotoUploadForm personId={personId} age={numericAge} replacing={Boolean(photo)}/></div></main>}
