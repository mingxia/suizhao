import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const persons = sqliteTable("persons", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(), nickname: text("nickname"),
  birthday: integer("birthday", { mode: "timestamp_ms" }).notNull(), coverKey: text("cover_key"),
  privacy: text("privacy", { enum: ["private", "unlisted"] }).notNull().default("private"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("persons_owner_id_idx").on(table.ownerId)]);

export const yearPhotos = sqliteTable("year_photos", {
  id: text("id").primaryKey(), personId: text("person_id").notNull().references(() => persons.id, { onDelete: "cascade" }),
  stage: text("stage", { enum: ["first_seen", "age"] }).notNull().default("age"), age: integer("age"), year: integer("year").notNull(), thumbnailKey: text("thumbnail_key").notNull(), largeKey: text("large_key").notNull(), mimeType: text("mime_type").notNull(), width: integer("width"), height: integer("height"), note: text("note"), takenAt: integer("taken_at", { mode: "timestamp_ms" }), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("year_photos_person_age_unique").on(table.personId, table.age), uniqueIndex("year_photos_person_stage_year_unique").on(table.personId, table.stage, table.year), index("year_photos_person_id_idx").on(table.personId)]);

export type YearPhotoStage = "first_seen" | "age";

export const witnesses = sqliteTable("witnesses", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull().references(() => persons.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  relation: text("relation").notNull(),
  avatar: text("avatar"),
  token: text("token").notNull().unique(),
  permission: text("permission", { enum: ["readonly", "comment", "family"] }).notNull().default("comment"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  lastVisitedAt: integer("last_visited_at", { mode: "timestamp_ms" }),
}, (table) => [index("witnesses_person_id_idx").on(table.personId)]);

export const witnessVisits = sqliteTable("witness_visits", {
  id: text("id").primaryKey(),
  witnessId: text("witness_id").notNull().references(() => witnesses.id, { onDelete: "cascade" }),
  visitedAt: integer("visited_at", { mode: "timestamp_ms" }).notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  viewedYears: text("viewed_years").notNull().default("[]"),
}, (table) => [index("witness_visits_witness_id_idx").on(table.witnessId)]);

export const witnessMessages = sqliteTable("witness_messages", {
  id: text("id").primaryKey(),
  witnessId: text("witness_id").notNull().references(() => witnesses.id, { onDelete: "cascade" }),
  personId: text("person_id").notNull().references(() => persons.id, { onDelete: "cascade" }),
  yearPhotoId: text("year_photo_id").references(() => yearPhotos.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("witness_messages_person_id_idx").on(table.personId), index("witness_messages_photo_id_idx").on(table.yearPhotoId)]);

export type WitnessPermission = "readonly" | "comment" | "family";
