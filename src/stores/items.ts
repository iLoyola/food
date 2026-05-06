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

    async function fetchItems(): Promise<ItemModel[]> {
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

            if (error) throw error

            items.push(...(data as DbItem[]).map(toItemModel))
        } catch (error) {
            console.error(error)
        } finally {
            loading.value = false
        }
        return []
    }

    async function updateItems(_items: ItemModel[]) {
        // TODO: implement
        return []
    }

    async function deleteItem(item: ItemModel) {
        // TODO: implement
        return item
    }

    return { fetchItems, updateItems, deleteItem, items }
})
