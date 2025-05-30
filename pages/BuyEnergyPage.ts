import { Page, Locator, expect } from '@playwright/test';

type EnergyType = 'Gas' | 'Electricity' | 'Oil' | 'Nuclear';

interface EnergyEndpoints {
    buyEnergy: string;
    saleConfirmed: string;
    genericError: string;
}

export class BuyEnergyPage {
  readonly page: Page;
  readonly endpoints: EnergyEndpoints;
  readonly pageTitle: Locator;
  readonly resetDataButton: Locator;
  readonly backToHomepageLink: Locator;
  readonly successMessage: Locator;
  readonly genericErrorPageHeading: Locator;
  readonly genericErrorMessage: Locator;

  readonly gasRow: Locator;
  readonly nuclearRow: Locator;
  readonly electricityRow: Locator;
  readonly oilRow: Locator;
  readonly buyMoreLink: Locator; 

  // Accept 'endpoints' object in the constructor
  constructor(page: Page, endpoints: EnergyEndpoints) {
    this.page = page;
    this.endpoints = endpoints; // Assign the endpoints to the property

    this.pageTitle = page.getByRole('heading', { name: 'Buy Energy' });
    this.resetDataButton = page.getByRole('button', { name: 'Reset' });
    this.backToHomepageLink = page.getByRole('link', { name: 'Back to Homepage' });

    this.successMessage = page.locator('.alert-success').or(page.getByText('Thank you for your purchase', { exact: false }));
    this.genericErrorPageHeading = page.getByRole('heading', { name: 'Error', exact: true });
    this.genericErrorMessage = page.locator('h2').filter({ hasText: 'An error occurred while processing your request' });

    this.gasRow = page.locator('tr', { hasText: 'Gas' });
    this.nuclearRow = page.locator('tr', { hasText: 'Nuclear' });
    this.electricityRow = page.locator('tr', { hasText: 'Electricity' });
    this.oilRow = page.locator('tr', { hasText: 'Oil' });
    this.buyMoreLink = page.getByRole('link', { name: 'Buy more »' });
  }

  // --- Helper Methods (unchanged) ---
  private getEnergyTypeRowLocator(energyType: EnergyType): Locator {
    switch (energyType) {
      case 'Gas': return this.gasRow;
      case 'Electricity': return this.electricityRow;
      case 'Oil': return this.oilRow;
      case 'Nuclear': return this.nuclearRow;
      default: throw new Error(`Invalid energy type: ${energyType}`);
    }
  }

  public getInputLocator(energyType: 'Gas' | 'Electricity' | 'Oil'): Locator {
    const row = this.getEnergyTypeRowLocator(energyType);
    return row.locator('input[name="energyType.AmountPurchased"]');
  }

  public getBuyButtonLocator(energyType: 'Gas' | 'Electricity' | 'Oil'): Locator {
    const row = this.getEnergyTypeRowLocator(energyType);
    return row.getByRole('button', { name: 'Buy' });
  }

  public getEnergyTypeErrorLocator(energyType: 'Gas' | 'Electricity' | 'Oil'): Locator {
    const row = this.getEnergyTypeRowLocator(energyType);
    return row.locator('span.field-validation-error, div.validation-summary-errors');
  }

  // --- Page Action & Assertion Methods ---

  async isBuyEnergyPageDisplayed(): Promise<boolean> {
    // Using the endpoint from the constructor
    await this.page.waitForURL(`**${this.endpoints.buyEnergy}`, { waitUntil: 'networkidle' });
    return await this.pageTitle.isVisible();
  }

  async isNuclearNotAvailable(): Promise<boolean> {
    return await this.nuclearRow.locator('td').filter({ hasText: 'Not Available' }).isVisible();
  }

  async enterUnitsRequired(energyType: 'Gas' | 'Electricity' | 'Oil', value: string): Promise<void> {
    const inputLocator = this.getInputLocator(energyType);
    await inputLocator.waitFor({ state: 'visible' });
    await inputLocator.fill(value);
  }

  async clickBuyButton(energyType: 'Gas' | 'Electricity' | 'Oil'): Promise<void> {
    const buyButton = this.getBuyButtonLocator(energyType);
    await expect(buyButton).toBeVisible();
    await expect(buyButton).toBeEnabled();
    await buyButton.click();
  }

  async clickResetButton(): Promise<void> {
    await this.resetDataButton.click();
    await expect(this.getInputLocator('Gas')).toHaveValue('0', { timeout: 10000 });
  }

  async isSuccessMessageDisplayed(): Promise<boolean> {
    return await this.successMessage.isVisible();
  }

  async getSuccessMessageText(): Promise<string> {
    return await this.successMessage.innerText();
  }

  async isGenericErrorPageDisplayed(): Promise<boolean> {
    await expect(this.genericErrorPageHeading).toBeVisible();
    return await this.genericErrorPageHeading.isVisible();
  }

  async getGenericErrorMessageText(): Promise<string> {
    await expect(this.genericErrorMessage).toBeVisible();
    return await this.genericErrorMessage.innerText();
  }
  async clickBuyMoreLinkAndReturnToBuyPage(): Promise<void> {
    await expect(this.buyMoreLink).toBeVisible();
    await this.buyMoreLink.click();
    
    // Using the endpoint from the constructor
    await this.page.waitForURL(`**${this.endpoints.buyEnergy}`, { waitUntil: 'networkidle' });
  }
}