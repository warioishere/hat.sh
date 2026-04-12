const { test, expect } = require("@playwright/test");

test.describe("Navigation & UI", () => {
  test("should navigate to about page", async ({ page }) => {
    await page.goto("/about/");
    await page.waitForTimeout(3000);

    await expect(page.locator("text=Documentation").first()).toBeVisible();
  });

  test("should navigate to generate keys page", async ({ page }) => {
    await page.goto("/generate-keys/");
    await page.waitForTimeout(1000);

    await expect(page.locator("text=Hat.sh")).toBeVisible();
    await expect(page.locator("text=Key Pair Generation")).toBeVisible();
  });

  test("should generate key pair", async ({ page }) => {
    await page.goto("/generate-keys/");
    await page.waitForTimeout(1000);

    // Click generate button
    await page.locator(".keyPairGenerateBtn").click();
    await page.waitForTimeout(1000);

    // Keys should be generated
    const publicKey = page.locator("#generatedPublicKey");
    const privateKey = page.locator("#generatedPrivateKey");

    await expect(publicKey).not.toHaveValue("");
    await expect(privateKey).not.toHaveValue("");
  });

  test("should switch between encryption and decryption tabs", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Should start on encryption tab
    await expect(page.locator("text=Choose files to encrypt")).toBeVisible();

    // Switch to decryption
    await page.getByRole("tab", { name: /Decryption/i }).click();
    await expect(page.locator("text=Choose files to decrypt")).toBeVisible();

    // Switch back
    await page.getByRole("tab", { name: /Encryption/i }).click();
    await expect(page.locator("text=Choose files to encrypt")).toBeVisible();
  });

  test("should open settings dialog", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Click settings icon
    await page.locator('[aria-label="settings"]').or(page.locator('button:has(svg[data-testid="SettingsIcon"])')).first().click();

    // Settings dialog should appear
    await expect(page.locator("text=Settings").first()).toBeVisible();
    await expect(page.locator("text=Dark Mode").or(page.locator("text=Dunkler Modus"))).toBeVisible();
  });

  test("should toggle dark mode", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Open settings
    await page.locator('button:has(svg[data-testid="SettingsIcon"])').first().click();
    await page.waitForTimeout(500);

    // Toggle dark mode
    const toggle = page.locator('input[type="checkbox"]').first();
    await toggle.click();
    await page.waitForTimeout(500);

    // HTML should have darkStyle class
    const hasDarkStyle = await page.locator("html").evaluate((el) =>
      el.classList.contains("darkStyle")
    );
    expect(hasDarkStyle).toBe(true);

    // Toggle back
    await toggle.click();
    await page.waitForTimeout(500);

    const hasLight = await page.locator("html").evaluate((el) =>
      !el.classList.contains("darkStyle")
    );
    expect(hasLight).toBe(true);
  });

  test("should show 404 page", async ({ page }) => {
    await page.goto("/nonexistent-page/");
    await expect(page.locator("text=404")).toBeVisible();
  });

  test("should show version badge", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    await expect(page.locator("text=v3.0.2")).toBeVisible();
  });
});
