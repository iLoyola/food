-- Adds an admin-only column for problems flagged during AI recipe-photo
-- scanning (blurry/cut-off/unreadable sections). Kept separate from `notes`
-- (which is public-facing recipe content) so scan gaps can never accidentally
-- ship on the live site. Nullable — only ever set when a recipe was created
-- via a scan and something needed a second look.

ALTER TABLE recipes ADD COLUMN scan_issues TEXT;
