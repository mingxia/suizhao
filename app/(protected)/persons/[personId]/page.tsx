import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { familyMembers, timelines, witnesses, witnessVisits, yearPhotos } from "@/db/schema";
import { getAvailableAges, getCurrentAge, getFirstSeenYear, getYearForAge } from "@/lib/age";
import { requirePersonOwner } from "@/lib/permissions";
import { requireSession } from "@/lib/session";
import { PersonYears } from "./person-years";
import { PersonModal } from "../../person-modal";
import { WitnessPanel } from "./witness-panel";
import { isWitnessActive } from "@/lib/witness-access";

export default async function PersonPage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const session = await requireSession();
  const person = await requirePersonOwner(personId, session.user.id);
  const db = await getDb();
  const [photos, ownedPersons, witnessRows, visits, linkedMembers] = await Promise.all([
    db.select().from(yearPhotos).where(eq(yearPhotos.personId, personId)).orderBy(asc(yearPhotos.age)),
    db.select({ id: timelines.id, name: timelines.name, birthday: timelines.birthday, coverKey: timelines.coverKey, type: timelines.type, updatedAt: timelines.updatedAt }).from(timelines).where(eq(timelines.ownerId, session.user.id)).orderBy(desc(timelines.updatedAt)),
    db.select().from(witnesses).where(eq(witnesses.personId, personId)).orderBy(desc(witnesses.createdAt)),
    db.select().from(witnessVisits).innerJoin(witnesses, eq(witnessVisits.witnessId, witnesses.id)).where(eq(witnesses.personId, personId)).orderBy(desc(witnessVisits.visitedAt)),
    db.select({ id: timelines.id, name: timelines.name }).from(familyMembers).innerJoin(timelines, eq(familyMembers.personId, timelines.id)).where(eq(familyMembers.familyId, personId)),
  ]);
  const ages = getAvailableAges(person.birthday);
  const currentAge = getCurrentAge(person.birthday);
  const firstSeenPhoto = photos.find((item) => item.stage === "first_seen");
  const cards = [
    { stage: "first_seen" as const, age: null, year: getFirstSeenYear(person.birthday), photoId: firstSeenPhoto?.id ?? null, note: firstSeenPhoto?.note ?? null, takenAt: firstSeenPhoto?.takenAt?.toISOString().slice(0, 10) ?? null },
    ...ages.map((age) => {
      const photo = photos.find((item) => item.stage === "age" && item.age === age);
      return { stage: "age" as const, age, year: getYearForAge(person.birthday, age), photoId: photo?.id ?? null, note: photo?.note ?? null, takenAt: photo?.takenAt?.toISOString().slice(0, 10) ?? null };
    }),
  ];

  return <main className="container person-page">
    <section className="person-hero card">
      {person.coverKey
        ? <img className="person-cover" src={`/api/persons/${personId}/cover?v=${person.updatedAt.getTime()}`} alt={`${person.name}的封面`} />
        : <div className="person-cover person-cover-placeholder" role="img" aria-label="尚未上传封面图"><span className="placeholder-sun" /><span className="placeholder-hills" /><span className="placeholder-tree">♧</span><small>{person.type === "family" ? "留住每一年的团圆" : "留住每一岁的光影"}</small></div>}
      <div className="person-summary">
        <details className="timeline-switcher">
          <summary aria-label={`选择当前照见对象，当前为${person.name}`}>
            <h1>{person.name}</h1><i aria-hidden="true" />
          </summary>
          <div className="timeline-switcher-menu">
            <p>我的照见</p>
            <div className="timeline-switcher-list">
              {ownedPersons.map((item) => {
                const itemAge = getCurrentAge(item.birthday);
                return <Link
                  className={item.id === personId ? "timeline-switcher-card timeline-switcher-card-active" : "timeline-switcher-card"}
                  href={`/persons/${item.id}`}
                  key={item.id}
                  aria-current={item.id === personId ? "page" : undefined}
                >
                  {item.coverKey
                    ? <img src={`/api/persons/${item.id}/cover?v=${item.updatedAt.getTime()}`} alt="" />
                    : <span className="timeline-switcher-thumbnail" aria-hidden="true">{item.name.slice(0, 1)}</span>}
                  <span className="timeline-switcher-card-copy">
                    <strong>{item.name}</strong>
                    <small>{item.birthday.getUTCFullYear()}年{item.type === "family" ? `成婚 · 携手${itemAge}年` : `出生 · ${itemAge}岁`}</small>
                  </span>
                  {item.id === personId && <span className="timeline-switcher-check" aria-label="当前照见">✓</span>}
                </Link>;
              })}
            </div>
            <PersonModal mode="create" associationOptions={ownedPersons.filter((item) => item.type === "person")} className="timeline-switcher-create">＋ 创建新的照见</PersonModal>
          </div>
        </details>
        <p>{person.birthday.getUTCFullYear()}年{person.type === "family" ? `成婚 · 携手${currentAge}年` : `出生 · ${currentAge}岁`}</p>
        <span>已记录{photos.length}年</span>
        {person.type === "family" && linkedMembers.length > 0 && <nav className="family-member-links" aria-label="家庭关联人物">{linkedMembers.map((member) => <Link href={`/persons/${member.id}`} key={member.id}>@{member.name}</Link>)}</nav>}
      </div>
      <div className="person-intro">
        <h2>{person.type === "family" ? "每年一张，照见团圆。" : "每岁一张，照见成长。"}</h2>
        <p>{person.type === "family" ? "从结婚照开始，每年留下一张全家福，看见家的变迁。" : "一年只留一张照片，慢慢看见一个人的一生。"}</p>
        <div className="person-hero-tools">
          <PersonModal mode="edit" associationOptions={ownedPersons.filter((item) => item.type === "person")} className="person-settings-trigger" person={{ id: personId, type: person.type, name: person.name, nickname: person.nickname ?? "", birthday: person.birthday.toISOString().slice(0, 10), privacy: person.privacy, hasCover: Boolean(person.coverKey), memberIds: linkedMembers.map((member) => member.id) }}>照见设置 →</PersonModal>
          <WitnessPanel personId={personId} personName={person.name} visitCount={visits.length} items={witnessRows.map((witness) => {
            const visit = visits.find((row) => row.witness_visits.witnessId === witness.id)?.witness_visits;
            return { id: witness.id, name: witness.name, relation: witness.relation, permission: witness.permission, token: witness.token, status: isWitnessActive(witness) ? "active" as const : "paused" as const, expiresAt: witness.expiresAt?.toISOString() ?? null, lastVisitedAt: witness.lastVisitedAt?.toISOString() ?? null, viewedYears: visit ? JSON.parse(visit.viewedYears) as number[] : [] };
          })} />
        </div>
      </div>
    </section>
    <PersonYears personId={personId} personName={person.name} type={person.type} cards={cards} nextYear={new Date().getUTCFullYear() + 1} />
  </main>;
}
