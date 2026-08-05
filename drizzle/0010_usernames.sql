ALTER TABLE `user` ADD `username` text;
ALTER TABLE `user` ADD `display_username` text;
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);
