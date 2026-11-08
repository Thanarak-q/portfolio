import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const waitForCurriculumChecker = async (page: Page) => {
  await page.waitForFunction(
    () => !document.querySelector('astro-island[component-export="default"][ssr]')
  );
};

test("homepage renders core sections", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Thanarak Kanyaprasit/);
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("link", { name: "About" })).toHaveAttribute(
    "href",
    "#about"
  );
  await expect(
    page.getByRole("heading", { name: /Thanarak Kanyaprasit/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Open to/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /thanarak_ka@cmu\.ac\.th/i })
  ).toHaveAttribute("href", "mailto:thanarak_ka@cmu.ac.th");
});

test("project section is removed", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#cases")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Projects" })).toHaveCount(0);
});

test("homepage does not disclose SmartMath infrastructure vendors", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("body")).not.toContainText(
    /OpenAI|Pinecone|RabbitMQ|PostgreSQL|Redis|MinIO|Caddy|Prometheus|Grafana|Loki/i
  );
});

test("privacy page shows current ownership and deletion contact", async ({
  page,
}) => {
  await page.goto("/privacy");

  await expect(
    page.getByRole("heading", { name: "Privacy Policy" })
  ).toBeVisible();
  await expect(
    page.getByText(/platform compliance for connected apps/i)
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /thanarak_ka@cmu\.ac\.th/i }).first()
  ).toHaveAttribute("href", "mailto:thanarak_ka@cmu.ac.th");
});

test("curriculum checker page renders setup and runs audit", async ({ page }) => {
  await page.goto("/curriculum-checker");
  await waitForCurriculumChecker(page);

  // Check title/header
  await expect(page.getByRole("heading", { name: /คุณเรียนแผนไหน\?/i })).toBeVisible();
  
  // Wait for hydration by clicking the Regular Plan button and verifying it gets the active class
  const regularPlanBtn = page.getByRole("button", { name: /แผนปกติ/i });
  await regularPlanBtn.click();
  await expect(regularPlanBtn).toHaveClass(/active/);
  
  // Verify raw transcript textarea is visible
  const textarea = page.locator("textarea.cc-textarea");
  await expect(textarea).toBeVisible();

  // Paste a mock transcript
  await textarea.fill(`
    1/2564
    204111  Fundamentals of Programming  3  A
    206111  Calculus 1                   3  B+
  `);

  // Click analyze button
  const analyzeBtn = page.getByRole("button", { name: /วิเคราะห์ผลการเรียน/i });
  await expect(analyzeBtn).toBeEnabled();
  await analyzeBtn.click();

  // Verify result workspace rendered
  await expect(
    page.getByRole("heading", { name: /พื้นที่วางแผนจบ/i })
  ).toBeVisible();
  
  // Verify course chip exists
  await expect(page.getByText("204111").first()).toBeVisible();
  await expect(page.getByText("206111").first()).toBeVisible();
});

test("curriculum checker lets students plan missing required courses", async ({
  page,
}) => {
  await page.goto("/curriculum-checker");
  await waitForCurriculumChecker(page);

  const regularPlanBtn = page.getByRole("button", { name: /แผนปกติ/i });
  await regularPlanBtn.click();
  await expect(regularPlanBtn).toHaveClass(/active/);

  const textarea = page.locator("textarea.cc-textarea");
  await textarea.fill(`
    1/2564
    204111  Fundamentals of Programming  3  A
    206111  Calculus 1                   3  B+
  `);

  await page.getByRole("button", { name: /วิเคราะห์ผลการเรียน/i }).click();
  await expect(
    page.getByRole("heading", { name: /พื้นที่วางแผนจบ/i })
  ).toBeVisible();

  const planCalculus2 = page.getByRole("button", {
    name: /วางแผน 206112/i,
  });
  await expect(planCalculus2).toBeVisible();
  await planCalculus2.click();

  await expect(planCalculus2).toHaveCount(0);
  await expect(page.locator(".cc-term").filter({ hasText: "206112" })).toContainText(
    "แผน"
  );

  await page.getByLabel(/ภาคการศึกษาใหม่/i).fill("3/2564");
  await page.getByRole("button", { name: /สร้างเทอม/i }).click();
  await expect(page.locator(".cc-term").filter({ hasText: "3/2564" })).toBeVisible();
});

test("writing section shows write-ups as a gallery linking to articles", async ({
  page,
}) => {
  await page.goto("/");

  const section = page.locator("#focus");
  await expect(section.getByRole("heading", { name: /written lately/i })).toBeAttached();

  await expect(section.locator(".wg-card")).toHaveCount(5);

  const links = section.locator("a.wg-card");
  await expect(links).toHaveCount(2);
  await expect(links.first()).toContainText("API Key Feature");
  await expect(links.nth(1)).toContainText("How I Used AI to Build My Portfolio");
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("href", /linkedin\.com\/pulse\//);
    await expect(link).toHaveAttribute("target", "_blank");
  }
});

test("reading bookcase opens each review in a new tab", async ({ page }) => {
  await page.goto("/");

  const shelf = page.locator("#reading");
  const books = shelf.locator("a.bc-book");
  await expect(books).toHaveCount(7);
  await expect(books.first()).toHaveAttribute("href", "/reading#bug-bounty-bootcamp");
  await expect(books.first()).toHaveAttribute("target", "_blank");
  await expect(shelf.locator("a.bc-drawer")).toHaveAttribute("href", "/reading");
  await expect(shelf.locator("a.bc-drawer")).toHaveAttribute("target", "_blank");
});

test("reading page shows a review for every book", async ({ page }) => {
  await page.goto("/reading#practical-ai-security");

  await expect(page.getByRole("heading", { level: 1, name: /Books I've read/i })).toBeVisible();
  await expect(page.locator("article.rv")).toHaveCount(7);

  const review = page.locator("#practical-ai-security");
  await expect(review).toBeInViewport();
  await expect(review).toContainText("Harriet Farlow");
  await expect(review).toContainText("Reading now");
});

test("experience section showcases project UI with page galleries", async ({
  page,
}) => {
  await page.goto("/");

  const showcase = page.locator("#work [data-ui-work]");
  await expect(showcase).toHaveCount(1);
  await expect(page.locator("#work .work-list")).toHaveCount(0);
  await expect(showcase.locator("a")).toHaveCount(0);
  await expect(showcase).not.toContainText(/concept|where i'd test/i);

  const projects = showcase.locator("[data-ui-work-card]");
  await expect(projects).toHaveCount(3);
  for (const project of await projects.all()) {
    expect(await project.locator(".pr-page").count()).toBeGreaterThan(1);
  }

  const srcs = await showcase
    .locator("img")
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute("src")));
  expect(srcs.length).toBeGreaterThan(10);
  for (const src of srcs) {
    expect(src).toMatch(/^\/assets\/work-.+\.webp$/);
    const res = await page.request.get(src!);
    expect(res.ok()).toBe(true);
  }
});
