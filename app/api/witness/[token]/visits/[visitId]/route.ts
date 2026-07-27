import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { witnesses, witnessVisits, yearPhotos } from "@/db/schema";
import { isWitnessActive } from "@/lib/witness-access";

const viewedYearSchema = z.object({ year: z.number().int().min(1900).max(3000) });

export async function POST(request: Request, { params }: { params: Promise<{ token: string; visitId: string }> }) {
  const parsed = viewedYearSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: "浏览记录不正确" }, { status: 400 });
  const { token, visitId } = await params;
  const db = await getDb();
  const [record] = await db.select({ visit: witnessVisits, personId: witnesses.personId, witness: witnesses }).from(witnessVisits)
    .innerJoin(witnesses, and(eq(witnessVisits.witnessId, witnesses.id), eq(witnesses.token, token)))
    .where(eq(witnessVisits.id, visitId)).limit(1);
  if (!record || !isWitnessActive(record.witness)) return Response.json({ message: "见证记录不存在" }, { status: 404 });
  const [available] = await db.select({ id: yearPhotos.id }).from(yearPhotos)
    .where(and(eq(yearPhotos.personId, record.personId), eq(yearPhotos.year, parsed.data.year))).limit(1);
  if (!available) return Response.json({ message: "成长年份不存在" }, { status: 400 });
  const years = parseViewedYears(record.visit.viewedYears);
  if (!years.includes(parsed.data.year)) {
    years.push(parsed.data.year);
    years.sort((a, b) => a - b);
    await db.update(witnessVisits).set({ viewedYears: JSON.stringify(years) }).where(eq(witnessVisits.id, visitId));
  }
  return Response.json({ viewedYears: years });
}

function parseViewedYears(value: string): number[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((year): year is number => Number.isInteger(year)) : [];
  } catch {
    return [];
  }
}
