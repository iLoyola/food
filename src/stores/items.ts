import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../supabase/client.js'
import { useToastStore } from './toast.js'
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
    const toast = useToastStore()
    const loading = ref<boolean>(false)
    const items = reactive<ItemModel[]>([])
    const knownItems = reactive<ItemModel[]>([])
    const checkedIds = ref<Set<string>>(new Set())

    function toggleChecked(id: string) {
        const next = new Set(checkedIds.value)
        next.has(id) ? next.delete(id) : next.add(id)
        checkedIds.value = next
    }

    function clearChecked() {
        checkedIds.value = new Set()
    }

    async function purchaseItems(ids: string[]): Promise<void> {
        if (!ids.length) return
        try {
            const { error } = await supabase
                .from('items')
                .update({ is_enabled: false })
                .in('id', ids)
            if (error) throw error
            clearChecked()
            await fetchItems()
            toast.show(`${ids.length} item${ids.length !== 1 ? 's' : ''} marked as purchased.`, 'success')
        } catch (err) {
            console.error(err)
            toast.show('Failed to mark items as purchased.', 'error')
        }
    }

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
                .order('product')

            if (error) throw error

            const all = (data as DbItem[]).map(toItemModel)
            knownItems.splice(0, knownItems.length)
            knownItems.push(...all)
            items.splice(0, items.length)
            items.push(...all.filter(i => i.isEnabled))
        } catch (error) {
            console.error(error)
            toast.show('Failed to load items. Please try again.', 'error')
        } finally {
            loading.value = false
        }
    }

    async function addItem(item: ItemModel): Promise<void> {
        try {
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
            toast.show(`${item.product} added to the list.`, 'success')
        } catch (err) {
            console.error(err)
            toast.show('Failed to add item. Please try again.', 'error')
            throw err
        }
    }

    async function updateItem(item: ItemModel): Promise<void> {
        try {
            const { error } = await supabase
                .from('items')
                .update({
                    product: item.product.trim(),
                    brand: item.brand?.trim() || null,
                    quantity: item.quantity ?? 1,
                    comments: item.comments?.trim() || null,
                    is_nonessential: item.isNonessential,
                    is_enabled: item.isEnabled,
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
            toast.show(`${item.product} updated.`, 'success')
        } catch (err) {
            console.error(err)
            toast.show('Failed to update item. Please try again.', 'error')
            throw err
        }
    }

    async function deleteItem(item: ItemModel): Promise<void> {
        try {
            const { error } = await supabase
                .from('items')
                .update({ is_enabled: false })
                .eq('id', item.id!)

            if (error) throw error

            await fetchItems()
            toast.show(`${item.product} removed from the list.`, 'success')
        } catch (err) {
            console.error(err)
            toast.show('Failed to remove item. Please try again.', 'error')
            throw err
        }
    }

    return { fetchItems, addItem, updateItem, deleteItem, purchaseItems, toggleChecked, clearChecked, items, knownItems, checkedIds, loading }
})
