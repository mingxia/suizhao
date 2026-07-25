import { z } from "zod";
export const personSchema = z.object({ name: z.string().trim().min(1).max(30), nickname: z.string().trim().max(30).optional().or(z.literal("")), birthday: z.coerce.date().max(new Date()), privacy: z.enum(["private", "unlisted"]).default("private") });
export const photoNoteSchema = z.object({ note: z.string().trim().max(50).optional().or(z.literal("")) });
export const uploadSchema = z.object({ age: z.coerce.number().int().min(1), note: z.string().trim().max(50).optional().or(z.literal("")), takenAt: z.coerce.date().optional(), replace: z.coerce.boolean().default(false) });
