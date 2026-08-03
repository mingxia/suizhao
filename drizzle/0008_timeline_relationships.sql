CREATE TABLE `timeline_members` (
  `id` text PRIMARY KEY NOT NULL, `timeline_id` text NOT NULL, `user_id` text NOT NULL,
  `role` text NOT NULL CHECK (`role` in ('owner','collaborator','viewer')), `relation` text NOT NULL,
  `invited_by` text, `status` text DEFAULT 'accepted' NOT NULL CHECK (`status` in ('pending','accepted','revoked')),
  `created_at` integer NOT NULL, `accepted_at` integer, `revoked_at` integer,
  FOREIGN KEY (`timeline_id`) REFERENCES `timelines`(`id`) ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade,
  FOREIGN KEY (`invited_by`) REFERENCES `user`(`id`) ON DELETE set null
);
CREATE UNIQUE INDEX `timeline_members_timeline_user_unique` ON `timeline_members` (`timeline_id`,`user_id`);
CREATE INDEX `timeline_members_user_status_idx` ON `timeline_members` (`user_id`,`status`);
CREATE TABLE `timeline_invitations` (
  `id` text PRIMARY KEY NOT NULL, `timeline_id` text NOT NULL, `inviter_user_id` text NOT NULL, `invitee_user_id` text NOT NULL,
  `role` text NOT NULL CHECK (`role` in ('collaborator','viewer')), `relation` text NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL CHECK (`status` in ('pending','accepted','declined','revoked')),
  `created_at` integer NOT NULL, `accepted_at` integer,
  FOREIGN KEY (`timeline_id`) REFERENCES `timelines`(`id`) ON DELETE cascade,
  FOREIGN KEY (`inviter_user_id`) REFERENCES `user`(`id`) ON DELETE cascade,
  FOREIGN KEY (`invitee_user_id`) REFERENCES `user`(`id`) ON DELETE cascade
);
CREATE UNIQUE INDEX `timeline_invitations_pending_unique` ON `timeline_invitations` (`timeline_id`,`invitee_user_id`,`status`);
CREATE INDEX `timeline_invitations_invitee_status_idx` ON `timeline_invitations` (`invitee_user_id`,`status`);
CREATE TABLE `notifications` (`id` text PRIMARY KEY NOT NULL, `user_id` text NOT NULL, `timeline_id` text, `type` text NOT NULL CHECK (`type` in ('timeline_invitation','timeline_updated')), `content` text NOT NULL, `read_at` integer, `created_at` integer NOT NULL, FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade, FOREIGN KEY (`timeline_id`) REFERENCES `timelines`(`id`) ON DELETE cascade);
CREATE INDEX `notifications_user_created_idx` ON `notifications` (`user_id`,`created_at`);
CREATE TABLE `timeline_activity` (`id` text PRIMARY KEY NOT NULL, `timeline_id` text NOT NULL, `user_id` text NOT NULL, `action` text NOT NULL CHECK (`action` in ('upload_photo','update_story','delete_photo','invite_member')), `target_id` text, `created_at` integer NOT NULL, FOREIGN KEY (`timeline_id`) REFERENCES `timelines`(`id`) ON DELETE cascade, FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade);
CREATE INDEX `timeline_activity_timeline_created_idx` ON `timeline_activity` (`timeline_id`,`created_at`);
