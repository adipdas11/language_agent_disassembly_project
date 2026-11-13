import { expect, test } from "@playwright/test";

test("three model collages show two rows of five samples without raw/labelled pairs", async ({ page }) => {
  await page.goto("/#datasets");
  const viewer = page.locator(".dataset-collages");
  await expect(viewer.locator(".collage-model")).toHaveCount(3);
  await expect(viewer.locator(".collage-tile img")).toHaveCount(30);
  for (const grid of await viewer.locator(".collage-grid").all()) {
    await expect(grid.locator("img")).toHaveCount(10);
    const rowPositions = await grid.locator('.collage-tile').evaluateAll(tiles => [...new Set(tiles.map(tile => Math.round(tile.getBoundingClientRect().top)))]);
    expect(rowPositions).toHaveLength(2);
    for (const image of await grid.locator("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
  }
  await expect(viewer.locator(".figure-button")).toHaveCount(0);
  await expect(viewer.locator('img[src*="prediction"]')).toHaveCount(0);
  for (const label of ["Global device dataset", "Local fastener dataset", "Process-state dataset"])
    await expect(viewer.getByRole("link", { name: label, exact: true })).toHaveCount(1);
});

test("all seven unique diagram clips decode, including the wider execution view", async ({
  page,
}) => {
  await page.goto("/");
  const videos = page.locator("#architecture video");
  await expect(videos).toHaveCount(7);
  const sources = await videos.evaluateAll((items) =>
    items.map(
      (video) =>
        video.currentSrc ||
        video.getAttribute("src") ||
        video.querySelector("source")?.src,
    ),
  );
  expect(new Set(sources).size).toBe(7);
  for (const video of await videos.all()) {
    await video.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        video.evaluate((node) => (node as HTMLVideoElement).videoWidth),
      )
      .toBeGreaterThan(0);
    await video.evaluate(async (node) => {
      const video = node as HTMLVideoElement;
      await video.play();
    });
    await expect
      .poll(() =>
        video.evaluate((node) => (node as HTMLVideoElement).currentTime),
      )
      .toBeGreaterThan(0);
    await video.evaluate(node => (node as HTMLVideoElement).pause());
  }
  const film = page.getByLabel("Dual-arm execution video", { exact: true });
  expect(await film.evaluate(node => ({width:(node as HTMLVideoElement).videoWidth, height:(node as HTMLVideoElement).videoHeight}))).toEqual({width:950,height:612});

});

test("results retain V11 physical-trial values and separate the additional HDD", async ({ page }) => {
  await page.goto("/#results");
  await expect(page.locator(".results-summary")).toContainText("58.1% → 89.7%");
  await expect(page.locator(".device-results .paper-table")).toHaveCount(3);
  await expect(page.locator(".perception-metrics tbody tr")).toHaveCount(18);
  await expect(page.locator(".skill-table tbody tr")).toHaveCount(10);
  await expect(page.locator(".comparison-plots")).toContainText("96.4 ± 4.7%");
  await expect(page.locator(".comparison-plots")).toContainText("360.4 ± 30.6 s");
  await expect(page.locator(".results-summary")).toContainText("22.2%");
  await expect(page.locator(".additional-hdd")).toContainText("90.9%");
  await expect(page.locator("#results")).not.toContainText("generated examples");
});

test("worked state contains only the four runtime fields and no product identifier", async ({
  page,
}) => {
  await page.goto("/#state");
  const state = await page.locator(".state-display").textContent();
  const parsed = JSON.parse(state!);
  expect(Object.keys(parsed)).toEqual([
    "global_view",
    "local_view",
    "assembly_state",
    "force_torque",
  ]);
  expect(parsed).not.toHaveProperty("device_id");
  expect(parsed.assembly_state.last_outcome).toBe("failure");
  await expect(page.locator(".state-example")).toHaveCount(1);
});

test('device videos include all recorded actions and execution combines them at twice the recording speed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#architecture');
  const manifest = await (await page.request.get('/assets/architecture/clips.json')).json();
  const execution = manifest.find((clip: {id: string}) => clip.id === 'execution');
  expect(execution.speed_factor).toBe(2);
  expect(execution.segments.map((clip: {id: string}) => clip.id)).toEqual(['hdd', 'mini-pc', 'laptop']);
  for (const [label, duration] of [
    ['Hard disk drive evaluation video', 41.5],
    ['Mini PC evaluation video', 41.5],
    ['Laptop evaluation video', 30.8],
    ['Dual-arm execution video', 56.9],
  ] as const) {
    const video = page.getByLabel(label, { exact: true });
    await video.scrollIntoViewIfNeeded();
    await expect.poll(() => video.evaluate(node => (node as HTMLVideoElement).duration)).toBeGreaterThan(0);
    expect(await video.evaluate(node => (node as HTMLVideoElement).duration)).toBeCloseTo(duration, 1);
    expect(await video.evaluate(node => (node as HTMLVideoElement).controls)).toBe(false);
    for (const proportion of [0.5, 0.99]) {
      await video.evaluate((node, proportion) => { const clip = node as HTMLVideoElement; clip.pause(); clip.currentTime = clip.duration * proportion; }, proportion);
      await expect.poll(() => video.evaluate(node => !(node as HTMLVideoElement).seeking && (node as HTMLVideoElement).readyState >= 2)).toBe(true);
    }
  }
  const total = manifest.filter((clip: {id: string}) => clip.id !== 'execution').reduce((sum: number, clip: {duration: number}) => sum + clip.duration, 0);
  expect(execution.duration).toBeCloseTo(total / 2, 1);
});
