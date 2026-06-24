import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class AppInventoryFixture extends E2EComponentFixture {

    getIngredientLines() {
        return this.page.locator('.ingredient-line');
    }

    async getCheckIconsText() {
        return await this.page.locator('.check-icon').allTextContents();
    }

    async clickCloseInventory() {
        await this.page.locator('.shopping-note-open').click();
    }
}