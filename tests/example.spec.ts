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
    page.getByRole("link", { name: /thanarak\.work@gmail\.com/i })
  ).toHaveAttribute("href", "mailto:thanarak.work@gmail.com");
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
    page.getByRole("link", { name: /thanarak\.work@gmail\.com/i }).first()
  ).toHaveAttribute("href", "mailto:thanarak.work@gmail.com");
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
