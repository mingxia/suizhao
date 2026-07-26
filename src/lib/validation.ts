import { z } from "zod";
export const personSchema = z.object({ name: z.string().trim().min(1).max(30), nickname: z.string().trim().max(30).optional().or(z.literal("")), birthday: z.coerce.date().max(new Date()), privacy: z.enum(["private", "unlisted"]).default("private") });
export const photoNoteSchema = z.object({ note: z.string().trim().max(50).optional().or(z.literal("")) });
export const uploadSchema = z.object({ stage: z.enum(["first_seen", "age"]).default("age"), age: z.preprocess((value) => value === "" || value == null ? undefined : value, z.coerce.number().int().min(1).optional()), note: z.string().trim().max(50).optional().or(z.literal("")), takenAt: z.coerce.date().optional(), replace: z.coerce.boolean().default(false) }).superRefine((data, context) => {
  if (data.stage === "age" && data.age === undefined) context.addIssue({ code: "custom", path: ["age"], message: "年龄照片必须提供年龄" });
  if (data.stage === "first_seen" && data.age !== undefined) context.addIssue({ code: "custom", path: ["age"], message: "初见照片不使用年龄" });
});
