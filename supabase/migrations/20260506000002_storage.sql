-- =============================================================
-- Storage bucket for recipe images
-- =============================================================
-- Images are stored as: {alias}_{size}.jpg  (e.g. healthy-granola_xl.jpg)
-- Sizes: xl, lg, md, sm
--
-- The bucket is public so images are served via CDN without auth tokens.
-- Write access is restricted to authenticated household members.

INSERT INTO storage.buckets (id, name, public)
VALUES ('recipes', 'recipes', true)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload, replace, and delete recipe images
CREATE POLICY "Authenticated users can manage recipe images" ON storage.objects
    FOR ALL TO authenticated
    USING     (bucket_id = 'recipes')
    WITH CHECK (bucket_id = 'recipes');
