import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class IngredientFormFixture extends E2EComponentFixture {

    // --- ACCESSEURS ---

    getNameInput() {
        // Cible l'input à l'intérieur du label "Nom du produit :" dans le composant app-form-field
        return this.page.locator('app-form-field[label*="Nom du produit :"]').locator('input, textarea');
    }

    getFileInput() {
        return this.page.locator('input[type="file"]');
    }

    getRayonSelect() {
        return this.page.locator('app-form-field[label*="Dans quel rayon le ranger ?"]').locator('select');
    }

    getRangementSelect() {
        return this.page.locator('app-form-field[label*="Où rangez-vous ceci chez vous ?"]').locator('select');
    }

    getSubmitButton() {
        return this.page.locator('app-button', { hasText: 'Ajouter au supermarché' });
    }

    getCloseButton() {
        return this.page.locator('.form-header .btn-close');
    }

    getFeedbackMessage() {
        return this.page.locator('form > p b');
    }

    // --- ACTIONS ---

    async fillName(name: string) {
        const input = this.getNameInput();
        await input.fill(name);
    }

    async uploadImage(relativeFilePath: string) {
        const fileInput = this.getFileInput();
        await fileInput.setInputFiles(relativeFilePath);
    }

    async selectRayon(rayonLabel: string) {
        const select = this.getRayonSelect();
        await select.selectOption({ label: rayonLabel });
    }

    async selectRangement(rangementLabel: string) {
        const select = this.getRangementSelect();
        await select.selectOption({ label: rangementLabel });
    }

    async clickSave() {
        const button = this.getSubmitButton();
        await button.click();
    }

    async clickClose() {
        const button = this.getCloseButton();
        await button.click();
    }

    // --- MACRO-ACTION (Remplissage complet rapide) ---

    async createIngredientShortcut(name: string, relativeImagePath: string, rayonLabel: string, rangementLabel: string) {
        await this.fillName(name);
        await this.uploadImage(relativeImagePath);
        await this.selectRayon(rayonLabel);
        await this.selectRangement(rangementLabel);
        await this.clickSave();
    }
}