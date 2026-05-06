/**
 * One-time data seed: loads the Firebase JSON exports into Supabase.
 *
 * Requires the service role key (not the anon key) to bypass RLS.
 * Find it in: Supabase dashboard → Project Settings → API → service_role key.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=xxx \
 *   npm run seed
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ─── Config ──────────────────────────────────────────────────────────────────

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
})

// ─── Load JSON data ───────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadJson(relativePath: string) {
    return JSON.parse(readFileSync(resolve(__dirname, relativePath), 'utf-8'))
}

const categoriesData   = loadJson('../src/data/categories.json').categories
const marketplacesData = loadJson('../src/data/marketplaces.json').marketplaces
const itemsData        = loadJson('../src/data/items.json').items
const recipesData      = loadJson('../src/data/recipes.json').recipes

// ─── Guard: prevent double-seeding ───────────────────────────────────────────

async function assertEmpty() {
    const { count } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
        console.error(
            'categories table already has data.\n' +
            'Truncate all tables before re-running:\n\n' +
            '  TRUNCATE categories, marketplaces, items, item_marketplaces,\n' +
            '           recipes, recipe_ingredients, recipe_steps,\n' +
            '           recipe_bound_recipes CASCADE;\n'
        )
        process.exit(1)
    }
}

// ─── Seeders ─────────────────────────────────────────────────────────────────

async function seedCategories(): Promise<Map<string, string>> {
    const rows = categoriesData.map((c: any) => ({
        name:       c.name,
        is_enabled: c.isEnabled,
    }))

    const { data, error } = await supabase
        .from('categories')
        .insert(rows)
        .select('id, name')

    if (error) throw error

    const nameToId = new Map<string, string>()
    data.forEach((row: any) => nameToId.set(row.name, row.id))

    console.log(`  ✓ ${data.length} categories`)
    return nameToId
}

async function seedMarketplaces(): Promise<Map<string, string>> {
    const rows = marketplacesData.map((m: any) => ({
        name:       m.name,
        is_enabled: m.isEnabled,
    }))

    const { data, error } = await supabase
        .from('marketplaces')
        .insert(rows)
        .select('id, name')

    if (error) throw error

    const nameToId = new Map<string, string>()
    data.forEach((row: any) => nameToId.set(row.name, row.id))

    console.log(`  ✓ ${data.length} marketplaces`)
    return nameToId
}

async function seedItems(
    categoryMap: Map<string, string>,
    marketplaceMap: Map<string, string>
) {
    for (const item of itemsData) {
        const { data, error } = await supabase
            .from('items')
            .insert({
                product:         item.product,
                brand:           item.brand       || null,
                quantity:        item.quantity     ?? 1,
                comments:        item.comments     || null,
                is_nonessential: item.isNonessential,
                is_enabled:      item.isEnabled,
                category_id:     categoryMap.get(item.category?.name) ?? null,
            })
            .select('id')
            .single()

        if (error) throw error

        const marketplaceRows = (item.marketplaces ?? [])
            .map((mp: any) => ({
                item_id:        data.id,
                marketplace_id: marketplaceMap.get(mp.name),
            }))
            .filter((row: any) => row.marketplace_id != null)

        if (marketplaceRows.length > 0) {
            const { error: joinError } = await supabase
                .from('item_marketplaces')
                .insert(marketplaceRows)

            if (joinError) throw joinError
        }
    }

    console.log(`  ✓ ${itemsData.length} items`)
}

async function seedRecipes() {
    for (const recipe of recipesData) {
        const { data, error } = await supabase
            .from('recipes')
            .insert({
                alias:          recipe.alias,
                name:           recipe.name,
                description:    recipe.description    || '',
                reference:      recipe.reference      || null,
                tags:           recipe.tags            ?? [],
                notes:          recipe.notes           || null,
                is_enabled:     recipe.isEnabled,
                title_position: recipe.titlePosition   ?? '',
            })
            .select('id')
            .single()

        if (error) throw error

        const recipeId = data.id

        if (recipe.ingredients?.length > 0) {
            const { error: ingError } = await supabase
                .from('recipe_ingredients')
                .insert(
                    recipe.ingredients.map((ing: any, i: number) => ({
                        recipe_id:  recipeId,
                        sort_order: i,
                        quantity:   ing.quantity  ?? null,
                        volume:     ing.volume     || null,
                        ingredient: ing.ingredient,
                        process:    ing.process    || null,
                        extra:      ing.extra      || null,
                    }))
                )

            if (ingError) throw ingError
        }

        if (recipe.steps?.length > 0) {
            const { error: stepError } = await supabase
                .from('recipe_steps')
                .insert(
                    recipe.steps.map((step: any, i: number) => ({
                        recipe_id:   recipeId,
                        step_number: i + 1,
                        instruction: step.instruction,
                        step_images: step.stepImages ?? [],
                    }))
                )

            if (stepError) throw stepError
        }

        if (recipe.boundRecipes?.length > 0) {
            const { error: boundError } = await supabase
                .from('recipe_bound_recipes')
                .insert(
                    recipe.boundRecipes.map((br: any) => ({
                        recipe_id: recipeId,
                        name:      br.name,
                        url:       br.url,
                    }))
                )

            if (boundError) throw boundError
        }
    }

    console.log(`  ✓ ${recipesData.length} recipes`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('Checking database state...')
    await assertEmpty()

    console.log('Seeding...')
    const categoryMap    = await seedCategories()
    const marketplaceMap = await seedMarketplaces()
    await seedItems(categoryMap, marketplaceMap)
    await seedRecipes()

    console.log('\nDone.')
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
