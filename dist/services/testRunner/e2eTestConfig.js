"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.E2ETestConfigService = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Service for detecting and configuring E2E test frameworks
 */
class E2ETestConfigService {
    static instance;
    /**
     * Get singleton instance of the service
     */
    static getInstance() {
        if (!E2ETestConfigService.instance) {
            E2ETestConfigService.instance = new E2ETestConfigService();
        }
        return E2ETestConfigService.instance;
    }
    /**
     * Private constructor to enforce singleton
     */
    constructor() { }
    /**
     * Detect the E2E framework in use in the given workspace
     */
    async detectFramework(workspacePath) {
        // Check for Cypress
        if (this.fileExists(workspacePath, 'cypress.json') ||
            this.fileExists(workspacePath, 'cypress.config.js') ||
            this.fileExists(workspacePath, 'cypress.config.ts')) {
            return {
                framework: 'cypress',
                command: 'npx cypress run',
                configPath: this.findConfigPath(workspacePath, ['cypress.json', 'cypress.config.js', 'cypress.config.ts']),
                headless: true
            };
        }
        // Check for Playwright
        if (this.fileExists(workspacePath, 'playwright.config.js') ||
            this.fileExists(workspacePath, 'playwright.config.ts')) {
            return {
                framework: 'playwright',
                command: 'npx playwright test',
                configPath: this.findConfigPath(workspacePath, ['playwright.config.js', 'playwright.config.ts']),
                headless: true
            };
        }
        // Check for Puppeteer (usually used with Jest or Mocha)
        if (this.fileExists(workspacePath, 'jest-puppeteer.config.js') ||
            this.folderContains(workspacePath, 'node_modules/puppeteer')) {
            return {
                framework: 'puppeteer',
                command: 'npm test',
                headless: true
            };
        }
        // Check for TestCafe
        if (this.fileExists(workspacePath, '.testcaferc.json') ||
            this.fileExists(workspacePath, 'testcafe.config.js')) {
            return {
                framework: 'testcafe',
                command: 'npx testcafe chrome',
                configPath: this.findConfigPath(workspacePath, ['.testcaferc.json', 'testcafe.config.js']),
                headless: false
            };
        }
        // Check for Selenium
        if (this.folderContains(workspacePath, 'node_modules/selenium-webdriver') ||
            this.folderContains(workspacePath, 'node_modules/webdriverio')) {
            return {
                framework: 'selenium',
                command: 'npm test',
                headless: false
            };
        }
        // Check package.json for e2e scripts
        const packageJsonPath = path.join(workspacePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.scripts) {
                    if (packageJson.scripts['test:e2e']) {
                        return {
                            framework: 'other',
                            command: 'npm run test:e2e'
                        };
                    }
                    if (packageJson.scripts['e2e']) {
                        return {
                            framework: 'other',
                            command: 'npm run e2e'
                        };
                    }
                }
            }
            catch (error) {
                console.error('Error parsing package.json:', error);
            }
        }
        return undefined;
    }
    /**
     * Configure the E2E tests with user input
     */
    async configureE2E(workspacePath) {
        // Try to detect the framework first
        const detected = await this.detectFramework(workspacePath);
        // If detected, ask if the user wants to use it
        if (detected) {
            const useDetected = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Use detected ${detected.framework} framework?`
            });
            if (useDetected === 'Yes') {
                // Allow customizing the browser for supported frameworks
                if (['cypress', 'playwright', 'testcafe'].includes(detected.framework)) {
                    const browser = await vscode.window.showQuickPick(['chrome', 'firefox', 'edge', 'safari'], {
                        placeHolder: 'Select browser to use for tests'
                    });
                    if (browser) {
                        detected.browser = browser;
                        // Update command based on browser selection
                        if (detected.framework === 'cypress') {
                            detected.command = `npx cypress run --browser ${browser}`;
                        }
                        else if (detected.framework === 'playwright') {
                            detected.command = `npx playwright test --browser ${browser}`;
                        }
                        else if (detected.framework === 'testcafe') {
                            detected.command = `npx testcafe ${browser}`;
                        }
                    }
                }
                // Ask if headless mode should be used
                const headless = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: 'Run tests in headless mode?'
                });
                detected.headless = headless === 'Yes';
                // Update command based on headless preference
                if (detected.framework === 'cypress' && detected.headless) {
                    detected.command += ' --headless';
                }
                else if (detected.framework === 'playwright' && !detected.headless) {
                    detected.command += ' --headed';
                }
                return detected;
            }
        }
        // Manual configuration
        const framework = await vscode.window.showQuickPick([
            { label: 'Cypress', value: 'cypress' },
            { label: 'Playwright', value: 'playwright' },
            { label: 'Puppeteer', value: 'puppeteer' },
            { label: 'Selenium', value: 'selenium' },
            { label: 'TestCafe', value: 'testcafe' },
            { label: 'Other', value: 'other' }
        ], {
            placeHolder: 'Select E2E testing framework'
        });
        if (!framework) {
            return undefined;
        }
        const config = {
            framework: framework.value,
            command: ''
        };
        // Set default command based on framework
        switch (config.framework) {
            case 'cypress':
                config.command = 'npx cypress run';
                break;
            case 'playwright':
                config.command = 'npx playwright test';
                break;
            case 'puppeteer':
                config.command = 'npm test';
                break;
            case 'testcafe':
                config.command = 'npx testcafe chrome';
                break;
            case 'selenium':
                config.command = 'npm test';
                break;
            case 'other':
                config.command = 'npm run test:e2e';
                break;
        }
        // Allow customizing the command
        const customCommand = await vscode.window.showInputBox({
            prompt: 'Enter the test command',
            value: config.command
        });
        if (customCommand) {
            config.command = customCommand;
        }
        return config;
    }
    fileExists(workspacePath, relativePath) {
        return fs.existsSync(path.join(workspacePath, relativePath));
    }
    folderContains(workspacePath, folderPath) {
        return fs.existsSync(path.join(workspacePath, folderPath));
    }
    findConfigPath(workspacePath, possiblePaths) {
        for (const relativePath of possiblePaths) {
            const fullPath = path.join(workspacePath, relativePath);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }
        return undefined;
    }
}
exports.E2ETestConfigService = E2ETestConfigService;
//# sourceMappingURL=e2eTestConfig.js.map