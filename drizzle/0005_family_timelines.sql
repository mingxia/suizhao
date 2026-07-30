ALTER TABLE `persons` RENAME TO `timelines`;
ALTER TABLE `timelines` ADD `type` text DEFAULT 'person' NOT NULL;
DROP INDEX IF EXISTS `persons_owner_id_idx`;
CREATE INDEX `timelines_owner_id_idx` ON `timelines` (`owner_id`);
