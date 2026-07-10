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

const scrollToDeckProgress = async (page: Page, progress: number) => {
  await page.evaluate(async (p) => {
    const deck = document.querySelector<HTMLElement>(".case-deck");
    if (!deck) return;
    const top = deck.getBoundingClientRect().top + window.scrollY;
    const y = top + (deck.offsetHeight - window.innerHeight) * p;
    // Repeat across frames so smooth-scroll libs can't drift the position
    for (let i = 0; i < 12; i++) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
  }, progress);
};

test("case files deck reveals both case studies on scroll", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Cases" })).toHaveAttribute(
    "href",
    "#cases"
  );

  await scrollToDeckProgress(page, 0.25);
  await expect(page.getByRole("heading", { name: "SmartMath" })).toBeVisible();
  await scrollToDeckProgress(page, 0.4);
  const architecture = page.locator(".wire-arch");
  await expect(architecture.getByText("backend api", { exact: true })).toBeVisible();
  await expect(architecture.getByText("ai service", { exact: true })).toBeVisible();
  await expect(architecture.getByText("message broker", { exact: true })).toBeVisible();
  await expect(architecture.getByText("ai worker", { exact: true })).toBeVisible();
  await expect(architecture.getByText("ai dependencies", { exact: true })).toBeVisible();
  await expect(architecture.getByText("data services", { exact: true })).toBeVisible();
  await expect(architecture.getByText(/interactive · streaming/i)).toBeVisible();
  await expect(architecture.getByText(/async · durable/i)).toBeVisible();

  await scrollToDeckProgress(page, 0.8);
  await expect(
    page.getByRole("heading", { name: "Village Security Platform" })
  ).toBeVisible();
  await expect(page.getByText("Records bound to the session")).toBeVisible();
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
