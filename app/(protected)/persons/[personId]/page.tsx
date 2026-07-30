import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { timelines, witnesses, witnessVisits, yearPhotos } from "@/db/schema";
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
  const [photos, ownedPersons, witnessRows, visits] = await Promise.all([
    db.select().from(yearPhotos).where(eq(yearPhotos.personId, personId)).orderBy(asc(yearPhotos.age)),
    db.select({ id: timelines.id, name: timelines.name }).from(timelines).where(eq(timelines.ownerId, session.user.id)).orderBy(desc(timelines.updatedAt)),
    db.select().from(witnesses).where(eq(witnesses.personId, personId)).orderBy(desc(witnesses.createdAt)),
    db.select().from(witnessVisits).innerJoin(witnesses, eq(witnessVisits.witnessId, witnesses.id)).where(eq(witnesses.personId, personId)).orderBy(desc(witnessVisits.visitedAt)),
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
    <div className="person-page-toolbar">
      {ownedPersons.length > 1 && <details className="person-switcher">
        <summary><span>正在查看</span><strong>{person.name}</strong><i aria-hidden="true">⌄</i></summary>
        <div className="person-switcher-menu">
          <p>切换照见</p>
          {ownedPersons.map((item) => <Link
            className={item.id === personId ? "person-switcher-link person-switcher-link-active" : "person-switcher-link"}
            href={`/persons/${item.id}`}
            key={item.id}
            aria-current={item.id === personId ? "page" : undefined}
          >
            <span>{item.name.slice(0, 1)}</span>
            <strong>{item.name}</strong>
            {item.id === personId && <small>当前</small>}
          </Link>)}
          <PersonModal mode="create" className="person-switcher-create">＋ 创建新照见</PersonModal>
        </div>
      </details>}
    </div>
    <section className="person-hero card">
      {person.coverKey
        ? <img className="person-cover" src={`/api/persons/${personId}/cover`} alt={`${person.name}的封面`} />
        : <div className="person-cover person-cover-placeholder" role="img" aria-label="尚未上传封面图"><span className="placeholder-sun" /><span className="placeholder-hills" /><span className="placeholder-tree">♧</span><small>{person.type === "family" ? "留住每一年的团圆" : "留住每一岁的光影"}</small></div>}
      <div className="person-summary">
        <h1>{person.name}</h1>
        <p>{person.birthday.getUTCFullYear()}年{person.type === "family" ? `成婚 · 携手${currentAge}年` : `出生 · ${currentAge}岁`}</p>
        <span>已记录{photos.length}年</span>
      </div>
      <div className="person-intro">
        <h2>{person.type === "family" ? "每年一张，照见团圆。" : "每岁一张，照见成长。"}</h2>
        <p>{person.type === "family" ? "从结婚照开始，每年留下一张全家福，看见家的变迁。" : "一年只留一张照片，慢慢看见一个人的一生。"}</p>
        <div className="person-hero-tools">
          <PersonModal mode="edit" className="person-settings-trigger" person={{ id: personId, type: person.type, name: person.name, nickname: person.nickname ?? "", birthday: person.birthday.toISOString().slice(0, 10), privacy: person.privacy }}>照见设置 →</PersonModal>
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
