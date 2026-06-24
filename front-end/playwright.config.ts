import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  timeout: 200000,
  reporter: [['html', { open: 'always' }]],
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on',
    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: 500,
    }
  },
  projects: [
    {
      name: 'tests-paralleles',
      // Lance tous les tests du dossier e2e...
      testMatch: ['e2e/**/*.spec.ts'],
      // ...sauf lui car il créer des items 
      testIgnore: [/.*create-items-scenario-5\.spec\.ts/], 
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