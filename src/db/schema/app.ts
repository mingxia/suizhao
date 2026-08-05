import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const timelines = sqliteTable("timelines", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(), nickname: text("nickname"),
  birthday: integer("birthday", { mode: "timestamp_ms" }).notNull(), coverKey: text("cover_key"),
  privacy: text("privacy", { enum: ["private", "unlisted"] }).notNull().default("private"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  type: text("type", { enum: ["person", "family"] }).notNull().default("person"),
}, (table) => [index("timelines_owner_id_idx").on(table.ownerId)]);

export type TimelineType = "person" | "family";

export type OrderProduct = "lifetime_membership";
export type OrderStatus = "pending" | "reviewing" | "approved" | "rejected" | "cancelled";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  product: text("product", { enum: ["lifetime_membership"] }).notNull(),
  status: text("status", { enum: ["pending", "reviewing", "approved", "rejected", "cancelled"] }).notNull().default("pending"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency", { enum: ["CNY", "USD"] }).notNull().default("CNY"),
  paymentMethod: text("payment_method", { enum: ["wechat_pay_qr"] }).notNull().default("wechat_pay_qr"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  adminNote: text("admin_note"),
  reviewedBy: text("reviewed_by").references(() => user.id, { onDelete: "set null" }),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  index("orders_user_status_idx").on(table.userId, table.status),
  index("orders_status_created_idx").on(table.status, table.createdAt),
]);

export const familyMembers = sqliteTable("family_members", {
  familyId: text("family_id").notNull().references(() => timelines.id, { onDelete: "cascade" }),
  personId: text("person_id").notNull().references(() => timelines.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  uniqueIndex("family_members_family_person_unique").on(table.familyId, table.personId),
  index("family_members_family_id_idx").on(table.familyId),
  index("family_members_person_id_idx").on(table.personId),
]);

export const yearPhotos = sqliteTable("year_photos", {
  id: text("id").primaryKey(), personId: text("person_id").notNull().references(() => timelines.id, { onDelete: "cascade" }),
  stage: text("stage", { enum: ["first_seen", "age"] }).notNull().default("age"), age: integer("age"), year: integer("year").notNull(), thumbnailKey: text("thumbnail_key").notNull(), largeKey: text("large_key").notNull(), mimeType: text("mime_type").notNull(), width: integer("width"), height: integer("height"), note: text("note"), takenAt: integer("taken_at", { mode: "timestamp_ms" }), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("year_photos_person_age_unique").on(table.personId, table.age), uniqueIndex("year_photos_person_stage_year_unique").on(table.personId, table.stage, table.year), index("year_photos_person_id_idx").on(table.personId)]);

export type YearPhotoStage = "first_seen" | "age";

export const witnesses = sqliteTable("witnesses", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull().references(() => timelines.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  relation: text("relation").notNull(),
  avatar: text("avatar"),
  token: text("token").notNull().unique(),
  permission: text("permission", { enum: ["readonly", "comment", "family"] }).notNull().default("comment"),
  status: text("status", { enum: ["active", "paused"] }).notNull().default("active"),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  pausedAt: integer("paused_at", { mode: "timestamp_ms" }),
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
  personId: text("person_id").notNull().references(() => timelines.id, { onDelete: "cascade" }),
  yearPhotoId: text("year_photo_id").references(() => yearPhotos.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("witness_messages_person_id_idx").on(table.personId), index("witness_messages_photo_id_idx").on(table.yearPhotoId)]);

export type WitnessPermission = "readonly" | "comment" | "family";
export type WitnessStatus = "active" | "paused";

export type TimelineRole = "owner" | "collaborator" | "viewer";
export type TimelineMemberStatus = "pending" | "accepted" | "revoked";

/** Registered-user relationships. Witnesses intentionally remain a separate, link-based feature. */
export const timelineMembers = sqliteTable("timeline_members", {
  id: text("id").primaryKey(),
  timelineId: text("timeline_id").notNull().references(() => timelines.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "collaborator", "viewer"] }).notNull(),
  relation: text("relation").notNull(),
  invitedBy: text("invited_by").references(() => user.id, { onDelete: "set null" }),
  status: text("status", { enum: ["pending", "accepted", "revoked"] }).notNull().default("accepted"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
}, (table) => [
  uniqueIndex("timeline_members_timeline_user_unique").on(table.timelineId, table.userId),
  index("timeline_members_user_status_idx").on(table.userId, table.status),
]);

export const timelineInvitations = sqliteTable("timeline_invitations", {
  id: text("id").primaryKey(),
  timelineId: text("timeline_id").notNull().references(() => timelines.id, { onDelete: "cascade" }),
  inviterUserId: text("inviter_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  inviteeUserId: text("invitee_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["collaborator", "viewer"] }).notNull(),
  relation: text("relation").notNull(),
  status: text("status", { enum: ["pending", "accepted", "declined", "revoked"] }).notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
}, (table) => [
  uniqueIndex("timeline_invitations_pending_unique").on(table.timelineId, table.inviteeUserId, table.status),
  index("timeline_invitations_invitee_status_idx").on(table.inviteeUserId, table.status),
]);

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  timelineId: text("timeline_id").references(() => timelines.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["timeline_invitation", "timeline_updated"] }).notNull(),
  content: text("content").notNull(),
  readAt: integer("read_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("notifications_user_created_idx").on(table.userId, table.createdAt)]);

export const timelineActivity = sqliteTable("timeline_activity", {
  id: text("id").primaryKey(),
  timelineId: text("timeline_id").notNull().references(() => timelines.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  action: text("action", { enum: ["upload_photo", "update_story", "delete_photo", "invite_member"] }).notNull(),
  targetId: text("target_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("timeline_activity_timeline_created_idx").on(table.timelineId, table.createdAt)]);
