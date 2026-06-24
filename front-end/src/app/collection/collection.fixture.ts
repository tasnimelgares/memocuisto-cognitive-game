import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class CollectionFixture extends E2EComponentFixture {
    getRecipeForm() {
        return this.page.waitForSelector('app-recipe-form');
    }

    getIngredientForm() {
        return this.page.waitForSelector('app-ingredient-form');
    }

    async clickToggleSlider() {
        await this.page.locator('.toggle-container .slider').click();
    }

    async fillFilterInput(filtre: string) {
        await this.page.locator('.global-search-input').fill(filtre);
    }

    async clearFilterInput() {
        await this.page.locator('.clear-btn').click();
    }

    async clickReturnButton(){
        await this.page.locator('.return-btn').click();
    }

}