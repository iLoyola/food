export interface RecipeModel {
    readonly alias: string,
    readonly name: string,
    readonly id: string,
    description: string,
    reference?: string,
    tags: string[],
    ingredients: [
        {
            quantity: number,
            volume: string,
            ingredient: string,
            process: string,
            extra: string
        }
    ],
    steps: [
        {
            step: string,
            stepImages: [],
            instruction: string
        }
    ],
    primaryImages: string[],
    notes?: string,
    isEnabled: boolean,
    titlePosition: string,
    boundRecipes?: [
        {
            name: string,
            url: string
        }
    ]
}