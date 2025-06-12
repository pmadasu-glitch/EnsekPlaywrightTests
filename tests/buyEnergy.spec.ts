import { test, expect } from '@playwright/test';
import { BuyEnergyPage } from '../pages/BuyEnergyPage';
import * as testData from '../test_data/energy_purchase_data.json';

test.describe('Buy Energy Functionality', () => {
  let buyEnergyPage: BuyEnergyPage;
  const { baseURL, endpoints } = testData.config;

  // --- REUSABLE HELPER METHOD FOR PURCHASE CONFIRMATIONS ---
  async function performPurchaseAndVerifySaleConfirmed(
    energyType: 'Gas' | 'Electricity' | 'Oil',
    amount: string,
    expectedMainMessagePart: string,
    expectedRemainingUnitsText: string
  ) {
    await buyEnergyPage.enterUnitsRequired(energyType as any, amount);
    await buyEnergyPage.clickBuyButton(energyType as any);

    // Wait for the Sale Confirmed URL
    const saleConfirmedRegex = new RegExp(endpoints.saleConfirmed.replace(/\//g, '\\/'));
    await buyEnergyPage.page.waitForURL(saleConfirmedRegex, { waitUntil: 'domcontentloaded' });
    await expect(buyEnergyPage.page).toHaveURL(saleConfirmedRegex);

    // Verify the success message visibility and main text part
    await expect(buyEnergyPage.successMessage).toBeVisible();
    await expect(buyEnergyPage.successMessage).toContainText(expectedMainMessagePart);

    await expect(buyEnergyPage.successMessage).toContainText(expectedRemainingUnitsText);
    await expect(buyEnergyPage.page.getByRole('heading', { name: 'Sale Confirmed!' })).toBeVisible();
  }

  test.beforeEach(async ({ page }) => {
    buyEnergyPage = new BuyEnergyPage(page, endpoints);
    await page.goto(`${baseURL}${endpoints.buyEnergy}`);

    const isPageDisplayed = await buyEnergyPage.isBuyEnergyPageDisplayed();
    expect(isPageDisplayed).toBe(true);

    // ALWAYS CLICK RESET BUTTON TO ENSURE CONSISTENT STARTING STATE FOR ALL TESTS
    console.log('Resetting data before each test to ensure consistent energy levels.');
    await buyEnergyPage.clickResetButton();

    // This conditional logic was for Nuclear availability, keep it if it's still relevant after reset
    // Although typically 'Reset' should make all types available if that's its function.
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    if (currentHour >= 20) {
      console.log('It is currently 8 PM or later. Nuclear energy should now be available.');
    }
  });

  test('should reset data when "Reset" button is clicked', async () => {
    await buyEnergyPage.enterUnitsRequired('Gas', '100');
    await buyEnergyPage.enterUnitsRequired('Electricity', '50');
    await buyEnergyPage.enterUnitsRequired('Oil', '10');

    await buyEnergyPage.clickResetButton();

    // These assertions verify that all fields are reset to '0'
    await expect(buyEnergyPage.getInputLocator('Gas')).toHaveValue('0');
    await expect(buyEnergyPage.getInputLocator('Electricity')).toHaveValue('0');
    await expect(buyEnergyPage.getInputLocator('Oil')).toHaveValue('0');
  });

  test.describe('Successful Energy Purchase', () => {

    test('should allow purchasing Gas energy (100 units), verify success, and return to Buy page', async () => {
      const { energyType, amount } = testData.successfulPurchases[0];
      const initialAmount = testData.initialAvailableAmounts[energyType as keyof typeof testData.initialAvailableAmounts];
      const purchasedAmountNum = parseInt(amount);

      // Now, expectedRemainingDisplayed should always be initial - purchased,
      // as the app seems to correctly deduct and display this for positive purchases after reset.
      const expectedRemainingDisplayed = initialAmount - purchasedAmountNum;

      await performPurchaseAndVerifySaleConfirmed(
        energyType as any,
        amount,
        'Thank you for your purchase',
        `There are now ${expectedRemainingDisplayed} units of ${energyType} left in our stores.`
      );

      await buyEnergyPage.clickBuyMoreLinkAndReturnToBuyPage();
      const isBuyPageVisibleAfterReturn = await buyEnergyPage.isBuyEnergyPageDisplayed();
      expect(isBuyPageVisibleAfterReturn).toBe(true);
      await expect(buyEnergyPage.getInputLocator(energyType as any)).toBeVisible();
    });

    test('should allow purchasing Electricity energy (500 units), verify success, and return to Buy page', async () => {
      const { energyType, amount } = testData.successfulPurchases[1];
      const initialAmount = testData.initialAvailableAmounts[energyType as keyof typeof testData.initialAvailableAmounts];
      const purchasedAmountNum = parseInt(amount);

      const expectedRemainingDisplayed = initialAmount - purchasedAmountNum;
      await performPurchaseAndVerifySaleConfirmed(
        energyType as any,
        amount,
        'Thank you for your purchase',
        `There are now ${expectedRemainingDisplayed} units of ${energyType} left in our stores.`
      );

      await buyEnergyPage.clickBuyMoreLinkAndReturnToBuyPage();
      const isBuyPageVisibleAfterReturn = await buyEnergyPage.isBuyEnergyPageDisplayed();
      expect(isBuyPageVisibleAfterReturn).toBe(true);
      await expect(buyEnergyPage.getInputLocator(energyType as any)).toBeVisible();
    });

    test('should allow purchasing Oil energy (5 units), verify success, and return to Buy page', async () => {
      const { energyType, amount } = testData.successfulPurchases[2];
      const initialAmount = testData.initialAvailableAmounts[energyType as keyof typeof testData.initialAvailableAmounts];
      const expectedRemainingDisplayed = initialAmount;
      await performPurchaseAndVerifySaleConfirmed(
        energyType as any,
        amount,
        'Thank you for your purchase',
        `There are now ${expectedRemainingDisplayed} units of ${energyType} left in our stores.`
      );

      await buyEnergyPage.clickBuyMoreLinkAndReturnToBuyPage();
      const isBuyPageVisibleAfterReturn = await buyEnergyPage.isBuyEnergyPageDisplayed();
      expect(isBuyPageVisibleAfterReturn).toBe(true);
      await expect(buyEnergyPage.getInputLocator(energyType as any)).toBeVisible();
    });
  });

  test.describe('Energy Purchase - Invalid Quantities (Bug Confirmation)', () => {

    test('BUG: should show incorrect success message with negative units for buying more Gas than available', async () => {
      const energyType = 'Gas';
      const purchaseAmount = 30010;
      const initialGasAvailable = testData.initialAvailableAmounts.Gas;

      // The app DOES calculate remaining correctly (initial - purchased) for this bug
      const expectedRemainingDisplayed = initialGasAvailable - purchaseAmount;

      await performPurchaseAndVerifySaleConfirmed(
        energyType,
        purchaseAmount.toString(),
        `Thank you for your purchase of ${purchaseAmount} units of Gas`,
        `There are now ${expectedRemainingDisplayed} units of ${energyType} left in our stores.`
      );
    });

    test('should redirect to error page for Gas with invalid input "abc"', async () => {
      const { type, value, expectedMessagePart } = testData.invalidInputs[0];

      await buyEnergyPage.enterUnitsRequired(type as any, value);
      await buyEnergyPage.clickBuyButton(type as any);

      await expect(buyEnergyPage.genericErrorPageHeading).toBeVisible();
      await expect(buyEnergyPage.genericErrorMessage).toBeVisible();
      await expect(buyEnergyPage.genericErrorMessage).toContainText(expectedMessagePart);
    });

    test('BUG: should confirm purchase of 0 units for Gas, verifying message and remaining units', async () => {
      const { type, value, expectedMessagePart } = testData.invalidInputs[1];
      const initialAmount = testData.initialAvailableAmounts[type as keyof typeof testData.initialAvailableAmounts];

      // The app DOES calculate remaining correctly (initial - purchased) for this bug
      const purchasedAmountNum = parseInt(value);
      const expectedRemainingDisplayed = initialAmount - purchasedAmountNum;

      await performPurchaseAndVerifySaleConfirmed(
        type as any,
        value,
        expectedMessagePart,
        `There are now ${expectedRemainingDisplayed} units of ${type} left in our stores.`
      );
    });

    test('BUG: should confirm purchase of negative units for Electricity, verifying message and remaining units', async () => {
      const { type, value, expectedMessagePart } = testData.invalidInputs[2];
      const initialAmount = testData.initialAvailableAmounts[type as keyof typeof testData.initialAvailableAmounts];
      const purchasedAmountNum = parseInt(value);
      const expectedRemainingDisplayed = initialAmount - purchasedAmountNum;

      await performPurchaseAndVerifySaleConfirmed(
        type as any,
        value,
        expectedMessagePart,
        `There are now ${expectedRemainingDisplayed} units of ${type} left in our stores.`
      );
    });
  });
});