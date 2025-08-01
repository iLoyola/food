import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

import { MarketplaceModel } from '../model/marketplace.model.js'

const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL

export const useMarketplacesStore = defineStore('marketplaces', () => {
    const loading = ref<boolean>(false)
    const marketplaces = reactive<MarketplaceModel[]>([])
    const activeMarket = ref<string>('all')

    async function fetchMarketplaces(): Promise<MarketplaceModel[]> {
        try {
            loading.value = true
            let response = await fetch(`${dbUrl}/marketplaces.json`)
            let responseData = await response.json()

            for (let key in responseData) {
                if (responseData.hasOwnProperty(key)) {
                    marketplaces.push({ ...responseData[key], id: key })
                }
            }

        } catch (error) {
            console.log(error)
        }
        loading.value = false
        return []
    }
    return { fetchMarketplaces, marketplaces, activeMarket }
})