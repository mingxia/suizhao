ALTER TABLE `orders` ADD `payment_reference` text;
CREATE UNIQUE INDEX `orders_payment_reference_unique` ON `orders` (`payment_reference`);
