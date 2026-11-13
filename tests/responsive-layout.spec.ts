import { expect, test } from "@playwright/test";

const viewports = [
  [320, 568],
  [360, 800],
  [390, 844],
  [430, 932],
  [667, 375],
  [844, 390],
  [768, 1024],
  [820, 1180],
  [1024, 768],
  [1024, 1366],
  [1180, 820],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [2560, 1440],
];
for (const [width, height] of viewports) {
  test(`page and feedback loop fit ${width} × ${height}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator(".prompt-template")).toHaveCount(4);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const clipped = await page
      .locator(
        ".parallel-skills, .parallel-devices, .runtime-fields, .process-stage, .prompt-list, .comparison-plots, .device-results, .perception-metrics, .prompt-layout",
      )
      .evaluateAll((groups) =>
        groups.flatMap((group) => {
          const parent = group.getBoundingClientRect();
          return [...group.children]
            .filter((child) => {
              const box = child.getBoundingClientRect();
              return box.left < parent.left - 1 || box.right > parent.right + 1;
            })
            .map((child) => child.className);
        }),
      );
    expect(clipped).toEqual([]);
    const arrows = await page.locator(".connector-base").evaluateAll((paths) =>
      paths.map((node) => ({
        length: (node as SVGPathElement).getTotalLength(),
        thickness: parseFloat(getComputedStyle(node).strokeWidth),
      })),
    );
    expect(arrows).toHaveLength(6);
    expect(
      arrows.every((arrow) => arrow.length >= 25 && arrow.thickness >= 2.2),
    ).toBe(true);
    const route = await page
      .locator(".feedback .connector-base")
      .evaluate((node) => {
        const path = node as SVGPathElement,
          matrix = path.getScreenCTM()!;
        const start = path.getPointAtLength(0).matrixTransform(matrix),
          end = path
            .getPointAtLength(path.getTotalLength())
            .matrixTransform(matrix);
        return {
          start: { x: start.x, y: start.y },
          end: { x: end.x, y: end.y },
        };
      });
    const execution = (await page
      .locator('[data-flow-panel="execution"]')
      .boundingBox())!;
    const state = (await page
      .locator('[data-flow-panel="state"]')
      .boundingBox())!;
    expect(route.start.x).toBeCloseTo(execution.x + execution.width + 4, 0);
    expect(route.start.y).toBeCloseTo(execution.y + execution.height / 2, 0);
    if (execution.x > state.x + state.width) {
      expect(route.end.x).toBeCloseTo(state.x + state.width / 2, 0);
      expect(route.end.y).toBeCloseTo(state.y - 23, 0);
    } else {
      expect(route.end.x).toBeCloseTo(state.x + state.width + 8, 0);
      expect(route.end.y).toBeCloseTo(state.y + state.height / 2, 0);
    }
    // Feedback must travel through gutters, never through a video or JSON card.
    const blocked = await page.locator('.feedback .connector-base').evaluate(node => {
      const path = node as SVGPathElement, matrix = path.getScreenCTM()!;
      const panels = [...document.querySelectorAll('.flow-panel')].map(panel => panel.getBoundingClientRect());
      for (let at = 0; at <= path.getTotalLength(); at += 4) {
        const point = path.getPointAtLength(at).matrixTransform(matrix);
        if (panels.some(panel => point.x > panel.left + 2 && point.x < panel.right - 2 && point.y > panel.top + 2 && point.y < panel.bottom - 2)) return true;
      }
      return false;
    });
    expect(blocked).toBe(false);
    const orbit = (await page.locator(".react-orbit").boundingBox())!;
    expect(Math.abs(orbit.width - orbit.height)).toBeLessThan(1);
    expect(
      await page
        .locator(".state-display")
        .evaluate((node) => node.scrollWidth - node.clientWidth),
    ).toBeLessThanOrEqual(1);
  });
}
