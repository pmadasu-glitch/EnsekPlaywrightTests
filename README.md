# Ensek Playwright Test Automation Suite

This repository contains an automated test suite for the Ensek application, built using Playwright. It includes both API tests and UI tests (assuming `buyEnergy.spec.ts` covers UI interactions) to ensure the functionality and reliability of the application.

## Table of Contents

-   [Project Structure](#project-structure)
-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [How to Execute Tests](#how-to-execute-tests)
    -   [Running All Tests](#running-all-tests)
    -   [Running Specific Test Files](#running-specific-test-files)
    -   [Running Tests with Specific Browsers](#running-tests-with-specific-browsers)
    -   [Running Tests in UI Mode (for debugging)](#running-tests-in-ui-mode-for-debugging)
    -   [Generating HTML Reports](#generating-html-reports)
-   [CI/CD](#cicd)

## Project Structure

The project is organized to maintain readability, scalability, and ease of maintenance.

ENSEKPLAYWRIGHTTESTS/
├── .github/
│   └── workflows/
│       └── playwright.yml             # GitHub Actions workflow for CI/CD
├── node_modules/                      # Node.js dependencies (installed via npm)
├── pages/
│   └── BuyEnergyPage.ts               # Page Object Model for UI interactions (e.g., buying energy)
├── playwright-report/                 # Directory where Playwright HTML reports are generated
│   └── index.html                     # Main HTML report file
├── test_data/
│   └── energy_purchase_data.json      # JSON file containing test data for energy purchases
├── test-results/                      # Raw test results (e.g., JSON, traces, screenshots)
├── tests/
│   ├── api.spec.ts                    # Test suite for Ensek API endpoints
│   └── buyEnergy.spec.ts              # Test suite for UI functionality (e.g., buying energy via UI)
├── .gitignore                         # Specifies intentionally untracked files to ignore by Git
├── package-lock.json                  # Records the exact versions of dependencies
├── package.json                       # Project metadata and script definitions
├── playwright.config.ts               # Playwright test runner configuration file
├── README.md                          # This README file
└── tsconfig.json                      # TypeScript configuration for the project


## Prerequisites

Before you can run the tests, ensure you have the following installed on your system:

* **Node.js**: Version 18 or higher (LTS recommended). You can download it from [nodejs.org](https://nodejs.org/).
* **npm** (Node Package Manager): Comes bundled with Node.js.

## Installation

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/pmadasu-glitch/EnsekPlaywrightTests.git](https://github.com/pmadasu-glitch/EnsekPlaywrightTests.git)
    cd EnsekPlaywrightTests
    ```
 
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Install Playwright browsers:**
    ```bash
    npx playwright install --with-deps
    ```
    This command will install the necessary browser binaries (Chromium, Firefox, WebKit) and their system dependencies.

## How to Execute Tests

Playwright tests can be executed using the `npx playwright test` command, with various options for targeting specific tests or browsers.

### Running All Tests

To run all API and UI tests defined in the `tests/` directory:

```bash
npx playwright test
Running Specific Test Files
To run only the API tests:

Bash

npx playwright test tests/api.spec.ts
To run only the UI tests (e.g., buyEnergy.spec.ts):

Bash

npx playwright test tests/buyEnergy.spec.ts
Running Tests with Specific Browsers
You can specify which browsers to run the tests on (configured in playwright.config.ts). By default, Playwright usually runs on all configured browsers. To run on a specific one:

Bash

npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
Running Tests in UI Mode (for debugging)
Playwright's UI mode provides a powerful graphical interface to run, debug, and inspect tests.

Bash

npx playwright test --ui
This will open a UI where you can select tests, see their execution, inspect locators, and view traces.

Generating HTML Reports
After test execution, Playwright automatically generates an HTML report (unless configured otherwise). To view it:

Bash

npx playwright show-report
This will open the playwright-report/index.html in your default browser.

CI/CD
This project is configured with GitHub Actions to automatically run tests on every push and pull request to the main branch. The workflow is defined in .github/workflows/playwright.yml.

The CI pipeline will:

Check out the repository.
Set up Node.js.
Install project dependencies and Playwright browsers.
Execute all Playwright tests.
Upload test results and the HTML report as artifacts, which can be downloaded from the GitHub Actions run summary.