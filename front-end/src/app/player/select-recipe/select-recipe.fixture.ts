import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class SelectRecipeFixture extends E2EComponentFixture {

  getRecipeByName(recipeName: string) {
    return this.page.getByText(recipeName, { exact: false });
  }
  getBtnMemoriseParti() {
    return this.page.getByRole('button', { name: /J'ai mémorisé, c'est parti !/i });
  }
  
  async clickRecipe(recipeName: string) {
    await this.getRecipeByName(recipeName).click();
  }

  async clickMemoriseParti() {
    await this.getBtnMemoriseParti().click();
  }
}