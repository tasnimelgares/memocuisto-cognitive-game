import { E2EComponentFixture } from "e2e/e2e-component.fixture";
import { RecipeSettingsFixture } from "./recipe-settings/recipe-settings.fixture";

export class ConfigFixture extends E2EComponentFixture {

  public readonly recipeSettings = new RecipeSettingsFixture(this.page);

  getOptionAttenuerEchecs() {
    return this.page.getByText(/atténuer les retours d'échecs/i, { exact: false });
  }

  getOptionRappelInactivite() {
    return this.page.getByText(/rappel d'inactivité/i, { exact: false });
  }

  getBtnModeMalvoyant() {
    return this.page.locator('section', { hasText: /Mode malvoyant/i }).locator('button.toggle-btn');
  }

  getBtnLancerPartie() {
    return this.page.getByRole('button', { name: /Lancer la partie/i });
  }

  async toggleAttenuerEchecs() {
    await this.getOptionAttenuerEchecs().click();
  }

  async toggleRappelInactivite() {
    await this.getOptionRappelInactivite().click();
  }

  async toggleModeMalvoyant() {
    const btn = this.getBtnModeMalvoyant();
    const text = await btn.textContent();
    if (text && text.includes('Désactivé')) {
      await btn.click();
    }
  }

  async clickLancerPartie() {
    await this.getBtnLancerPartie().click();
  }

  // Action combinée pour configurer la partie selon le scénario 2
  async preparerPartieScenario2() {
    await this.toggleAttenuerEchecs();
    await this.toggleRappelInactivite();
    await this.toggleModeMalvoyant();
    await this.clickLancerPartie();
  }

  // Action combinée pour configurer la partie selon le scénario 5
  async preparerPartieScenario5() {
    await this.recipeSettings.selectDifficulty('moyen');
    await this.clickLancerPartie();
  }
}