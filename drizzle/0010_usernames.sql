ALTER TABLE `user` ADD `username` text;
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);
