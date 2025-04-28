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
exports.PromptTemplatePanel = void 0;
const vscode = __importStar(require("vscode"));
const manager_1 = require("../services/promptTemplates/manager");
const PromptTemplateHtmlProvider_1 = require("./PromptTemplateHtmlProvider");
class PromptTemplatePanel {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(PromptTemplatePanel.viewType, 'Prompt Templates', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
        });
        return new PromptTemplatePanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(async (message) => {
            const templateManager = (0, manager_1.getPromptTemplateManager)();
            switch (message.command) {
                case 'getTemplates':
                    this._panel.webview.postMessage({
                        command: 'templatesLoaded',
                        templates: templateManager.getAllTemplates()
                    });
                    return;
                case 'getCategories':
                    this._panel.webview.postMessage({
                        command: 'categoriesLoaded',
                        categories: templateManager.getAllCategories()
                    });
                    return;
                case 'getTags':
                    this._panel.webview.postMessage({
                        command: 'tagsLoaded',
                        tags: templateManager.getAllTags()
                    });
                    return;
                case 'createTemplate':
                    try {
                        const newTemplate = message.template;
                        const created = templateManager.createTemplate(newTemplate);
                        this._panel.webview.postMessage({
                            command: 'templateCreated',
                            template: created
                        });
                        vscode.window.showInformationMessage(`Template "${created.name}" created`);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to create template: ${error.message}`);
                    }
                    return;
                case 'updateTemplate':
                    try {
                        const { id, updates } = message;
                        const updated = templateManager.updateTemplate(id, updates);
                        if (updated) {
                            this._panel.webview.postMessage({
                                command: 'templateUpdated',
                                template: updated
                            });
                            vscode.window.showInformationMessage(`Template "${updated.name}" updated`);
                        }
                        else {
                            vscode.window.showErrorMessage(`Template not found: ${id}`);
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to update template: ${error.message}`);
                    }
                    return;
                case 'deleteTemplate':
                    try {
                        const { id } = message;
                        const success = templateManager.deleteTemplate(id);
                        this._panel.webview.postMessage({
                            command: 'templateDeleted',
                            id,
                            success
                        });
                        if (success) {
                            vscode.window.showInformationMessage('Template deleted');
                        }
                        else {
                            vscode.window.showErrorMessage(`Template not found: ${id}`);
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to delete template: ${error.message}`);
                    }
                    return;
                case 'cloneTemplate':
                    try {
                        const { id, newName } = message;
                        const cloned = templateManager.cloneTemplate(id, newName);
                        if (cloned) {
                            this._panel.webview.postMessage({
                                command: 'templateCreated',
                                template: cloned
                            });
                            vscode.window.showInformationMessage(`Template "${cloned.name}" created as a copy`);
                        }
                        else {
                            vscode.window.showErrorMessage(`Template not found: ${id}`);
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to clone template: ${error.message}`);
                    }
                    return;
                case 'exportTemplates':
                    try {
                        const { templateIds } = message;
                        const json = templateManager.exportTemplates(templateIds);
                        // Save to file
                        const saveUri = await vscode.window.showSaveDialog({
                            defaultUri: vscode.Uri.file('prompt-templates.json'),
                            filters: { 'JSON': ['json'] }
                        });
                        if (saveUri) {
                            await vscode.workspace.fs.writeFile(saveUri, Buffer.from(json, 'utf8'));
                            vscode.window.showInformationMessage(`Templates exported to ${saveUri.fsPath}`);
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to export templates: ${error.message}`);
                    }
                    return;
                case 'importTemplates':
                    try {
                        // Open file picker
                        const fileUri = await vscode.window.showOpenDialog({
                            canSelectFiles: true,
                            canSelectFolders: false,
                            canSelectMany: false,
                            filters: { 'JSON': ['json'] }
                        });
                        if (fileUri && fileUri.length > 0) {
                            const fileContent = await vscode.workspace.fs.readFile(fileUri[0]);
                            const json = Buffer.from(fileContent).toString('utf8');
                            const result = templateManager.importTemplates(json);
                            this._panel.webview.postMessage({
                                command: 'templatesImported',
                                success: result.success,
                                failed: result.failed
                            });
                            vscode.window.showInformationMessage(`Imported ${result.success} templates (${result.failed} failed)`);
                            // Refresh templates
                            this._panel.webview.postMessage({
                                command: 'templatesLoaded',
                                templates: templateManager.getAllTemplates()
                            });
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to import templates: ${error.message}`);
                    }
                    return;
                case 'applyTemplate':
                    try {
                        const { id } = message;
                        await templateManager.applyTemplate(id);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to apply template: ${error.message}`);
                    }
                    return;
            }
        }, null, this._disposables);
    }
    _update() {
        const webview = this._panel.webview;
        this._panel.title = "Prompt Templates";
        this._panel.webview.html = PromptTemplateHtmlProvider_1.PromptTemplateHtmlProvider.getHtml(this._panel.webview.uri);
    }
    show(uri) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        const panel = this._panel || vscode.window.createWebviewPanel('promptTemplate', 'Prompt Template', column || vscode.ViewColumn.One, { enableScripts: true });
        this._panel = panel;
        panel.webview.html = PromptTemplateHtmlProvider_1.PromptTemplateHtmlProvider.getHtml(uri);
        panel.webview.onDidReceiveMessage(message => this.handleMessage(message, uri), undefined, this._disposables);
    }
    handleMessage(message, uri) {
        switch (message.command) {
            case 'insertTemplate':
                this.insertTemplate(uri, message.templateId);
                break;
            case 'refresh':
                this._panel.webview.html = PromptTemplateHtmlProvider_1.PromptTemplateHtmlProvider.getHtml(uri);
                break;
        }
    }
    dispose() {
        // Clean up resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.PromptTemplatePanel = PromptTemplatePanel;
PromptTemplatePanel.viewType = 'copilotPPA.promptTemplatePanel';
//# sourceMappingURL=promptTemplatePanel.js.map