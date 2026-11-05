import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
const folder = `/tmp/disassembly-redesign-${process.argv[2] ?? 'after'}`
await mkdir(folder, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ reducedMotion: 'reduce' })
for (const width of [1440, 768, 390, 360]) {
  await page.setViewportSize({ width, height: 1000 })
  await page.goto('http://127.0.0.1:5180/')
  await page.screenshot({ path: `${folder}/hero-${width}.png` })
  for (const id of ['architecture', 'actions', 'datasets', 'state', 'agent', 'devices', 'results', 'prompts']) {
    const target = page.locator(`#${id}`)
    await target.scrollIntoViewIfNeeded()
    await target.screenshot({ path: `${folder}/${id}-${width}.png`, style: '.site-header, .skip-link { visibility: hidden !important }' })
  }
  console.log(width, await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth-innerWidth, sections: [...document.querySelectorAll('main > section')].map(x => x.id) })))
}
await browser.close()
