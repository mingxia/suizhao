"use client";

import { useState } from "react";

const personalYears = Array.from({ length: 5 }, (_, index) => ({
  label: `${index + 1}岁`,
  year: String(new Date().getFullYear() - 5 + index),
  image: `/images/home/hero0${index + 1}.webp`,
}));

const familyYears = [
  { label: "初见", year: "2019", image: "/images/home/hero05.webp", alt: "两个人相识的合照" },
  { label: "成家", year: "2020", image: "/images/home/hero06.webp", alt: "夫妻纪念合照" },
  { label: "三口", year: "2022", image: "/images/home/hero02.webp", alt: "一家三口的家庭照" },
  { label: "团圆", year: "2023", image: "/images/home/hero04.webp", alt: "一家人的团圆合照" },
  { label: "今年", year: "2025", image: "/images/home/hero03.webp", alt: "全家福" },
];

export function HeroAlbumSlider() {
  const [active, setActive] = useState<"person" | "family">("person");
  const isFamily = active === "family";
  const items = isFamily ? familyYears : personalYears;

  return (
    <div className="album-showcase" id="example">
      <div className="album-switch" role="tablist" aria-label="照见示例类型">
        <button role="tab" aria-selected={!isFamily} onClick={() => setActive("person")}>个人照见</button>
        <button role="tab" aria-selected={isFamily} onClick={() => setActive("family")}>家庭照见</button>
      </div>
      <div className="album-scene">
        <div className="album-frame">
          <div className="album" role="tabpanel" aria-label={isFamily ? "家庭照见示例" : "个人照见示例"}>
            <div className="album-head">
              <strong>照见</strong><span>{isFamily ? "我们家的时光长卷" : "个人与家庭的成长档案"}</span>
              <span className="album-user" aria-label={isFamily ? "我的家庭" : "我的"}>{isFamily ? "⌂  我们家" : "♙  我的"}</span>
            </div>
            <div className="year-strip">
              {items.map(({ label, year, image }, index) => (
                <article className="year-card" key={`${active}-${label}`}>
                  <strong>{label}</strong><small>{year}</small>
                  <div className={`portrait${isFamily ? " family-portrait" : ""}`} role="img" aria-label={isFamily ? familyYears[index].alt : `${label}成长照片`} style={{ backgroundImage: `url(${image})` }} />
                </article>
              ))}
              <article className="year-card pending">
                <strong>{isFamily ? "明年" : "6岁"}</strong><small>{new Date().getFullYear()}</small>
                <div className="add-photo"><b>＋</b><span>待记录</span></div>
              </article>
            </div>
            <div className="timeline">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>
            <p className="album-caption">{isFamily ? "一家人记录，一家人共创" : "一个人记录，一家人见证"}</p>
          </div>
        </div>
      </div>
      <div className="album-dots" aria-hidden="true"><i className={!isFamily ? "active" : ""} /><i className={isFamily ? "active" : ""} /></div>
    </div>
  );
}
