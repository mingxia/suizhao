"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { YearPhotoStage } from "@/db/schema/app";
import { PhotoUploadForm } from "./photos/[age]/photo-upload-form";

type YearCard = { year: number; photoId: string | null } & (
  | { stage: "first_seen"; age: null }
  | { stage: "age"; age: number }
);

export function PersonYears({ personId, personName, cards, nextAge }: { personId: string; personName: string; cards: YearCard[]; nextAge: number }) {
  const [uploadCard, setUploadCard] = useState<YearCard | null>(null);
  useEffect(() => {
    if (uploadCard === null) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setUploadCard(null);
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [uploadCard]);

  return <>
    <section className="years-grid">
      {cards.map((card) => {
        const key = card.stage === "first_seen" ? "first_seen" : `age-${card.age}`;
        const path = card.stage === "first_seen" ? "first-seen" : String(card.age);
        const description = card.stage === "first_seen" ? `${personName}的初见照片` : `${personName}${card.age}岁的照片`;
        return card.photoId
          ? <Link key={key} href={`/persons/${personId}/photos/${path}`} className="year-photo-card card">
              <img src={`/api/photos/${card.photoId}/file?variant=thumbnail`} alt={description} loading="lazy" />
              <YearLabel stage={card.stage} age={card.age} year={card.year} />
            </Link>
          : <button key={key} type="button" className="year-photo-card year-add-card card" onClick={() => setUploadCard(card)}>
              <span className="year-add-body"><b>＋</b><span>{card.stage === "first_seen" ? "添加初见照片" : "添加这一岁的照片"}</span></span>
              <YearLabel stage={card.stage} age={card.age} year={card.year} />
            </button>;
      })}
      <div className="year-photo-card year-locked-card card"><div><span aria-hidden="true">♙</span><strong>{nextAge}岁</strong><small>生日后解锁</small></div></div>
    </section>
    {uploadCard !== null && <div className="upload-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setUploadCard(null)}>
      <section className="upload-modal card" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <button type="button" className="modal-close" aria-label="关闭" onClick={() => setUploadCard(null)}>×</button>
        <p className="modal-eyebrow">{personName} · {uploadCard.stage === "first_seen" ? "初见" : `${uploadCard.age}岁`}</p>
        <h2 id="upload-title">{uploadCard.stage === "first_seen" ? "添加初见照片" : "添加这一岁的照片"}</h2>
        <p className="muted">{uploadCard.stage === "first_seen" ? "选一张第一次被记录的照片，收藏相遇的起点。" : "选一张最能代表这一岁的照片，收藏此刻的故事。"}</p>
        <PhotoUploadForm personId={personId} stage={uploadCard.stage} age={uploadCard.age} replacing={false} onSuccess={() => setUploadCard(null)} />
      </section>
    </div>}
  </>;
}

function YearLabel({ stage, age, year }: { stage: YearPhotoStage; age: number | null; year: number }) {
  return <p className="year-label"><strong>{stage === "first_seen" ? "初见" : `${age}岁`}</strong><span>/</span><time>{year}</time></p>;
}
