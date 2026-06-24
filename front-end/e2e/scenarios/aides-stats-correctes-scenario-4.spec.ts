import { test, expect } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';
import { HomepageFixture } from 'src/app/homepage/homepage.fixture';
import { PatientSelectionFixture } from 'src/app/caregiver/patient-selection/patient-selection.fixture';
import { DashboardFixture } from 'src/app/caregiver/dashboard/dashboard.fixture';
import { ConfigFixture } from 'src/app/caregiver/config/config.fixture';
import { KitchenSectionFixture } from 'src/app/player/start-game/step2/kitchen-section/kitchen-section.fixture';
import { StepsFixture } from 'src/app/player/start-game/step3/steps/steps.fixture';
import { SelectRecipeFixture } from 'src/app/player/select-recipe/select-recipe.fixture';
import { MapFixture } from 'src/app/player/start-game/step1/map/map.fixture';
import { StoreSectionFixture } from 'src/app/player/start-game/step1/store-section/store-section.fixture';

test.describe('Vérification du système d\'aides et des statistiques', () => {

    // Scénario 4 :
    test('Doit déclencher les aides après inactivité/erreurs et les résultats sont envoyés aux stats', async ({ page }) => {
        const homepage = new HomepageFixture(page);
        const patientSelection = new PatientSelectionFixture(page);
        const dashboard = new DashboardFixture(page);
        const config = new ConfigFixture(page);
        const kitchenFixture = new KitchenSectionFixture(page);
        const stepsFixture = new StepsFixture(page);

        await page.goto(testUrl);

        await test.step('Configuration des aides pour Luc (5 10 25 30)', async () => {
            await homepage.loginAsSoignant('1234');
            await patientSelection.selectPatientAndProceed('Luc Bernard');
            await dashboard.clickConfiguration();

            const sectionAides = page.locator('app-help-settings');
            const btnToggle = sectionAides.getByRole('button');
            const isEnabled = await btnToggle.evaluate(el => el.classList.contains('active'));

            if (!isEnabled) {
                await btnToggle.click();
            }
            
            const valeursAides = ['5', '10', '25', '30'];
            const sliders = sectionAides.locator('input[type="range"]');
        
            for (let i = 0; i < 4; i++) {
                const valeurCible = valeursAides[i];
                
                await sliders.nth(i).fill(valeurCible);
                await sliders.nth(i).dispatchEvent('change');
                
                const valeurActuelle = await sliders.nth(i).inputValue();
                console.log(`Temps configuré pour le palier d'aide ${i + 1} : ${valeurActuelle} secondes`);
            }
            
            await config.clickLancerPartie();
        });
        
        await test.step('Lancer une partie et attendre pour le déclenchement des aides (dans l\'étape 1 du supermarché)', async () => {
            
            const selectRecipeFixture = new SelectRecipeFixture(page);
            const mapFixture = new MapFixture(page);
            const storeFixture = new StoreSectionFixture(page);

            await homepage.clickBtnJouerEnAutonomie();
            await selectRecipeFixture.clickRecipe('Pancakes');
            await selectRecipeFixture.clickMemoriseParti();

            // atendre que les rayons deviennet jaune (noramlement 5sec)
            await expect(page.locator('.highlight, .highlighted').first()).toBeVisible({ timeout: 30000 });
            await mapFixture.allerAuRayon('Rayon Épicerie');

            // Attendre le temps que tous les ingrédients de ce rayon soient pris par l'Aide Complète
            await page.waitForTimeout(28000);

            const slotFarine = page.locator('.shelf-slot', { has: page.locator('app-ingredient-card', { hasText: 'Farine' }) });
            await expect(slotFarine).toHaveClass(/\bfound\b/);
            const slotSucre = page.locator('.shelf-slot', { has: page.locator('app-ingredient-card', { hasText: /^Sucre$/ }) });
            await expect(slotSucre).toHaveClass(/\bfound\b/);
            const slotOeufs = page.locator('.shelf-slot', { has: page.locator('app-ingredient-card', { hasText: /Œufs/i }) });
            await expect(slotOeufs).toHaveClass(/\bfound\b/);
            
    
            const btnRetour = page.getByRole('button', { name: /Retour au plan/i });
            await btnRetour.scrollIntoViewIfNeeded();
            await expect(btnRetour).toBeInViewport(); 
            await storeFixture.retournerAuPlan();
            // le lait devrait etre directement pris automatiquement et on doit avoir le "aller a la cuisine"
            await mapFixture.allerAuRayon('Rayon Frais');

            const btnCuisine = page.getByRole('button', { name: /Aller à la cuisine/i });
            await expect(btnCuisine).toBeVisible({ timeout: 10000 });
            await storeFixture.allerCuisine();
        });
        
        await test.step('Vérifier le déclenchement des aides dans les étapes 2 de rangement et 3 de préparation de recette ', async () => {
            
            // Dans l'étape 2 de rangement :
            await expect(page.locator('#frigo')).toBeVisible({ timeout: 15000 });
            
            // check que l'aide a placé la farine et les oeufs:
            await expect(page.locator('#placard').getByRole('img', { name: /Farine/i })).toBeVisible({ timeout: 35000 });
            await expect(page.locator('#frigo').getByRole('img', { name: /Œufs/i })).toBeVisible({ timeout: 35000 });

            // Ici a 25 secondes on a la farine et les oeufs qui sont mis par l'aide. 
            // Puis ensuite on met juste le lait, le sucre devrait etre mis automatiquement car 30s l'aide complète fait tout
            await kitchenFixture.rangerAuFrigo('Lait');

            await expect(kitchenFixture.getBtnPreparerRecette()).toBeVisible({ timeout: 40000 }); 
            await kitchenFixture.allerPreparerRecette();

            // Dans l'étape 3 de préparation :
            const mixedStepsColumn = page.locator('.column').filter({ hasText: 'Étapes mélangées' });
            await expect(mixedStepsColumn).toBeVisible({ timeout: 10000 });

            // L'ordre correct est : Mélanger -> Ajouter -> Reposer -> Cuire
            // On clique exprès dans le désordre sur les deux premières fausses
            await stepsFixture.cliquerSurEtape('Cuire à la poêle');
            await stepsFixture.cliquerSurEtape('Laisser reposer la pâte');

            // On vérifie la recette (le jeu va nous dire que c'est faux)
            await stepsFixture.verifierRecette();

            // On recommence :
            await page.getByRole('button', { name: /Recommencer/i }).click();

            // "l'aide fait tout", donc on attend simplement que l'aide place tout
            await page.waitForTimeout(32000);
            
            // Fin de partie on attend du coup :
            const btnRetourAccueil = page.getByRole('button', { name: /Retourner à l'accueil/i });
            await expect(btnRetourAccueil).toBeVisible({ timeout: 35000 }); 

            await btnRetourAccueil.click();
            await homepage.clickBtnDeconnexion();
        });

        await test.step('Côté Soignant : Voir si on a les bonnes stats', async () => {
            await homepage.loginAsSoignant('1234');
            await patientSelection.selectPatientAndProceed('Luc Bernard');
            await dashboard.clickStatistiques();

            // Vérifier que la partie a été ajoutée aux graphiques
            await expect(page.locator('#scoreChart')).toBeVisible({ timeout: 10000 });
            await expect(page.locator('#timeChart')).toBeVisible();
            
            // On vérifie aussi que le sélecteur de date contient bien au moins une partie enregistrée
            const selectDates = page.locator('select.date-selector option');
            expect(await selectDates.count()).toBeGreaterThan(0);

            //Vérifier qu'aucun score n'est à 100%
            const stepStats = page.locator('app-step-stats');
            await expect(stepStats).toHaveCount(3);
            for (let i = 0; i < 3; i++) {
                await expect(stepStats.nth(i)).not.toContainText('100%');
            }

            // Vérifier que les aides utilisées sont bien présentes dans les étapes
            await page.locator('.steps-list').scrollIntoViewIfNeeded();
            const aidesEtape1 = stepStats.nth(0).locator('app-aides-chips span');
            expect(await aidesEtape1.count()).toBeGreaterThan(0);
            await expect(aidesEtape1.first()).toBeVisible();

            const aidesEtape2 = stepStats.nth(1).locator('app-aides-chips span');
            expect(await aidesEtape2.count()).toBeGreaterThan(0);
        });
  });

});