import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../supabase/client.js'
import { MarketplaceModel } from '../model/marketplace.model.js'

export const useMarketplacesStore = defineStore('marketplaces', () => {
    const loading = ref<boolean>(false)
    const marketplaces = reactive<MarketplaceModel[]>([])
    const activeMarket = ref<string>('all')

    async function fetchMarketplaces(): Promise<MarketplaceModel[]> {
        try {
            loading.value = true
            const { data, error } = await supabase
                .from('marketplaces')
                .select('*')
                .eq('is_enabled', true)

            if (error) throw error

            marketplaces.push(...data.map(m => ({
                id: m.id,
                name: m.name,
                isEnabled: m.is_enabled
            })))
        } catch (error) {
            console.error(error)
        } finally {
            loading.value = false
        }
        return []
    }

    return { fetchMarketplaces, marketplaces, activeMarket }
})
