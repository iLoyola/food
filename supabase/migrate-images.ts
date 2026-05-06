/**
 * One-time image migration: uploads local recipe images to Supabase Storage.
 *
 * Requires:
 *   SUPABASE_URL             — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (Project Settings → API)
 *   IMAGES_DIR               — absolute path to the folder containing the images
 *
 * Images must be named: {alias}_{size}.jpg  (e.g. healthy-granola_xl.jpg)
 * Sizes: xl, lg, md, sm
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=sb_service_role_... \
 *   IMAGES_DIR=/Volumes/MyDrive/recipe-images \
 *   npm run migrate-images
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

// ─── Config ───────────────────────────────────────────────────────────────────

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, IMAGES_DIR } = process.env

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !IMAGES_DIR) {
    console.error(
        'Required environment variables:\n' +
        '  SUPABASE_URL\n' +
        '  SUPABASE_SERVICE_ROLE_KEY\n' +
        '  IMAGES_DIR  (absolute path to the folder containing the images)\n'
    )
    process.exit(1)
}

if (!existsSync(IMAGES_DIR)) {
    console.error(`IMAGES_DIR not found: ${IMAGES_DIR}`)
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
})

// ─── Data ─────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const recipes: { alias: string }[] = JSON.parse(
    readFileSync(resolve(__dirname, '../src/data/recipes.json'), 'utf-8')
).recipes

const SIZES = ['xl', 'lg', 'md', 'sm'] as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readLocalImage(alias: string, size: string): Buffer | null {
    const filePath = join(IMAGES_DIR!, `${alias}_${size}.jpg`)
    if (!existsSync(filePath)) return null
    return readFileSync(filePath)
}

async function uploadToSupabase(alias: string, size: string, buffer: Buffer): Promise<void> {
    const { error } = await supabase.storage
        .from('recipes')
        .upload(`${alias}_${size}.jpg`, buffer, {
            contentType: 'image/jpeg',
            upsert: true,
        })

    if (error) throw error
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log(`Reading images from: ${IMAGES_DIR}`)
    console.log(`Uploading ${recipes.length} recipes × ${SIZES.length} sizes...\n`)

    let uploaded = 0
    let missing  = 0
    let failed   = 0

    for (const { alias } of recipes) {
        const results: string[] = []

        for (const size of SIZES) {
            const buffer = readLocalImage(alias, size)

            if (!buffer) {
                results.push(`${size}:-`)
                missing++
                continue
            }

            try {
                await uploadToSupabase(alias, size, buffer)
                results.push(`${size}:✓`)
                uploaded++
            } catch (err: any) {
                results.push(`${size}:✗`)
                console.error(`    Error on ${alias}_${size}: ${err.message}`)
                failed++
            }
        }

        console.log(`  ${alias.padEnd(24)} ${results.join('  ')}`)
    }

    console.log(`
Summary
  Uploaded : ${uploaded}
  Missing  : ${missing}
  Failed   : ${failed}
`)

    if (failed > 0) process.exit(1)
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
