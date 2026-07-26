"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PhotoUploadForm } from "./photos/[age]/photo-upload-form";

type YearCard = { age: number; year: number; photoId: string | null };

export function PersonYears({ personId, personName, cards, nextAge }: { personId: string; personName: string; cards: YearCard[]; nextAge: number }) {
  const [uploadAge, setUploadAge] = useState<number | null>(null);
  useEffect(() => {
    if (uploadAge === null) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setUploadAge(null);
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [uploadAge]);

  return <>
    <section className="years-grid">
      {cards.map(({ age, year, photoId }) => photoId
        ? <Link key={age} href={`/persons/${personId}/photos/${age}`} className="year-photo-card card">
            <img src={`/api/photos/${photoId}/file?variant=thumbnail`} alt={`${personName}${age}岁的照片`} loading="lazy" />
            <YearLabel age={age} year={year} />
          </Link>
        : <button key={age} type="button" className="year-photo-card year-add-card card" onClick={() => setUploadAge(age)}>
            <span className="year-add-body"><b>＋</b><span>添加这一岁的照片</span></span>
            <YearLabel age={age} year={year} />
          </button>)}
      <div className="year-photo-card year-locked-card card"><div><span aria-hidden="true">♙</span><strong>{nextAge}岁</strong><small>生日后解锁</small></div></div>
    </section>
    {uploadAge !== null && <div className="upload-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setUploadAge(null)}>
      <section className="upload-modal card" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <button type="button" className="modal-close" aria-label="关闭" onClick={() => setUploadAge(null)}>×</button>
        <p className="modal-eyebrow">{personName} · {uploadAge}岁</p>
        <h2 id="upload-title">添加这一岁的照片</h2>
        <p className="muted">选一张最能代表这一岁的照片，收藏此刻的故事。</p>
        <PhotoUploadForm personId={personId} age={uploadAge} replacing={false} onSuccess={() => setUploadAge(null)} />
      </section>
    </div>}
  </>;
}

function YearLabel({ age, year }: { age: number; year: number }) {
  return <p className="year-label"><strong>{age}岁</strong><span>/</span><time>{year}</time></p>;
}
