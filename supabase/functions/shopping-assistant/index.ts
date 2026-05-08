import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

function json(data: object, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

async function findItem(supabase: ReturnType<typeof createClient>, name: string) {
    // Exact match first (case-insensitive)
    const { data: exact } = await supabase
        .from('items')
        .select('id, product, is_enabled')
        .ilike('product', name)
        .limit(1)
        .maybeSingle()

    if (exact) return exact

    // Fall back to partial match
    const { data: partial } = await supabase
        .from('items')
        .select('id, product, is_enabled')
        .ilike('product', `%${name}%`)
        .limit(1)
        .maybeSingle()

    return partial ?? null
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    // Accept API key via header or query param (for platforms that can't set headers, e.g. IFTTT free tier)
    const url = new URL(req.url)
    const apiKey = req.headers.get('x-api-key') ?? url.searchParams.get('key')
    if (!apiKey || apiKey !== Deno.env.get('ASSISTANT_API_KEY')) {
        return json({ ok: false, message: 'Unauthorized.' }, 401)
    }

    let body: { action?: string; item?: string }
    try {
        body = await req.json()
    } catch {
        return json({ ok: false, message: 'Invalid request body.' }, 400)
    }

    const { action, item } = body

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // ── ADD ────────────────────────────────────────────────────────────────────
    if (action === 'add') {
        if (!item?.trim()) return json({ ok: false, message: 'Please specify an item to add.' })

        const found = await findItem(supabase, item.trim())

        if (!found) {
            return json({
                ok: false,
                message: `I don't have "${item}" in the catalog yet. Please add it through the iLoyola app first, then I can manage it by voice.`,
            })
        }

        if (found.is_enabled) {
            return json({ ok: true, message: `${found.product} is already on your list.` })
        }

        await supabase.from('items').update({ is_enabled: true }).eq('id', found.id)
        return json({ ok: true, message: `Done — ${found.product} is back on your shopping list.` })
    }

    // ── REMOVE ─────────────────────────────────────────────────────────────────
    if (action === 'remove') {
        if (!item?.trim()) return json({ ok: false, message: 'Please specify an item to remove.' })

        const found = await findItem(supabase, item.trim())

        if (!found) {
            return json({
                ok: false,
                message: `I couldn't find "${item}" in your list.`,
            })
        }

        if (!found.is_enabled) {
            return json({ ok: true, message: `${found.product} is already off your list.` })
        }

        await supabase.from('items').update({ is_enabled: false }).eq('id', found.id)
        return json({ ok: true, message: `Removed ${found.product} from your shopping list.` })
    }

    // ── LIST ───────────────────────────────────────────────────────────────────
    if (action === 'list') {
        const { data, error } = await supabase
            .from('items')
            .select('product, quantity')
            .eq('is_enabled', true)
            .order('product')

        if (error) return json({ ok: false, message: 'Could not read your list right now.' }, 500)

        if (!data?.length) {
            return json({ ok: true, message: 'Your shopping list is empty.' })
        }

        const itemList = data
            .map(i => (i.quantity && i.quantity > 1 ? `${i.quantity} ${i.product}` : i.product))
            .join(', ')

        return json({
            ok: true,
            message: `You have ${data.length} item${data.length !== 1 ? 's' : ''} on your list: ${itemList}.`,
        })
    }

    return json({ ok: false, message: `Unknown action "${action}".` }, 400)
})
