const { test, expect } = require("@playwright/test");
const { preparePage, compareWithBaseline } = require("./helpers");

const routes = [
  { path: "al-folio/", id: "home" },
  { path: "al-folio/projects/", id: "projects" },
  { path: "al-folio/publications/", id: "publications" },
  { path: "al-folio/repositories/", id: "repositories" },
];

test.beforeEach(async ({}, testInfo) => {
  test.skip(!process.env.BASELINE_URL, "BASELINE_URL is not configured for visual parity checks.");
});

for (const route of routes) {
  test(`visual parity: ${route.id} (light)`, async ({ page, context }, testInfo) => {
    await preparePage(page);
    const ratio = await compareWithBaseline(context, page, route.path);
    let threshold = testInfo.project.name === "mobile" ? 0.08 : 0.04;
    // Tailwind v1 intentionally diverges more from v0.16 publications layout on mobile.
    if (route.id === "publications" && testInfo.project.name === "mobile") {
      threshold = 0.26;
    }
    expect(ratio).not.toBeNull();
    expect(ratio).toBeLessThan(threshold);
  });
}
