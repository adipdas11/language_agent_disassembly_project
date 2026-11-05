import { expect, test } from '@playwright/test'

// CSS viewport sizes cover common display scaling, portrait/landscape tablets,
// small phones, and laptop/desktop resolutions independently of screen inches.
const viewports = [
  [320, 568], [360, 800], [390, 844], [430, 932],
  [667, 375], [844, 390], [768, 1024], [820, 1180],
  [1024, 768], [1024, 1366], [1180, 820], [1366, 1024],
  [1280, 800], [1366, 768], [1440, 900], [1536, 864],
  [1920, 1080], [2560, 1440],
]

for (const [width, height] of viewports) {
  test(`whole page fits ${width} × ${height} with clear diagram connectors`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await expect(page.locator('.prompt-template')).toHaveCount(5)
    if (width <= 950) {
      await expect(page.getByRole('button', { name: 'Toggle navigation' })).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Research sections' })).toBeHidden()
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)

    const clipped = await page.locator('.sample-image-grid, .parallel-skills, .parallel-devices, .parallel-states, .parallel-scenarios, .prompt-list, .hero-actions, .prompt-template > header, .state-example .panel-toolbar').evaluateAll((groups) => groups.flatMap((group) => {
      const parent = group.getBoundingClientRect()
      return [...group.children].filter((child) => {
        const box = child.getBoundingClientRect()
        return box.left < parent.left-1 || box.right > parent.right+1
      }).map((child) => child.className || child.tagName)
    }))
    expect(clipped).toEqual([])

    const paths = page.locator('.visual-flow-connectors > path:not(.flow-feedback-line)')
    await expect(paths).toHaveCount(5)
    const arrows = await paths.evaluateAll((items) => items.map((item) => ({
      length: (item as SVGPathElement).getTotalLength(),
      thickness: parseFloat(getComputedStyle(item).strokeWidth),
    })))
    expect(arrows.every((arrow) => arrow.length >= 27 && arrow.thickness >= 2.6)).toBe(true)
    const panels = await page.locator('.flow-panel').evaluateAll((items) => items.map((item) => {
      const box = item.getBoundingClientRect()
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right }
    }))
    const minimumGap = width <= 650 ? 48 : width <= 1100 ? 64 : 72
    expect(panels[3].top-panels[2].bottom).toBeGreaterThanOrEqual(minimumGap-1)
    const feedback = page.locator('.flow-feedback-line')
    await expect(feedback).not.toHaveCSS('display', 'none')
    const route = await feedback.evaluate((node) => {
      const path = node as SVGPathElement
      const matrix = path.getScreenCTM()!
      const start = path.getPointAtLength(0).matrixTransform(matrix)
      const end = path.getPointAtLength(path.getTotalLength()).matrixTransform(matrix)
      return { start: { x:start.x,y:start.y }, end: { x:end.x,y:end.y } }
    })
    const execution = await page.locator('[data-flow-panel="execution"]').boundingBox()
    const state = await page.locator('[data-flow-panel="state"]').boundingBox()
    expect(route.start.x).toBeCloseTo(execution!.x+execution!.width+8, 0)
    expect(route.start.y).toBeCloseTo(execution!.y+execution!.height/2, 0)
    expect(route.end.x).toBeCloseTo(state!.x+state!.width+8, 0)
    expect(route.end.y).toBeCloseTo(state!.y+state!.height/2, 0)
  })
}
