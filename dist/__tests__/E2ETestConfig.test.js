"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('E2ETestConfig Interface', () => {
    // Test for basic configurations
    describe('Basic Configuration', () => {
        it('should create a valid E2E test config with required fields', () => {
            const config = {
                framework: 'cypress',
                command: 'npx cypress run'
            };
            expect(config.framework).toBe('cypress');
            expect(config.command).toBe('npx cypress run');
            expect(config.configPath).toBeUndefined();
            expect(config.browser).toBeUndefined();
            expect(config.headless).toBeUndefined();
        });
        it('should create a config with all available properties', () => {
            const config = {
                framework: 'playwright',
                command: 'npx playwright test',
                configPath: './playwright.config.js',
                browser: 'chrome',
                headless: true
            };
            expect(config.framework).toBe('playwright');
            expect(config.command).toBe('npx playwright test');
            expect(config.configPath).toBe('./playwright.config.js');
            expect(config.browser).toBe('chrome');
            expect(config.headless).toBe(true);
        });
    });
    // Test for supported frameworks
    describe('Framework Types', () => {
        it('should accept all supported E2E frameworks', () => {
            // Define all supported frameworks
            const frameworks = [
                'cypress',
                'playwright',
                'puppeteer',
                'selenium',
                'testcafe',
                'other'
            ];
            // Test each framework
            frameworks.forEach(framework => {
                const config = {
                    framework,
                    command: `run ${framework}`
                };
                expect(config.framework).toBe(framework);
            });
        });
    });
    // Test for common browser configurations
    describe('Browser Configuration', () => {
        it('should support different browsers', () => {
            const browsers = ['chrome', 'firefox', 'edge', 'safari'];
            browsers.forEach(browser => {
                const config = {
                    framework: 'cypress',
                    command: `npx cypress run --browser ${browser}`,
                    browser: browser
                };
                expect(config.browser).toBe(browser);
            });
        });
        it('should handle headless mode configuration', () => {
            // Headless true
            const headlessConfig = {
                framework: 'playwright',
                command: 'npx playwright test',
                headless: true
            };
            expect(headlessConfig.headless).toBe(true);
            // Headless false
            const headedConfig = {
                framework: 'playwright',
                command: 'npx playwright test --headed',
                headless: false
            };
            expect(headedConfig.headless).toBe(false);
        });
    });
    // Test for framework-specific configurations
    describe('Framework-Specific Configurations', () => {
        it('should work with Cypress configuration', () => {
            const config = {
                framework: 'cypress',
                command: 'npx cypress run --browser chrome --headless',
                configPath: 'cypress.json',
                browser: 'chrome',
                headless: true
            };
            expect(config.framework).toBe('cypress');
            expect(config.command).toContain('cypress');
            expect(config.command).toContain('--browser chrome');
            expect(config.command).toContain('--headless');
            expect(config.configPath).toBe('cypress.json');
        });
        it('should work with Playwright configuration', () => {
            const config = {
                framework: 'playwright',
                command: 'npx playwright test --browser=firefox',
                configPath: 'playwright.config.js',
                browser: 'firefox',
                headless: true
            };
            expect(config.framework).toBe('playwright');
            expect(config.command).toContain('playwright');
            expect(config.command).toContain('--browser=firefox');
            expect(config.configPath).toBe('playwright.config.js');
        });
        it('should work with custom framework configuration', () => {
            const config = {
                framework: 'other',
                command: './run-custom-tests.sh',
                configPath: './custom-config.json'
            };
            expect(config.framework).toBe('other');
            expect(config.command).toBe('./run-custom-tests.sh');
            expect(config.configPath).toBe('./custom-config.json');
        });
    });
});
//# sourceMappingURL=E2ETestConfig.test.js.map