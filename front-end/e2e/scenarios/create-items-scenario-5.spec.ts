import { test, expect } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';
import { ConfigFixture } from 'src/app/caregiver/config/config.fixture';
import { DashboardFixture } from 'src/app/caregiver/dashboard/dashboard.fixture';
import { PatientSelectionFixture } from 'src/app/caregiver/patient-selection/patient-selection.fixture';
import { CatalogueFixture } from 'src/app/collection/catalogue/catalogue.fixture';
import { CollectionFixture } from 'src/app/collection/collection.fixture';
import { DetailCardFixture } from 'src/app/collection/detail-card/detail-card.fixture';
import { HomepageFixture } from 'src/app/homepage/homepage.fixture';
import { SelectRecipeFixture } from 'src/app/player/select-recipe/select-recipe.fixture';
import { MapFixture } from 'src/app/player/start-game/step1/map/map.fixture';
import { StoreSectionFixture } from 'src/app/player/start-game/step1/store-section/store-section.fixture';
import { KitchenSectionFixture } from 'src/app/player/start-game/step2/kitchen-section/kitchen-section.fixture';
import { StepsFixture } from 'src/app/player/start-game/step3/steps/steps.fixture';
import { IngredientFormFixture } from 'src/app/shared/ingredient-form/ingredient-form.fixture';
import { RecipeFormFixture } from 'src/app/shared/recipe-form/recipe-form.fixture';

test.describe('Creation Feature', () => {
        
    test('Should create elements, verify isolation between patients and play game', async ({ page }) => {

        test.setTimeout(400000); 
        await page.goto(testUrl);

        const homepageFixture = new HomepageFixture(page);
        const catalogueFixture = new CatalogueFixture(page);
        const collectionFixture = new CollectionFixture(page);
        const recipeFormFixture = new RecipeFormFixture(page);
        const ingredientFormFixture = new IngredientFormFixture(page);
        const selectRecipeFixture = new SelectRecipeFixture(page);
        const mapFixture = new MapFixture(page);
        const storeFixture = new StoreSectionFixture(page);
        const kitchenFixture = new KitchenSectionFixture(page);
        const stepsFixture = new StepsFixture(page);
        const patientSelectFixture = new PatientSelectionFixture(page);
        const dashboardFixture = new DashboardFixture(page);
        const configFixture = new ConfigFixture(page);
        const detailCardFixture = new DetailCardFixture(page);

        let nbRecipeBefore: number;


        // Se connecter à un compte patient et aller sur la page catalogue

        await test.step('Se connecter à un compte patient et aller sur la page catalogue', async () => {
            await homepageFixture.clickBtnJouer();
            await homepageFixture.clickPatientByName('Lisa Dupont');
            await homepageFixture.clickBtnCatalogue();
        });

        // Créer un ingrédient

        await test.step('Créer un ingrédient', async () => {
            // pour passer au mode ingredients
            nbRecipeBefore = await catalogueFixture.getAllItemsVisible().count();
        
            await collectionFixture.clickToggleSlider();
            await catalogueFixture.clickAddIngredientButton();

            // créer la menthe
            await ingredientFormFixture.createIngredientShortcut('Menthe poivrée','e2e/assets/menthe.png','Fruits & Légumes','Frigo');
            await expect(page.locator('form')).toContainText('Ingrédient enregistré !');
            await ingredientFormFixture.clickClose();

            /// vérifier l'ajout dans le catalogue
            await collectionFixture.fillFilterInput('menthe poivrée');
            const ingredientsDisplayed = await catalogueFixture.getAllItemsTexts();
            expect(ingredientsDisplayed).toContain('Menthe poivrée');

            await collectionFixture.clearFilterInput();
        });

        // Créer une recette

        await test.step('Creer une recette', async () => {
            // pour passer au mode recette
            await collectionFixture.clickToggleSlider();
            await catalogueFixture.clickAddRecipeButton();

            // créer le mojito
            await recipeFormFixture.createRecipeShortcut(
                'Mojito', 
                'e2e/assets/mojito.png', 
                'Boisson', 
                [
                    'eau gazeuse',
                    'citron',
                    'sucre',
                    'glacons',
                    'menthe poivrée'
                ],
                [
                    'Mettre les glaçons dans le verre.',
                    'Presser le citron et ajouter le jus au verre.',
                    'Ajouter le sucre, la menthe, l\'eau gazeuse et mélanger.',
                    'Servir frais.'
                ]
            );

            const recipeFeedbackMessageLocator = recipeFormFixture.getFeedbackMessage();
            expect(recipeFeedbackMessageLocator).toHaveText('Recette enregistrée !');
            await recipeFormFixture.clickClose();

            /// vérifier l'ajout dans le catalogue
            const recipesDisplayed = await catalogueFixture.getAllItemsTexts();
            expect(recipesDisplayed).toContain('Mojito');
        });

        // Changement de patient et vérification

        await test.step('Changer de patient et vérifier l\'absence des nouveaux items', async () => {
            await collectionFixture.clickReturnButton();
            await homepageFixture.clickBtnDeconnexion();

            await homepageFixture.clickBtnJouer();
            await homepageFixture.clickPatientByName('Caroline Martin');
            await homepageFixture.clickBtnCatalogue();

            // verifications de l'absence des items 
            const recipesDisplayedAfter = await catalogueFixture.getAllItemsTexts();
            expect(recipesDisplayedAfter).not.toContain('Mojito');
            await expect(catalogueFixture.getAllItemsVisible()).toHaveCount(nbRecipeBefore);

            await collectionFixture.clickToggleSlider();

            await collectionFixture.fillFilterInput('menthe poivrée');
            const ingredientsDisplayedAfter = await catalogueFixture.getAllItemsTexts();
            expect(ingredientsDisplayedAfter).not.toContain('Menthe poivrée');
        });

        // retour et jeu

        // préparation : changer la difficulté pour avoir la nouvelle recette

        await test.step('Préparation : changer la difficulté pour avoir la nouvelle recette', async () => {
            await collectionFixture.clickReturnButton();
            await homepageFixture.clickBtnDeconnexion();
            await homepageFixture.loginAsSoignant('1234'); 
            await patientSelectFixture.selectPatientAndProceed('Lisa Dupont'); 
            await dashboardFixture.clickConfiguration();
            await configFixture.preparerPartieScenario5();
        });

        await test.step('Jouer une partie avec la nouvelle recette', async () => {

            // forcer le chargement de l'ingrédient
            await homepageFixture.clickBtnCatalogue();
            await collectionFixture.clickToggleSlider();
            await collectionFixture.fillFilterInput('menthe poivrée');
            await catalogueFixture.clickItemByName('Menthe poivrée');
            await detailCardFixture.clickClose();
            await collectionFixture.clickReturnButton();

            await homepageFixture.clickBtnJouerEnAutonomie();
            await selectRecipeFixture.clickRecipe('Mojito');
            await expect(page.locator('text=Menthe poivrée')).toBeVisible({ timeout: 10000 });
            await selectRecipeFixture.clickMemoriseParti();

            // etape 1
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            await mapFixture.allerAuRayon('Rayon Fruits & Légumes');
            await storeFixture.cliquerIngredient('Citron');
            await expect(page.locator('text=Menthe poivrée')).toBeVisible({ timeout: 10000 });
            await storeFixture.cliquerIngredient('Menthe poivrée');
            await storeFixture.retournerAuPlan();

            await mapFixture.allerAuRayon('Rayon Épicerie');
            await storeFixture.cliquerIngredient('Sucre');
            await storeFixture.retournerAuPlan();

            await mapFixture.allerAuRayon('Rayon Boissons');
            await storeFixture.cliquerIngredient('Eau gazeuse');
            await storeFixture.retournerAuPlan();

            await mapFixture.allerAuRayon('Rayon Surgelés');
            await storeFixture.cliquerIngredient('Glacons');

            await storeFixture.allerCuisine();

            // etape 2
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });
            await kitchenFixture.rangerAuFrigo('Eau gazeuse');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();

            await kitchenFixture.rangerAuFrigo('Menthe poivrée');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();

            await kitchenFixture.rangerAuFrigo('Citron');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();

            await kitchenFixture.rangerAuPlacard('Sucre');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();

            await kitchenFixture.rangerAuCongelateur('Glacons');
            
            await expect(kitchenFixture.getBtnPreparerRecette()).toBeVisible();
            await kitchenFixture.allerPreparerRecette();

            // etapte 3
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            // Séquence avec erreur volontaire
            // Ordre cliqué : Remuer (1), Espresso (2), Chauffer (3), Verser (4)
            await stepsFixture.cliquerSurEtape('Mettre les glaçons dans le verre.');
            await stepsFixture.cliquerSurEtape('Presser le citron et ajouter le jus au verre.');
            await stepsFixture.cliquerSurEtape('Ajouter le sucre, la menthe, l\'eau gazeuse et mélanger.');
            await stepsFixture.cliquerSurEtape('Servir frais.');

            // Clic sur vérifier
            await stepsFixture.verifierRecette();

            await expect(page).toHaveURL(/.*success/);

            await page.getByRole('button', { name: /Retourner à l'accueil/i }).click();
            // On s'assure qu'on est bien revenu sur la page d'accueil principale
            await expect(page).toHaveURL(testUrl);
        });

        // Supression de la  nouvelle recette et du nouvel ingrédient

        // supprime pour qu'on puisse relancer le test sans souci
        await test.step('Préparation : changer la difficulté pour avoir la nouvelle recette', async () => {
            await homepageFixture.clickBtnCatalogue();
            await catalogueFixture.clickItemByName('Mojito');
            await detailCardFixture.clickDelete();
            await detailCardFixture.confirmDelete();
            const recipesDisplayed = await catalogueFixture.getAllItemsTexts();
            expect(recipesDisplayed).not.toContain('Mojito');

            await collectionFixture.clickToggleSlider();
            await collectionFixture.fillFilterInput('Menthe poivrée');
            await catalogueFixture.clickItemByName('Menthe poivrée');
            await detailCardFixture.clickDelete();
            await detailCardFixture.confirmDelete();
            let ingredientsDisplayed = await catalogueFixture.getAllItemsTexts();
            expect(ingredientsDisplayed).not.toContain('Mojito');
            
        });


    });

});
