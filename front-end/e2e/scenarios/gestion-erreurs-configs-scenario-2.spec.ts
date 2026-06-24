import { test, expect } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';
import { HomepageFixture } from 'src/app/homepage/homepage.fixture'; 
import { PatientSelectionFixture } from 'src/app/caregiver/patient-selection/patient-selection.fixture';
import { DashboardFixture } from 'src/app/caregiver/dashboard/dashboard.fixture';
import { ConfigFixture } from 'src/app/caregiver/config/config.fixture';
import { SelectRecipeFixture } from 'src/app/player/select-recipe/select-recipe.fixture';
import { MapFixture } from 'src/app/player/start-game/step1/map/map.fixture';
import { StoreSectionFixture } from 'src/app/player/start-game/step1/store-section/store-section.fixture';
import { KitchenSectionFixture } from 'src/app/player/start-game/step2/kitchen-section/kitchen-section.fixture';
import { StepsFixture } from 'src/app/player/start-game/step3/steps/steps.fixture';

test.describe('Gestion des erreurs et configurations', () => {

    test('Scénario 2 : Parcours complet', async ({ page }) => {

        test.setTimeout(180000); 

        // Initialisation de toutes les fixtures
        const homepageFixture = new HomepageFixture(page);
        const patientSelectFixture = new PatientSelectionFixture(page);
        const dashboardFixture = new DashboardFixture(page);
        const configFixture = new ConfigFixture(page);
        const selectRecipeFixture = new SelectRecipeFixture(page);
        const mapFixture = new MapFixture(page);
        const storeFixture = new StoreSectionFixture(page);
        
        await page.goto(testUrl);

        await test.step('1. Espace Soignant : Connexion et choix du patient', async () => {
            await homepageFixture.loginAsSoignant('1234'); 
            await patientSelectFixture.selectPatientAndProceed('paul durand'); 
        });

        await test.step('2. Espace Soignant : Aller dans les configurations', async () => {
            await dashboardFixture.clickConfiguration();
        });

        await test.step('3. Configuration : Activer les options et Lancer la partie', async () => {
            
            const btnAttenuer = configFixture.getOptionAttenuerEchecs();
            const classesAttenuer = await btnAttenuer.getAttribute('class');
            if (classesAttenuer && !classesAttenuer.includes('active')) {
                await btnAttenuer.click();
            }

            const btnRappel = configFixture.getOptionRappelInactivite();
            const classesRappel = await btnRappel.getAttribute('class');
            if (classesRappel && !classesRappel.includes('active')) {
                await btnRappel.click();
            }

            await configFixture.toggleModeMalvoyant();

            await configFixture.clickLancerPartie();
        });

        await test.step('4. Accueil : Lancer le jeu en autonomie', async () => {
            await homepageFixture.clickBtnJouerEnAutonomie();
        });

        await test.step('5. Choix de la recette et mémorisation', async () => {
            await selectRecipeFixture.clickRecipe('Café au lait');
            await selectRecipeFixture.clickMemoriseParti();
        });

        await test.step('6. Erreur volontaire : Fruits & Légumes', async () => {
            
            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            await mapFixture.allerAuRayon('Rayon Fruits & Légumes');
            await storeFixture.cliquerIngredient('Oranges');
            await expect(storeFixture.getFeedbackMessage()).toBeVisible();
            await storeFixture.retournerAuPlan();
        });

        await test.step('7. Erreurs et succès : Rayon Frais', async () => {
            await mapFixture.allerAuRayon('Rayon Frais');
            // On dit au navigateur de nous prévenir si la synthèse vocale est utilisée
            await page.evaluate(() => {
                // On crée une variable globale dans le navigateur pour stocker l'info
                (window as any).syntheseVocaleUtilisee = false;
                
                // On espionne la fonction speak originale
                const originalSpeak = window.speechSynthesis.speak;
                window.speechSynthesis.speak = function(utterance) {
                    (window as any).syntheseVocaleUtilisee = true; // On lève le drapeau
                    return originalSpeak.apply(this, [utterance]); // On laisse le son se jouer normalement
                };
            }); 
            await storeFixture.cliquerIngredient('Cheddar');
            await expect(storeFixture.getFeedbackMessage()).toBeVisible();
            

             // On demande au navigateur si le drapeau a été levé
             const sonAEteJoue = await page.evaluate(() => {
                return (window as any).syntheseVocaleUtilisee;
            });
            
            // On s'attend à ce que ce soit true car le mode malvoyant est activé
            expect(sonAEteJoue).toBe(true);
            
            await expect(storeFixture.getFeedbackMessage()).toBeHidden();

            await storeFixture.cliquerIngredient('Lait');
            await expect(storeFixture.getFeedbackMessage()).toBeVisible();
            await storeFixture.retournerAuPlan();
        });

        await test.step('8. Fin des courses : Rayon Épicerie', async () => {
            await mapFixture.allerAuRayon('Rayon Épicerie');
            await storeFixture.cliquerIngredient('Café');
            await expect(storeFixture.getFeedbackMessage()).toBeVisible(); 
            
          
            await expect(storeFixture.getFeedbackMessage()).toBeHidden();
            
            await storeFixture.cliquerIngredient('Sucre');
            await storeFixture.allerCuisine();
        });

        await test.step('9. Rangement : Erreur volontaire puis succès', async () => {
    
            const kitchenFixture = new KitchenSectionFixture(page);

            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            // Erreur volontaire : Café dans le frigo
            await kitchenFixture.rangerAuFrigo('Café');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();

            // Succès : Café dans le placard
            await kitchenFixture.rangerAuPlacard('Café');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();

            // Succès : Sucre dans le placard
            await kitchenFixture.rangerAuPlacard('Sucre');
            await expect(kitchenFixture.getFeedbackMessage()).toBeVisible();
            await expect(kitchenFixture.getFeedbackMessage()).toBeHidden();

            // Succès : Lait dans le frigo (déclenche la victoire)
            await kitchenFixture.rangerAuFrigo('Lait');
            
            await expect(kitchenFixture.getBtnPreparerRecette()).toBeVisible();
        });

        await test.step('10. Fin du rangement : Aller à la recette', async () => {
            const kitchenFixture = new KitchenSectionFixture(page);
            // Clic sur "Préparer la recette"
            await kitchenFixture.allerPreparerRecette();
        });

        await test.step('11. Préparation de la recette : Erreurs et validation finale', async () => {
            const stepsFixture = new StepsFixture(page);

            await page.locator('.entrance-overlay').waitFor({ state: 'hidden' });

            // Séquence avec erreur volontaire
            // Ordre cliqué : Remuer (1), Espresso (2), Chauffer (3), Verser (4)
            await stepsFixture.cliquerSurEtape('Remuer doucement');
            await stepsFixture.cliquerSurEtape('Faire couler un expresso');
            await stepsFixture.cliquerSurEtape('Faire chauffer le lait');
            await stepsFixture.cliquerSurEtape('Verser le lait dans le café');
            
            // Clic sur vérifier (erreur)
            await stepsFixture.verifierRecette();
            
            // Vérifier que le message d'erreur atténué apparaît bien (grâce à la config)
            await stepsFixture.getFeedbackMessage().scrollIntoViewIfNeeded();
            await expect(stepsFixture.getFeedbackMessage()).toBeVisible();
            await expect(stepsFixture.getFeedbackMessage()).toBeHidden();
            
            // Ensuite séquence correcte (on remplit les trous restants)
            await stepsFixture.cliquerSurEtape('Faire chauffer le lait');
            await stepsFixture.cliquerSurEtape('Verser le lait dans le café');
            await stepsFixture.cliquerSurEtape('Remuer doucement');

            // Clic sur vérifier (Victoire)
            await stepsFixture.verifierRecette();

            await expect(page).toHaveURL(/.*success/);
        });

        await test.step('12. Écran de succès : Retour à l\'accueil', async () => {
            await page.getByRole('button', { name: /Retourner à l'accueil/i }).click();
            // On s'assure qu'on est bien revenu sur la page d'accueil principale
            await expect(page).toHaveURL(testUrl);
        });
    });
});