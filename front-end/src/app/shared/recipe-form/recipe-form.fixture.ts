import { E2EComponentFixture } from "e2e/e2e-component.fixture";
import { SelectIngredientsFixture } from "src/app/twoplayer/select-ingredient/select-ingredient.fixture";
import { SelectStepsFixture } from "src/app/twoplayer/select-steps/select-steps.fixture";

export class RecipeFormFixture extends E2EComponentFixture {

    public readonly stepsFixture = new SelectStepsFixture(this.page);
    public readonly selectIngredientFixture = new SelectIngredientsFixture(this.page);
    // --- ACCESSEURS ---

    getNameInput() {
        // Cible l'input à l'intérieur du label "nom" dans le composant app-form-field
        return this.page.locator('app-form-field[label*="Nom"]').locator('input, textarea');
    }

    getFileInput() {
        return this.page.locator('input[type="file"]');
    }

    getCategorySelect() {
        return this.page.locator('app-form-field[label*="Catégorie"]').locator('select');
    }

    getSubmitButton() {
        return this.page.locator('app-button', { hasText: 'Sauvegarder la recette' });
    }

    getCloseButton() {
        return this.page.locator('.btn-close');
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

    async selectCategory(categoryLabel: string) {
        const select = this.getCategorySelect();
        // Sélectionne l'option par son texte visible (ex: 'Dessert')
        await select.selectOption({ label: categoryLabel });
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

    async createRecipeShortcut(name: string, relativeImagePath: string, categoryLabel: string, ingredients: string[],  steps: string[]) {
        await this.fillName(name);
        await this.uploadImage(relativeImagePath);
        await this.selectCategory(categoryLabel);
        // ingredients
        for (const ingredientText of ingredients) {
            await this.selectIngredientFixture.addIngredient(ingredientText);
        }
        await this.selectIngredientFixture.clickBtnCloseDropdown();
        // étapes
        for (const stepText of steps) {
            await this.stepsFixture.addStep(stepText);
        }
        await this.clickSave();
    }
}