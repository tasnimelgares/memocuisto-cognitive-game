import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class DashboardFixture extends E2EComponentFixture {

  getBtnConfiguration() {
    return this.page.getByRole('button', { name: /Configuration/i });
  }

  getBtnStatistiques() {
    return this.page.getByRole('button', { name: /Statistiques/i });
  }

  getBtnCatalogue() {
    return this.page.getByRole('button', { name: /Catalogue/i });
  }

  getBtnInformations() {
    return this.page.getByRole('button', { name: /Informations/i });
  }

  async clickConfiguration() {
    await this.getBtnConfiguration().click();
  }

  async clickStatistiques() {
    await this.getBtnStatistiques().click();
  }
}