import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class GuessRecipeFixture extends E2EComponentFixture {
    getLettersTriedZone() {
        return this.page.locator('.letters-tried');
    }
    
    getLetterSlots() {
        return this.page.locator('.letter-slot');
    }
  
    getKeyboardButtons() {
        return this.page.locator('.virtual-keyboard .key-button');
    }

    async taperLettre(lettre: string) {
        await this.page.locator('.virtual-keyboard').getByRole('button', { name: lettre, exact: true }).click();
    }

    async cliquerRetourAccueil() {
        await this.page.getByRole('button', { name: /Retourner à l'accueil/i }).click();
    }
}