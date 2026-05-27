import { expect, test } from "@playwright/test";

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
    page.getByRole("heading", { name: /Bring me in before the real attack\./i })
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
    page.getByText(/connected apps and experimental tools operated by Thanarak/i)
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /thanarak\.work@gmail\.com/i }).first()
  ).toHaveAttribute("href", "mailto:thanarak.work@gmail.com");
});
