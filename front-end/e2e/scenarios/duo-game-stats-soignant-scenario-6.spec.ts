import { test, expect } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';
import { HomepageFixture } from 'src/app/homepage/homepage.fixture'; 
import { PatientSelectionFixture } from 'src/app/caregiver/patient-selection/patient-selection.fixture';
import { DashboardFixture } from 'src/app/caregiver/dashboard/dashboard.fixture';
import { SelectRecipeFixture } from 'src/app/player/select-recipe/select-recipe.fixture';
import { MapFixture } from 'src/app/player/start-game/step1/map/map.fixture';
import { StoreSectionFixture } from 'src/app/player/start-game/step1/store-section/store-section.fixture';
import { KitchenSectionFixture } from 'src/app/player/start-game/step2/kitchen-section/kitchen-section.fixture';
import { StatisticsFixture } from 'src/app/caregiver/statistics/statistics.fixture';
import { TwoPlayerFixture } from 'src/app/twoplayer/twoplayer.fixture';
import { GuessRecipeFixture } from 'src/app/twoplayer/guess-recipe/guess-recipe.fixture';

test.describe('Partie Duo, sécurité Soignant et vérification des statistiques', () => {

    test('Scénario 6 : Mauvais MDP soignant et stats inchangées (Duo)', async ({ page }) => {
        
        test.setTimeout(250000); 

        const homepageFixture = new HomepageFixture(page);
        const patientSelectFixture = new PatientSelectionFixture(page);
        const dashboardFixture = new DashboardFixture(page);
        const selectRecipeFixture = new SelectRecipeFixture(page);
        const mapFixture = new MapFixture(page);
        const storeFixture = new StoreSectionFixture(page);
        const kitchenFixture = new KitchenSectionFixture(page);
        const statsFixture = new StatisticsFixture(page);
        const twoPlayerFixture = new TwoPlayerFixture(page);
        const guessRecipeFixture = new GuessRecipeFixture(page);

        let nombrePartiesAvant = 0;
        let statsSnapshotAvant: any = null;

        await page.goto(testUrl);

        await test.step('0. Soignant : Mémoriser les stats actuelles', async () => {
            await homepageFixture.loginAsSoignant('1234'); 
            await patientSelectFixture.selectPatientAndProceed('Jean Dumand'); 
            
            await dashboardFixture.clickStatistiques();
            
            nombrePartiesAvant = await statsFixture.getNombreDePartiesJouees();
            console.log(`Nombre de parties avant le mode Duo : ${nombrePartiesAvant}`);

            statsSnapshotAvant = await statsFixture.getStatsSnapshot();

            await statsFixture.clickBtnHomePage();
        });

        await test.step('1. Accueil : Lancer une partie Duo', async () => {
            await homepageFixture.clickBtnJouer();
            await homepageFixture.clickPatientByName('Jean Dumand');
            await homepageFixture.clickBtnJouerADeux();
            await twoPlayerFixture.clickRecetteExistante();
        });

        await test.step('2. Choix de la recette et mémorisation', async () => {
            await selectRecipeFixture.clickRecipe('Burger');
            await selectRecipeFixture.clickMemoriseParti();
        });

        await test.step('3. Supermarché : Récupérer les ingrédients', async () => {
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            await mapFixture.allerAuRayon('Rayon Frais');
            await storeFixture.cliquerIngredient('Cheddar');
            await storeFixture.retournerAuPlan();

            await mapFixture.allerAuRayon('Rayon Fruits & Légumes');
            await storeFixture.cliquerIngredient('Salade');
            await storeFixture.cliquerIngredient('Tomate');
            await storeFixture.retournerAuPlan();

            await mapFixture.allerAuRayon('Rayon Boulangerie');
            await storeFixture.cliquerIngredient('Pain à burger');
            await storeFixture.retournerAuPlan();

            await mapFixture.allerAuRayon('Rayon Boucherie & Poissonnerie');  
            await storeFixture.cliquerIngredient('Viande hachée');
            
            await storeFixture.allerCuisine();
        });

        await test.step('4. Cuisine : Rangement', async () => {
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            await kitchenFixture.rangerAuPlacard('Pain à burger');
            await kitchenFixture.rangerAuFrigo('Viande hachée');
            await kitchenFixture.rangerAuFrigo('Salade');
            await kitchenFixture.rangerAuFrigo('Tomate');
            await kitchenFixture.rangerAuFrigo('Cheddar');
            
            await kitchenFixture.allerPreparerRecette();
        });

        await test.step('5. Recette Duo : Deviner le mot', async () => {

            await guessRecipeFixture.taperLettre('b');
            await guessRecipeFixture.taperLettre('u');
            await guessRecipeFixture.taperLettre('r');
            await guessRecipeFixture.taperLettre('g');
            await guessRecipeFixture.taperLettre('e');
            await expect(page).toHaveURL(/.*success/);
            await guessRecipeFixture.cliquerRetourAccueil();
            await expect(page).toHaveURL(testUrl);
        });

        await test.step('6. Accueil : Déconnexion et test de sécurité MDP', async () => {
            // Déconnexion du profil joueur
            await page.getByRole('button', { name: /Déconnexion/i }).click();
            
            await homepageFixture.clickProfilSoignant();
            
            // Mauvais mot de passe
            await homepageFixture.fillPassword('mauvaismdp');
            await homepageFixture.clickValider();
            
            // Vérification de l'apparition du message d'erreur 
            const errorMessage = page.locator('.error-message');
            await expect(errorMessage).toBeVisible();
            await expect(errorMessage).toHaveText(/incorrect/i);

            await homepageFixture.fillPassword('1234');
            await homepageFixture.clickValider();
        });


        await test.step('7. Soignant : Vérification des statistiques inchangées', async () => {
            await patientSelectFixture.selectPatientAndProceed('Jean Dumand');
            await dashboardFixture.clickStatistiques();

            const nombrePartiesApres = await statsFixture.getNombreDePartiesJouees();
            console.log(`Nombre de parties après le mode Duo : ${nombrePartiesApres}`);

            const statsSnapshotApres = await statsFixture.getStatsSnapshot();

            expect(nombrePartiesApres).toEqual(nombrePartiesAvant);
            expect(statsSnapshotApres).toEqual(statsSnapshotAvant);
        });
    });
});