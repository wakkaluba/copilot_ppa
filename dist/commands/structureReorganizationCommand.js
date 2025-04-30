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
exports.StructureReorganizationCommand = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const structureReorganizer_1 = require("../services/refactoring/structureReorganizer");
/**
 * Command handler for code structure reorganization
 */
class StructureReorganizationCommand {
    structureReorganizer;
    constructor() {
        this.structureReorganizer = new structureReorganizer_1.StructureReorganizer();
    }
    /**
     * Register the command with VS Code
     */
    register() {
        return vscode.commands.registerCommand('vscodeLocalLLMAgent.reorganizeCodeStructure', this.executeCommand.bind(this));
    }
    /**
     * Execute the structure reorganization command
     */
    async executeCommand() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const filePath = editor.document.uri.fsPath;
        const fileName = path.basename(filePath);
        try {
            // Show progress indication
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Analyzing code structure in ${fileName}...`,
                cancellable: false
            }, async (progress) => {
                // Analyze the structure
                progress.report({ message: 'Analyzing code structure...' });
                const analysisResult = await this.structureReorganizer.analyzeFileStructure(filePath);
                // Generate reorganization proposal
                progress.report({ message: 'Generating reorganization proposal...' });
                const proposal = await this.structureReorganizer.proposeReorganization(filePath);
                // If there are no suggestions, inform the user and exit
                if (proposal.changes.length === 0) {
                    vscode.window.showInformationMessage('No structure improvements suggested for this file.');
                    return;
                }
                // Show the reorganization proposal to the user
                progress.report({ message: 'Preparing proposal preview...' });
                // Create a diff view to show the changes
                const originalUri = editor.document.uri;
                const proposalUri = originalUri.with({ scheme: 'proposed-reorganization' });
                // Register a content provider for the virtual document
                const proposalProvider = new class {
                    onDidChangeEmitter = new vscode.EventEmitter();
                    onDidChange = this.onDidChangeEmitter.event;
                    provideTextDocumentContent(uri) {
                        return proposal.reorganizedCode;
                    }
                };
                const registration = vscode.workspace.registerTextDocumentContentProvider('proposed-reorganization', proposalProvider);
                // Show the diff
                await vscode.commands.executeCommand('vscode.diff', originalUri, proposalUri, `Structure Reorganization: ${fileName}`, { preview: true });
                // Ask if user wants to apply changes
                const applyChanges = await vscode.window.showInformationMessage(`${proposal.changes.length} structure improvements suggested. Apply changes?`, { modal: true }, 'Apply', 'Cancel');
                if (applyChanges === 'Apply') {
                    await this.structureReorganizer.applyReorganization(filePath, proposal);
                    vscode.window.showInformationMessage('Code structure reorganized successfully.');
                }
                // Dispose of the content provider registration
                registration.dispose();
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error analyzing code structure: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.StructureReorganizationCommand = StructureReorganizationCommand;
//# sourceMappingURL=structureReorganizationCommand.js.map