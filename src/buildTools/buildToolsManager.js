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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildToolsManager = void 0;
var vscode = require("vscode");
var path = require("path");
var fs = require("fs");
var webpackConfigManager_1 = require("./webpack/webpackConfigManager");
var rollupConfigManager_1 = require("./rollup/rollupConfigManager");
var viteConfigManager_1 = require("./vite/viteConfigManager");
var buildScriptOptimizer_1 = require("./buildScriptOptimizer");
var bundleAnalyzer_1 = require("./bundleAnalyzer");
var BuildToolsManager = /** @class */ (function () {
    function BuildToolsManager(context, logger) {
        this.context = context;
        this.logger = logger;
        this.webpackManager = new webpackConfigManager_1.WebpackConfigManager(logger);
        this.rollupManager = new rollupConfigManager_1.RollupConfigManager(logger);
        this.viteManager = new viteConfigManager_1.ViteConfigManager();
        this.buildScriptOptimizer = new buildScriptOptimizer_1.BuildScriptOptimizer();
        this.bundleAnalyzer = new bundleAnalyzer_1.BundleAnalyzer();
        this.registerCommands();
    }
    BuildToolsManager.prototype.registerCommands = function () {
        // Register webpack commands
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLM.buildTools.detectWebpackConfig', this.detectWebpackConfig.bind(this)), vscode.commands.registerCommand('localLLM.buildTools.optimizeWebpackConfig', this.optimizeWebpackConfig.bind(this)), 
        // Rollup commands
        vscode.commands.registerCommand('localLLM.buildTools.detectRollupConfig', this.detectRollupConfig.bind(this)), vscode.commands.registerCommand('localLLM.buildTools.optimizeRollupConfig', this.optimizeRollupConfig.bind(this)), 
        // Vite commands
        vscode.commands.registerCommand('localLLM.buildTools.detectViteConfig', this.detectViteConfig.bind(this)), vscode.commands.registerCommand('localLLM.buildTools.optimizeViteConfig', this.optimizeViteConfig.bind(this)), 
        // Build script commands
        vscode.commands.registerCommand('localLLM.buildTools.optimizeBuildScripts', this.optimizeBuildScripts.bind(this)), 
        // Bundle analyzer commands
        vscode.commands.registerCommand('localLLM.buildTools.analyzeBundleSize', this.analyzeBundleSize.bind(this)));
    };
    // Webpack methods
    BuildToolsManager.prototype.detectWebpackConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspacePath, configs, selected, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        workspacePath = this.getFirstWorkspaceFolder();
                        return [4 /*yield*/, this.webpackManager.detectConfigs(workspacePath)];
                    case 1:
                        configs = _a.sent();
                        if (configs.length === 0) {
                            vscode.window.showInformationMessage('No webpack configuration files found in the workspace.');
                            return [2 /*return*/];
                        }
                        vscode.window.showInformationMessage("Found ".concat(configs.length, " webpack configuration files."));
                        return [4 /*yield*/, vscode.window.showQuickPick(configs.map(function (c) { return ({ label: path.basename(c), description: c }); }), { placeHolder: 'Select a webpack configuration file to analyze' })];
                    case 2:
                        selected = _a.sent();
                        if (!selected) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.analyzeWebpackConfig(selected.description)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Error: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    BuildToolsManager.prototype.analyzeWebpackConfig = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, panel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.webpackManager.analyzeConfig(configPath)];
                    case 1:
                        analysis = _a.sent();
                        panel = vscode.window.createWebviewPanel('webpackAnalysis', "Webpack Analysis: ".concat(path.basename(configPath)), vscode.ViewColumn.One, { enableScripts: true });
                        panel.webview.html = this.getWebpackAnalysisHtml(analysis, configPath);
                        return [2 /*return*/];
                }
            });
        });
    };
    BuildToolsManager.prototype.getWebpackAnalysisHtml = function (analysis, configPath) {
        return "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Webpack Configuration Analysis</title>\n                <style>\n                    body { font-family: Arial, sans-serif; padding: 20px; }\n                    h1 { color: #333; }\n                    .section { margin-bottom: 20px; }\n                    .section h2 { color: #0078d7; }\n                    .entry { margin-bottom: 10px; }\n                    .entry-title { font-weight: bold; }\n                    .performance-issue { color: #d83b01; }\n                    .optimization-suggestion { color: #107c10; }\n                </style>\n            </head>\n            <body>\n                <h1>Webpack Configuration Analysis</h1>\n                <p>Configuration: ".concat(configPath, "</p>\n                \n                <div class=\"section\">\n                    <h2>Entry Points</h2>\n                    ").concat(this.renderEntryPoints(analysis.entryPoints), "\n                </div>\n                \n                <div class=\"section\">\n                    <h2>Output Configuration</h2>\n                    ").concat(this.renderOutputConfig(analysis.output), "\n                </div>\n                \n                <div class=\"section\">\n                    <h2>Loaders</h2>\n                    ").concat(this.renderLoaders(analysis.loaders), "\n                </div>\n                \n                <div class=\"section\">\n                    <h2>Plugins</h2>\n                    ").concat(this.renderPlugins(analysis.plugins), "\n                </div>\n                \n                <div class=\"section\">\n                    <h2>Optimization Suggestions</h2>\n                    ").concat(this.renderOptimizationSuggestions(analysis.optimizationSuggestions), "\n                </div>\n            </body>\n            </html>\n        ");
    };
    BuildToolsManager.prototype.renderEntryPoints = function (entryPoints) {
        if (!entryPoints || entryPoints.length === 0) {
            return '<p>No entry points found.</p>';
        }
        return entryPoints.map(function (entry) {
            return "<div class=\"entry\">\n                <div class=\"entry-title\">".concat(entry.name, "</div>\n                <div>").concat(entry.path, "</div>\n            </div>");
        }).join('');
    };
    BuildToolsManager.prototype.renderOutputConfig = function (output) {
        if (!output) {
            return '<p>No output configuration found.</p>';
        }
        return "\n            <div class=\"entry\">\n                <div class=\"entry-title\">Path:</div>\n                <div>".concat(output.path, "</div>\n            </div>\n            <div class=\"entry\">\n                <div class=\"entry-title\">Filename:</div>\n                <div>").concat(output.filename, "</div>\n            </div>\n        ");
    };
    BuildToolsManager.prototype.renderLoaders = function (loaders) {
        if (!loaders || loaders.length === 0) {
            return '<p>No loaders found.</p>';
        }
        return loaders.map(function (loader) {
            return "<div class=\"entry\">\n                <div class=\"entry-title\">".concat(loader.name, "</div>\n                <div>Test: ").concat(loader.test, "</div>\n                ").concat(loader.options ? "<div>Options: ".concat(JSON.stringify(loader.options), "</div>") : '', "\n            </div>");
        }).join('');
    };
    BuildToolsManager.prototype.renderPlugins = function (plugins) {
        if (!plugins || plugins.length === 0) {
            return '<p>No plugins found.</p>';
        }
        return plugins.map(function (plugin) {
            return "<div class=\"entry\">\n                <div class=\"entry-title\">".concat(plugin.name, "</div>\n                ").concat(plugin.description ? "<div>".concat(plugin.description, "</div>") : '', "\n            </div>");
        }).join('');
    };
    BuildToolsManager.prototype.renderOptimizationSuggestions = function (suggestions) {
        if (!suggestions || suggestions.length === 0) {
            return '<p>No optimization suggestions available.</p>';
        }
        return suggestions.map(function (suggestion) {
            return "<div class=\"entry optimization-suggestion\">\n                <div class=\"entry-title\">".concat(suggestion.title, "</div>\n                <div>").concat(suggestion.description, "</div>\n            </div>");
        }).join('');
    };
    BuildToolsManager.prototype.optimizeWebpackConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configs, selected, optimizations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.detectConfigsForOptimization('webpack')];
                    case 1:
                        configs = _a.sent();
                        if (!configs.length) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, vscode.window.showQuickPick(configs.map(function (c) { return ({ label: path.basename(c), description: c }); }), { placeHolder: 'Select a webpack configuration file to optimize' })];
                    case 2:
                        selected = _a.sent();
                        if (!selected) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.webpackManager.generateOptimizations(selected.description)];
                    case 3:
                        optimizations = _a.sent();
                        return [4 /*yield*/, this.showOptimizationOptions(selected.description, optimizations)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Similar methods for Rollup and Vite
    BuildToolsManager.prototype.detectRollupConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspacePath, configs, selected, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        workspacePath = this.getFirstWorkspaceFolder();
                        return [4 /*yield*/, this.rollupManager.detectConfigs(workspacePath)];
                    case 1:
                        configs = _a.sent();
                        if (configs.length === 0) {
                            vscode.window.showInformationMessage('No Rollup configuration files found in the workspace.');
                            return [2 /*return*/];
                        }
                        vscode.window.showInformationMessage("Found ".concat(configs.length, " Rollup configuration files."));
                        return [4 /*yield*/, vscode.window.showQuickPick(configs.map(function (c) { return ({ label: path.basename(c), description: c }); }), { placeHolder: 'Select a Rollup configuration file to analyze' })];
                    case 2:
                        selected = _a.sent();
                        if (!selected) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.analyzeRollupConfig(selected.description)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Error: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    BuildToolsManager.prototype.optimizeRollupConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configs, selected, optimizations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.detectConfigsForOptimization('rollup')];
                    case 1:
                        configs = _a.sent();
                        if (!configs.length) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, vscode.window.showQuickPick(configs.map(function (c) { return ({ label: path.basename(c), description: c }); }), { placeHolder: 'Select a Rollup configuration file to optimize' })];
                    case 2:
                        selected = _a.sent();
                        if (!selected) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.rollupManager.generateOptimizations(selected.description)];
                    case 3:
                        optimizations = _a.sent();
                        return [4 /*yield*/, this.showOptimizationOptions(selected.description, optimizations)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BuildToolsManager.prototype.detectViteConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation similar to detectWebpackConfig
                vscode.window.showInformationMessage('Detecting Vite configuration files...');
                return [2 /*return*/];
            });
        });
    };
    BuildToolsManager.prototype.optimizeViteConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation similar to optimizeWebpackConfig
                vscode.window.showInformationMessage('Optimizing Vite configuration...');
                return [2 /*return*/];
            });
        });
    };
    // Build script optimization
    BuildToolsManager.prototype.optimizeBuildScripts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var packageJsonPath, content, packageJson, buildScripts, scriptToOptimize, optimizations, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findPackageJson()];
                    case 1:
                        packageJsonPath = _a.sent();
                        if (!packageJsonPath) {
                            vscode.window.showErrorMessage('No package.json found in the workspace.');
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        content = fs.readFileSync(packageJsonPath, 'utf-8');
                        packageJson = JSON.parse(content);
                        if (!packageJson.scripts) {
                            vscode.window.showInformationMessage('No scripts found in package.json.');
                            return [2 /*return*/];
                        }
                        buildScripts = Object.entries(packageJson.scripts)
                            .filter(function (_a) {
                            var name = _a[0], script = _a[1];
                            return name.includes('build') ||
                                String(script).includes('build') ||
                                String(script).includes('webpack') ||
                                String(script).includes('rollup') ||
                                String(script).includes('vite');
                        })
                            .map(function (_a) {
                            var name = _a[0], script = _a[1];
                            return ({ name: name, script: String(script) });
                        });
                        if (buildScripts.length === 0) {
                            vscode.window.showInformationMessage('No build scripts found in package.json.');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, vscode.window.showQuickPick(buildScripts.map(function (s) { return ({
                                label: s.name,
                                description: s.script,
                                detail: 'Build script'
                            }); }), { placeHolder: 'Select a build script to optimize' })];
                    case 3:
                        scriptToOptimize = _a.sent();
                        if (!scriptToOptimize) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.buildScriptOptimizer.optimizeScript(scriptToOptimize.label, scriptToOptimize.description || '')];
                    case 4:
                        optimizations = _a.sent();
                        this.showBuildScriptOptimizations(packageJsonPath, scriptToOptimize.label, optimizations);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        vscode.window.showErrorMessage("Error reading package.json: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    BuildToolsManager.prototype.showBuildScriptOptimizations = function (packageJsonPath, scriptName, optimizations) {
        return __awaiter(this, void 0, void 0, function () {
            var panel;
            var _this = this;
            return __generator(this, function (_a) {
                panel = vscode.window.createWebviewPanel('buildScriptOptimizations', "Build Script Optimizations: ".concat(scriptName), vscode.ViewColumn.One, { enableScripts: true });
                panel.webview.html = this.getBuildScriptOptimizationHtml(optimizations, scriptName);
                // Handle messages from the webview
                panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(message.command === 'applyOptimization')) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.applyBuildScriptOptimization(packageJsonPath, scriptName, message.optimization)];
                            case 1:
                                _a.sent();
                                vscode.window.showInformationMessage("Applied optimization to script '".concat(scriptName, "'."));
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); }, undefined, this.context.subscriptions);
                return [2 /*return*/];
            });
        });
    };
    BuildToolsManager.prototype.getBuildScriptOptimizationHtml = function (optimizations, scriptName) {
        return "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Build Script Optimizations</title>\n                <style>\n                    body { font-family: Arial, sans-serif; padding: 20px; }\n                    h1 { color: #333; }\n                    .optimization { \n                        margin-bottom: 20px; \n                        padding: 15px;\n                        border: 1px solid #ddd;\n                        border-radius: 4px;\n                    }\n                    .optimization-title { font-weight: bold; margin-bottom: 10px; }\n                    .optimization-description { margin-bottom: 10px; }\n                    .optimization-before, .optimization-after { \n                        font-family: monospace; \n                        padding: 10px;\n                        background-color: #f5f5f5;\n                        border-radius: 4px;\n                        margin-bottom: 10px;\n                    }\n                    .optimization-benefit {\n                        color: #107c10;\n                        margin-bottom: 10px;\n                    }\n                    button {\n                        background-color: #0078d7;\n                        color: white;\n                        border: none;\n                        padding: 8px 16px;\n                        border-radius: 2px;\n                        cursor: pointer;\n                    }\n                    button:hover {\n                        background-color: #005a9e;\n                    }\n                </style>\n            </head>\n            <body>\n                <h1>Build Script Optimizations for '".concat(scriptName, "'</h1>\n                \n                <div id=\"optimizations\">\n                    ").concat(this.renderBuildScriptOptimizations(optimizations), "\n                </div>\n                \n                <script>\n                    const vscode = acquireVsCodeApi();\n                    \n                    function applyOptimization(optimizationId) {\n                        vscode.postMessage({\n                            command: 'applyOptimization',\n                            optimization: optimizationId\n                        });\n                    }\n                </script>\n            </body>\n            </html>\n        ");
    };
    BuildToolsManager.prototype.renderBuildScriptOptimizations = function (optimizations) {
        if (!optimizations || optimizations.length === 0) {
            return '<p>No optimization suggestions available.</p>';
        }
        return optimizations.map(function (opt, index) {
            return "<div class=\"optimization\">\n                <div class=\"optimization-title\">".concat(opt.title, "</div>\n                <div class=\"optimization-description\">").concat(opt.description, "</div>\n                <div class=\"optimization-benefit\">").concat(opt.benefit, "</div>\n                <div>\n                    <div>Before:</div>\n                    <div class=\"optimization-before\">").concat(opt.before, "</div>\n                </div>\n                <div>\n                    <div>After:</div>\n                    <div class=\"optimization-after\">").concat(opt.after, "</div>\n                </div>\n                <button onclick=\"applyOptimization(").concat(index, ")\">Apply This Optimization</button>\n            </div>");
        }).join('');
    };
    BuildToolsManager.prototype.applyBuildScriptOptimization = function (packageJsonPath, scriptName, optimizationIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var content, packageJson, optimizations, optimization, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        content = fs.readFileSync(packageJsonPath, 'utf-8');
                        packageJson = JSON.parse(content);
                        return [4 /*yield*/, this.buildScriptOptimizer.optimizeScript(scriptName, packageJson.scripts[scriptName])];
                    case 1:
                        optimizations = _a.sent();
                        optimization = optimizations[optimizationIndex];
                        if (optimization) {
                            packageJson.scripts[scriptName] = optimization.after;
                            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        vscode.window.showErrorMessage("Error applying optimization: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Bundle analysis
    BuildToolsManager.prototype.analyzeBundleSize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspacePath, possibleOutputDirs, outputDirs, _i, possibleOutputDirs_1, dir, fullPath, selectedDir, dirToAnalyze, selected, analysisResult, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        workspacePath = this.getFirstWorkspaceFolder();
                        possibleOutputDirs = [
                            'dist',
                            'build',
                            'out',
                            'public',
                            'output'
                        ];
                        outputDirs = [];
                        for (_i = 0, possibleOutputDirs_1 = possibleOutputDirs; _i < possibleOutputDirs_1.length; _i++) {
                            dir = possibleOutputDirs_1[_i];
                            fullPath = path.join(workspacePath, dir);
                            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
                                outputDirs.push(fullPath);
                            }
                        }
                        if (!(outputDirs.length === 0)) return [3 /*break*/, 2];
                        vscode.window.showInformationMessage('No standard build output directories found. Please select a directory to analyze.');
                        return [4 /*yield*/, vscode.window.showOpenDialog({
                                canSelectFiles: false,
                                canSelectFolders: true,
                                canSelectMany: false,
                                openLabel: 'Select Build Output Directory'
                            })];
                    case 1:
                        selectedDir = _b.sent();
                        if (!((_a = selectedDir === null || selectedDir === void 0 ? void 0 : selectedDir[0]) === null || _a === void 0 ? void 0 : _a.fsPath)) {
                            return [2 /*return*/];
                        }
                        outputDirs = [selectedDir[0].fsPath];
                        _b.label = 2;
                    case 2:
                        dirToAnalyze = void 0;
                        if (!(outputDirs.length === 1)) return [3 /*break*/, 3];
                        dirToAnalyze = outputDirs[0];
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, vscode.window.showQuickPick(outputDirs.map(function (dir) { return ({ label: path.basename(dir), description: dir }); }), { placeHolder: 'Select a build directory to analyze' })];
                    case 4:
                        selected = _b.sent();
                        if (!selected) {
                            return [2 /*return*/];
                        }
                        dirToAnalyze = selected.description;
                        _b.label = 5;
                    case 5:
                        if (!dirToAnalyze) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.bundleAnalyzer.analyzeDirectory(dirToAnalyze)];
                    case 6:
                        analysisResult = _b.sent();
                        this.showBundleAnalysis(analysisResult);
                        return [3 /*break*/, 8];
                    case 7:
                        error_5 = _b.sent();
                        vscode.window.showErrorMessage("Error analyzing bundle: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    BuildToolsManager.prototype.showBundleAnalysis = function (analysis) {
        var panel = vscode.window.createWebviewPanel('bundleAnalysis', 'Bundle Size Analysis', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.getBundleAnalysisHtml(analysis);
    };
    BuildToolsManager.prototype.getBundleAnalysisHtml = function (analysis) {
        return "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Bundle Size Analysis</title>\n                <style>\n                    body { font-family: Arial, sans-serif; padding: 20px; }\n                    h1, h2 { color: #333; }\n                    .summary { margin-bottom: 20px; }\n                    .file-size-bar {\n                        height: 20px;\n                        background-color: #0078d7;\n                        margin-bottom: 5px;\n                    }\n                    .file-entry {\n                        margin-bottom: 15px;\n                    }\n                    .file-name {\n                        font-weight: bold;\n                    }\n                    .file-size {\n                        color: #666;\n                    }\n                    .file-type {\n                        display: inline-block;\n                        padding: 2px 6px;\n                        border-radius: 4px;\n                        font-size: 12px;\n                        margin-left: 8px;\n                    }\n                    .file-type-js { background-color: #F0DB4F; color: black; }\n                    .file-type-css { background-color: #264de4; color: white; }\n                    .file-type-image { background-color: #41B883; color: white; }\n                    .file-type-other { background-color: #999; color: white; }\n                    .recommendations {\n                        margin-top: 30px;\n                        border-top: 1px solid #ddd;\n                        padding-top: 20px;\n                    }\n                    .recommendation {\n                        margin-bottom: 15px;\n                        padding: 10px;\n                        background-color: #f8f8f8;\n                        border-left: 4px solid #0078d7;\n                    }\n                </style>\n            </head>\n            <body>\n                <h1>Bundle Size Analysis</h1>\n                \n                <div class=\"summary\">\n                    <h2>Summary</h2>\n                    <p>Total size: ".concat(this.formatFileSize(analysis.totalSize), "</p>\n                    <p>Number of files: ").concat(analysis.files.length, "</p>\n                    <p>JavaScript size: ").concat(this.formatFileSize(analysis.jsSize), " (").concat(Math.round(analysis.jsSize / analysis.totalSize * 100), "%)</p>\n                    <p>CSS size: ").concat(this.formatFileSize(analysis.cssSize), " (").concat(Math.round(analysis.cssSize / analysis.totalSize * 100), "%)</p>\n                    <p>Images size: ").concat(this.formatFileSize(analysis.imageSize), " (").concat(Math.round(analysis.imageSize / analysis.totalSize * 100), "%)</p>\n                    <p>Other assets: ").concat(this.formatFileSize(analysis.otherSize), " (").concat(Math.round(analysis.otherSize / analysis.totalSize * 100), "%)</p>\n                </div>\n                \n                <h2>Files by Size</h2>\n                <div id=\"files\">\n                    ").concat(this.renderBundleFiles(analysis.files), "\n                </div>\n                \n                <div class=\"recommendations\">\n                    <h2>Recommendations</h2>\n                    ").concat(this.renderBundleRecommendations(analysis.recommendations), "\n                </div>\n            </body>\n            </html>\n        ");
    };
    BuildToolsManager.prototype.formatFileSize = function (bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        }
        else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    };
    BuildToolsManager.prototype.renderBundleFiles = function (files) {
        var _this = this;
        if (!files || files.length === 0) {
            return '<p>No files found.</p>';
        }
        // Sort files by size, largest first
        var sortedFiles = __spreadArray([], files, true).sort(function (a, b) { return b.size - a.size; });
        var maxSize = sortedFiles[0].size;
        return sortedFiles.map(function (file) {
            var percentWidth = (file.size / maxSize * 100).toFixed(2);
            var fileTypeClass = 'file-type-other';
            var fileType = 'Other';
            if (file.path.endsWith('.js') || file.path.endsWith('.mjs')) {
                fileTypeClass = 'file-type-js';
                fileType = 'JavaScript';
            }
            else if (file.path.endsWith('.css')) {
                fileTypeClass = 'file-type-css';
                fileType = 'CSS';
            }
            else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].some(function (ext) { return file.path.endsWith(ext); })) {
                fileTypeClass = 'file-type-image';
                fileType = 'Image';
            }
            return "\n                <div class=\"file-entry\">\n                    <div class=\"file-name\">\n                        ".concat(path.basename(file.path), "\n                        <span class=\"file-type ").concat(fileTypeClass, "\">").concat(fileType, "</span>\n                    </div>\n                    <div class=\"file-size\">").concat(_this.formatFileSize(file.size), "</div>\n                    <div class=\"file-size-bar\" style=\"width: ").concat(percentWidth, "%\"></div>\n                </div>\n            ");
        }).join('');
    };
    BuildToolsManager.prototype.renderBundleRecommendations = function (recommendations) {
        var _this = this;
        if (!recommendations || recommendations.length === 0) {
            return '<p>No recommendations available.</p>';
        }
        return recommendations.map(function (rec) {
            return "<div class=\"recommendation\">\n                <h3>".concat(rec.title, "</h3>\n                <p>").concat(rec.description, "</p>\n                ").concat(rec.potentialSavings ? "<p>Potential savings: ".concat(_this.formatFileSize(rec.potentialSavings), "</p>") : '', "\n            </div>");
        }).join('');
    };
    // Helper methods
    BuildToolsManager.prototype.detectConfigsForOptimization = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var workspacePath, configs, _a, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        workspacePath = this.getFirstWorkspaceFolder();
                        configs = [];
                        _a = type;
                        switch (_a) {
                            case 'webpack': return [3 /*break*/, 1];
                            case 'rollup': return [3 /*break*/, 3];
                            case 'vite': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.webpackManager.detectConfigs(workspacePath)];
                    case 2:
                        configs = _b.sent();
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, this.rollupManager.detectConfigs(workspacePath)];
                    case 4:
                        configs = _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.viteManager.detectConfigs(workspacePath)];
                    case 6:
                        configs = _b.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        if (configs.length === 0) {
                            vscode.window.showInformationMessage("No ".concat(type, " configuration files found in the workspace."));
                        }
                        return [2 /*return*/, configs];
                    case 8:
                        error_6 = _b.sent();
                        vscode.window.showErrorMessage("Error: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)));
                        return [2 /*return*/, []];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    BuildToolsManager.prototype.showOptimizationOptions = function (configPath, optimizations) {
        return __awaiter(this, void 0, void 0, function () {
            var panel;
            return __generator(this, function (_a) {
                panel = vscode.window.createWebviewPanel('optimizationSuggestions', "Optimization Suggestions: ".concat(path.basename(configPath)), vscode.ViewColumn.One, { enableScripts: true });
                panel.webview.html = this.getOptimizationSuggestionsHtml(optimizations, configPath);
                return [2 /*return*/];
            });
        });
    };
    BuildToolsManager.prototype.findPackageJson = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, packageJsonPath;
            return __generator(this, function (_a) {
                workspaceFolders = vscode.workspace.workspaceFolders;
                if (!(workspaceFolders === null || workspaceFolders === void 0 ? void 0 : workspaceFolders.length)) {
                    return [2 /*return*/, undefined];
                }
                packageJsonPath = path.join(workspaceFolders[0].uri.fsPath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    return [2 /*return*/, packageJsonPath];
                }
                return [2 /*return*/, undefined];
            });
        });
    };
    BuildToolsManager.prototype.getOptimizationSuggestionsHtml = function (optimizations, configPath) {
        return "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Optimization Suggestions</title>\n                <style>\n                    body { font-family: Arial, sans-serif; padding: 20px; }\n                    h1 { color: #333; }\n                    .suggestion {\n                        margin-bottom: 20px;\n                        padding: 15px;\n                        border: 1px solid #ddd;\n                        border-radius: 4px;\n                    }\n                    .suggestion-title { font-weight: bold; margin-bottom: 10px; }\n                    .suggestion-description { margin-bottom: 10px; }\n                    pre {\n                        background-color: #f5f5f5;\n                        padding: 10px;\n                        border-radius: 4px;\n                        overflow-x: auto;\n                    }\n                    code { font-family: monospace; }\n                </style>\n            </head>\n            <body>\n                <h1>Optimization Suggestions</h1>\n                <p>Configuration: ".concat(configPath, "</p>\n                \n                ").concat(this.renderSharedSuggestions(optimizations), "\n            </body>\n            </html>\n        ");
    };
    BuildToolsManager.prototype.renderSharedSuggestions = function (suggestions) {
        if (!(suggestions === null || suggestions === void 0 ? void 0 : suggestions.length)) {
            return '<p>No optimization suggestions available.</p>';
        }
        return suggestions.map(function (suggestion) { return "\n            <div class=\"suggestion\">\n                <div class=\"suggestion-title\">".concat(suggestion.title, "</div>\n                <div class=\"suggestion-description\">").concat(suggestion.description, "</div>\n                <pre><code>").concat(suggestion.code, "</code></pre>\n            </div>\n        "); }).join('');
    };
    BuildToolsManager.prototype.getRollupAnalysisHtml = function (analysis, configPath) {
        return "\n            <!DOCTYPE html>\n            <html>\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Rollup Configuration Analysis</title>\n                <style>\n                    body { font-family: Arial, sans-serif; padding: 20px; }\n                    h1 { color: #333; }\n                    .section { margin-bottom: 20px; }\n                    .section h2 { color: #0078d7; }\n                    .entry { margin-bottom: 10px; }\n                    .entry-title { font-weight: bold; }\n                    .performance-issue { color: #d83b01; }\n                    .optimization-suggestion { color: #107c10; }\n                </style>\n            </head>\n            <body>\n                <h1>Rollup Configuration Analysis</h1>\n                <p>Configuration: ".concat(configPath, "</p>\n                \n                <div class=\"section\">\n                    <h2>Entry Points</h2>\n                    ").concat(this.renderRollupInput(analysis.input), "\n                </div>\n                \n                <div class=\"section\">\n                    <h2>Output Configuration</h2>\n                    ").concat(this.renderRollupOutput(analysis.output), "\n                </div>\n                \n                <div class=\"section\">\n                    <h2>Plugins</h2>\n                    ").concat(this.renderRollupPlugins(analysis.plugins), "\n                </div>\n\n                <div class=\"section\">\n                    <h2>External Dependencies</h2>\n                    ").concat(this.renderRollupExternals(analysis.external), "\n                </div>\n                \n                <div class=\"section\">\n                    <h2>Optimization Suggestions</h2>\n                    ").concat(this.renderRollupOptimizationSuggestions(analysis.optimizationSuggestions), "\n                </div>\n            </body>\n            </html>\n        ");
    };
    BuildToolsManager.prototype.renderRollupInput = function (input) {
        if (!input || input.length === 0) {
            return '<p>No entry points defined</p>';
        }
        return "\n            <ul>\n                ".concat(input.map(function (entry) { return "<li>".concat(entry, "</li>"); }).join('\n'), "\n            </ul>\n        ");
    };
    BuildToolsManager.prototype.renderRollupOutput = function (output) {
        if (!output || output.length === 0) {
            return '<p>No output configuration defined</p>';
        }
        return "\n            <ul>\n                ".concat(output.map(function (out) { return "\n                    <li>\n                        <div class=\"entry\">\n                            <div class=\"entry-title\">Format: ".concat(out.format, "</div>\n                            <div>File: ").concat(out.file, "</div>\n                            ").concat(out.name ? "<div>Name: ".concat(out.name, "</div>") : '', "\n                        </div>\n                    </li>\n                "); }).join('\n'), "\n            </ul>\n        ");
    };
    BuildToolsManager.prototype.renderRollupPlugins = function (plugins) {
        if (!plugins || plugins.length === 0) {
            return '<p>No plugins configured</p>';
        }
        return "\n            <ul>\n                ".concat(plugins.map(function (plugin) { return "\n                    <li>\n                        <div class=\"entry\">\n                            <div class=\"entry-title\">".concat(plugin.name, "</div>\n                            <div>").concat(plugin.description, "</div>\n                        </div>\n                    </li>\n                "); }).join('\n'), "\n            </ul>\n        ");
    };
    BuildToolsManager.prototype.renderRollupExternals = function (externals) {
        if (!externals || externals.length === 0) {
            return '<p>No external dependencies defined</p>';
        }
        return "\n            <ul>\n                ".concat(externals.map(function (ext) { return "<li>".concat(ext, "</li>"); }).join('\n'), "\n            </ul>\n        ");
    };
    BuildToolsManager.prototype.renderRollupOptimizationSuggestions = function (suggestions) {
        if (!suggestions || suggestions.length === 0) {
            return '<p>No optimization suggestions available</p>';
        }
        return "\n            <ul>\n                ".concat(suggestions.map(function (suggestion) { return "\n                    <li>\n                        <div class=\"entry optimization-suggestion\">\n                            <div class=\"entry-title\">".concat(suggestion.title, "</div>\n                            <div>").concat(suggestion.description, "</div>\n                            <pre><code>").concat(suggestion.code, "</code></pre>\n                        </div>\n                    </li>\n                "); }).join('\n'), "\n            </ul>\n        ");
    };
    BuildToolsManager.prototype.analyzeRollupConfig = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, panel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rollupManager.analyzeConfig(configPath)];
                    case 1:
                        analysis = _a.sent();
                        panel = vscode.window.createWebviewPanel('rollupAnalysis', "Rollup Analysis: ".concat(path.basename(configPath)), vscode.ViewColumn.One, { enableScripts: true });
                        panel.webview.html = this.getRollupAnalysisHtml(analysis, configPath);
                        return [2 /*return*/];
                }
            });
        });
    };
    BuildToolsManager.prototype.getFirstWorkspaceFolder = function () {
        var _a;
        var workspaceFolders = vscode.workspace.workspaceFolders;
        if (!((_a = workspaceFolders === null || workspaceFolders === void 0 ? void 0 : workspaceFolders[0]) === null || _a === void 0 ? void 0 : _a.uri.fsPath)) {
            throw new Error('No workspace folder open.');
        }
        return workspaceFolders[0].uri.fsPath;
    };
    return BuildToolsManager;
}());
exports.BuildToolsManager = BuildToolsManager;
