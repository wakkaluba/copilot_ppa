import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Supported E2E testing frameworks
 */
export type E2EFramework = 'cypress' | 'playwright' | 'puppeteer' | 'selenium' | 'testcafe' | 'other';

/**
 * Configuration for E2E tests
 */
export interface E2ETestConfig {
    framework: E2EFramework;
    command: string;
    configPath?: string;
    browser?: string;
    headless?: boolean;
}

/**
 * Service for detecting and configuring E2E test frameworks
 */
export class E2ETestConfigService {
    private static instance: E2ETestConfigService;

    /**
     * Get singleton instance of the service
     */
    public static getInstance(): E2ETestConfigService {
        if (!E2ETestConfigService.instance) {
            E2ETestConfigService.instance = new E2ETestConfigService();
        }
        return E2ETestConfigService.instance;
    }

    /**
     * Private constructor to enforce singleton
     */
    private constructor() {}

    /**
     * Detect the E2E framework in use in the given workspace
     */
    public async detectFramework(workspacePath: string): Promise<E2ETestConfig | undefined> {
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
            } catch (error) {
                console.error('Error parsing package.json:', error);
            }
        }
        
        return undefined;
    }
    
    /**
     * Configure the E2E tests with user input
     */
    public async configureE2E(workspacePath: string): Promise<E2ETestConfig | undefined> {
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
                        } else if (detected.framework === 'playwright') {
                            detected.command = `npx playwright test --browser ${browser}`;
                        } else if (detected.framework === 'testcafe') {
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
                } else if (detected.framework === 'playwright' && !detected.headless) {
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
        
        const config: E2ETestConfig = {
            framework: framework.value as E2EFramework,
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
    
    private fileExists(workspacePath: string, relativePath: string): boolean {
        return fs.existsSync(path.join(workspacePath, relativePath));
    }
    
    private folderContains(workspacePath: string, folderPath: string): boolean {
        return fs.existsSync(path.join(workspacePath, folderPath));
    }
    
    private findConfigPath(workspacePath: string, possiblePaths: string[]): string | undefined {
        for (const relativePath of possiblePaths) {
            const fullPath = path.join(workspacePath, relativePath);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }
        return undefined;
    }
}
