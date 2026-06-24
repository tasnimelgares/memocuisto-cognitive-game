import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class CatalogueFixture extends E2EComponentFixture {
    
    getAddIngredientButton() {
        return this.page.locator('.ingredient-grid .add-placeholder-card', { hasText: 'Ajouter un ingrédient' });
    }

    getAddRecipeButton() {
        return this.page.locator('.recipe-grid .add-placeholder-card', { hasText: 'Ajouter une recette' });
    }

    getAllItemsVisible() {
        return this.page.locator('.content-area app-recipe-card');
    }

    /**
     * Renvoie le nombre d'éléments actuellement visibles sur la page
     */
    async getItemsCount(): Promise<number> {
        return this.getAllItemsVisible().count();
    }

    /**
     * Récupère tous les textes ou titres des cartes visibles 
     */
    async getAllItemsTexts(): Promise<string[]> {
        await this.page.locator('.content-area').waitFor({ state: 'visible' });

        //on attends un peu pr être sur que c'est chargé
        await this.page.waitForTimeout(200);

        const items = this.page.locator('.content-area app-recipe-card');
        
        // Maintenant on peut récupérer tous les textes en toute sécurité
        return items.allInnerTexts();
    }

    /**
     * Clique sur un élément de la liste en fonction de son nom/texte
     */
    async clickItemByName(name: string) {
        await this.getAllItemsVisible().filter({ hasText: name }).click();
    }
    
    async clickAddRecipeButton() {
        const button = await this.getAddRecipeButton();
        return button.click();
    }

    async clickAddIngredientButton() {
        const button = await this.getAddIngredientButton();
        return button.click();
    }

}