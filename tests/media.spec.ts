import { expect, test } from "@playwright/test";

test("perception matrix has raw and labelled images, including aligned contact", async ({
  page,
}) => {
  await page.goto("/#datasets");
  const viewer = page.locator(".dataset-samples");
  await expect(viewer.locator("tbody tr")).toHaveCount(3);
  await expect(viewer.locator(".research-figure")).toHaveCount(6);
  await expect(viewer.locator(".figure-image-label")).toHaveText(
    "Contact aligned",
  );
  await expect(viewer.locator('img[src*="prediction"]')).toHaveCount(0);
  for (const label of [
    "Global device dataset",
    "Local fastener dataset",
    "Process-state dataset",
  ])
    await expect(
      viewer.getByRole("link", { name: label, exact: true }),
    ).toHaveCount(1);
});

test("all seven unique diagram clips decode, including the wider execution view", async ({
  page,
}) => {
  await page.goto("/");
  const videos = page.locator("video");
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
