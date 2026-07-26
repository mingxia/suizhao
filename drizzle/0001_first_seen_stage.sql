PRAGMA foreign_keys=OFF;

CREATE TABLE `__new_year_photos` (
  `id` text PRIMARY KEY NOT NULL,
  `person_id` text NOT NULL,
  `stage` text DEFAULT 'age' NOT NULL,
  `age` integer,
  `year` integer NOT NULL,
  `thumbnail_key` text NOT NULL,
  `large_key` text NOT NULL,
  `mime_type` text NOT NULL,
  `width` integer,
  `height` integer,
  `note` text,
  `taken_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE cascade
);

INSERT INTO `__new_year_photos` (`id`, `person_id`, `stage`, `age`, `year`, `thumbnail_key`, `large_key`, `mime_type`, `width`, `height`, `note`, `taken_at`, `created_at`, `updated_at`)
SELECT `id`, `person_id`, 'age', `age`, `year`, `thumbnail_key`, `large_key`, `mime_type`, `width`, `height`, `note`, `taken_at`, `created_at`, `updated_at` FROM `year_photos`;

DROP TABLE `year_photos`;
ALTER TABLE `__new_year_photos` RENAME TO `year_photos`;
CREATE UNIQUE INDEX `year_photos_person_age_unique` ON `year_photos` (`person_id`, `age`);
CREATE UNIQUE INDEX `year_photos_person_stage_year_unique` ON `year_photos` (`person_id`, `stage`, `year`);
CREATE INDEX `year_photos_person_id_idx` ON `year_photos` (`person_id`);

PRAGMA foreign_keys=ON;
