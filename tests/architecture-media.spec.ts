import { expect, test } from '@playwright/test'

test('perception input, model, and output lanes remain ordered and the pipeline fits every screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [360, 768, 1280, 1600]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/#architecture')
    const sizes = await page.locator('.flow-panel').evaluateAll((panels) => panels.map((panel) => {
      const box = panel.getBoundingClientRect()
      const media = panel.querySelector('.flow-perception-views, .flow-json-window, .flow-agent-visual, .flow-clip')!.getBoundingClientRect()
      return { fits: media.left >= box.left && media.right <= box.right && media.top >= box.top && media.bottom <= box.bottom }
    }))
    expect(sizes).toHaveLength(6)
    expect(sizes.every((item) => item.fits)).toBe(true)
    const lanes = await page.locator('.vision-row').evaluateAll((rows) => rows.map((row) => {
      const input = row.querySelector('.vision-input')!.getBoundingClientRect()
      const model = row.querySelector('.vision-model')!.getBoundingClientRect()
      const output = row.querySelector('.vision-output')!.getBoundingClientRect()
      return input.right < model.left && model.right < output.left && Math.abs(input.top-output.top) < 1
    }))
    expect(lanes).toEqual([true, true, true])
    const deviceFrames = await page.locator('.parallel-device').evaluateAll((frames) => frames.map((frame) => frame.getBoundingClientRect().top))
    if (width > 650) expect(Math.max(...deviceFrames) - Math.min(...deviceFrames)).toBeLessThan(1)
    const execution = await page.locator('[data-flow-panel="execution"]').boundingBox()
    const evaluation = await page.locator('[data-flow-panel="devices"]').boundingBox()
    expect(evaluation!.y).toBeGreaterThan(execution!.y+execution!.height)
    expect(Math.abs(execution!.width-evaluation!.width)).toBeLessThan(1)
    expect(Math.abs(execution!.x-evaluation!.x)).toBeLessThan(1)
    if (width >= 1280) expect((await page.getByLabel('Dual-arm execution video', { exact: true }).boundingBox())!.width).toBeGreaterThanOrEqual(768)
    const orbit = await page.locator('.react-orbit').boundingBox()
    expect(Math.abs(orbit!.width-orbit!.height)).toBeLessThan(1)
    await expect(page.locator('.react-orbit .flow-phase')).toHaveText(['Observe', 'Think', 'Act'])
    const loopClear = await page.locator('.react-orbit').evaluate((orbit) => {
      const labels = [...orbit.querySelectorAll('.flow-phase')].map((label) => label.getBoundingClientRect())
      return [...orbit.querySelectorAll('svg > path')].every((item) => {
        const path = item as SVGPathElement
        const matrix = path.getScreenCTM()!
        for (let i = 0; i <= 30; i++) {
          const point = path.getPointAtLength(path.getTotalLength()*i/30).matrixTransform(matrix)
          if (labels.some((label) => point.x > label.left-4 && point.x < label.right+4 && point.y > label.top-4 && point.y < label.bottom+4)) return false
        }
        return true
      })
    })
    expect(loopClear).toBe(true)
    if (width > 1100) {
      const state = await page.locator('[data-flow-panel="state"]').boundingBox()
      const agent = await page.locator('[data-flow-panel="agent"]').boundingBox()
      const perception = await page.locator('[data-flow-panel="scene"]').boundingBox()
      expect(Math.abs(state!.x-agent!.x)).toBeLessThan(1)
      expect(state!.height).toBeLessThan(perception!.height*.7)
      expect(agent!.y-(state!.y+state!.height)).toBeCloseTo(48, 0)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
  }
})

test('predictions use crisp visible overlays from the saved model outputs', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#architecture')
  const rows = page.locator('.vision-row')
  await expect(rows.nth(0).locator('.detection-boxes rect')).toHaveCount(8)
  await expect(rows.nth(1).locator('.detection-boxes rect')).toHaveCount(3)
  await expect(rows.nth(2).locator('.classification-label')).toHaveText('Contact Aligned100.0%')
  const lid = rows.nth(0).locator('.detection-boxes rect').first()
  expect(Number(await lid.getAttribute('x'))).toBeCloseTo(6.307, 2)
  expect(await lid.evaluate((rect) => getComputedStyle(rect).vectorEffect)).toBe('non-scaling-stroke')
  for (const overlay of await rows.locator('.flow-detection-layer').all()) await expect(overlay).toHaveCSS('opacity', '1')
})

test('the ReAct proposal, state example, and selected skill agree', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#architecture')
  const map = page.locator('.visual-flow')
  const choices = map.getByRole('group', { name: 'Architecture skill videos' })
  await expect(choices.locator('video')).toHaveCount(3)
  for (const [label, call, status] of [['Unscrew', 'unscrew(lid_screw_01)', 'lid_blocked'], ['Pick-and-Extract', 'pick_and_extract(lid)', 'lid_free'], ['Flip', 'flip(device)', 'flip_ready']]) {
    await choices.getByRole('button', { name: label, exact: true }).click()
    await expect(map.locator('.flow-interface code')).toHaveText(call)
    await expect(map.getByLabel('Illustrative world-state JSON')).toContainText(status)
  }
})

test('raw input becomes detections and JSON builds during the walkthrough', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#architecture')
  const map = page.locator('.visual-flow')
  await map.getByRole('button', { name: 'Scene-level perception', exact: true }).click()
  await map.getByRole('button', { name: 'Play architecture animation', exact: true }).click()
  await expect(map.locator('.flow-perception-view')).toHaveCount(3)
  await expect(map.locator('.flow-detection-layer').first()).not.toHaveClass(/visible/)
  await expect(map.locator('.flow-detection-layer').first()).toHaveClass(/visible/)
  for (const image of await map.locator('.flow-detection-layer').all()) await expect(image).toHaveClass(/visible/)
  await map.getByRole('button', { name: 'Structured world state', exact: true }).click()
  await map.getByRole('button', { name: 'Play architecture animation', exact: true }).click()
  await expect(map.locator('.flow-type-cursor')).toBeVisible()
  await expect(map.getByLabel('Illustrative world-state JSON')).toContainText('"fasteners"')
})

test('all skill and device videos play, new execution footage decodes, and global pause stops playback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/#architecture')
  const map = page.locator('.visual-flow')
  await map.getByRole('button', { name: 'Play architecture animation', exact: true }).click()
  const checkVideo = async (label: string) => {
    const video = map.getByLabel(label, { exact: true })
    await video.scrollIntoViewIfNeeded()
    await expect.poll(() => video.evaluate((node) => (node as HTMLVideoElement).currentTime)).toBeGreaterThan(.1)
    expect(await video.evaluate((node) => { const v = node as HTMLVideoElement; return v.videoWidth > 0 && v.muted && v.loop && !v.error })).toBe(true)
  }
  const skills = map.getByRole('group', { name: 'Architecture skill videos' })
  await expect(skills.locator('video')).toHaveCount(3)
  for (const [button, label] of [['Unscrew', 'Unscrew'], ['Pick-and-Extract', 'Pick-and-Extract'], ['Flip', 'Flip']]) {
    await skills.getByRole('button', { name: button, exact: true }).click()
    await checkVideo(`${label} skill video`)
  }
  await checkVideo('Dual-arm execution video')
  const devices = map.getByRole('group', { name: 'Architecture device videos' })
  await expect(devices.locator('video')).toHaveCount(3)
  for (const label of ['HDD', 'Mini PC', 'Laptop']) {
    await checkVideo(`${label} evaluation video`)
  }
  await expect.poll(() => devices.locator('video').evaluateAll((videos) => videos.every((video) => !video.paused))).toBe(true)
  await map.getByRole('button', { name: 'Pause architecture animation', exact: true }).click()
  await map.getByLabel('Dual-arm execution video', { exact: true }).scrollIntoViewIfNeeded()
  await expect.poll(() => map.locator('video').evaluateAll((videos) => videos.every((v) => v.paused))).toBe(true)
})
