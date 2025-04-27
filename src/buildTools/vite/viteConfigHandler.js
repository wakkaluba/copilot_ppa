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
exports.ViteConfigHandler = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
/**
 * Handles Vite configuration files
 */
var ViteConfigHandler = /** @class */ (function () {
    function ViteConfigHandler() {
        this.configFileNames = [
            'vite.config.js',
            'vite.config.ts',
            'vite.config.mjs'
        ];
    }
    /**
     * Checks if a Vite configuration file exists in the workspace
     */
    ViteConfigHandler.prototype.isConfigPresent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, _i, workspaceFolders_1, folder, _a, _b, configName, configPath;
            return __generator(this, function (_c) {
                workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders) {
                    return [2 /*return*/, false];
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
     * Opens the Vite configuration file in the editor
     */
    ViteConfigHandler.prototype.openConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, configFiles, _i, workspaceFolders_2, folder, _a, _b, configName, configPath, createNew, document_1, selected, document_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders) {
                            vscode.window.showErrorMessage('No workspace folder is open');
                            return [2 /*return*/];
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
                                        detail: configPath,
                                        configPath: configPath
                                    });
                                }
                            }
                        }
                        if (!(configFiles.length === 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, vscode.window.showInformationMessage('No Vite configuration files found. Create a new one?', 'Yes', 'No')];
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
                        return [4 /*yield*/, vscode.workspace.openTextDocument(configFiles[0].configPath)];
                    case 5:
                        document_1 = _c.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_1)];
                    case 6:
                        _c.sent();
                        return [2 /*return*/];
                    case 7: return [4 /*yield*/, vscode.window.showQuickPick(configFiles, {
                            placeHolder: 'Select a Vite configuration file to open'
                        })];
                    case 8:
                        selected = _c.sent();
                        if (!selected) return [3 /*break*/, 11];
                        return [4 /*yield*/, vscode.workspace.openTextDocument(selected.configPath)];
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
     * Creates a new Vite configuration file
     */
    ViteConfigHandler.prototype.createNewConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, targetFolder, selected, configName, configPath, template, document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders) {
                            vscode.window.showErrorMessage('No workspace folder is open');
                            return [2 /*return*/];
                        }
                        if (!(workspaceFolders.length === 1)) return [3 /*break*/, 1];
                        targetFolder = workspaceFolders[0].uri.fsPath;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, vscode.window.showQuickPick(workspaceFolders.map(function (folder) { return ({
                            label: folder.name,
                            detail: folder.uri.fsPath,
                            folderPath: folder.uri.fsPath
                        }); }), { placeHolder: 'Select a workspace folder' })];
                    case 2:
                        selected = _a.sent();
                        if (!selected) {
                            return [2 /*return*/];
                        }
                        targetFolder = selected.folderPath;
                        _a.label = 3;
                    case 3: return [4 /*yield*/, vscode.window.showQuickPick(this.configFileNames, {
                            placeHolder: 'Select a configuration file name'
                        })];
                    case 4:
                        configName = _a.sent();
                        if (!configName) {
                            return [2 /*return*/];
                        }
                        configPath = path.join(targetFolder, configName);
                        template = this.getViteConfigTemplate();
                        fs.writeFileSync(configPath, template);
                        return [4 /*yield*/, vscode.workspace.openTextDocument(configPath)];
                    case 5:
                        document = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document)];
                    case 6:
                        _a.sent();
                        vscode.window.showInformationMessage("Created ".concat(configName));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns a template for a new Vite configuration file
     */
    ViteConfigHandler.prototype.getViteConfigTemplate = function () {
        return "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    port: 3000,\n    open: true\n  },\n  build: {\n    outDir: 'dist',\n    sourcemap: true,\n    minify: 'terser',\n    cssCodeSplit: true,\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          vendor: ['react', 'react-dom'],\n        }\n      }\n    }\n  }\n});\n";
    };
    /**
     * Provides suggestions for optimizing Vite configuration
     */
    ViteConfigHandler.prototype.suggestOptimizations = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var document, text, suggestions, selected;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.openTextDocument(configPath)];
                    case 1:
                        document = _a.sent();
                        text = document.getText();
                        suggestions = [];
                        if (!text.includes('manualChunks')) {
                            suggestions.push('Add code splitting with manualChunks');
                        }
                        if (!text.includes('terser')) {
                            suggestions.push('Use terser for minification');
                        }
                        if (!text.includes('visualizer')) {
                            suggestions.push('Add bundle visualization with rollup-plugin-visualizer');
                        }
                        if (!(suggestions.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, vscode.window.showQuickPick(suggestions, {
                                placeHolder: 'Select an optimization to apply',
                                canPickMany: true
                            })];
                    case 2:
                        selected = _a.sent();
                        if (selected && selected.length > 0) {
                            vscode.window.showInformationMessage("Selected optimizations: ".concat(selected.join(', ')));
                            // Here we would apply the selected optimizations
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        vscode.window.showInformationMessage('No optimization suggestions available');
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ViteConfigHandler;
}());
exports.ViteConfigHandler = ViteConfigHandler;
