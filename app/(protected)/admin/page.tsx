import { count, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { timelines, user, yearPhotos } from "@/db/schema";
import { requireSession } from "@/lib/session";

const metricDetails = [
  { key: "freeUsers", label: "免费用户数", description: "当前使用免费方案的注册用户", icon: "人" },
  { key: "lifetimeUsers", label: "终身会员数", description: "已开通终身会员的用户", icon: "会" },
  { key: "personTimelines", label: "个人照见数", description: "所有用户创建的个人照见", icon: "照" },
  { key: "familyTimelines", label: "家庭照见数", description: "所有用户创建的家庭照见", icon: "家" },
  { key: "photos", label: "上传照片数", description: "目前保存的全部成长照片", icon: "片" },
] as const;

export default async function AdminDashboard() {
  const session = await requireSession();
  if (!session.user.isAdmin) notFound();

  const db = await getDb();
  const [[freeUsers], [lifetimeUsers], [personTimelines], [familyTimelines], [photos]] = await Promise.all([
    db.select({ value: count() }).from(user).where(eq(user.membership, "free")),
    db.select({ value: count() }).from(user).where(eq(user.membership, "lifetime")),
    db.select({ value: count() }).from(timelines).where(eq(timelines.type, "person")),
    db.select({ value: count() }).from(timelines).where(eq(timelines.type, "family")),
    db.select({ value: count() }).from(yearPhotos),
  ]);
  const metrics = {
    freeUsers: freeUsers.value,
    lifetimeUsers: lifetimeUsers.value,
    personTimelines: personTimelines.value,
    familyTimelines: familyTimelines.value,
    photos: photos.value,
  };

  return <main className="container admin-dashboard">
    <header className="admin-heading">
      <div>
        <p className="dashboard-eyebrow">ADMIN OVERVIEW</p>
        <h1>系统大屏</h1>
        <p>一览照见的用户与内容数据。</p>
      </div>
      <span className="admin-live-badge"><i /> 实时数据</span>
    </header>
    <section className="admin-metric-grid" aria-label="系统数据概览">
      {metricDetails.map((metric) => <article className="card admin-metric-card" key={metric.key}>
        <div className="admin-metric-icon" aria-hidden="true">{metric.icon}</div>
        <p>{metric.label}</p>
        <strong>{metrics[metric.key].toLocaleString("zh-CN")}</strong>
        <small>{metric.description}</small>
      </article>)}
    </section>
  </main>;
}
