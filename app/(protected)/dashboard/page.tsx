import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { persons } from "@/db/schema";
import { requireSession } from "@/lib/session";

export default async function Dashboard() {
  const session = await requireSession();
  const [person] = await (await getDb())
    .select({ id: persons.id })
    .from(persons)
    .where(eq(persons.ownerId, session.user.id))
    .orderBy(desc(persons.updatedAt))
    .limit(1);

  if (person) redirect(`/persons/${person.id}`);

  return <main className="container dashboard-empty">
    <p className="dashboard-eyebrow">我的岁照</p>
    <div className="card dashboard-empty-card">
      <h1>创建第一个人物</h1>
      <p className="muted">从一年一张照片开始，保存时间留下的样子。</p>
      <Link className="btn" href="/persons/new">创建人物</Link>
    </div>
  </main>;
}
