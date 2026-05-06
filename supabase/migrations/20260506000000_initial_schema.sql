-- =============================================================
-- Lookup tables
-- =============================================================

CREATE TABLE categories (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT    NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE marketplaces (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT    NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true
);

-- =============================================================
-- Items
-- =============================================================

CREATE TABLE items (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  product         TEXT    NOT NULL,
  brand           TEXT,
  quantity        INTEGER NOT NULL DEFAULT 1,
  comments        TEXT,
  is_nonessential BOOLEAN NOT NULL DEFAULT false,
  is_enabled      BOOLEAN NOT NULL DEFAULT true,
  category_id     UUID    REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX items_category_id_idx ON items (category_id);

-- Many-to-many: which marketplaces carry each item
CREATE TABLE item_marketplaces (
  item_id        UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  marketplace_id UUID NOT NULL REFERENCES marketplaces(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, marketplace_id)
);

CREATE INDEX item_marketplaces_marketplace_id_idx ON item_marketplaces (marketplace_id);

-- =============================================================
-- Recipes
-- =============================================================

CREATE TABLE recipes (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  alias          TEXT    NOT NULL UNIQUE,
  name           TEXT    NOT NULL,
  description    TEXT    NOT NULL DEFAULT '',
  reference      TEXT,
  tags           TEXT[]  NOT NULL DEFAULT '{}',
  notes          TEXT,
  is_enabled     BOOLEAN NOT NULL DEFAULT true,
  title_position TEXT    NOT NULL DEFAULT ''
);

-- alias is used for routing (/recipes/:alias) and image filename construction
CREATE INDEX recipes_alias_idx ON recipes (alias);

CREATE TABLE recipe_ingredients (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id  UUID    NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  quantity   NUMERIC,
  volume     TEXT,
  ingredient TEXT    NOT NULL,
  process    TEXT,
  extra      TEXT
);

CREATE INDEX recipe_ingredients_recipe_id_idx ON recipe_ingredients (recipe_id);

CREATE TABLE recipe_steps (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id   UUID    NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT    NOT NULL,
  step_images TEXT[]  NOT NULL DEFAULT '{}'
);

CREATE INDEX recipe_steps_recipe_id_idx ON recipe_steps (recipe_id);

-- Optional related-recipe links attached to a recipe
CREATE TABLE recipe_bound_recipes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  url       TEXT NOT NULL
);

CREATE INDEX recipe_bound_recipes_recipe_id_idx ON recipe_bound_recipes (recipe_id);

-- =============================================================
-- Row Level Security
-- =============================================================
-- This is a single-household app: all authenticated users share
-- the same data with full read/write access.

ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplaces         ENABLE ROW LEVEL SECURITY;
ALTER TABLE items                ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_marketplaces    ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps         ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_bound_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users have full access" ON categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access" ON marketplaces
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access" ON items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access" ON item_marketplaces
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access" ON recipes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access" ON recipe_ingredients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access" ON recipe_steps
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access" ON recipe_bound_recipes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
