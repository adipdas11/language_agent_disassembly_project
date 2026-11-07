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

test("all eight unique videos decode and the primary recording starts at execution", async ({
  page,
}) => {
  await page.goto("/");
  const videos = page.locator("video");
  await expect(videos).toHaveCount(8);
  const sources = await videos.evaluateAll((items) =>
    items.map(
      (video) =>
        video.currentSrc ||
        video.getAttribute("src") ||
        video.querySelector("source")?.src,
    ),
  );
  expect(new Set(sources).size).toBe(8);
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
  }
  const film = page.getByLabel("UNMAKE physical disassembly experiment", {
    exact: true,
  });
  expect(
    await film.evaluate((node) => (node as HTMLVideoElement).duration),
  ).toBeCloseTo(121.3, 0);
  const edit = await (
    await page.request.get("/assets/experiment-edit.json")
  ).json();
  expect(edit.source_start_seconds).toBe(21.2);
  expect(edit.source_end_seconds).toBe(142.5);
});

test("results distinguish examples from perception measurements and retain revised values", async ({
  page,
}) => {
  await page.goto("/#results");
  await expect(page.locator(".data-status")).toContainText(
    "not measured robot performance",
  );
  await expect(page.locator(".controller-card")).toHaveCount(3);
  await expect(
    page.locator(".perception-results .data-table tbody tr"),
  ).toHaveCount(18);
  await expect(page.locator(".skill-results .data-table tbody tr")).toHaveCount(
    7,
  );
  await expect(page.locator(".controller-card").nth(0)).toContainText("49.6");
  await expect(page.locator(".controller-card").nth(1)).toContainText("11.5");
  await expect(page.locator(".controller-card").nth(2)).toContainText("6.8");
  await expect(page.locator(".metric-definitions")).toContainText("22.6%");
  await expect(page.locator(".comparison-intro")).toContainText("16.1%");
  await expect(page.locator("#results")).not.toContainText("72.2%");
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
  expect(parsed.assembly_state.last_outcome).toBe("success");
  await expect(page.locator(".state-example")).toHaveCount(1);
});
