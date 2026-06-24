import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class StatisticsFixture extends E2EComponentFixture {

  getNoDataMessage() {
    return this.page.getByText('Aucune partie enregistrée');
  }

  getSelectOptions() {
    return this.page.locator('select.date-selector option');
  }

  async getNombreDePartiesJouees(): Promise<number> {
    const noDataVisible = await this.getNoDataMessage().isVisible();
    if (noDataVisible) {
      return 0;
    } else {
      return await this.getSelectOptions().count();
    }
  }

  async clickBtnHomePage(){
    await this.page.locator('img[src*="acceuil.png"]').click();
  }

  //Capture un "instantané" des statistiques actuellement affichées à l'écran 
  // (null s'il n'y a aucune partie)

  async getStatsSnapshot() {
    // Vérifie si le message "Aucune partie enregistrée" est visible
    const aucunePartie = await this.page.getByText('Aucune partie enregistrée').isVisible();
    if (aucunePartie) {
      return null;
    }

    // Récupère la date de la partie sélectionnée dans le menu déroulant
    const dateSelectionnee = await this.page.locator('.date-selector option:checked').innerText();

    // Récupère le contenu textuel des composants clés
    const globalSummary = await this.page.locator('app-global-summary').innerText();
    const precisionText = await this.page.locator('app-indicator-card', { hasText: 'Précision' }).innerText();
    const aisanceText = await this.page.locator('app-indicator-card', { hasText: 'Aisance' }).innerText();
    const fatigueText = await this.page.locator('app-indicator-card', { hasText: 'Indice de Fatigue' }).innerText();

    // Retourne un objet contenant toutes les stats
    return {
      date: dateSelectionnee.trim(),
      summary: globalSummary.trim(),
      precision: precisionText.trim(),
      aisance: aisanceText.trim(),
      fatigue: fatigueText.trim()
    };
  }
}