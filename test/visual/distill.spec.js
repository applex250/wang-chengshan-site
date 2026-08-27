const { test, expect } = require("@playwright/test");
const { preparePage, stabilizeVisuals, compareWithBaseline } = require("./helpers");

test("distill style remains stable after load (light)", async ({ page }) => {
  await preparePage(page);
  await page.goto("al-folio/blog/2021/distill/", { waitUntil: "networkidle" });
  await stabilizeVisuals(page);

  const before = await page.evaluate(() => {
    const article = document.querySelector("d-article");
    return article ? getComputedStyle(article).color : null;
  });

  await page.waitForTimeout(3000);

  const after = await page.evaluate(() => {
    const article = document.querySelector("d-article");
    return article ? getComputedStyle(article).color : null;
  });

  expect(after).toBe(before);

  const hasRemoteDistillLoader = await page.evaluate(() => {
    return performance.getEntriesByType("resource").some((entry) => entry.name.includes("distill.pub/template.v2.js"));
  });
  expect(hasRemoteDistillLoader).toBe(false);
});

test("distill visual parity against baseline (light)", async ({ page, context }, testInfo) => {
  test.skip(!process.env.BASELINE_URL, "BASELINE_URL is not configured for visual parity checks.");
  await preparePage(page);
  const ratio = await compareWithBaseline(context, page, "al-folio/blog/2021/distill/", { fullPage: false });
  const threshold = testInfo.project.name === "mobile" ? 0.1 : 0.06;
  expect(ratio).not.toBeNull();
  expect(ratio).toBeLessThan(threshold);
});
