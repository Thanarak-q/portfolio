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
    page.getByRole("heading", { name: /Some attacks/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /hello@thanarak\.dev/i })
  ).toHaveAttribute("href", "mailto:hello@thanarak.dev");
});
