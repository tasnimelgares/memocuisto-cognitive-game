import { test, expect } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';
import { DashboardFixture } from 'src/app/caregiver/dashboard/dashboard.fixture';
import { PatientSelectionFixture } from 'src/app/caregiver/patient-selection/patient-selection.fixture';
import { StatisticsFixture } from 'src/app/caregiver/statistics/statistics.fixture';
import { HomepageFixture } from 'src/app/homepage/homepage.fixture';
import { SelectRecipeFixture } from 'src/app/player/select-recipe/select-recipe.fixture';
import { AppInventoryFixture } from 'src/app/player/start-game/step1/app-inventory/app-inventory.fixture';
import { MapFixture } from 'src/app/player/start-game/step1/map/map.fixture';
import { StoreSectionFixture } from 'src/app/player/start-game/step1/store-section/store-section.fixture';
import { KitchenSectionFixture } from 'src/app/player/start-game/step2/kitchen-section/kitchen-section.fixture';
import { SidebarFixture } from 'src/app/shared/sidebar/sidebar.fixture';
import { GuessRecipeFixture } from 'src/app/twoplayer/guess-recipe/guess-recipe.fixture';
import { TwoPlayerFixture } from 'src/app/twoplayer/twoplayer.fixture';

test.describe('Creation Feature', () => {

    test.setTimeout(400000); 
    test('play half game', async ({ page }) => {
        await page.goto(testUrl);

        const homepageFixture = new HomepageFixture(page);
        const patientSelectFixture = new PatientSelectionFixture(page);
        const dashboardFixture = new DashboardFixture(page);
        const selectRecipeFixture = new SelectRecipeFixture(page);
        const mapFixture = new MapFixture(page);
        const storeFixture = new StoreSectionFixture(page);
        const kitchenFixture = new KitchenSectionFixture(page);
        const statsFixture = new StatisticsFixture(page);
        const sidebarFixture = new SidebarFixture(page);
        const twoPlayerFixture = new TwoPlayerFixture(page);
        const appInventoryFixture = new AppInventoryFixture(page);
        const guessRecipeFixture = new GuessRecipeFixture(page);

        let nombrePartiesAvant: number;

        // Récupérer les statistiques avant 
        await test.step('Récupérer les statistiques avant.', async () => {
            await homepageFixture.loginAsSoignant('1234'); 
            await patientSelectFixture.selectPatientAndProceed('Caroline Martin'); 
            
            await dashboardFixture.clickStatistiques();
            
            nombrePartiesAvant = await statsFixture.getNombreDePartiesJouees();
            console.log(`Nombre de parties avant la partie incomplète : ${nombrePartiesAvant}`);
            await statsFixture.clickBtnHomePage();
        });

        // lancer une partie solo et la quitter au milieu
        await test.step('Lancer une partie solo et la quitter au milieu.', async () => {
            await homepageFixture.clickBtnJouer();
            await patientSelectFixture.clickPatient('Caroline Martin');
            await homepageFixture.clickBtnJouerEnAutonomie();
            await selectRecipeFixture.clickRecipe('Pancakes');
            await selectRecipeFixture.clickMemoriseParti();

            // étape 1
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            await mapFixture.allerAuRayon('Rayon Épicerie');
            await storeFixture.cliquerIngredient('Sucre');
            await storeFixture.cliquerIngredient('Farine');
            await storeFixture.cliquerIngredient('Œufs');
            await storeFixture.retournerAuPlan();

            await mapFixture.allerAuRayon('Rayon Frais');
            await storeFixture.cliquerIngredient('Lait');

            await storeFixture.allerCuisine();

            // étape 2 à moitié
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            await kitchenFixture.rangerAuFrigo('Lait');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();
            
            await kitchenFixture.rangerAuPlacard('Sucre');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();

            // on quitte la partie en cours
            await sidebarFixture.clickSidebar();
            await sidebarFixture.clickExitGame();
            await homepageFixture.clickBtnDeconnexion();
        });


        // aller dans le profil soignant et vérifier l'absence de changements pr le patient
        await test.step('Vérifier l\'absence de changements dans les statistiques.', async () => {

            await homepageFixture.loginAsSoignant('1234'); 
            await patientSelectFixture.selectPatientAndProceed('Caroline Martin'); 
            
            await dashboardFixture.clickStatistiques();
            
            const nombrePartiesAprès = await statsFixture.getNombreDePartiesJouees();
            console.log(`Nombre de parties après la partie incomplète : ${nombrePartiesAprès}`);
            expect(nombrePartiesAprès).toBe(nombrePartiesAvant);
            await statsFixture.clickBtnHomePage();
        });

        // lancer une partie duo et vérifier que tout est réinitialisé
        await test.step('Lancer une partie duo et vérifier que tout est réinitialisé.', async () => {
            
            await homepageFixture.clickBtnJouer();
            await patientSelectFixture.clickPatient('Caroline Martin');
            await homepageFixture.clickBtnJouerADeux();
            await twoPlayerFixture.clickRecetteExistante();
            await selectRecipeFixture.clickRecipe('Pancakes');
            await selectRecipeFixture.clickMemoriseParti();
        });

        await test.step('Vérifier que l\'étape 1 est réinitialisée.', async () => {

            // dans l'etape 1 vérifier que rien est coché dans la liste
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });
            await mapFixture.clickOpenInventory();

            const ingredientLines = appInventoryFixture.getIngredientLines();
            const count = await ingredientLines.count();

            // on vérifie qu'aucun ingrédient est "found"
            for (let i = 0; i < count; i++) {
                await expect(ingredientLines.nth(i)).not.toHaveClass(/is-found/);
            }

            // on vérifie qu'il y a des carrés vides 
            const iconsText = await appInventoryFixture.getCheckIconsText();

            for (const text of iconsText) {
                expect(text.trim()).toBe('▢');
                expect(text.trim()).not.toBe('☑');
            }

            // fin de l'étape
            await mapFixture.allerAuRayon('Rayon Épicerie');
            await storeFixture.cliquerIngredient('Sucre');
            await storeFixture.cliquerIngredient('Farine');
            await storeFixture.cliquerIngredient('Œufs');
            await storeFixture.retournerAuPlan();

            await mapFixture.allerAuRayon('Rayon Frais');
            await storeFixture.cliquerIngredient('Lait');

            await storeFixture.allerCuisine();
        });
    

        await test.step('Vérifier que l\'étape 2 est réinitialisée.', async () => {
            // dans l'étape 2 vérifier que tout est réinitialisé et vide
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            // vérifier que les compartiments de rangement sont vides
            await expect(kitchenFixture.getItemsInFrigo()).toHaveCount(0);
            await expect(kitchenFixture.getItemsInPlacard()).toHaveCount(0);
            await expect(kitchenFixture.getItemsInCongelateur()).toHaveCount(0);

            // vérifier que tous les ingrédients requis sont bien revenus sur la table
            const itemsSurTable = kitchenFixture.getItemsSurTable();
            await expect(itemsSurTable).toHaveCount(4);

            // fin de l'étape
            await kitchenFixture.rangerAuFrigo('Lait');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();

            await kitchenFixture.rangerAuFrigo('Œufs');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();
            
            await kitchenFixture.rangerAuPlacard('Sucre');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();

            await kitchenFixture.rangerAuPlacard('Farine');

            await kitchenFixture.allerPreparerRecette();

        });

        await test.step('Vérifier que l\'étape 3 est réinitialisée.', async () => {
            // dans l'étape 3 vérifier que aucune lettre est déjà entrée au début

            // texte ou il y a les lettres tapées
            const zoneLettresTapees = guessRecipeFixture.getLettersTriedZone();
            await expect(zoneLettresTapees).toContainText('Lettres tapées :');
            const texteZone = await zoneLettresTapees.innerText();
            expect(texteZone.trim()).toBe('Lettres tapées :');

            // on vérifie qu'il n'y a que des tirets
            const slots = guessRecipeFixture.getLetterSlots();
            const slotsCount = await slots.count();
            for (let i = 0; i < slotsCount; i++) {
                const slotText = await slots.nth(i).innerText();
                // Si ce n'est pas un espace vide, ça doit être un tiret du bas
                if (slotText.trim() !== '') {
                    expect(slotText.trim()).toBe('_');
                }
            }

            // Vérifier qu'aucune lettre du clavier n'est déjà cliquée/marquée
            const boutonsClavier = guessRecipeFixture.getKeyboardButtons();
            const totalTouches = await boutonsClavier.count();

            for (let i = 0; i < totalTouches; i++) {
                const touche = boutonsClavier.nth(i);
                
                // on vérifie que la touche n'est pas désactivée
                await expect(touche).not.toBeDisabled();
                
                // on vérifie qu'elle n'a pas les classes de statut (correct / wrong)
                await expect(touche).not.toHaveClass(/correct/);
                await expect(touche).not.toHaveClass(/wrong/);
            }

            // fin de l'étape 
            await guessRecipeFixture.taperLettre('p');
            await guessRecipeFixture.taperLettre('a');
            await guessRecipeFixture.taperLettre('n');
            await guessRecipeFixture.taperLettre('c');
            await guessRecipeFixture.taperLettre('k');
            await guessRecipeFixture.taperLettre('e');
            await guessRecipeFixture.taperLettre('s');
            await expect(page).toHaveURL(/.*success/);
            await guessRecipeFixture.cliquerRetourAccueil();
            await expect(page).toHaveURL(testUrl);

        });

    });

});
