import { z } from "zod";
export const timelineSchema = z.object({ type: z.enum(["person", "family"]), name: z.string().trim().min(1).max(30), nickname: z.string().trim().max(30).optional().or(z.literal("")), birthday: z.coerce.date().max(new Date()), privacy: z.enum(["private", "unlisted"]).default("private") });
export const photoNoteSchema = z.object({ note: z.string().trim().max(50).optional().or(z.literal("")) });
export const yearDetailsSchema = z.object({
  locationName: z.string().trim().max(50, "地点最多50字").optional().or(z.literal("")),
  yearHighlight: z.string().trim().max(100, "值得记住的事最多100字").optional().or(z.literal("")),
});
export const uploadSchema = z.object({ stage: z.enum(["first_seen", "age"]).default("age"), age: z.preprocess((value) => value === "" || value == null ? undefined : value, z.coerce.number().int().min(1).optional()), note: z.string().trim().max(50).optional().or(z.literal("")), locationName: yearDetailsSchema.shape.locationName, yearHighlight: yearDetailsSchema.shape.yearHighlight, takenAt: z.coerce.date().optional(), replace: z.coerce.boolean().default(false) }).superRefine((data, context) => {
  if (data.stage === "age" && data.age === undefined) context.addIssue({ code: "custom", path: ["age"], message: "年龄照片必须提供年龄" });
  if (data.stage === "first_seen" && data.age !== undefined) context.addIssue({ code: "custom", path: ["age"], message: "初见照片不使用年龄" });
});
export const witnessSchema = z.object({
  name: z.string().trim().min(1).max(30),
  relation: z.string().trim().min(1).max(30),
  permission: z.enum(["readonly", "comment", "family"]).default("comment"),
  duration: z.enum(["7", "30", "90", "never"]).default("30"),
});
export const witnessDurationSchema = z.enum(["7", "30", "90", "never"]);
export const witnessMessageSchema = z.object({
  token: z.string().min(20).max(100),
  yearPhotoId: z.string().uuid().optional().or(z.literal("")),
  content: z.string().trim().min(1, "请写下想说的话").max(500, "祝福最多500字"),
});
