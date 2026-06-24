import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class StoreSectionFixture extends E2EComponentFixture {

  getIngredient(nomIngredient: string) {
    return this.page.getByText(nomIngredient, { exact: true });
  }

  getBtnRetourPlan() {
    return this.page.getByRole('button', { name: /Retour au plan/i });
  }

  getFeedbackMessage() {
    return this.page.locator('app-encouragement-text');
  }

  getBtnAllerCuisine() {
    return this.page.getByRole('button', { name: /Aller à la cuisine/i });
  }


  async cliquerIngredient(nomIngredient: string) {
    await this.getIngredient(nomIngredient).click();
  }

  async retournerAuPlan() {
    await this.getBtnRetourPlan().click();
  }

  async allerCuisine() {
    await this.getBtnAllerCuisine().click();
  }
}