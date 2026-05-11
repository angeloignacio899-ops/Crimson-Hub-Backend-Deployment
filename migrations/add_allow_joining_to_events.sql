-- Add allow_joining column to event table
ALTER TABLE event ADD COLUMN `allow_joining` BOOLEAN DEFAULT 1 AFTER `remarks`;

-- This allows organizers/admins to disable joining for events
-- 1 = Allow joining (default)
-- 0 = Disable joining
