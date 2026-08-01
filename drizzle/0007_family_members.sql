CREATE TABLE `family_members` (
  `family_id` text NOT NULL,
  `person_id` text NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`family_id`) REFERENCES `timelines`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`person_id`) REFERENCES `timelines`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `family_members_family_person_unique` ON `family_members` (`family_id`, `person_id`);
CREATE INDEX `family_members_family_id_idx` ON `family_members` (`family_id`);
CREATE INDEX `family_members_person_id_idx` ON `family_members` (`person_id`);
