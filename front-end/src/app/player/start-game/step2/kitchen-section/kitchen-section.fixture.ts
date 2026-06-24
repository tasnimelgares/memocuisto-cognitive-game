import { E2EComponentFixture } from "e2e/e2e-component.fixture";
import { Locator } from '@playwright/test';

export class KitchenSectionFixture extends E2EComponentFixture {


  getIngredient(nomIngredient: string) {
    // On cible l'image de l'ingrédient par son texte alternatif (alt)
    return this.page.locator(`img[alt="${nomIngredient}"]`);
  }

  getZoneFrigo() {
    return this.page.locator('#frigo');
  }

  getZonePlacard() {
    return this.page.locator('#placard');
  }

  getZoneCongelateur(){
    return this.page.locator('#congelateur');
  }

  getFeedbackMessage() {
    return this.page.locator('app-encouragement-text');
  }

  getBtnPreparerRecette() {
    return this.page.getByRole('button', { name: /Préparer la recette/i });
  }

  // Cible les images d'ingrédients spécifiquement rangées dans le frigo
  getItemsInFrigo() {
    return this.page.locator('#frigo img.stored-item');
  }

  // Cible les images d'ingrédients spécifiquement rangées dans le placard
  getItemsInPlacard() {
    return this.page.locator('#placard img.stored-item');
  }

  // Cible les images d'ingrédients spécifiquement rangées dans le congélateur
  getItemsInCongelateur() {
    return this.page.locator('#congelateur img.stored-item');
  }

  // Cible tous les ingrédients encore présents sur la table (à trier)
  getItemsSurTable() {
    return this.page.locator('.items-to-sort .draggable img');
  }

  // Fonction pour Angular CDK
  private async dragCdk(source: Locator, target: Locator) {
    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();

    if (!sourceBox || !targetBox) throw new Error("Éléments introuvables pour le Drag & Drop");

    // Placer la souris au centre de l'ingrédient
    await this.page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await this.page.mouse.down();
    
    // Bouger un tout petit peu pour qu'Angular détecte le début du glissement
    await this.page.mouse.move(sourceBox.x + sourceBox.width / 2 + 10, sourceBox.y + sourceBox.height / 2 + 10);
    await this.page.waitForTimeout(200); 

    // Déplacer la souris vers la zone cible
    await this.page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await this.page.waitForTimeout(200); 
    
    // Relâcher le clic
    await this.page.mouse.up();
  }

  async rangerAuFrigo(nomIngredient: string) {
    const ingredient = this.getIngredient(nomIngredient);
    const frigo = this.getZoneFrigo();
    await this.dragCdk(ingredient, frigo); 
  }

  async rangerAuPlacard(nomIngredient: string) {
    const ingredient = this.getIngredient(nomIngredient);
    const placard = this.getZonePlacard();
    await this.dragCdk(ingredient, placard);
  }

  async rangerAuCongelateur(nomIngredient: string) {
    const ingredient = this.getIngredient(nomIngredient);
    const congelateur = this.getZoneCongelateur();
    await this.dragCdk(ingredient, congelateur);
  }

  async allerPreparerRecette() {
    await this.getBtnPreparerRecette().click();
  }
}