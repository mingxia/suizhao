import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { persons, witnesses, witnessMessages, witnessVisits, yearPhotos } from "@/db/schema";
import { getCurrentAge } from "@/lib/age";
import { Logo } from "../../../logo";
import { WitnessMessageForm } from "./message-form";
import { WitnessVisitTracker } from "./visit-tracker";
import { isWitnessActive } from "@/lib/witness-access";

export const metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" as const };

export default async function WitnessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = await getDb();
  const [record] = await db.select({ witness: witnesses, person: persons }).from(witnesses).innerJoin(persons, eq(witnesses.personId, persons.id)).where(eq(witnesses.token, token)).limit(1);
  if (!record) notFound();
  if (!isWitnessActive(record.witness)) return <main className="witness-page witness-unavailable-page">
    <header className="witness-public-header"><Logo href="/" /><span>照见 · 家人见证</span></header>
    <section className="witness-unavailable card"><span>♡</span><p className="modal-eyebrow">FAMILY WITNESS</p><h1>这份成长记录暂时收起了</h1><p>可以联系邀请你的家人，请TA再次为你开启。</p></section>
    <footer className="witness-footer">照见 · 每岁一张，照见成长。</footer>
  </main>;
  const [photos, messages] = await Promise.all([
    db.select().from(yearPhotos).where(eq(yearPhotos.personId, record.person.id)).orderBy(asc(yearPhotos.year), asc(yearPhotos.age)),
    db.select({ message: witnessMessages, author: witnesses.name }).from(witnessMessages).innerJoin(witnesses, eq(witnessMessages.witnessId, witnesses.id)).where(eq(witnessMessages.personId, record.person.id)).orderBy(asc(witnessMessages.createdAt)),
  ]);
  const requestHeaders = await headers();
  const now = new Date();
  const visitId = crypto.randomUUID();
  await Promise.all([
    db.insert(witnessVisits).values({ id: visitId, witnessId: record.witness.id, visitedAt: now, ip: requestHeaders.get("cf-connecting-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim(), userAgent: requestHeaders.get("user-agent"), viewedYears: "[]" }),
    db.update(witnesses).set({ lastVisitedAt: now }).where(eq(witnesses.id, record.witness.id)),
  ]);
  const canComment = record.witness.permission !== "readonly";
  return <main className="witness-page">
    <WitnessVisitTracker token={token} visitId={visitId} />
    <header className="witness-public-header"><Logo href={`/witness/${token}`} /><span>一份只为你打开的成长记录</span></header>
    <section className="witness-public-hero">
      <p>家人见证 · FAMILY WITNESS</p><h1>{record.person.name}的成长记录</h1>
      <div className="witness-identity"><span>{record.witness.name.slice(0, 1)}</span><strong>{record.witness.name}</strong>正在见证{record.person.name}的成长</div>
      <small>{record.person.birthday.getUTCFullYear()}年出生 · 已走过{getCurrentAge(record.person.birthday)}年</small>
    </section>
    <section className="witness-timeline">
      {photos.length === 0 && <div className="witness-no-photos">成长的故事正在被慢慢收藏，过些时候再来看看吧。</div>}
      {photos.map((photo, index) => {
        const photoMessages = messages.filter(({ message }) => message.yearPhotoId === photo.id);
        return <article className="witness-year" key={photo.id}>
          <div className="witness-year-marker"><time>{photo.year}</time><i /><span>{photo.stage === "first_seen" ? "初见" : `${photo.age}岁`}</span></div>
          <div className="witness-memory-card">
            <img data-witness-year={photo.year} src={`/api/witness/${token}/photos/${photo.id}?variant=large`} alt={`${record.person.name}${photo.stage === "first_seen" ? "初见" : `${photo.age}岁`}的照片`} loading={index ? "lazy" : "eager"} />
            {photo.note && <p className="photo-note">{photo.note}</p>}
            {photoMessages.map(({ message, author }) => <blockquote key={message.id}><p>{message.content}</p><footer>来自{author}的祝福 ♡</footer></blockquote>)}
            {canComment && <details className="year-message"><summary>写下关于这一年的记忆</summary><WitnessMessageForm token={token} yearPhotoId={photo.id} compact /></details>}
          </div>
        </article>;
      })}
    </section>
    <section className="witness-blessing card"><span>♡</span><p className="modal-eyebrow">给{record.person.name}的一封小信</p><h2>有些话，会陪伴很久。</h2>
      {messages.filter(({ message }) => !message.yearPhotoId).map(({ message, author }) => <blockquote key={message.id}><p>{message.content}</p><footer>—— {author}</footer></blockquote>)}
      {canComment ? <WitnessMessageForm token={token} /> : <p className="muted">这是一份安静的只读成长记录。</p>}
    </section>
    <footer className="witness-footer">照见 · 每岁一张，照见成长。</footer>
  </main>;
}
