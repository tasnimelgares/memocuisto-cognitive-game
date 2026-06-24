import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class MapFixture extends E2EComponentFixture {

  getRayon(nomRayon: string) {
    // Cherche le nom du rayon (ex: "Rayon Fruits & Légumes")
    return this.page.getByText(nomRayon, { exact: false });
  }

  async allerAuRayon(nomRayon: string) {
    await this.getRayon(nomRayon).click();
  }

  async clickOpenInventory(){
    await this.page.locator('.inventory-top-right').click();
  }
}