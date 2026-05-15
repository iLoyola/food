Create a new Supabase migration file for this project.

The migration description is: $ARGUMENTS

Steps:
1. Get the current date and time to build the timestamp in the format `YYYYMMDDHHmmss` (e.g. 20260515143000).
2. Convert the description to snake_case (e.g. "add user profiles" → "add_user_profiles").
3. Create the file at `supabase/migrations/<timestamp>_<snake_case_description>.sql`.
4. Add a comment at the top explaining what the migration does.
5. Write the SQL based on the description. Follow the conventions in existing migration files:
   - All tables need RLS enabled: `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;`
   - Authenticated users need explicit GRANTs: `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<name> TO authenticated;`
   - RLS policies use `FOR ALL TO authenticated USING (true)` for general tables.
6. Show the created file path and contents for review.

Do not run `supabase db push` — leave that for the user to review and run manually.
