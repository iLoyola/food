// Deno edge function — never expose ANTHROPIC_API_KEY to the client.
// Auth: relies on Supabase's default JWT verification (this function is NOT
// deployed with --no-verify-jwt), since it's only ever called by the
// authenticated app via supabase.functions.invoke() — unlike shopping-assistant,
// there's no third-party caller here, so no custom API-key check is needed.
import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: object, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

// Everything extractable from a cookbook photo. Deliberately narrower than
// the full RecipeFormPayload — alias (derived client-side from name),
// titlePosition, isEnabled, reference, and boundRecipes aren't things a
// photo can tell you, so they're left to their normal form defaults.
const RECIPE_SCHEMA = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        notes: { type: 'string' },
        scanIssues: { type: 'string' },
        ingredients: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    quantity: { type: 'number' },
                    volume: { type: 'string' },
                    ingredient: { type: 'string' },
                    process: { type: 'string' },
                    extra: { type: 'string' },
                },
                required: ['quantity', 'volume', 'ingredient', 'process', 'extra'],
                additionalProperties: false,
            },
        },
        steps: {
            type: 'array',
            items: {
                type: 'object',
                properties: { instruction: { type: 'string' } },
                required: ['instruction'],
                additionalProperties: false,
            },
        },
    },
    required: ['name', 'description', 'tags', 'notes', 'scanIssues', 'ingredients', 'steps'],
    additionalProperties: false,
} as const

const EXTRACTION_PROMPT = `These images are photo(s) of a single recipe from a physical cookbook. If there is more than one image, they are sequential pages of the SAME recipe — combine them into one result, not several.

Extract:
- name: the recipe's title as printed.
- description: a short description if the cookbook gives one; otherwise "".
- tags: a few lowercase descriptive tags (e.g. cuisine, meal type) if reasonably inferable; otherwise [].
- ingredients: normalize each line into {quantity, volume, ingredient, process, extra}. quantity is numeric (convert fractions like ½ or ¼ to decimals); volume is the unit (e.g. "cup", "tbsp"); ingredient is the item name; process is a prep note if the ingredient line includes one (e.g. "chopped", "melted"); extra is any parenthetical or trailing note. Use "" / 0 for parts that don't apply.
- steps: preserve the original wording of each instruction as closely as possible. Do not paraphrase or add steps that aren't printed. Split into one entry per numbered/paragraph step as printed.
- notes: ONLY notes that are actually printed on the page itself (e.g. "Note: this doubles well" or a storage tip in the cookbook's own text). Leave "" if the page prints no such note. This field may end up published on the live site verbatim, so never put commentary about the scan itself here.
- scanIssues: the opposite of notes — never anything printed on the page. Use this ONLY to flag problems with the scan itself: blurry or cut-off sections, anything you couldn't read, anything you're unsure about. Leave "" if the whole recipe was clearly legible. This field is shown to the person reviewing the scan and is never saved with the recipe, so be specific (e.g. "Steps 4-5 were cut off in the photo").

Never invent ingredients, quantities, or steps that aren't visibly printed. If a field genuinely isn't determinable, use "" (or 0 for quantity) and note the gap in scanIssues rather than guessing.`

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    let body: { images?: string[] }
    try {
        body = await req.json()
    } catch {
        return json({ error: 'Invalid request body.' }, 400)
    }

    const images = body.images ?? []
    if (images.length === 0 || images.length > 3) {
        return json({ error: 'Expected 1 to 3 images.' }, 400)
    }

    let imageBlocks: { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }[]
    try {
        imageBlocks = images.map((dataUri) => {
            const match = dataUri.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)
            if (!match) throw new Error('Malformed image data URI.')
            const [, mediaType, data] = match
            return { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType, data } }
        })
    } catch {
        return json({ error: 'One or more images were not valid base64 image data URIs.' }, 400)
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

    try {
        const stream = anthropic.messages.stream({
            model: 'claude-opus-5',
            max_tokens: 16000,
            thinking: { type: 'adaptive' },
            output_config: { format: { type: 'json_schema', schema: RECIPE_SCHEMA } },
            messages: [
                {
                    role: 'user',
                    content: [...imageBlocks, { type: 'text', text: EXTRACTION_PROMPT }],
                },
            ],
        })

        const message = await stream.finalMessage()

        if (message.stop_reason === 'refusal') {
            return json({ error: 'The recipe photo could not be processed.' }, 422)
        }

        const textBlock = message.content.find((b) => b.type === 'text')
        if (!textBlock || textBlock.type !== 'text') {
            return json({ error: 'No extraction result was returned.' }, 502)
        }

        const payload = JSON.parse(textBlock.text)
        return json(payload)
    } catch (err) {
        console.error('recipe-parser failed:', err)
        return json({ error: 'Failed to parse recipe photo.' }, 500)
    }
})
