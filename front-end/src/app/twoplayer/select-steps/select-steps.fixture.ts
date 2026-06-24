import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class SelectStepsFixture extends E2EComponentFixture {

    // --- ACCESSEURS ---

    getStepInput() {
        return this.page.locator('.step-input');
    }

    getAddButton() {
        return this.page.locator('button.add-btn');
    }

    getStepsListItems() {
        return this.page.locator('.steps-list .step-item');
    }

    getErrorMessage() {
        return this.page.locator('.error-msg');
    }

    getWarningMessage() {
        return this.page.locator('.warning-msg');
    }

    // --- ACTIONS ---

    /**
     * Écrit un texte dans l'input et clique sur "Ajouter"
     */
    async addStep(stepText: string) {
        const input = this.getStepInput();
        await input.fill(stepText);
        
        const addButton = this.getAddButton();
        await addButton.click();
    }

    /**
     * Supprime une étape à un index précis (0 pour la première, 1 pour la deuxième, etc.)
     */
    async removeStepAt(index: number) {
        const stepItem = this.getStepsListItems().nth(index);
        const deleteButton = stepItem.locator('.delete-btn');
        await deleteButton.click();
    }

    // --- VÉRIFICATIONS / GETTERS DE DONNÉES ---

    /**
     * Renvoie le nombre d'étapes actuellement visibles dans la liste
     */
    async getStepsCount() : Promise<number> {
        return this.getStepsListItems().count();
    }

    /**
     * Renvoie le texte d'une étape spécifique à un index donné
     */
    async getStepTextAt(index: number): Promise<string | null> {
        const stepItem = this.getStepsListItems().nth(index);
        return stepItem.locator('.step-content p').innerText();
    }
}