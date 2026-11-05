import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const width of [360, 768, 1280, 1600]) {
  test(`responsive layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: /language-agent guided/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /local fastener dataset/i }).first()).toHaveAttribute('href', /electronic_devices_local/)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}

test('core interactive story is operable', async ({ page }) => {
  await page.goto('/')
  const sectionOrder = await page.evaluate(() => ['top', 'abstract', 'video', 'architecture', 'datasets', 'state', 'agent', 'results', 'prompts'].map((id) => document.getElementById(id)?.offsetTop ?? -1))
  expect(sectionOrder).toEqual([...sectionOrder].sort((a, b) => a - b))
  await expect(page.locator('.hero-photo')).toHaveCount(0)
  await page.getByRole('button', { name: 'State verification', exact: true }).click()
  await expect(page.getByRole('button', { name: 'State verification', exact: true })).toHaveAttribute('aria-pressed', 'true')

  await expect(page.getByRole('heading', { name: 'Misaligned contact', exact: true })).toBeVisible()
  await expect(page.locator('.parallel-devices')).toContainText('Mini PC')

  await expect(page.getByText('Reasoning template', { exact: true })).toBeVisible()
  await expect(page.getByText('{force_torque}', { exact: true }).first()).toBeVisible()

  await expect(page.locator('.state-display details')).toHaveCount(0)
  await expect(page.locator('.state-example')).toHaveCount(1)

  await expect(page.getByTitle(/adaptive dual-arm robotic disassembly experiment video/i)).toHaveAttribute('src', /youtube-nocookie/)
})

test('figure modal supports keyboard close', async ({ page }) => {
  await page.goto('/#architecture')
  await page.getByRole('button', { name: /expand animated architecture figure/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('all architecture blocks are selectable and expose their input and output', async ({ page }) => {
  await page.goto('/#architecture')
  const blocks = page.locator('.diagram-node')
  await expect(blocks).toHaveCount(9)
  for (let index = 0; index < 9; index++) {
    await blocks.nth(index).focus()
    await page.keyboard.press('Enter')
    await expect(blocks.nth(index)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.diagram-node[aria-pressed="true"]')).toHaveCount(1)
    await expect(blocks.nth(index)).toHaveAttribute('aria-description', /Input: .+Output: /)
  }
  await expect(page.getByRole('button', { name: 'Play architecture animation' })).toBeVisible()
})

test('mobile navigation opens, jumps to a section, and closes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await page.getByRole('navigation', { name: 'Research sections' }).getByRole('link', { name: 'Actions', exact: true }).click()
  await expect(page.locator('#actions')).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-expanded', 'false')
})

test('reduced motion and accessibility audit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.locator('.reveal').first()).toHaveCSS('opacity', '1')
  const results = await new AxeBuilder({ page }).exclude('.recharts-wrapper').exclude('.video-shell iframe').analyze()
  expect(results.violations).toEqual([])
})
