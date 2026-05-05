import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

// model
import { ItemModel } from '../model/item.model.js'

const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL

export const useItemsStore = defineStore('items', () => {

    const loading = ref<boolean>(false)
    const items = reactive <ItemModel[]>([])

    async function fetchItems(): Promise<ItemModel[]> {
        try {
            loading.value = true
            let response = await fetch(`${dbUrl}/items.json`)
            let responseData = await response.json()

            for (let key in responseData) {
                if (responseData.hasOwnProperty(key)) {
                    items.push({ ...responseData[key], id: key, marketplacesIds: [] })
                }
            }

        } catch (error) {
            console.log(error)
        }
        loading.value = false
        return []
    }

    async function updateItems(items: ItemModel[]) {
        try {
            loading.value = true
            console.log({items})

        }
        catch (error) {

        } finally {
            loading.value = false
        }
        return []
    }

    async function deleteItem(item:ItemModel) {
        try {
            loading.value = true
            console.log({ item })

        }
        catch (error) {

        } finally {
            loading.value = false
        }
        return item
    }

    return { fetchItems, updateItems, deleteItem, items }
})