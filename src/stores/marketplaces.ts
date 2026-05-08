import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../supabase/client.js'
import { useToastStore } from './toast.js'
import { MarketplaceModel } from '../model/marketplace.model.js'

export interface AdminMarketplace extends MarketplaceModel {
    itemCount: number
}

export const useMarketplacesStore = defineStore('marketplaces', () => {
    const toast = useToastStore()
    const loading = ref<boolean>(false)
    const marketplaces = reactive<MarketplaceModel[]>([])
    const adminMarketplaces = reactive<AdminMarketplace[]>([])
    const activeMarket = ref<string>('all')

    async function fetchMarketplaces(): Promise<void> {
        try {
            loading.value = true
            const { data, error } = await supabase
                .from('marketplaces')
                .select('*')
                .eq('is_enabled', true)
                .order('name')

            if (error) throw error

            marketplaces.splice(0)
            marketplaces.push(...data.map(m => ({
                id: m.id,
                name: m.name,
                isEnabled: m.is_enabled
            })))
        } catch (error) {
            console.error(error)
            toast.show('Failed to load marketplaces. Please try again.', 'error')
        } finally {
            loading.value = false
        }
    }

    async function fetchAllMarketplaces(): Promise<void> {
        try {
            const { data, error } = await supabase
                .from('marketplaces')
                .select('id, name, is_enabled, item_marketplaces(marketplace_id)')
                .order('name')

            if (error) throw error

            adminMarketplaces.splice(0)
            adminMarketplaces.push(...data.map((m: any) => ({
                id: m.id,
                name: m.name,
                isEnabled: m.is_enabled,
                itemCount: m.item_marketplaces.length,
            })))
        } catch (error) {
            console.error(error)
            toast.show('Failed to load marketplaces.', 'error')
        }
    }

    async function addMarketplace(name: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('marketplaces')
                .insert({ name: name.trim(), is_enabled: true })
            if (error) throw error
            await Promise.all([fetchMarketplaces(), fetchAllMarketplaces()])
            toast.show(`"${name.trim()}" added.`, 'success')
        } catch (err) {
            console.error(err)
            toast.show('Failed to add marketplace.', 'error')
            throw err
        }
    }

    async function updateMarketplace(id: string, name: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('marketplaces')
                .update({ name: name.trim() })
                .eq('id', id)
            if (error) throw error
            await Promise.all([fetchMarketplaces(), fetchAllMarketplaces()])
            toast.show('Marketplace updated.', 'success')
        } catch (err) {
            console.error(err)
            toast.show('Failed to update marketplace.', 'error')
            throw err
        }
    }

    async function setMarketplaceEnabled(id: string, enabled: boolean): Promise<void> {
        try {
            const { error } = await supabase
                .from('marketplaces')
                .update({ is_enabled: enabled })
                .eq('id', id)
            if (error) throw error
            await Promise.all([fetchMarketplaces(), fetchAllMarketplaces()])
            toast.show(enabled ? 'Marketplace enabled.' : 'Marketplace disabled.', 'success')
        } catch (err) {
            console.error(err)
            toast.show('Failed to update marketplace.', 'error')
            throw err
        }
    }

    async function deleteMarketplace(id: string): Promise<void> {
        try {
            const { error: mpError } = await supabase
                .from('item_marketplaces')
                .delete()
                .eq('marketplace_id', id)
            if (mpError) throw mpError

            const { error } = await supabase
                .from('marketplaces')
                .delete()
                .eq('id', id)
            if (error) throw error

            await Promise.all([fetchMarketplaces(), fetchAllMarketplaces()])
            toast.show('Marketplace deleted.', 'success')
        } catch (err) {
            console.error(err)
            toast.show('Failed to delete marketplace.', 'error')
            throw err
        }
    }

    return {
        fetchMarketplaces, fetchAllMarketplaces,
        addMarketplace, updateMarketplace, setMarketplaceEnabled, deleteMarketplace,
        marketplaces, adminMarketplaces, activeMarket, loading,
    }
})
