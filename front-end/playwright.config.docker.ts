import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  timeout: 200000,
  outputDir: './ops/e2e-results/tests-results',
  reporter: [['html', { open: 'never',outputFolder: './ops/e2e-results/playwright-report' }]],
  use: {
    baseURL: 'http://front',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    video: 'on',
    screenshot: 'on',
    launchOptions: {
      slowMo: 1000,
    }
  },
  projects: [
    {
      name: 'tests-paralleles',
      // Lance tous les tests du dossier e2e...
      testMatch: ['e2e/**/*.spec.ts'],
      // ...sauf lui car il créer des items 
      testIgnore: [
        /.*create-items-scenario-5\.spec\.ts/,
        /.*gestion-erreurs-configs-scenario-2\.spec\.ts/ 
      ],
    },
    {
      name: 'test-creation-isole',
      testMatch: [/.*create-items-scenario-5\.spec\.ts/],
      // on force Playwright à n'allouer qu'un seul worker pour ce projet
      workers: 1,
    }
  ]
};

export default config;