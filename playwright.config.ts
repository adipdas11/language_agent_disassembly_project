import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  webServer: {
    command: 'npm run dev -- --port 5180 --strictPort',
    url: 'http://127.0.0.1:5180',
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://127.0.0.1:5180',
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
  },
  reporter: [['list']],
})
