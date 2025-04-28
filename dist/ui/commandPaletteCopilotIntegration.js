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
exports.registerCopilotIntegrationCommands = registerCopilotIntegrationCommands;
const vscode = __importStar(require("vscode"));
const copilotIntegrationWebview_1 = require("../copilot/copilotIntegrationWebview");
const CopilotCommandRegistrationService_1 = require("./services/CopilotCommandRegistrationService");
const CopilotStatusBarService_1 = require("./services/CopilotStatusBarService");
const CopilotCodeProcessingService_1 = require("./services/CopilotCodeProcessingService");
function registerCopilotIntegrationCommands(context, copilotProvider, copilotService) {
    const commandRegistrationService = new CopilotCommandRegistrationService_1.CopilotCommandRegistrationService(context, copilotService);
    const statusBarService = new CopilotStatusBarService_1.CopilotStatusBarService(context);
    const codeProcessingService = new CopilotCodeProcessingService_1.CopilotCodeProcessingService(copilotProvider);
    registerCommands(context, commandRegistrationService, statusBarService, codeProcessingService, copilotService);
    setupStatusBarUpdates(context, statusBarService);
}
function registerCommands(context, commandService, statusBarService, codeProcessingService, copilotService) {
    // Register webview command
    commandService.registerWebviewCommand(() => {
        const webview = new copilotIntegrationWebview_1.CopilotIntegrationWebview(context, copilotService);
        webview.show();
    });
    // Register provider toggle command
    commandService.registerProviderToggleCommand(async () => {
        const newProvider = await statusBarService.toggleProvider();
        vscode.window.showInformationMessage(`Switched to ${newProvider === 'copilot' ? 'GitHub Copilot' : 'Local LLM'} as the provider.`);
    });
    // Register availability check command
    commandService.registerAvailabilityCheckCommand(() => {
        const isAvailable = copilotService.isAvailable();
        showAvailabilityMessage(isAvailable);
        return isAvailable;
    });
    // Register code selection command
    commandService.registerCodeSelectionCommand(async (editor) => {
        await handleCodeSelection(editor, codeProcessingService);
    });
}
function setupStatusBarUpdates(context, statusBarService) {
    // Update status bar when settings change
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('copilot-ppa.selectedProvider')) {
            statusBarService.updateStatusBar();
        }
    }));
    // Initial status bar update
    statusBarService.updateStatusBar();
}
async function handleCodeSelection(editor, codeProcessingService) {
    const selection = editor.selection;
    if (selection.isEmpty) {
        vscode.window.showErrorMessage('No text selected to send to Copilot.');
        return;
    }
    const text = editor.document.getText(selection);
    const userPrompt = await promptForUserInput();
    if (!userPrompt) {
        return;
    }
    await processCodeWithProgress(text, userPrompt, codeProcessingService);
}
async function promptForUserInput() {
    return vscode.window.showInputBox({
        prompt: 'What would you like Copilot to do with this code?',
        placeHolder: 'E.g., Explain this code, Refactor this code, Optimize this code'
    });
}
async function processCodeWithProgress(text, userPrompt, codeProcessingService) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Processing with Copilot...',
        cancellable: false
    }, async () => {
        try {
            const response = await codeProcessingService.processCode(text, userPrompt);
            if (response) {
                await showResponseInEditor(response);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error processing with Copilot: ${error}`);
        }
    });
}
async function showResponseInEditor(response) {
    const document = await vscode.workspace.openTextDocument({
        content: `# Copilot Response\n\n${response.completion}`,
        language: 'markdown'
    });
    await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Beside });
}
function showAvailabilityMessage(isAvailable) {
    if (isAvailable) {
        vscode.window.showInformationMessage('GitHub Copilot is available and connected.');
    }
    else {
        vscode.window.showErrorMessage('GitHub Copilot is not available. Please make sure the extension is installed and authenticated.');
    }
}
//# sourceMappingURL=commandPaletteCopilotIntegration.js.map