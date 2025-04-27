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
exports.PromptTemplatePanel = void 0;
var vscode = require("vscode");
var manager_1 = require("../services/promptTemplates/manager");
var PromptTemplateHtmlProvider_1 = require("./PromptTemplateHtmlProvider");
var PromptTemplatePanel = /** @class */ (function () {
    function PromptTemplatePanel(panel, extensionUri) {
        var _this = this;
        this._disposables = [];
        this._panel = panel;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(function () { return _this.dispose(); }, null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(function (e) {
            if (_this._panel.visible) {
                _this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var templateManager, _a, newTemplate, created, id, updates, updated, id, success, id, newName, cloned, templateIds, json, saveUri, error_1, fileUri, fileContent, json, result, error_2, id, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        templateManager = (0, manager_1.getPromptTemplateManager)();
                        _a = message.command;
                        switch (_a) {
                            case 'getTemplates': return [3 /*break*/, 1];
                            case 'getCategories': return [3 /*break*/, 2];
                            case 'getTags': return [3 /*break*/, 3];
                            case 'createTemplate': return [3 /*break*/, 4];
                            case 'updateTemplate': return [3 /*break*/, 5];
                            case 'deleteTemplate': return [3 /*break*/, 6];
                            case 'cloneTemplate': return [3 /*break*/, 7];
                            case 'exportTemplates': return [3 /*break*/, 8];
                            case 'importTemplates': return [3 /*break*/, 14];
                            case 'applyTemplate': return [3 /*break*/, 20];
                        }
                        return [3 /*break*/, 24];
                    case 1:
                        this._panel.webview.postMessage({
                            command: 'templatesLoaded',
                            templates: templateManager.getAllTemplates()
                        });
                        return [2 /*return*/];
                    case 2:
                        this._panel.webview.postMessage({
                            command: 'categoriesLoaded',
                            categories: templateManager.getAllCategories()
                        });
                        return [2 /*return*/];
                    case 3:
                        this._panel.webview.postMessage({
                            command: 'tagsLoaded',
                            tags: templateManager.getAllTags()
                        });
                        return [2 /*return*/];
                    case 4:
                        try {
                            newTemplate = message.template;
                            created = templateManager.createTemplate(newTemplate);
                            this._panel.webview.postMessage({
                                command: 'templateCreated',
                                template: created
                            });
                            vscode.window.showInformationMessage("Template \"".concat(created.name, "\" created"));
                        }
                        catch (error) {
                            vscode.window.showErrorMessage("Failed to create template: ".concat(error.message));
                        }
                        return [2 /*return*/];
                    case 5:
                        try {
                            id = message.id, updates = message.updates;
                            updated = templateManager.updateTemplate(id, updates);
                            if (updated) {
                                this._panel.webview.postMessage({
                                    command: 'templateUpdated',
                                    template: updated
                                });
                                vscode.window.showInformationMessage("Template \"".concat(updated.name, "\" updated"));
                            }
                            else {
                                vscode.window.showErrorMessage("Template not found: ".concat(id));
                            }
                        }
                        catch (error) {
                            vscode.window.showErrorMessage("Failed to update template: ".concat(error.message));
                        }
                        return [2 /*return*/];
                    case 6:
                        try {
                            id = message.id;
                            success = templateManager.deleteTemplate(id);
                            this._panel.webview.postMessage({
                                command: 'templateDeleted',
                                id: id,
                                success: success
                            });
                            if (success) {
                                vscode.window.showInformationMessage('Template deleted');
                            }
                            else {
                                vscode.window.showErrorMessage("Template not found: ".concat(id));
                            }
                        }
                        catch (error) {
                            vscode.window.showErrorMessage("Failed to delete template: ".concat(error.message));
                        }
                        return [2 /*return*/];
                    case 7:
                        try {
                            id = message.id, newName = message.newName;
                            cloned = templateManager.cloneTemplate(id, newName);
                            if (cloned) {
                                this._panel.webview.postMessage({
                                    command: 'templateCreated',
                                    template: cloned
                                });
                                vscode.window.showInformationMessage("Template \"".concat(cloned.name, "\" created as a copy"));
                            }
                            else {
                                vscode.window.showErrorMessage("Template not found: ".concat(id));
                            }
                        }
                        catch (error) {
                            vscode.window.showErrorMessage("Failed to clone template: ".concat(error.message));
                        }
                        return [2 /*return*/];
                    case 8:
                        _b.trys.push([8, 12, , 13]);
                        templateIds = message.templateIds;
                        json = templateManager.exportTemplates(templateIds);
                        return [4 /*yield*/, vscode.window.showSaveDialog({
                                defaultUri: vscode.Uri.file('prompt-templates.json'),
                                filters: { 'JSON': ['json'] }
                            })];
                    case 9:
                        saveUri = _b.sent();
                        if (!saveUri) return [3 /*break*/, 11];
                        return [4 /*yield*/, vscode.workspace.fs.writeFile(saveUri, Buffer.from(json, 'utf8'))];
                    case 10:
                        _b.sent();
                        vscode.window.showInformationMessage("Templates exported to ".concat(saveUri.fsPath));
                        _b.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_1 = _b.sent();
                        vscode.window.showErrorMessage("Failed to export templates: ".concat(error_1.message));
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                    case 14:
                        _b.trys.push([14, 18, , 19]);
                        return [4 /*yield*/, vscode.window.showOpenDialog({
                                canSelectFiles: true,
                                canSelectFolders: false,
                                canSelectMany: false,
                                filters: { 'JSON': ['json'] }
                            })];
                    case 15:
                        fileUri = _b.sent();
                        if (!(fileUri && fileUri.length > 0)) return [3 /*break*/, 17];
                        return [4 /*yield*/, vscode.workspace.fs.readFile(fileUri[0])];
                    case 16:
                        fileContent = _b.sent();
                        json = Buffer.from(fileContent).toString('utf8');
                        result = templateManager.importTemplates(json);
                        this._panel.webview.postMessage({
                            command: 'templatesImported',
                            success: result.success,
                            failed: result.failed
                        });
                        vscode.window.showInformationMessage("Imported ".concat(result.success, " templates (").concat(result.failed, " failed)"));
                        // Refresh templates
                        this._panel.webview.postMessage({
                            command: 'templatesLoaded',
                            templates: templateManager.getAllTemplates()
                        });
                        _b.label = 17;
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        error_2 = _b.sent();
                        vscode.window.showErrorMessage("Failed to import templates: ".concat(error_2.message));
                        return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                    case 20:
                        _b.trys.push([20, 22, , 23]);
                        id = message.id;
                        return [4 /*yield*/, templateManager.applyTemplate(id)];
                    case 21:
                        _b.sent();
                        return [3 /*break*/, 23];
                    case 22:
                        error_3 = _b.sent();
                        vscode.window.showErrorMessage("Failed to apply template: ".concat(error_3.message));
                        return [3 /*break*/, 23];
                    case 23: return [2 /*return*/];
                    case 24: return [2 /*return*/];
                }
            });
        }); }, null, this._disposables);
    }
    PromptTemplatePanel.createOrShow = function (extensionUri) {
        var column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        var panel = vscode.window.createWebviewPanel(PromptTemplatePanel.viewType, 'Prompt Templates', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
        });
        return new PromptTemplatePanel(panel, extensionUri);
    };
    PromptTemplatePanel.prototype._update = function () {
        var webview = this._panel.webview;
        this._panel.title = "Prompt Templates";
        this._panel.webview.html = PromptTemplateHtmlProvider_1.PromptTemplateHtmlProvider.getHtml(this._panel.webview.uri);
    };
    PromptTemplatePanel.prototype.show = function (uri) {
        var _this = this;
        var column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        var panel = this._panel || vscode.window.createWebviewPanel('promptTemplate', 'Prompt Template', column || vscode.ViewColumn.One, { enableScripts: true });
        this._panel = panel;
        panel.webview.html = PromptTemplateHtmlProvider_1.PromptTemplateHtmlProvider.getHtml(uri);
        panel.webview.onDidReceiveMessage(function (message) { return _this.handleMessage(message, uri); }, undefined, this._disposables);
    };
    PromptTemplatePanel.prototype.handleMessage = function (message, uri) {
        switch (message.command) {
            case 'insertTemplate':
                this.insertTemplate(uri, message.templateId);
                break;
            case 'refresh':
                this._panel.webview.html = PromptTemplateHtmlProvider_1.PromptTemplateHtmlProvider.getHtml(uri);
                break;
        }
    };
    PromptTemplatePanel.prototype.dispose = function () {
        // Clean up resources
        this._panel.dispose();
        while (this._disposables.length) {
            var x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    };
    PromptTemplatePanel.viewType = 'copilotPPA.promptTemplatePanel';
    return PromptTemplatePanel;
}());
exports.PromptTemplatePanel = PromptTemplatePanel;
