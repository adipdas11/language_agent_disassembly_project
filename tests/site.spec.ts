import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("research story explains the method and evidence before the full demonstration", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "UNMAKE: Language-Agent-Guided Adaptive Dual-Arm Robotic Disassembly",
  );
  const sections = await page
    .locator("main > section")
    .evaluateAll((items) => items.map((item) => item.id));
  expect(sections).toEqual([
    "top",
    "abstract",
    "architecture",
    "datasets",
    "state",
    "results",
    "video",
    "prompts",
    "limitations",
  ]);
  await expect(page.locator(".prompt-template")).toHaveCount(5);
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.locator("main details")).toHaveCount(0);
  await expect(page.locator(".author")).toHaveCount(3);
  await expect(page.getByRole("button", { name: /coming soon/ })).toHaveCount(
    2,
  );
});

test("dataset figure expands and closes using the keyboard", async ({
  page,
}) => {
  await page.goto("/#datasets");
  await page
    .getByRole("button", {
      name: "Open full-size figure: Raw image",
      exact: true,
    })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close figure" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("mobile navigation opens and follows the selected anchor", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Actions", exact: true })
    .click();
  await expect(page.locator("#actions")).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Toggle navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("desktop and phone satisfy accessibility checks, including colour contrast", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
});
