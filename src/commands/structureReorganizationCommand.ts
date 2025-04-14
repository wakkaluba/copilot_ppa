import * as vscode from 'vscode';
import * as path from 'path';
import { StructureReorganizer } from '../services/refactoring/structureReorganizer';

/**
 * Command handler for code structure reorganization
 */
export class StructureReorganizationCommand {
    private structureReorganizer: StructureReorganizer;

    constructor() {
        this.structureReorganizer = new StructureReorganizer();
    }

    /**
     * Register the command with VS Code
     */
    public register(): vscode.Disposable {
        return vscode.commands.registerCommand(
            'vscodeLocalLLMAgent.reorganizeCodeStructure',
            this.executeCommand.bind(this)
        );
    }

    /**
     * Execute the structure reorganization command
     */
    private async executeCommand(): Promise<void> {
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
                const proposalProvider = new class implements vscode.TextDocumentContentProvider {
                    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
                    onDidChange = this.onDidChangeEmitter.event;
                    
                    provideTextDocumentContent(uri: vscode.Uri): string {
                        return proposal.reorganizedCode;
                    }
                };
                
                const registration = vscode.workspace.registerTextDocumentContentProvider(
                    'proposed-reorganization', 
                    proposalProvider
                );
                
                // Show the diff
                await vscode.commands.executeCommand(
                    'vscode.diff',
                    originalUri,
                    proposalUri,
                    `Structure Reorganization: ${fileName}`,
                    { preview: true }
                );
                
                // Ask if user wants to apply changes
                const applyChanges = await vscode.window.showInformationMessage(
                    `${proposal.changes.length} structure improvements suggested. Apply changes?`,
                    { modal: true },
                    'Apply',
                    'Cancel'
                );
                
                if (applyChanges === 'Apply') {
                    await this.structureReorganizer.applyReorganization(filePath, proposal);
                    vscode.window.showInformationMessage('Code structure reorganized successfully.');
                }
                
                // Dispose of the content provider registration
                registration.dispose();
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error analyzing code structure: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
