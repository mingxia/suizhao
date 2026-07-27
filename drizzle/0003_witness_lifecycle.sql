ALTER TABLE `witnesses` ADD `status` text DEFAULT 'active' NOT NULL;
ALTER TABLE `witnesses` ADD `expires_at` integer;
ALTER TABLE `witnesses` ADD `paused_at` integer;

-- Existing links stay active without an expiry so a deployment does not
-- unexpectedly lock out family members who already received an invitation.
