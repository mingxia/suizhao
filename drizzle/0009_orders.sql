CREATE TABLE `orders` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `product` text NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `amount_cents` integer NOT NULL,
  `currency` text DEFAULT 'CNY' NOT NULL,
  `payment_method` text DEFAULT 'wechat_pay_qr' NOT NULL,
  `customer_name` text NOT NULL,
  `customer_email` text NOT NULL,
  `admin_note` text,
  `reviewed_by` text,
  `reviewed_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE INDEX `orders_user_status_idx` ON `orders` (`user_id`,`status`);
CREATE INDEX `orders_status_created_idx` ON `orders` (`status`,`created_at`);
