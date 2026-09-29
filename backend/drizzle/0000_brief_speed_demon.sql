CREATE TABLE `feed_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feed_tokens_token_unique` ON `feed_tokens` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `feed_tokens_user_id_unique` ON `feed_tokens` (`user_id`);--> statement-breakpoint
CREATE TABLE `movies` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`overview` text,
	`poster_path` text,
	`popularity` real DEFAULT 0 NOT NULL,
	`release_date` text,
	`last_checked_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tracked_movies` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`movie_id` integer NOT NULL,
	`added_at` text DEFAULT (current_timestamp) NOT NULL,
	`reminder_minutes_before` integer DEFAULT 60 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tracked_movies_user_movie_idx` ON `tracked_movies` (`user_id`,`movie_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);