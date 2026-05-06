import { CategoryModel } from './category.model.js'
import { MarketplaceModel } from './marketplace.model.js'

export interface ItemModel {
    product: string,
    id?: string,
    category: CategoryModel,
    brand?: string,
    quantity?: number,
    marketplaces: MarketplaceModel[],
    comments?: string,
    isNonessential: boolean,
    isEnabled: boolean,
    marketplacesIds: string[]
}