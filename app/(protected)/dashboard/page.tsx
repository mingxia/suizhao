import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { persons, yearPhotos } from "@/db/schema";
import { getCurrentAge } from "@/lib/age";
import { requireSession } from "@/lib/session";
export default async function Dashboard(){const s=await requireSession();const rows=await (await getDb()).select({person:persons,photos:count(yearPhotos.id)}).from(persons).leftJoin(yearPhotos,eq(persons.id,yearPhotos.personId)).where(eq(persons.ownerId,s.user.id)).groupBy(persons.id).orderBy(desc(persons.updatedAt));return <main className="container"><h1>我的成长页面</h1>{rows.length===0?<div className="card" style={{padding:32}}><h2>创建第一个成长页面。</h2><p className="muted">从一年一张照片开始，保存时间留下的样子。</p><Link className="btn" href="/persons/new">创建人物</Link></div>:<div className="grid">{rows.map(({person,photos})=><Link className="card" style={{padding:20,textDecoration:"none",color:"inherit"}} href={`/persons/${person.id}`} key={person.id}><h2>{person.name}</h2><p className="muted">{getCurrentAge(person.birthday)}岁 · 已记录{photos}年</p></Link>)}</div>}</main>}
