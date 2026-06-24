import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class SelectIngredientsFixture extends E2EComponentFixture {

    // --- ACCESSEURS ---

    getSearchInput() {
        return this.page.locator('.select-container .search-input');
    }

    getDropdown() {
        return this.page.locator('.select-container .dropdown');
    }

    getDropdownItems() {
        return this.getDropdown().locator('li');
    }

    getSelectedChips() {
        return this.page.locator('.selected-chips .chip');
    }

    getErrorMessage() {
        return this.page.locator('.error-msg');
    }

    getBtnClose() {
        return this.page.locator('.close-dropdown-btn');
    }

    getWarningMessage() {
        return this.page.locator('.warning-msg');
    }

    // --- ACTIONS ---

    /**
     * Recherche un ingrédient, attend que le dropdown s'ouvre, et clique sur le résultat correspondant
     */
    async addIngredient(ingredientName: string) {
        const input = this.getSearchInput();
        
        // on clique sur l'input pour focus et ouvrir la liste, puis on tape le nom
        await input.click();
        await input.fill(ingredientName);

        // on cible l'élément spécifique dans le dropdown qui contient le nom de l'ingrédient
        const itemToClick = this.getDropdownItems().filter({ hasText: ingredientName }).first();
        
        // on clique dessus pour l'ajouter
        await itemToClick.click();
    }

    /**
     * Supprime un ingrédient déjà sélectionné en cliquant sur sa croix (sa puce/chip)
     */
    async removeIngredient(ingredientName: string) {
        const chip = this.getSelectedChips().filter({ hasText: ingredientName });
        const closeButton = chip.locator('button');
        await closeButton.click();
    }

    /**
     * Ferme la liste de recherche d'ingrédients
     */
    async clickBtnCloseDropdown() {
        await this.getBtnClose().click();
    }

    // --- GETTERS DE DONNÉES / VÉRIFICATIONS ---

    /**
     * Renvoie le nombre d'ingrédients actuellement sélectionnés
     */
    async getSelectedCount(): Promise<number> {
        return this.getSelectedChips().count();
    }

    /**
     * Récupère la liste de tous les noms d'ingrédients actuellement sélectionnés
     */
    async getSelectedIngredientsNames(): Promise<string[]> {
        return this.getSelectedChips().allInnerTexts();
    }
}