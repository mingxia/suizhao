import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { yearPhotos } from "@/db/schema";
import { getAvailableAges, getCurrentAge, getYearForAge } from "@/lib/age";
import { requirePersonOwner } from "@/lib/permissions";
import { requireSession } from "@/lib/session";
import { PersonYears } from "./person-years";

export default async function PersonPage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const session = await requireSession();
  const person = await requirePersonOwner(personId, session.user.id);
  const photos = await (await getDb()).select().from(yearPhotos).where(eq(yearPhotos.personId, personId)).orderBy(asc(yearPhotos.age));
  const ages = getAvailableAges(person.birthday);
  const currentAge = getCurrentAge(person.birthday);
  const cards = ages.map((age) => {
    const photo = photos.find((item) => item.age === age);
    return { age, year: getYearForAge(person.birthday, age), photoId: photo?.id ?? null };
  });

  return <main className="container person-page">
    <section className="person-hero card">
      {person.coverKey
        ? <img className="person-cover" src={`/api/persons/${personId}/cover`} alt={`${person.name}的封面`} />
        : <div className="person-cover person-cover-placeholder" role="img" aria-label="尚未上传封面图"><span className="placeholder-sun" /><span className="placeholder-hills" /><span className="placeholder-tree">♧</span><small>留住每一岁的光影</small></div>}
      <div className="person-summary">
        <h1>{person.name}</h1>
        <p>{person.birthday.getUTCFullYear()}年出生 · {currentAge}岁</p>
        <span>已记录{photos.length}年</span>
      </div>
      <div className="person-intro">
        <h2>每岁一张，照见成长。</h2>
        <p>一年只留一张照片，慢慢看见一个人的一生。</p>
        <a href={`/persons/${personId}/settings`}>人物设置 →</a>
      </div>
    </section>
    {ages.length === 0
      ? <p className="empty-years">1岁照片将在第一个生日后解锁。</p>
      : <PersonYears personId={personId} personName={person.name} cards={cards} nextAge={currentAge + 1} />}
  </main>;
}
