import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('test-results/media-review', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ reducedMotion: 'reduce' })
for (const width of [360, 768, 1280, 1600]) {
  await page.setViewportSize({ width, height: 1000 })
  await page.goto('http://127.0.0.1:5180/#datasets')
  await page.locator('.dataset-samples').scrollIntoViewIfNeeded()
  await page.locator('.sample-body img').evaluate((im) => im.decode())
  await page.locator('.dataset-samples').screenshot({ path: `test-results/media-review/dataset-${width}.png`, style: 'header, .skip-link { visibility: hidden !important; }' })
  await page.locator('.action-video-grid').scrollIntoViewIfNeeded()
  await page.locator('.action-video video').first().evaluate((v) => {
    if (v.readyState >= 2) return
    return new Promise((resolve) => v.addEventListener('loadeddata', resolve, { once: true }))
  })
  await page.locator('.action-video-grid').screenshot({ path: `test-results/media-review/action-${width}.png`, style: '.site-header, .skip-link { visibility: hidden !important; }' })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  console.log(`${width}px: page overflow ${overflow}px`)
}
await browser.close()
