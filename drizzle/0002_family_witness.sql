CREATE TABLE `witnesses` (
  `id` text PRIMARY KEY NOT NULL,
  `person_id` text NOT NULL,
  `name` text NOT NULL,
  `relation` text NOT NULL,
  `avatar` text,
  `token` text NOT NULL,
  `permission` text DEFAULT 'comment' NOT NULL,
  `created_at` integer NOT NULL,
  `last_visited_at` integer,
  FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `witnesses_token_unique` ON `witnesses` (`token`);
CREATE INDEX `witnesses_person_id_idx` ON `witnesses` (`person_id`);

CREATE TABLE `witness_visits` (
  `id` text PRIMARY KEY NOT NULL,
  `witness_id` text NOT NULL,
  `visited_at` integer NOT NULL,
  `ip` text,
  `user_agent` text,
  `viewed_years` text DEFAULT '[]' NOT NULL,
  FOREIGN KEY (`witness_id`) REFERENCES `witnesses`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `witness_visits_witness_id_idx` ON `witness_visits` (`witness_id`);

CREATE TABLE `witness_messages` (
  `id` text PRIMARY KEY NOT NULL,
  `witness_id` text NOT NULL,
  `person_id` text NOT NULL,
  `year_photo_id` text,
  `content` text NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`witness_id`) REFERENCES `witnesses`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`year_photo_id`) REFERENCES `year_photos`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `witness_messages_person_id_idx` ON `witness_messages` (`person_id`);
CREATE INDEX `witness_messages_photo_id_idx` ON `witness_messages` (`year_photo_id`);
