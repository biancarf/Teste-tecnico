import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: ['src/steps/*.ts', 'src/fixtures.ts'],
  language: 'pt',
  missingSteps: 'fail-on-gen',
});

export default defineConfig({
  testDir,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // Ambiente compartilhado de homologação: paralelismo baixo para não poluir a disponibilidade.
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://reservas.desbravador.com.br',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@smoke/ },
  ],
});
