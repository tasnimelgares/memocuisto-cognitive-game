import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class StepsFixture extends E2EComponentFixture {

  getEtapeMixee(texteEtape: string) {
    // Cherche le texte exact de l'étape dans la colonne de gauche
    return this.page.getByText(texteEtape, { exact: true });
  }

  getBtnVerifier() {
    return this.page.getByRole('button', { name: /Vérifier votre recette/i });
  }

  getFeedbackMessage() {
    return this.page.locator('app-encouragement-text');
  }

  async cliquerSurEtape(texteEtape: string) {
    await this.getEtapeMixee(texteEtape).click();
  }

  async verifierRecette() {
    await this.getBtnVerifier().click();
  }
}