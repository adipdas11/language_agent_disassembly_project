import assert from 'node:assert/strict'
import { chromium, expect } from '@playwright/test'

const url = new URL(process.argv[2] ?? 'http://127.0.0.1:5181/language_agent_disassembly_project/')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  for (const width of [1440, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
    const failures = []
    page.on('pageerror', (error) => failures.push(error.message))
    page.on('response', (response) => {
      if (new URL(response.url()).origin === url.origin && response.status() >= 400) failures.push(`${response.status()} ${response.url()}`)
    })
    await page.goto(url.href)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('.prompt-template')).toHaveCount(4)
    await expect(page.locator('.collage-tile img')).toHaveCount(30)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('UNMAKE:')
    await expect(page.locator('.results-summary')).toContainText('58.1% → 89.7%')
    for (const section of await page.locator('main > section').all()) await section.scrollIntoViewIfNeeded()
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded()
      await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0)
    }
    const paths = await page.locator('img[src], video[src], video[poster], source[src], link[rel="icon"]').evaluateAll((nodes) => nodes.flatMap((node) => ['src', 'poster', 'href'].filter((key) => node.hasAttribute(key)).map((key) => new URL(node.getAttribute(key), location.href).href)))
    for (const path of paths) {
      const asset = new URL(path)
      if (asset.origin === url.origin) assert.ok(asset.pathname.startsWith(url.pathname), `Asset escaped the project path: ${asset.href}`)
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth+1), false)
    if (width === 1440) {
      await page.getByRole('button', { name: 'Play architecture animation', exact: true }).click()
      for (const video of await page.locator('video').all()) {
        await video.scrollIntoViewIfNeeded()
        await video.evaluate(async (node) => { await node.play() })
        await expect.poll(() => video.evaluate((node) => node.currentTime)).toBeGreaterThan(.1)
        assert.ok(await video.evaluate((node) => node.videoWidth > 0 && !node.error))
        await video.evaluate(node => node.pause())
      }
      await page.getByRole('button', { name: 'Pause architecture animation', exact: true }).click()
      await page.locator('.schema-reference > summary').click()
      const packet = JSON.parse(await page.locator('.state-display').textContent())
      assert.deepEqual(Object.keys(packet), ['global_view', 'local_view', 'assembly_state', 'force_torque'])
      assert.equal(packet.assembly_state.last_outcome, 'failure')
      assert.deepEqual(packet.assembly_state.removed, [])
      await page.locator('.prompt-template > summary').filter({ hasText: 'System instruction' }).click()
      await expect(page.locator('.prompt-template[open] .prompt-prose')).toContainText('structured world state')
      const tile = page.locator('.collage-tile').first()
      await tile.click()
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await page.getByRole('group', { name: 'Skill execution device' }).getByRole('button', { name: 'Laptop', exact: true }).click()
      await expect(page.getByLabel('Laptop: Pick & Extract', { exact: true })).toContainText('23 / 30')
    }
    if (width === 390) {
      await page.getByRole('button', { name: 'Toggle navigation' }).click()
      await page.getByRole('navigation').getByRole('link', { name: 'Planning', exact: true }).click()
      assert.equal(new URL(page.url()).pathname, url.pathname)
    }
    assert.deepEqual(failures, [])
    console.log(`Verified ${url.href} at ${width}px: assets, prompts, layout${width === 1440 ? ', seven videos, schema, prompts and interactive results' : ''}`)
    await page.close()
  }
} finally {
  await browser.close()
}
