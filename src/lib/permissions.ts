import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { timelines } from "@/db/schema";
export class PermissionError extends Error { constructor(public code: "NOT_FOUND" | "FORBIDDEN", message: string) { super(message); } }
export async function requirePersonOwner(personId: string, userId: string) { const [person] = await (await getDb()).select().from(timelines).where(eq(timelines.id, personId)).limit(1); if (!person) throw new PermissionError("NOT_FOUND", "照见不存在"); if (person.ownerId !== userId) throw new PermissionError("FORBIDDEN", "无权访问该照见"); return person; }
