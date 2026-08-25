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
            stepImages: string[],
            instruction: string
        }
    ],
    primaryImages: string[],
    notes?: string,
    // Admin-only: problems flagged by AI recipe-photo scanning. Never shown
    // on the public site — see the recipes.scan_issues column comment.
    scanIssues?: string,
    isEnabled: boolean,
    titlePosition: string,
    boundRecipes?: [
        {
            name: string,
            url: string
        }
    ]
}