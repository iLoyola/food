-- Explicit GRANT statements required by Supabase Data API policy change.
-- Starting October 30 2026, implicit grants on public schema tables are removed.
-- All tables exposed via the REST API must have explicit grants for each role.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_marketplaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_ingredients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_bound_recipes TO authenticated;

-- profiles: SELECT for all authenticated, UPDATE restricted to own row (matches RLS policy)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
