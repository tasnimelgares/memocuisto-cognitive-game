import { Locator, Page } from '@playwright/test';
import { E2EComponentFixture } from 'e2e/e2e-component.fixture';

export class RecipeSettingsFixture extends E2EComponentFixture {

  getDifficultySelect() {
    return this.page.locator('.form-group:has-text("Niveau de difficulté") select');
  }

  /**
   * Modifie la difficulté de la recette
   */
  async selectDifficulty(level: 'tout' | 'facile' | 'moyen' | 'difficile'): Promise<void> {
    await this.getDifficultySelect().selectOption(level);
  }

  /**
   * Récupère la valeur actuellement sélectionnée
   */
  async getCurrentDifficulty(): Promise<string> {
    return await this.getDifficultySelect().inputValue();
  }
}