"use client";

import { useEffect } from "react";

const REQUIRED_VISIBLE_MS = 1_500;

/** Records a year only after its memory card has genuinely stayed in view. */
export function WitnessVisitTracker({ token, visitId }: { token: string; visitId: string }) {
  useEffect(() => {
    const reported = new Set<number>();
    const timers = new Map<Element, number>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const year = Number((entry.target as HTMLElement).dataset.witnessYear);
        const existing = timers.get(entry.target);
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && Number.isInteger(year) && !reported.has(year) && existing === undefined) {
          const timer = window.setTimeout(async () => {
            timers.delete(entry.target);
            if (reported.has(year)) return;
            reported.add(year);
            try {
              const response = await fetch(`/api/witness/${token}/visits/${visitId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year }),
                keepalive: true,
              });
              if (!response.ok) reported.delete(year);
            } catch {
              reported.delete(year);
            }
          }, REQUIRED_VISIBLE_MS);
          timers.set(entry.target, timer);
        } else if ((!entry.isIntersecting || entry.intersectionRatio < 0.6) && existing !== undefined) {
          window.clearTimeout(existing);
          timers.delete(entry.target);
        }
      }
    }, { threshold: [0, 0.6] });
    const cards = document.querySelectorAll<HTMLElement>("[data-witness-year]");
    cards.forEach((card) => observer.observe(card));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [token, visitId]);
  return null;
}
