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
exports.RollupConfigUIService = void 0;
var vscode = require("vscode");
/**
 * Service responsible for UI interactions related to Rollup configuration
 */
var RollupConfigUIService = /** @class */ (function () {
    function RollupConfigUIService(logger, configManager) {
        this.logger = logger;
        this.configManager = configManager;
    }
    /**
     * Opens the Rollup configuration file in the editor
     * @throws {Error} If no config files exist
     */
    RollupConfigUIService.prototype.openConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, allConfigFiles_1, _loop_1, this_1, _i, workspaceFolders_1, folder, createNew, document_1, selected, document_2, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 16, , 17]);
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders || workspaceFolders.length === 0) {
                            throw new Error('No workspace folders are open');
                        }
                        allConfigFiles_1 = [];
                        _loop_1 = function (folder) {
                            var configs, error_2;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this_1.configManager.detectConfigs(folder.uri.fsPath)];
                                    case 1:
                                        configs = _b.sent();
                                        configs.forEach(function (configPath) {
                                            var relativePath = vscode.workspace.asRelativePath(configPath);
                                            allConfigFiles_1.push({
                                                label: "".concat(relativePath, " (").concat(folder.name, ")"),
                                                description: configPath,
                                                detail: "Full path: ".concat(configPath)
                                            });
                                        });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_2 = _b.sent();
                                        this_1.logger.warn("Failed to detect configs in ".concat(folder.name, ":"), error_2);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, workspaceFolders_1 = workspaceFolders;
                        _a.label = 1;
                    case 1:
                        if (!(_i < workspaceFolders_1.length)) return [3 /*break*/, 4];
                        folder = workspaceFolders_1[_i];
                        return [5 /*yield**/, _loop_1(folder)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!(allConfigFiles_1.length === 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, vscode.window.showInformationMessage('No Rollup configuration files found. Create a new one?', 'Yes', 'No')];
                    case 5:
                        createNew = _a.sent();
                        if (!(createNew === 'Yes')) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.createNewConfig()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                    case 8:
                        if (!(allConfigFiles_1.length === 1)) return [3 /*break*/, 11];
                        return [4 /*yield*/, vscode.workspace.openTextDocument(allConfigFiles_1[0].description)];
                    case 9:
                        document_1 = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_1)];
                    case 10:
                        _a.sent();
                        return [2 /*return*/];
                    case 11: return [4 /*yield*/, vscode.window.showQuickPick(allConfigFiles_1, {
                            placeHolder: 'Select a Rollup configuration file to open'
                        })];
                    case 12:
                        selected = _a.sent();
                        if (!selected) return [3 /*break*/, 15];
                        return [4 /*yield*/, vscode.workspace.openTextDocument(selected.description)];
                    case 13:
                        document_2 = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_2)];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        error_1 = _a.sent();
                        this.logger.error('Error opening config:', error_1);
                        vscode.window.showErrorMessage("Failed to open Rollup config: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                        return [3 /*break*/, 17];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new Rollup configuration file
     */
    RollupConfigUIService.prototype.createNewConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, targetFolder, selected, configUri, document_3, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders || workspaceFolders.length === 0) {
                            throw new Error('No workspace folders are open');
                        }
                        targetFolder = void 0;
                        if (!(workspaceFolders.length === 1)) return [3 /*break*/, 1];
                        targetFolder = workspaceFolders[0].uri.fsPath;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, vscode.window.showQuickPick(workspaceFolders.map(function (folder) { return ({
                            label: folder.name,
                            description: folder.uri.fsPath
                        }); }), { placeHolder: 'Select a workspace folder for the new config' })];
                    case 2:
                        selected = _a.sent();
                        if (!selected) {
                            return [2 /*return*/];
                        }
                        targetFolder = selected.description;
                        _a.label = 3;
                    case 3:
                        configUri = vscode.Uri.file("".concat(targetFolder, "/rollup.config.js"));
                        return [4 /*yield*/, vscode.workspace.fs.writeFile(configUri, Buffer.from(this.getRollupConfigTemplate()))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, vscode.workspace.openTextDocument(configUri)];
                    case 5:
                        document_3 = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_3)];
                    case 6:
                        _a.sent();
                        this.logger.info("Created new Rollup configuration file at ".concat(configUri.fsPath));
                        return [4 /*yield*/, vscode.window.showInformationMessage('Created new Rollup configuration file')];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_3 = _a.sent();
                        this.logger.error('Error creating new config:', error_3);
                        vscode.window.showErrorMessage("Failed to create Rollup config: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Provides suggestions for optimizing Rollup configuration
     */
    RollupConfigUIService.prototype.suggestOptimizations = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var optimizations, items, selected, document_4, edit, lastLine, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, this.configManager.generateOptimizations(configPath)];
                    case 1:
                        optimizations = _a.sent();
                        if (!(optimizations.length === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, vscode.window.showInformationMessage('No optimization suggestions available')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        items = optimizations.map(function (opt) { return ({
                            label: opt.title,
                            description: opt.description,
                            detail: opt.code
                        }); });
                        return [4 /*yield*/, vscode.window.showQuickPick(items, {
                                placeHolder: 'Select optimizations to apply',
                                canPickMany: true
                            })];
                    case 4:
                        selected = _a.sent();
                        if (!selected || selected.length === 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, vscode.workspace.openTextDocument(configPath)];
                    case 5:
                        document_4 = _a.sent();
                        edit = new vscode.WorkspaceEdit();
                        lastLine = document_4.lineCount - 1;
                        edit.insert(document_4.uri, new vscode.Position(lastLine, 0), '\n' +
                            selected.map(function (s) { return s.detail; }).join('\n'));
                        return [4 /*yield*/, vscode.workspace.applyEdit(edit)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, document_4.save()];
                    case 7:
                        _a.sent();
                        this.logger.info("Applied optimizations to ".concat(configPath, ": ").concat(selected.map(function (s) { return s.label; }).join(', ')));
                        return [4 /*yield*/, vscode.window.showInformationMessage("Applied optimizations: ".concat(selected.map(function (s) { return s.label; }).join(', ')))];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        error_4 = _a.sent();
                        this.logger.error('Error suggesting optimizations:', error_4);
                        vscode.window.showErrorMessage("Failed to suggest optimizations: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns a template for a new Rollup configuration file
     */
    RollupConfigUIService.prototype.getRollupConfigTemplate = function () {
        return "import typescript from '@rollup/plugin-typescript';\nimport resolve from '@rollup/plugin-node-resolve';\nimport commonjs from '@rollup/plugin-commonjs';\nimport { terser } from 'rollup-plugin-terser';\n\nconst production = !process.env.ROLLUP_WATCH;\n\nexport default {\n    input: 'src/index.ts',\n    output: [\n        {\n            file: 'dist/bundle.cjs.js',\n            format: 'cjs',\n            sourcemap: true\n        },\n        {\n            file: 'dist/bundle.esm.js',\n            format: 'es',\n            sourcemap: true\n        }\n    ],\n    plugins: [\n        resolve({\n            browser: true\n        }),\n        commonjs(),\n        typescript({\n            sourceMap: true,\n            inlineSources: !production\n        }),\n        production && terser()\n    ].filter(Boolean),\n    watch: {\n        clearScreen: false\n    }\n};";
    };
    return RollupConfigUIService;
}());
exports.RollupConfigUIService = RollupConfigUIService;
