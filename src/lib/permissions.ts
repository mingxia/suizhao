import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { persons } from "@/db/schema";
export class PermissionError extends Error { constructor(public code: "NOT_FOUND" | "FORBIDDEN", message: string) { super(message); } }
export async function requirePersonOwner(personId: string, userId: string) { const [person] = await getDb().select().from(persons).where(eq(persons.id, personId)).limit(1); if (!person) throw new PermissionError("NOT_FOUND", "人物不存在"); if (person.ownerId !== userId) throw new PermissionError("FORBIDDEN", "无权访问该人物"); return person; }
