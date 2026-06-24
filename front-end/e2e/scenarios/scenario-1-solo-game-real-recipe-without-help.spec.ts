import { test, expect } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';
import { SelectRecipeFixture } from 'src/app/player/select-recipe/select-recipe.fixture';
import { MapFixture } from 'src/app/player/start-game/step1/map/map.fixture';
import { StoreSectionFixture } from 'src/app/player/start-game/step1/store-section/store-section.fixture';
import { KitchenSectionFixture } from 'src/app/player/start-game/step2/kitchen-section/kitchen-section.fixture';
import { StepsFixture } from 'src/app/player/start-game/step3/steps/steps.fixture';

test.describe('Parcours Joueur - Happy Path', () => {

    test('Scénario 1 : Parcours parfait en autonomie', async ({ page }) => {

        test.setTimeout(90000); 

        const selectRecipeFixture = new SelectRecipeFixture(page);
        const mapFixture = new MapFixture(page);
        const storeFixture = new StoreSectionFixture(page);
        const kitchenFixture = new KitchenSectionFixture(page);
        const stepsFixture = new StepsFixture(page);

        await page.goto(testUrl);

        await test.step('1. Accueil : Choix du patient et lancement du jeu', async () => {
            // Clic sur Jouer depuis l'écran principal
            await page.getByRole('button', { name: /^JOUER$/i }).click();
            
            // Sélection du profil
            await page.getByText('Marie Lefèvre', { exact: false }).click();
            
            // Lancement en autonomie
            await page.getByRole('button', { name: /Jouer en autonomie/i }).click();
        });

        await test.step('2. Choix de la recette et mémorisation', async () => {
            await selectRecipeFixture.clickRecipe('Café au lait');
            await selectRecipeFixture.clickMemoriseParti();
        });

        //étape 1 du jeu
        await test.step('3. Supermarché : Parcours sans faute', async () => {
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            // Rayon Frais
            await mapFixture.allerAuRayon('Rayon Frais');
            await storeFixture.cliquerIngredient('Lait');
            await storeFixture.retournerAuPlan();

            // Rayon Épicerie
            await mapFixture.allerAuRayon('Rayon Épicerie');
            await storeFixture.cliquerIngredient('Café');
            await storeFixture.cliquerIngredient('Sucre');
            
            await storeFixture.allerCuisine();
        });

        //étape 2 du jeu
        await test.step('4. Cuisine : Rangement parfait', async () => {
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            await kitchenFixture.rangerAuPlacard('Café');
            await kitchenFixture.rangerAuPlacard('Sucre');
            await kitchenFixture.rangerAuFrigo('Lait');
            
            await kitchenFixture.allerPreparerRecette();
        });

        //étape 3 du jeu
        await test.step('5. Préparation de la recette : Bon ordre du premier coup', async () => {
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            // On clique sur les étapes dans l'ordre
            await stepsFixture.cliquerSurEtape('Faire couler un expresso');
            await stepsFixture.cliquerSurEtape('Faire chauffer le lait');
            await stepsFixture.cliquerSurEtape('Verser le lait dans le café');
            await stepsFixture.cliquerSurEtape('Remuer doucement');

            // Clic sur vérifier
            await stepsFixture.verifierRecette();

            await expect(page).toHaveURL(/.*success/);
        });

       //fn de partie
        await test.step('6. Écran de succès : Retour à l\'accueil', async () => {
            await page.getByRole('button', { name: /Retourner à l'accueil/i }).click();
            await expect(page).toHaveURL(testUrl);
        });
    });
});