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
  age: integer("age").notNull(), year: integer("year").notNull(), thumbnailKey: text("thumbnail_key").notNull(), largeKey: text("large_key").notNull(), mimeType: text("mime_type").notNull(), width: integer("width"), height: integer("height"), note: text("note"), takenAt: integer("taken_at", { mode: "timestamp_ms" }), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("year_photos_person_age_unique").on(table.personId, table.age), index("year_photos_person_id_idx").on(table.personId)]);
