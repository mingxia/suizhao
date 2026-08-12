import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { yearPhotos } from "@/db/schema";
import { getFirstSeenYear, getYearForAge } from "@/lib/age";
import { requireTimelineViewer } from "@/lib/permissions";
import { requireSession } from "@/lib/session";
import { PhotoReplacementModal } from "./photo-replacement-modal";
import { YearDetailsForm } from "./year-details-form";

export default async function PhotoDetail({ params }: { params: Promise<{ personId: string; age: string }> }) {
  const { personId, age: ageParam } = await params;
  const firstSeen = ageParam === "first-seen";
  const numericAge = firstSeen ? null : Number(ageParam);
  const session = await requireSession();
  const person = await requireTimelineViewer(personId, session.user.id);
  const photos = await (await getDb()).select().from(yearPhotos).where(eq(yearPhotos.personId, personId)).orderBy(asc(yearPhotos.year));
  const photo = photos.find((item) => firstSeen ? item.stage === "first_seen" : item.stage === "age" && item.age === numericAge);
  const index = photos.findIndex((item) => item.id === photo?.id);
  const label = firstSeen ? "初见" : `${numericAge}岁`;
  const year = firstSeen ? getFirstSeenYear(person.birthday) : getYearForAge(person.birthday, numericAge!);
  const photoPath = (item: typeof photos[number]) => item.stage === "first_seen" ? "first-seen" : String(item.age);
  const adjacentLabel = (item: typeof photos[number]) => item.stage === "first_seen" ? "上一刻" : "上一岁";
  return <main className="container"><div className="card" style={{ padding: 24 }}>
    <a href={`/persons/${personId}`}>← 返回成长页</a>
    <h1>{label} / {year}</h1>
    {photo && <>
      <img src={`/api/photos/${photo.id}/file?variant=large`} alt={`${person.name}${firstSeen ? "的初见" : `${numericAge}岁`}照片`} style={{ maxWidth: "100%", maxHeight: "70vh" }} />
      {photo.note && <p>{photo.note}</p>}
      {(photo.locationName || photo.yearHighlight) && <section className="year-details" aria-label="这一年的记忆">
        {photo.locationName && <div><span>这一年，家在哪里？</span><p>{photo.locationName}</p></div>}
        {photo.yearHighlight && <div><span>{person.type === "family" ? "这一年，家里最值得记住的事？" : "这一年，有什么值得记住？"}</span><p>{photo.yearHighlight}</p></div>}
      </section>}
      <nav>{photos[index - 1] && <a href={`/persons/${personId}/photos/${photoPath(photos[index - 1])}`}>{adjacentLabel(photos[index - 1])}</a>} {photos[index + 1] && <a href={`/persons/${personId}/photos/${photoPath(photos[index + 1])}`}>下一岁</a>}</nav>
      {person.role !== "viewer" && <YearDetailsForm photoId={photo.id} type={person.type} locationName={photo.locationName ?? ""} yearHighlight={photo.yearHighlight ?? ""} />}
    </>}
    {photo && person.role !== "viewer" && <PhotoReplacementModal personId={personId} type={person.type} stage={firstSeen ? "first_seen" : "age"} age={numericAge} note={photo.note ?? ""} takenAt={photo.takenAt?.toISOString().slice(0, 10) ?? ""} locationName={photo.locationName ?? ""} yearHighlight={photo.yearHighlight ?? ""} />}
  </div></main>;
}
