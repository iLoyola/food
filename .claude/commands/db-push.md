Push pending Supabase migrations to the remote database.

Steps:
1. Run `npx supabase@latest migration list` to show which migrations are pending (local but not yet applied remotely).
2. If there are no pending migrations, say so and stop.
3. If there are pending migrations, show the list and ask for confirmation before proceeding.
4. Once confirmed, run `echo "y" | npx supabase@latest db push` to apply them.
5. Run `npx supabase@latest migration list` again to confirm all migrations are now applied.
6. Report what was applied and whether it succeeded.
