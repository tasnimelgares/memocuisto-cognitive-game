import { RecipeSettingsFixture } from './../../src/app/caregiver/config/recipe-settings/recipe-settings.fixture';
import { test, expect } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';
import { HomepageFixture } from 'src/app/homepage/homepage.fixture';
import { ConfigFixture } from 'src/app/caregiver/config/config.fixture';
import { PatientSelectionFixture } from 'src/app/caregiver/patient-selection/patient-selection.fixture';
import { DashboardFixture } from 'src/app/caregiver/dashboard/dashboard.fixture';
import { SelectRecipeFixture } from 'src/app/player/select-recipe/select-recipe.fixture';
import { MapFixture } from 'src/app/player/start-game/step1/map/map.fixture';
import { StoreSectionFixture } from 'src/app/player/start-game/step1/store-section/store-section.fixture';
import { SidebarFixture } from 'src/app/shared/sidebar/sidebar.fixture';

test.describe('Vérification du système d\'aides et des statistiques', () => {
    
  // Scénario 3 :
    test('Doit appliquer, utiliser et conserver les configurations', async ({ page }) => {
      const homepage = new HomepageFixture(page);
      const config = new ConfigFixture(page);
      const patientSelection = new PatientSelectionFixture(page);
      const dashboard = new DashboardFixture(page);
      const recipeSettings = new RecipeSettingsFixture(page);

      await page.goto(testUrl);

      await test.step('1. Côté Soignant : Modifier difficulté, textes et encouragements', async () => {
        // la soignante se connecte, va dans les configs de Céline Pastor, met le niveau difficile, textes agrandis et encouragements
        // revient à la page d'accueil
        await homepage.loginAsSoignant('1234');
        await patientSelection.selectPatientAndProceed('Céline Pastor');
        await dashboard.clickConfiguration();

        await recipeSettings.selectDifficulty('difficile');

        const btnAgrandir = page.getByRole('button', { name: /Agrandir les consignes/i });
        const classesAgrandir = await btnAgrandir.getAttribute('class');
        if (classesAgrandir && !classesAgrandir.includes('active')) {
            await btnAgrandir.click();
        }

        const btnEncouragements = page.getByRole('button', { name: /Plus d'encouragements/i });
        const classesEncouragements = await btnEncouragements.getAttribute('class');
        if (classesEncouragements && !classesEncouragements.includes('active')) {
            await btnEncouragements.click();
        }

        await config.clickLancerPartie();
      });
   

      await test.step('2. Côté Joueur (solo) : Vérifier que chaque config est prise en compte', async () => {
        // lance le jeu pour Céline et vérifier :
        // l'agrandissement, 
        // les encouragements 
        // et la difficulté -> avec les recettes de gratin de legumes tiramisu etc. (celles avec bcp d'ingredients)
        // finir la partie

        const selectRecipeFixture = new SelectRecipeFixture(page);
        const mapFixture = new MapFixture(page);
        const storeFixture = new StoreSectionFixture(page);
        const sidebarFixture = new SidebarFixture(page);
        const homepageFixture = new HomepageFixture(page);

        await homepage.clickBtnJouerEnAutonomie();

        const recetteDifficile = page.getByText('Tiramisu', { exact: false });
        await expect(recetteDifficile).toBeVisible();
        await selectRecipeFixture.clickRecipe('Tiramisu');
        await selectRecipeFixture.clickMemoriseParti();

        const consigne = page.locator('app-instruction');
        await expect(consigne).toBeVisible();
        
        const body = page.locator('body');
        await expect(body).toHaveClass(/large-mode/);

        await mapFixture.allerAuRayon('Rayon Frais');

        const bonIngredient = page.locator('app-ingredient-card').filter({ hasText: /Mascarpone/i });
        await expect(bonIngredient).toBeVisible();
        await storeFixture.cliquerIngredient('Mascarpone');

        const encouragement = page.locator('app-encouragement-text');
        await expect(encouragement).toBeVisible({timeout: 10000});
 
        await page.getByRole('button', { name: '☰' }).click();
        const btnQuitter = page.locator('.quit-btn-small');
        await expect(btnQuitter).toBeVisible();
        await sidebarFixture.clickExitGame();
        await homepageFixture.clickBtnDeconnexion();
      });

      await test.step('3. Côté Soignant : Voir si elles sont encore activées', async () => {
        // retour à l'espace soignant et vérifier que les boutons sont toujours activés

        await homepage.loginAsSoignant('1234');
        await patientSelection.selectPatientAndProceed('Céline Pastor');
        await dashboard.clickConfiguration();

        const difficulteActuelle = await recipeSettings.getCurrentDifficulty();
        expect(difficulteActuelle).toBe('difficile');

        // les deux configs doivent être selectionnées
        const btnAgrandir = page.getByRole('button', { name: /Agrandir les consignes/i });
        await expect(btnAgrandir).toHaveClass(/\bactive\b/);

        const btnEncouragements = page.getByRole('button', { name: /Plus d'encouragements/i });
        await expect(btnEncouragements).toHaveClass(/\bactive\b/);
      });
  });
});
