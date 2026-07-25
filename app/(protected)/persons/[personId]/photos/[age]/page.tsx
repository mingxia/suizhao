import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { yearPhotos } from "@/db/schema";
import { getYearForAge } from "@/lib/age";
import { requirePersonOwner } from "@/lib/permissions";
import { requireSession } from "@/lib/session";
export default async function PhotoDetail({params}:{params:Promise<{personId:string;age:string}>}){const {personId,age}=await params;const s=await requireSession();const person=await requirePersonOwner(personId,s.user.id);const photos=await (await getDb()).select().from(yearPhotos).where(eq(yearPhotos.personId,personId)).orderBy(asc(yearPhotos.age));const photo=photos.find(p=>p.age===Number(age));const idx=photos.findIndex(p=>p.age===Number(age));return <main className="container"><div className="card" style={{padding:24}}><h1>{age}岁 / {getYearForAge(person.birthday,Number(age))}</h1>{photo?<><img src={`/api/photos/${photo.id}/file?variant=large`} alt={`${person.name}${age}岁的照片`} style={{maxWidth:"100%",maxHeight:"70vh"}}/><p>{photo.note}</p><nav>{photos[idx-1]&&<a href={`/persons/${personId}/photos/${photos[idx-1].age}`}>上一岁</a>} {photos[idx+1]&&<a href={`/persons/${personId}/photos/${photos[idx+1].age}`}>下一岁</a>}</nav><p className="muted">替换照片前提示：每一年只能留下一个瞬间。确定用这张照片替换原来的照片吗？</p></>:<p>添加这一岁的照片</p>}</div></main>}
