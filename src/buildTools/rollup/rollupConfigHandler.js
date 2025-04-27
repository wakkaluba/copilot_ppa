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
exports.RollupConfigHandler = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var ConfigValidationError_1 = require("./errors/ConfigValidationError");
/**
 * Handles Rollup configuration files
 */
var RollupConfigHandler = /** @class */ (function () {
    function RollupConfigHandler() {
        this.configFileNames = [
            'rollup.config.js',
            'rollup.config.mjs',
            'rollup.config.ts'
        ];
    }
    /**
     * Checks if a Rollup configuration file exists in the workspace
     * @throws {ConfigValidationError} If no workspace folders are open
     */
    RollupConfigHandler.prototype.isConfigPresent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, _i, workspaceFolders_1, folder, _a, _b, configName, configPath;
            return __generator(this, function (_c) {
                workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders) {
                    throw new ConfigValidationError_1.ConfigValidationError('No workspace folders are open');
                }
                for (_i = 0, workspaceFolders_1 = workspaceFolders; _i < workspaceFolders_1.length; _i++) {
                    folder = workspaceFolders_1[_i];
                    for (_a = 0, _b = this.configFileNames; _a < _b.length; _a++) {
                        configName = _b[_a];
                        configPath = path.join(folder.uri.fsPath, configName);
                        if (fs.existsSync(configPath)) {
                            return [2 /*return*/, true];
                        }
                    }
                }
                return [2 /*return*/, false];
            });
        });
    };
    /**
     * Opens the Rollup configuration file in the editor
     * @throws {ConfigValidationError} If no workspace folders are open or no config files exist
     */
    RollupConfigHandler.prototype.openConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, configFiles, _i, workspaceFolders_2, folder, _a, _b, configName, configPath, createNew, document_1, selected, document_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders) {
                            throw new ConfigValidationError_1.ConfigValidationError('No workspace folders are open');
                        }
                        configFiles = [];
                        for (_i = 0, workspaceFolders_2 = workspaceFolders; _i < workspaceFolders_2.length; _i++) {
                            folder = workspaceFolders_2[_i];
                            for (_a = 0, _b = this.configFileNames; _a < _b.length; _a++) {
                                configName = _b[_a];
                                configPath = path.join(folder.uri.fsPath, configName);
                                if (fs.existsSync(configPath)) {
                                    configFiles.push({
                                        label: "".concat(configName, " (").concat(folder.name, ")"),
                                        description: configPath,
                                        detail: "Full path: ".concat(configPath)
                                    });
                                }
                            }
                        }
                        if (!(configFiles.length === 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, vscode.window.showInformationMessage('No Rollup configuration files found. Create a new one?', 'Yes', 'No')];
                    case 1:
                        createNew = _c.sent();
                        if (!(createNew === 'Yes')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createNewConfig()];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [2 /*return*/];
                    case 4:
                        if (!(configFiles.length === 1)) return [3 /*break*/, 7];
                        return [4 /*yield*/, vscode.workspace.openTextDocument(configFiles[0].description)];
                    case 5:
                        document_1 = _c.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_1)];
                    case 6:
                        _c.sent();
                        return [2 /*return*/];
                    case 7: return [4 /*yield*/, vscode.window.showQuickPick(configFiles, {
                            placeHolder: 'Select a Rollup configuration file to open'
                        })];
                    case 8:
                        selected = _c.sent();
                        if (!selected) return [3 /*break*/, 11];
                        return [4 /*yield*/, vscode.workspace.openTextDocument(selected.description)];
                    case 9:
                        document_2 = _c.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_2)];
                    case 10:
                        _c.sent();
                        _c.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new Rollup configuration file
     * @throws {ConfigValidationError} If no workspace folders are open or file already exists
     */
    RollupConfigHandler.prototype.createNewConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, targetFolder, selected, configPath, document_3, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders) {
                            throw new ConfigValidationError_1.ConfigValidationError('No workspace folders are open');
                        }
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
                        configPath = path.join(targetFolder, 'rollup.config.js');
                        if (fs.existsSync(configPath)) {
                            throw new ConfigValidationError_1.ConfigValidationError("Configuration file already exists at ".concat(configPath));
                        }
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 8, , 9]);
                        fs.writeFileSync(configPath, this.getRollupConfigTemplate());
                        return [4 /*yield*/, vscode.workspace.openTextDocument(configPath)];
                    case 5:
                        document_3 = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_3)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, vscode.window.showInformationMessage('Created new Rollup configuration file')];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_1 = _a.sent();
                        throw new Error("Failed to create configuration file: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns a template for a new Rollup configuration file
     */
    RollupConfigHandler.prototype.getRollupConfigTemplate = function () {
        return "import typescript from '@rollup/plugin-typescript';\nimport resolve from '@rollup/plugin-node-resolve';\nimport commonjs from '@rollup/plugin-commonjs';\nimport { terser } from 'rollup-plugin-terser';\n\nconst production = !process.env.ROLLUP_WATCH;\n\nexport default {\n    input: 'src/index.ts',\n    output: [\n        {\n            file: 'dist/bundle.cjs.js',\n            format: 'cjs',\n            sourcemap: true\n        },\n        {\n            file: 'dist/bundle.esm.js',\n            format: 'es',\n            sourcemap: true\n        }\n    ],\n    plugins: [\n        resolve({\n            browser: true\n        }),\n        commonjs(),\n        typescript({\n            sourceMap: true,\n            inlineSources: !production\n        }),\n        production && terser()\n    ].filter(Boolean),\n    watch: {\n        clearScreen: false\n    }\n};";
    };
    /**
     * Provides suggestions for optimizing Rollup configuration
     * @throws {ConfigValidationError} If the config file doesn't exist
     */
    RollupConfigHandler.prototype.suggestOptimizations = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var document, text, suggestions, selected, workspaceEdit, importStatements, pluginStatements, _i, selected_1, suggestion, lines, lastImportLine, pluginsLine_1, pluginsClosingLine;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fs.existsSync(configPath)) {
                            throw new ConfigValidationError_1.ConfigValidationError("Configuration file not found: ".concat(configPath));
                        }
                        return [4 /*yield*/, vscode.workspace.openTextDocument(configPath)];
                    case 1:
                        document = _a.sent();
                        text = document.getText();
                        suggestions = [];
                        if (!text.includes('terser')) {
                            suggestions.push('Add minification with rollup-plugin-terser');
                        }
                        if (!text.includes('filesize')) {
                            suggestions.push('Add bundle size reporting with rollup-plugin-filesize');
                        }
                        if (!text.includes('visualizer')) {
                            suggestions.push('Add bundle visualization with rollup-plugin-visualizer');
                        }
                        if (!(suggestions.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, vscode.window.showQuickPick(suggestions, {
                                placeHolder: 'Select optimizations to apply',
                                canPickMany: true
                            })];
                    case 2:
                        selected = _a.sent();
                        if (!(selected && selected.length > 0)) return [3 /*break*/, 6];
                        workspaceEdit = new vscode.WorkspaceEdit();
                        importStatements = [];
                        pluginStatements = [];
                        for (_i = 0, selected_1 = selected; _i < selected_1.length; _i++) {
                            suggestion = selected_1[_i];
                            if (suggestion.includes('terser')) {
                                importStatements.push("import { terser } from 'rollup-plugin-terser';");
                                pluginStatements.push('production && terser()');
                            }
                            if (suggestion.includes('filesize')) {
                                importStatements.push("import filesize from 'rollup-plugin-filesize';");
                                pluginStatements.push('filesize()');
                            }
                            if (suggestion.includes('visualizer')) {
                                importStatements.push("import visualizer from 'rollup-plugin-visualizer';");
                                pluginStatements.push('visualizer()');
                            }
                        }
                        lines = text.split('\n');
                        lastImportLine = lines.findIndex(function (line) { return !line.trim().startsWith('import'); });
                        pluginsLine_1 = lines.findIndex(function (line) { return line.includes('plugins:'); });
                        if (lastImportLine !== -1 && pluginsLine_1 !== -1) {
                            // Add imports after the last import
                            workspaceEdit.insert(document.uri, new vscode.Position(lastImportLine, 0), importStatements.join('\n') + '\n');
                            pluginsClosingLine = lines.findIndex(function (line, i) { return i > pluginsLine_1 && line.includes(']'); });
                            if (pluginsClosingLine !== -1) {
                                workspaceEdit.insert(document.uri, new vscode.Position(pluginsClosingLine, 0), '    ' + pluginStatements.join(',\n    ') + ',\n');
                            }
                        }
                        return [4 /*yield*/, vscode.workspace.applyEdit(workspaceEdit)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, document.save()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, vscode.window.showInformationMessage("Applied optimizations: ".concat(selected.join(', ')))];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, vscode.window.showInformationMessage('No optimization suggestions available')];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return RollupConfigHandler;
}());
exports.RollupConfigHandler = RollupConfigHandler;
