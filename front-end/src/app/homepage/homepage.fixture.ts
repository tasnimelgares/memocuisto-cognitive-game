import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class HomepageFixture extends E2EComponentFixture {

  //récupération des éléments

  getBtnProfilSoignant() {
    return this.page.getByRole('button', { name: /Profil Soignant\(e\)/i });
  }

  getInputPassword() {
    return this.page.getByPlaceholder('Mot de passe...');
  }

  getBtnValider() {
    return this.page.getByRole('button', { name: 'Valider' });
  }

  getBtnJouerEnAutonomie() {
    return this.page.locator('#btn-solo');
  }

  getBtnJouerADeux() {
    return this.page.locator('#btn-duo');
  }

  getBtnJouer(){
    return this.page.locator('.big-play-btn');
  }

  getPatientsModal() {
    return this.page.locator('.modal-overlay:has-text("Sélectionne ton profil")');
  }

  getPatientProfiles() {
    return this.page.locator('.profiles-grid .profile');
  }

  getBtnCatalogue(){
    return this.page.locator('.btn-catalogue');
  }

  getBtnDeconnexion() {
    return this.page.locator('.change-profile-container');
  }

  // actions

  async clickProfilSoignant() {
    await this.getBtnProfilSoignant().click();
  }

  async clickBtnJouer(){
    await this.getBtnJouer().click();
  }

  async clickBtnJouerEnAutonomie(){
    await this.getBtnJouerEnAutonomie().click();
  }

  async clickBtnJouerADeux(){
    await this.getBtnJouerADeux().click();
  }

  async clickBtnCatalogue(){
    await this.getBtnCatalogue().click();
  }

  async clickBtnDeconnexion() {
    await this.getBtnDeconnexion().click();
  }

  async fillPassword(password: string) {
    await this.getInputPassword().fill(password);
  }

  async clickValider() {
    await this.getBtnValider().click();
  }

  /**
   * Clique sur un patient en cherchant directement par son prénom ou son nom
   */
  async clickPatientByName(name: string) {
    const patientRow = this.page.locator('.profiles-grid .profile', { hasText: name });
    await patientRow.click();
  }

  /**
   * Renvoie le nombre de patients affichés dans la modale
   */
  async getPatientsCount(): Promise<number> {
    return this.getPatientProfiles().count();
  }

  // Action combinée pour faire les 3 étapes d'un coup 
  async loginAsSoignant(password: string) {
    await this.clickProfilSoignant();
    await this.fillPassword(password);
    await this.clickValider();
  }
}