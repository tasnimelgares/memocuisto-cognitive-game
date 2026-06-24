import { test, expect } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';

test.describe('Affichage et interactions de la page d\'accueil', () => {
  test('Basic test', async ({ page }) => {
    await page.goto(testUrl);
  
    const btnSoignant = page.getByRole('button', { name: /Profil Soignant\(e\)/i });
    const btnJouer = page.getByRole('button', { name: /^JOUER$/i });
    const btnCommentJouer = page.getByRole('button', { name: /Comment jouer \?/i });

    await expect(btnSoignant).toBeVisible();
    await expect(btnJouer).toBeVisible();
    await expect(btnCommentJouer).toBeVisible();
  });
  test('Doit ouvrir la modale Accès Soignant au clic', async ({ page }) => {
    await page.goto(testUrl);

    // cliquer sur le bouton soignant
    const btnSoignant = page.getByRole('button', { name: /Profil Soignant\(e\)/i });
    await btnSoignant.click();

    // Vérification : la modale s'affiche avec son titre et le champ de saisie
    const modaleTitre = page.getByRole('heading', { name: 'Accès Soignant' });
    const inputPassword = page.getByPlaceholder('Mot de passe...');

    await expect(modaleTitre).toBeVisible();
    await expect(inputPassword).toBeVisible();
  });
  test('Doit ouvrir la modale de sélection de profil au clic sur JOUER', async ({ page }) => {
    await page.goto(testUrl);

    //cliquer sur le bouton JOUER
    const btnJouer = page.getByRole('button', { name: /^JOUER$/i });
    await btnJouer.click();

    // Vérification : la modale des profils s'affiche
    const modaleTitre = page.getByRole('heading', { name: 'Sélectionne ton profil' });
    await expect(modaleTitre).toBeVisible();
  });
  // TO GO FURTHER :
  // Check the PS6-CORRECTION repo : https://github.com/NablaT/ps6-correction-td1-td2-v2/blob/master/front-end/e2e/scenarios/create-quiz.spec.ts
});

