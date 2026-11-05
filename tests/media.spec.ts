import { expect, test } from '@playwright/test'

test('all additional dataset views are visible together, with each dataset linked once', async ({ page }) => {
  await page.goto('/#datasets')
  const viewer = page.locator('.dataset-samples')
  await expect(viewer.locator('.dataset-model')).toHaveCount(3)
  await expect(viewer.locator('.sample-comparison')).toHaveCount(5)
  await expect(viewer.locator('.sample-image-grid .research-figure')).toHaveCount(14)
  await expect(viewer.getByRole('button', { name: /choose|switch|original image$/, exact: false })).toHaveCount(0)
  for (const label of ['Global device dataset', 'Local fastener dataset', 'Process-state dataset']) await expect(page.getByRole('link', { name: label, exact: true })).toHaveCount(1)
  const images = viewer.locator('.sample-image-grid img')
  await images.last().scrollIntoViewIfNeeded()
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  }
})

test('each clip appears once and all content is accessible without tabs or disclosures', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('tab')).toHaveCount(0)
  await expect(page.locator('main details')).toHaveCount(0)
  const sources = await page.locator('video').evaluateAll((videos) => videos.map((v) => v.getAttribute('src')))
  expect(sources).toHaveLength(7)
  expect(new Set(sources).size).toBe(sources.length)
  await expect(page.locator('.skill-contract')).toHaveCount(3)
  await expect(page.locator('.device-facts')).toHaveCount(3)
  await expect(page.locator('.state-example')).toHaveCount(3)
  await expect(page.locator('.scenario-card')).toHaveCount(4)
  await expect(page.locator('.prompt-template')).toHaveCount(5)
  await expect(page.locator('.author')).toHaveCount(3)
  await expect(page.getByRole('button', { name: /coming soon/ })).toHaveCount(2)
})

test('reduced motion pauses all architecture media until explicitly played', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#actions')
  const video = page.getByLabel('Unscrew skill video', { exact: true })
  await video.scrollIntoViewIfNeeded()
  expect(await video.evaluate((node) => (node as HTMLVideoElement).paused)).toBe(true)
  await page.getByRole('button', { name: 'Play architecture animation', exact: true }).click()
  await video.scrollIntoViewIfNeeded()
  await expect.poll(() => video.evaluate((node) => (node as HTMLVideoElement).currentTime)).toBeGreaterThan(.1)
})
