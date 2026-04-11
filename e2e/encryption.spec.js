const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const TEST_FILE = path.join(__dirname, "testfile.txt");
const TEST_PASSWORD = "TestPassword123!secure";

test.beforeAll(() => {
  fs.writeFileSync(TEST_FILE, "Hat.sh E2E test content - this file will be encrypted and decrypted.");
});

test.afterAll(() => {
  if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
});

test.describe("Encryption", () => {
  test("should load the main page", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    await expect(page.locator("h5:has-text('Hat.sh')")).toBeVisible();
    await expect(page.getByRole("tab", { name: /Encryption/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Decryption/i })).toBeVisible();
  });

  test("should select a file for encryption", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Upload file
    const fileInput = page.locator('input[type="file"]#enc-file');
    await fileInput.setInputFiles(TEST_FILE);

    // File should appear in the list
    await expect(page.locator("text=testfile.txt")).toBeVisible();

    // Next button should be enabled
    const nextBtn = page.locator("button.nextBtnHs").first();
    await expect(nextBtn).toBeEnabled();
  });

  test("should enter password and proceed to download step", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Step 1: Upload file
    const fileInput = page.locator('input[type="file"]#enc-file');
    await fileInput.setInputFiles(TEST_FILE);
    await page.locator("button.nextBtnHs").first().click();

    // Step 2: Enter password
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(TEST_PASSWORD);

    // Password strength indicator should appear
    await expect(page.locator("text=Password strength")).toBeVisible();

    // Next button should be enabled
    const nextBtn = page.locator("button.nextBtnHs").first();
    await expect(nextBtn).toBeEnabled();
  });

  test("should generate a random password", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Step 1: Upload file
    const fileInput = page.locator('input[type="file"]#enc-file');
    await fileInput.setInputFiles(TEST_FILE);
    await page.locator("button.nextBtnHs").first().click();

    // Click generate password button
    await page.locator(".generatePasswordBtn").click();
    await page.waitForTimeout(500);

    // Password field should be filled
    const passwordInput = page.locator('input[type="password"]').first();
    const value = await passwordInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test("should reject short passwords", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Step 1: Upload file
    const fileInput = page.locator('input[type="file"]#enc-file');
    await fileInput.setInputFiles(TEST_FILE);
    await page.locator("button.nextBtnHs").first().click();

    // Step 2: Enter short password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill("short");

    // Click next - use the second nextBtnHs (the one in step 2)
    const nextButtons = page.locator("button.nextBtnHs");
    await nextButtons.nth(1).click();
    await page.waitForTimeout(500);

    // Should show short password error alert
    await expect(page.locator(".MuiAlert-standardError")).toBeVisible();
  });

  test("should switch to public key mode", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Step 1: Upload file
    const fileInput = page.locator('input[type="file"]#enc-file');
    await fileInput.setInputFiles(TEST_FILE);
    await page.locator("button.nextBtnHs").first().click();

    // Switch to public key mode
    await page.locator(".publicKeyInput").click();

    // Public key input field should appear
    await expect(page.locator("#public-key-input")).toBeVisible();
  });
});
