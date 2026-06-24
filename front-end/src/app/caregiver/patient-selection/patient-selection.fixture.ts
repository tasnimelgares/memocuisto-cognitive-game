import { E2EComponentFixture } from "e2e/e2e-component.fixture";

export class PatientSelectionFixture extends E2EComponentFixture {

  getPatientByName(patientName: string) {
    // Cherche le nom du patient qui s'affiche dans la liste
    return this.page.getByText(patientName, { exact: false });
  }

  getBtnSuivant() {
    return this.page.getByRole('button', { name: /Suivant/i });
  }

  async clickPatient(patientName: string) {
    await this.getPatientByName(patientName).click();
  }

  async clickSuivant() {
    await this.getBtnSuivant().click();
  }

  // Action combinée pr scenario 2
  async selectPatientAndProceed(patientName: string) {
    await this.clickPatient(patientName);
    await this.clickSuivant();
  }
}