import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { timelines } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { PersonModal } from "../person-modal";

export default async function Dashboard() {
  const session = await requireSession();
  const [person] = await (await getDb())
    .select({ id: timelines.id })
    .from(timelines)
    .where(eq(timelines.ownerId, session.user.id))
    .orderBy(desc(timelines.updatedAt))
    .limit(1);

  if (person) redirect(`/persons/${person.id}`);

  return <main className="dashboard-empty">
    <section className="dashboard-welcome" aria-labelledby="welcome-title">
      <div className="dashboard-welcome-copy">
        <p className="dashboard-eyebrow"><span aria-hidden="true" />你的故事，从这里开始</p>
        <h1 id="welcome-title">把散落的照片，<br /><em>变成看得见的时光</em></h1>
        <p className="dashboard-welcome-description">从出生那年开始，每年挑一张照片。几分钟，就能拥有一页只属于你的人生故事。</p>
        <PersonModal mode="create" className="btn dashboard-create-button">
          创建我的第一个照见 <span aria-hidden="true">→</span>
        </PersonModal>
        <p className="dashboard-create-note"><span aria-hidden="true">✓</span> 免费创建 · 随时补充 · 仅自己可见</p>
      </div>

      <div className="dashboard-preview" aria-label="个人照见效果预览">
        <div className="dashboard-preview-glow" />
        <div className="dashboard-preview-sheet">
          <div className="dashboard-preview-heading">
            <div className="dashboard-preview-avatar">你</div>
            <div><strong>我的照见</strong><small>一生 · 一年 · 一张照片</small></div>
            <span>预览</span>
          </div>
          <div className="dashboard-preview-years">
            <article><div className="dashboard-year-image dashboard-year-one" /><strong>2021</strong><small>故事开始的地方</small></article>
            <article><div className="dashboard-year-image dashboard-year-two" /><strong>2025</strong><small>慢慢长大的日子</small></article>
            <article className="dashboard-year-new"><div><b>＋</b><span>放入你的照片</span></div><strong>今年</strong><small>等待被记住</small></article>
          </div>
          <div className="dashboard-preview-line"><i /><i /><i /></div>
          <p>时间一直向前，而你的故事值得留下。</p>
        </div>
        <aside className="dashboard-preview-tip"><span aria-hidden="true">✦</span><div><strong>一年一张就够了</strong><small>不必整理全部相册，从最想留下的一张开始</small></div></aside>
      </div>
    </section>
  </main>;
}
