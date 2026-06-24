import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class DetailCardFixture extends E2EComponentFixture {

    // --- ACCESSEURS GÉNÉRAUX ET STRUCTURE ---

    getRecipeContainer() {
        return this.page.locator('.recipe-card-container');
    }

    getIngredientContainer() {
        return this.page.locator('.ingredient-card-container');
    }

    getConfirmationModal() {
        return this.page.locator('app-confirmation-modal');
    }

    // --- ACCESSEURS DÉTAILS RECETTE ---

    getRecipeTitle() {
        return this.getRecipeContainer().locator('h2');
    }

    getRecipeCategoryBadge() {
        return this.getRecipeContainer().locator('.category-badge');
    }

    getRecipeIngredientsItems() {
        return this.getRecipeContainer().locator('app-ingredient-mini-item');
    }

    getRecipeStepsItems() {
        return this.getRecipeContainer().locator('.steps-grid li');
    }

    // --- ACCESSEURS DÉTAILS INGRÉDIENT ---

    getIngredientTitle() {
        return this.getIngredientContainer().locator('h2');
    }

    getIngredientBadges() {
        // Retourne les badges du rayon et du rangement de la cuisine
        return this.getIngredientContainer().locator('.rayon-badge');
    }

    // --- ACTIONS COMMUNES ---

    /**
     * Clique sur le bouton de fermeture
     */
    async clickClose() {
        // On clique sur le bouton visible à l'écran
        await this.page.locator('.modal-overlay app-content-card:visible .btn-close').click();
    }

    /**
     * Clique sur le bouton de suppression 
     */
    async clickDelete() {
        await this.page.locator('.modal-overlay app-content-card:visible .btn-delete').click();
    }

    // --- ACTIONS MODALE DE CONFIRMATION ---

    /**
     * Confirme la suppression dans la sous-modale
     */
    async confirmDelete() {
        // Adapte le sélecteur du bouton de confirmation selon ton app-confirmation-modal
        await this.getConfirmationModal().locator('.confirm-delete-btn').click();
    }

    /**
     * Annule la suppression dans la sous-modale
     */
    async cancelDelete() {
        // Adapte le sélecteur du bouton d'annulation selon ton app-confirmation-modal
        await this.getConfirmationModal().locator('.cancel-btn').click();
    }
}