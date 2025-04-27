"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.E2ETestConfigService = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
/**
 * Service for detecting and configuring E2E test frameworks
 */
var E2ETestConfigService = /** @class */ (function () {
    function E2ETestConfigService() {
    }
    /**
     * Detect the E2E framework in use in the given workspace
     */
    E2ETestConfigService.prototype.detectFramework = function (workspacePath) {
        return __awaiter(this, void 0, void 0, function () {
            var packageJsonPath, packageJson;
            return __generator(this, function (_a) {
                // Check for Cypress
                if (this.fileExists(workspacePath, 'cypress.json') ||
                    this.fileExists(workspacePath, 'cypress.config.js') ||
                    this.fileExists(workspacePath, 'cypress.config.ts')) {
                    return [2 /*return*/, {
                            framework: 'cypress',
                            command: 'npx cypress run',
                            configPath: this.findConfigPath(workspacePath, ['cypress.json', 'cypress.config.js', 'cypress.config.ts']),
                            headless: true
                        }];
                }
                // Check for Playwright
                if (this.fileExists(workspacePath, 'playwright.config.js') ||
                    this.fileExists(workspacePath, 'playwright.config.ts')) {
                    return [2 /*return*/, {
                            framework: 'playwright',
                            command: 'npx playwright test',
                            configPath: this.findConfigPath(workspacePath, ['playwright.config.js', 'playwright.config.ts']),
                            headless: true
                        }];
                }
                // Check for Puppeteer (usually used with Jest or Mocha)
                if (this.fileExists(workspacePath, 'jest-puppeteer.config.js') ||
                    this.folderContains(workspacePath, 'node_modules/puppeteer')) {
                    return [2 /*return*/, {
                            framework: 'puppeteer',
                            command: 'npm test',
                            headless: true
                        }];
                }
                // Check for TestCafe
                if (this.fileExists(workspacePath, '.testcaferc.json') ||
                    this.fileExists(workspacePath, 'testcafe.config.js')) {
                    return [2 /*return*/, {
                            framework: 'testcafe',
                            command: 'npx testcafe chrome',
                            configPath: this.findConfigPath(workspacePath, ['.testcaferc.json', 'testcafe.config.js']),
                            headless: false
                        }];
                }
                // Check for Selenium
                if (this.folderContains(workspacePath, 'node_modules/selenium-webdriver') ||
                    this.folderContains(workspacePath, 'node_modules/webdriverio')) {
                    return [2 /*return*/, {
                            framework: 'selenium',
                            command: 'npm test',
                            headless: false
                        }];
                }
                packageJsonPath = path.join(workspacePath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    try {
                        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                        if (packageJson.scripts) {
                            if (packageJson.scripts['test:e2e']) {
                                return [2 /*return*/, {
                                        framework: 'other',
                                        command: 'npm run test:e2e'
                                    }];
                            }
                            if (packageJson.scripts['e2e']) {
                                return [2 /*return*/, {
                                        framework: 'other',
                                        command: 'npm run e2e'
                                    }];
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error parsing package.json:', error);
                    }
                }
                return [2 /*return*/, undefined];
            });
        });
    };
    /**
     * Configure the E2E tests with user input
     */
    E2ETestConfigService.prototype.configureE2E = function (workspacePath) {
        return __awaiter(this, void 0, void 0, function () {
            var detected, useDetected, browser, headless, framework, config, customCommand;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.detectFramework(workspacePath)];
                    case 1:
                        detected = _a.sent();
                        if (!detected) return [3 /*break*/, 6];
                        return [4 /*yield*/, vscode.window.showQuickPick(['Yes', 'No'], {
                                placeHolder: "Use detected ".concat(detected.framework, " framework?")
                            })];
                    case 2:
                        useDetected = _a.sent();
                        if (!(useDetected === 'Yes')) return [3 /*break*/, 6];
                        if (!['cypress', 'playwright', 'testcafe'].includes(detected.framework)) return [3 /*break*/, 4];
                        return [4 /*yield*/, vscode.window.showQuickPick(['chrome', 'firefox', 'edge', 'safari'], {
                                placeHolder: 'Select browser to use for tests'
                            })];
                    case 3:
                        browser = _a.sent();
                        if (browser) {
                            detected.browser = browser;
                            // Update command based on browser selection
                            if (detected.framework === 'cypress') {
                                detected.command = "npx cypress run --browser ".concat(browser);
                            }
                            else if (detected.framework === 'playwright') {
                                detected.command = "npx playwright test --browser ".concat(browser);
                            }
                            else if (detected.framework === 'testcafe') {
                                detected.command = "npx testcafe ".concat(browser);
                            }
                        }
                        _a.label = 4;
                    case 4: return [4 /*yield*/, vscode.window.showQuickPick(['Yes', 'No'], {
                            placeHolder: 'Run tests in headless mode?'
                        })];
                    case 5:
                        headless = _a.sent();
                        detected.headless = headless === 'Yes';
                        // Update command based on headless preference
                        if (detected.framework === 'cypress' && detected.headless) {
                            detected.command += ' --headless';
                        }
                        else if (detected.framework === 'playwright' && !detected.headless) {
                            detected.command += ' --headed';
                        }
                        return [2 /*return*/, detected];
                    case 6: return [4 /*yield*/, vscode.window.showQuickPick([
                            { label: 'Cypress', value: 'cypress' },
                            { label: 'Playwright', value: 'playwright' },
                            { label: 'Puppeteer', value: 'puppeteer' },
                            { label: 'Selenium', value: 'selenium' },
                            { label: 'TestCafe', value: 'testcafe' },
                            { label: 'Other', value: 'other' }
                        ], {
                            placeHolder: 'Select E2E testing framework'
                        })];
                    case 7:
                        framework = _a.sent();
                        if (!framework) {
                            return [2 /*return*/, undefined];
                        }
                        config = {
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
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: 'Enter the test command',
                                value: config.command
                            })];
                    case 8:
                        customCommand = _a.sent();
                        if (customCommand) {
                            config.command = customCommand;
                        }
                        return [2 /*return*/, config];
                }
            });
        });
    };
    E2ETestConfigService.prototype.fileExists = function (workspacePath, relativePath) {
        return fs.existsSync(path.join(workspacePath, relativePath));
    };
    E2ETestConfigService.prototype.folderContains = function (workspacePath, folderPath) {
        return fs.existsSync(path.join(workspacePath, folderPath));
    };
    E2ETestConfigService.prototype.findConfigPath = function (workspacePath, possiblePaths) {
        for (var _i = 0, possiblePaths_1 = possiblePaths; _i < possiblePaths_1.length; _i++) {
            var relativePath = possiblePaths_1[_i];
            var fullPath = path.join(workspacePath, relativePath);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }
        return undefined;
    };
    return E2ETestConfigService;
}());
exports.E2ETestConfigService = E2ETestConfigService;
