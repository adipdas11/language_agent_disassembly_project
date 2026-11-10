import { expect, test } from "@playwright/test";

test("all three perception lanes and all skill and device clips are visible together", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#architecture");
  await expect(page.locator(".vision-row")).toHaveCount(3);
  await expect(page.locator(".flow-panel")).toHaveCount(6);
  await expect(page.locator(".parallel-skill video")).toHaveCount(3);
  await expect(page.locator(".parallel-device video")).toHaveCount(3);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const lanes = await page.locator(".vision-row").evaluateAll((rows) =>
      rows.map((row) => {
        const raw = row.querySelector(".vision-input")!.getBoundingClientRect(),
          model = row.querySelector(".vision-model")!.getBoundingClientRect(),
          output = row.querySelector(".vision-output")!.getBoundingClientRect();
        return (
          raw.right < output.left &&
          model.bottom <= raw.top &&
          Math.abs(raw.top - output.top) < 1
        );
      }),
    );
    expect(lanes).toEqual([true, true, true]);
    const clippedLabels = await page
      .locator(".detection-label")
      .evaluateAll((labels) =>
        labels
          .filter((label) => {
            const parent = label
              .closest(".vision-output")!
              .getBoundingClientRect();
            const rect = label.getBoundingClientRect();
            return (
              rect.top < parent.top - 1 ||
              rect.right > parent.right + 1 ||
              rect.bottom > parent.bottom + 1
            );
          })
          .map((label) => label.textContent),
      );
    expect(clippedLabels).toEqual([]);
  }
  await expect(page.locator(".react-orbit .flow-phase")).toHaveText([
    "Observe",
    "Think",
    "Act",
  ]);
  await expect(page.locator(".classification-label")).toHaveText(
    "Contact Aligned100.0%",
  );
  await expect(page.locator(".detection-boxes rect")).toHaveCount(11);
  const figure = await page.locator(".visual-flow-board").boundingBox();
  expect(figure!.height).toBeLessThan(900);
  const columns = await page
    .locator(
      ".perception-panel, .state-panel, .execution-panel, .devices-panel",
    )
    .evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect().left),
    );
  expect(columns).toEqual([...columns].sort((a, b) => a - b));
});

test("skill selection uses paper dispatch identifiers and does not hide other skills", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#actions");
  for (const [name, call] of [
    ["Unscrew", "unscrew(holder_screw_03)"],
    ["Pick-and-Extract", "pickup_object(lid)"],
    ["Flip", "flip_object(observed_device)"],
  ]) {
    const button = page
      .locator(".parallel-skills")
      .getByRole("button", { name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".flow-interface code")).toHaveText(call);
    await expect(page.locator(".agent-context code")).toHaveText(call);
    await expect(page.locator(".parallel-skill")).toHaveCount(3);
  }
});

test("animation pauses for reduced motion and can be explicitly resumed", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#actions");
  const clip = page.getByLabel("Unscrew skill video", { exact: true });
  await clip.scrollIntoViewIfNeeded();
  expect(await clip.evaluate((node) => (node as HTMLVideoElement).paused)).toBe(
    true,
  );
  await page
    .getByRole("button", { name: "Play architecture animation", exact: true })
    .click();
  await clip.scrollIntoViewIfNeeded();
  await expect
    .poll(() => clip.evaluate((node) => (node as HTMLVideoElement).currentTime))
    .toBeGreaterThan(0.1);
  // Invoke the control without scrolling the film out of view.
  await page
    .getByRole("button", { name: "Pause architecture animation", exact: true })
    .evaluate((node) => (node as HTMLButtonElement).click());
  await expect
    .poll(() => clip.evaluate((node) => (node as HTMLVideoElement).paused))
    .toBe(true);
});

test("execution verification updates the state preview", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#architecture");
  await expect(page.getByLabel("Illustrative world-state JSON")).toContainText(
    '"last_outcome": null',
  );
  await page
    .getByRole("button", { name: /Cross-device evaluation/ })
    .click();
  await expect(page.getByLabel("Illustrative world-state JSON")).toContainText(
    '"last_outcome": "success"',
  );
});


test("only the selected highlighted skill plays while all three remain visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#actions");
  await page.getByRole("button", { name: "Play architecture animation", exact: true }).evaluate(node => (node as HTMLButtonElement).click());
  const skills = page.locator(".parallel-skills");
  await skills.getByRole("button", { name: "Unscrew", exact: true }).click();
  await expect.poll(() => skills.locator("video").evaluateAll(nodes => nodes.map(n => n.paused))).toEqual([false, true, true]);
  await skills.getByRole("button", { name: "Pick-and-Extract", exact: true }).click();
  await expect.poll(() => skills.locator("video").evaluateAll(nodes => nodes.map(n => n.paused))).toEqual([true, false, true]);
  await expect(page.locator(".parallel-skill.selected .skill-select")).toHaveText("Pick-and-Extract");
  await expect(page.locator(".parallel-skill")).toHaveCount(3);
});

test('selecting a skill starts playback and continues the automatic cycle without mode controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#actions');
  await expect(page.getByRole('button', { name: 'Play on click', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Loop all skills', exact: true })).toHaveCount(0);
  const videos = page.locator('.parallel-skills video');
  await page.locator('.parallel-skills').getByRole('button', { name: 'Pick-and-Extract', exact: true }).click();
  await expect.poll(() => videos.evaluateAll(nodes => nodes.map(node => node.paused))).toEqual([true, false, true]);
  await expect(page.locator('.parallel-skill.selected .skill-select')).toHaveAccessibleName('Pick-and-Extract');
  const pick = videos.nth(1);
  await expect.poll(() => pick.evaluate(node => (node as HTMLVideoElement).currentTime)).toBeGreaterThan(0.05);
  await pick.evaluate(node => { const video = node as HTMLVideoElement; video.currentTime = video.duration - 0.12; });
  await expect(page.locator('.parallel-skill.selected .skill-select')).toHaveAccessibleName('Flip');
  await expect.poll(() => videos.evaluateAll(nodes => nodes.map(node => node.paused))).toEqual([true, true, false]);
});

test('skills play each clip to its end and cycle first to last repeatedly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#actions');
  await page.locator('.parallel-skills').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Play architecture animation', exact: true }).evaluate(node => (node as HTMLButtonElement).click());
  const videos = page.locator('.parallel-skills video');
  for (const [index, name] of ['Unscrew', 'Pick-and-Extract', 'Flip', 'Unscrew'].entries()) {
    const selected = index % 3;
    await expect(page.locator('.parallel-skill.selected .skill-select')).toHaveAccessibleName(name);
    await expect.poll(() => videos.evaluateAll(nodes => nodes.map(node => node.paused))).toEqual([0, 1, 2].map(i => i !== selected));
    const video = videos.nth(selected);
    await expect.poll(() => video.evaluate(node => (node as HTMLVideoElement).currentTime)).toBeGreaterThan(0);
    if (index < 3) await video.evaluate(node => { const clip = node as HTMLVideoElement; clip.currentTime = clip.duration - 0.12; });
  }
  await page.getByRole('button', { name: 'Pause architecture animation', exact: true }).evaluate(node => (node as HTMLButtonElement).click());
  await expect.poll(() => videos.evaluateAll(nodes => nodes.map(node => node.paused))).toEqual([true, true, true]);
});
