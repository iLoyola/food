import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../supabase/client.js'
import { ItemModel } from '../model/item.model.js'
import { CategoryModel } from '../model/category.model.js'
import { MarketplaceModel } from '../model/marketplace.model.js'

type DbItem = {
    id: string
    product: string
    brand: string | null
    quantity: number
    comments: string | null
    is_nonessential: boolean
    is_enabled: boolean
    categories: { id: string; name: string; is_enabled: boolean } | null
    item_marketplaces: {
        marketplaces: { id: string; name: string; is_enabled: boolean }
    }[]
}

function toItemModel(r: DbItem): ItemModel {
    const category: CategoryModel = r.categories
        ? { id: r.categories.id, name: r.categories.name, isEnabled: r.categories.is_enabled }
        : { id: '', name: '', isEnabled: true }

    const marketplaces: MarketplaceModel[] = r.item_marketplaces.map(im => ({
        id: im.marketplaces.id,
        name: im.marketplaces.name,
        isEnabled: im.marketplaces.is_enabled
    }))

    return {
        id: r.id,
        product: r.product,
        brand: r.brand ?? '',
        quantity: r.quantity,
        comments: r.comments ?? '',
        isNonessential: r.is_nonessential,
        isEnabled: r.is_enabled,
        category,
        marketplaces,
        marketplacesIds: marketplaces.map(m => m.id)
    }
}

export const useItemsStore = defineStore('items', () => {
    const loading = ref<boolean>(false)
    const items = reactive<ItemModel[]>([])

    async function fetchItems(): Promise<void> {
        try {
            loading.value = true
            const { data, error } = await supabase
                .from('items')
                .select(`
                    *,
                    categories (*),
                    item_marketplaces (
                        marketplaces (*)
                    )
                `)
                .eq('is_enabled', true)
                .order('product')

            if (error) throw error

            items.splice(0, items.length)
            items.push(...(data as DbItem[]).map(toItemModel))
        } catch (error) {
            console.error(error)
        } finally {
            loading.value = false
        }
    }

    async function addItem(item: ItemModel): Promise<void> {
        const { data, error } = await supabase
            .from('items')
            .insert({
                product: item.product.trim(),
                brand: item.brand?.trim() || null,
                quantity: item.quantity ?? 1,
                comments: item.comments?.trim() || null,
                is_nonessential: item.isNonessential,
                is_enabled: true,
                category_id: item.category?.id || null,
            })
            .select('id')
            .single()

        if (error) throw error

        if (item.marketplacesIds.length > 0) {
            const { error: mpError } = await supabase
                .from('item_marketplaces')
                .insert(item.marketplacesIds.map(mp_id => ({ item_id: data.id, marketplace_id: mp_id })))
            if (mpError) throw mpError
        }

        await fetchItems()
    }

    async function updateItem(item: ItemModel): Promise<void> {
        const { error } = await supabase
            .from('items')
            .update({
                product: item.product.trim(),
                brand: item.brand?.trim() || null,
                quantity: item.quantity ?? 1,
                comments: item.comments?.trim() || null,
                is_nonessential: item.isNonessential,
                category_id: item.category?.id || null,
            })
            .eq('id', item.id!)

        if (error) throw error

        const { error: delError } = await supabase
            .from('item_marketplaces')
            .delete()
            .eq('item_id', item.id!)

        if (delError) throw delError

        if (item.marketplacesIds.length > 0) {
            const { error: mpError } = await supabase
                .from('item_marketplaces')
                .insert(item.marketplacesIds.map(mp_id => ({ item_id: item.id!, marketplace_id: mp_id })))
            if (mpError) throw mpError
        }

        await fetchItems()
    }

    async function deleteItem(item: ItemModel): Promise<void> {
        const { error } = await supabase
            .from('items')
            .update({ is_enabled: false })
            .eq('id', item.id!)

        if (error) throw error

        await fetchItems()
    }

    return { fetchItems, addItem, updateItem, deleteItem, items, loading }
})
