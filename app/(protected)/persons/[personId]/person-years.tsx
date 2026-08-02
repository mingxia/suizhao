"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { YearPhotoStage } from "@/db/schema/app";
import { PhotoUploadForm } from "./photos/[age]/photo-upload-form";

type YearCard = { year: number; photoId: string | null; note: string | null; takenAt: string | null } & (
  | { stage: "first_seen"; age: null }
  | { stage: "age"; age: number }
);

export function PersonYears({ personId, personName, type, cards, nextYear, canEdit = true }: { personId: string; personName: string; type: "person" | "family"; cards: YearCard[]; nextYear: number; canEdit?: boolean }) {
  const [viewCard, setViewCard] = useState<YearCard | null>(null);
  const [uploadCard, setUploadCard] = useState<YearCard | null>(null);
  const modalOpen = viewCard !== null || uploadCard !== null;

  useEffect(() => {
    if (!modalOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") uploadCard ? setUploadCard(null) : closeViewer();
      if (!uploadCard && event.key === "ArrowLeft") moveViewer(-1);
      if (!uploadCard && event.key === "ArrowRight") moveViewer(1);
    };
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  });

  useEffect(() => {
    const closeOnBack = () => setViewCard(null);
    window.addEventListener("popstate", closeOnBack);
    return () => window.removeEventListener("popstate", closeOnBack);
  }, []);

  function pathFor(card: YearCard) {
    return card.stage === "first_seen" ? "first-seen" : String(card.age);
  }

  function openViewer(card: YearCard) {
    window.history.pushState({ photoViewer: true }, "", `/persons/${personId}/photos/${pathFor(card)}`);
    setViewCard(card);
  }

  function closeViewer() {
    if (viewCard && window.history.state?.photoViewer) window.history.back();
    else setViewCard(null);
  }

  function finishUpload() {
    setUploadCard(null);
    if (viewCard && window.history.state?.photoViewer) window.history.back();
    else setViewCard(null);
  }

  function moveViewer(direction: -1 | 1) {
    if (!viewCard) return;
    const photos = cards.filter((card) => card.photoId);
    const next = photos[photos.findIndex((card) => card.photoId === viewCard.photoId) + direction];
    if (!next) return;
    window.history.replaceState({ photoViewer: true }, "", `/persons/${personId}/photos/${pathFor(next)}`);
    setViewCard(next);
  }

  return <>
    <section className="years-grid">
      {cards.map((card) => {
        const key = card.stage === "first_seen" ? "first_seen" : `age-${card.age}`;
        const description = type === "family" ? `${personName}${card.stage === "first_seen" ? "的结婚照" : `成婚第${card.age}年的全家福`}` : card.stage === "first_seen" ? `${personName}的初见照片` : `${personName}${card.age}岁的照片`;
        return card.photoId
          ? <Link key={key} href={`/persons/${personId}/photos/${pathFor(card)}`} className="year-photo-card card" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); openViewer(card); }}>
              <img src={`/api/photos/${card.photoId}/file?variant=thumbnail`} alt={description} loading="lazy" />
              <YearLabel stage={card.stage} age={card.age} year={card.year} type={type} />
            </Link>
          : canEdit ? <button key={key} type="button" className="year-photo-card year-add-card card" onClick={() => setUploadCard(card)}>
              <span className="year-add-body"><b>＋</b><span>{type === "family" ? card.stage === "first_seen" ? "添加结婚照" : "添加这一年的全家福" : card.stage === "first_seen" ? "添加初见照片" : "添加这一岁的照片"}</span></span>
              <YearLabel stage={card.stage} age={card.age} year={card.year} type={type} />
            </button> : null;
      })}
      <div className="year-photo-card year-locked-card card"><div><span aria-hidden="true">♙</span><strong>{nextYear}年</strong><small>待解锁</small></div></div>
    </section>

    {viewCard?.photoId && <div className="photo-viewer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeViewer()}>
      <section className="photo-viewer" role="dialog" aria-modal="true" aria-labelledby="photo-viewer-title">
        <button type="button" className="photo-viewer-close" aria-label="关闭照片" onClick={closeViewer}>×</button>
        <button type="button" className="photo-viewer-arrow photo-viewer-previous" aria-label="上一张照片" onClick={() => moveViewer(-1)}>‹</button>
        <div className="photo-viewer-image-wrap"><img src={`/api/photos/${viewCard.photoId}/file?variant=large`} alt={type === "family" ? `${personName}${viewCard.stage === "first_seen" ? "的结婚照" : "的全家福"}` : `${personName}${viewCard.stage === "first_seen" ? "的初见" : `${viewCard.age}岁`}照片`} /></div>
        <div className="photo-viewer-caption">
          <div><p className="modal-eyebrow">{personName} · {type === "family" ? "家庭相册" : "成长相册"}</p><h2 id="photo-viewer-title">{type === "family" ? viewCard.stage === "first_seen" ? "结婚照" : `第${viewCard.age}年` : viewCard.stage === "first_seen" ? "初见" : `${viewCard.age}岁`} <span>/ {viewCard.year}</span></h2>{viewCard.note && <p className="photo-viewer-note">{viewCard.note}</p>}</div>
          {canEdit && <button type="button" className="photo-manage-button" onClick={() => setUploadCard(viewCard)}>替换照片</button>}
        </div>
        <button type="button" className="photo-viewer-arrow photo-viewer-next" aria-label="下一张照片" onClick={() => moveViewer(1)}>›</button>
      </section>
    </div>}

    {uploadCard !== null && <div className="upload-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setUploadCard(null)}>
      <section className="upload-modal card" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <button type="button" className="modal-close" aria-label="关闭" onClick={() => setUploadCard(null)}>×</button>
        <p className="modal-eyebrow">{personName} · {type === "family" ? uploadCard.stage === "first_seen" ? "结婚照" : `第${uploadCard.age}年` : uploadCard.stage === "first_seen" ? "初见" : `${uploadCard.age}岁`}</p>
        <h2 id="upload-title">{uploadCard.photoId ? "替换这张照片" : type === "family" ? uploadCard.stage === "first_seen" ? "添加结婚照" : "添加这一年的全家福" : uploadCard.stage === "first_seen" ? "添加初见照片" : "添加这一岁的照片"}</h2>
        <p className="muted">{uploadCard.photoId ? "选择新照片后，当前照片将被替换；原有日期和故事已为你保留。" : uploadCard.stage === "first_seen" ? "选一张第一次被记录的照片，收藏相遇的起点。" : "选一张最能代表这一岁的照片，收藏此刻的故事。"}</p>
        <PhotoUploadForm personId={personId} stage={uploadCard.stage} age={uploadCard.age} replacing={Boolean(uploadCard.photoId)} defaultNote={uploadCard.note ?? ""} defaultTakenAt={uploadCard.takenAt ?? ""} onSuccess={finishUpload} />
      </section>
    </div>}
  </>;
}

function YearLabel({ stage, age, year, type }: { stage: YearPhotoStage; age: number | null; year: number; type: "person" | "family" }) {
  return <p className="year-label"><strong>{type === "family" ? stage === "first_seen" ? "结婚照" : `第${age}年` : stage === "first_seen" ? "初见" : `${age}岁`}</strong><span>/</span><time>{year}</time></p>;
}
