import * as vscode from 'vscode';
import { CommandToggleManager } from './commandToggleManager';

/**
 * Adds command prefixes to messages based on toggle states
 */
export class CommandPrefixer {
    private toggleManager: CommandToggleManager;
    
    constructor(context: vscode.ExtensionContext) {
        this.toggleManager = CommandToggleManager.getInstance(context);
    }
    
    /**
     * Add active command prefixes to a message
     */
    public prefixMessage(message: string): string {
        const prefix = this.toggleManager.getActiveTogglesPrefix();
        return prefix + message;
    }
    
    /**
     * Register command decorators for a text editor
     */
    public registerCommandDecorators(editor: vscode.TextEditor): vscode.Disposable[] {
        const disposables: vscode.Disposable[] = [];
        const decorationType = vscode.window.createTextEditorDecorationType({
            light: {
                backgroundColor: 'rgba(0, 122, 204, 0.1)',
                borderRadius: '3px',
                fontWeight: 'bold',
                color: '#0078d4'
            },
            dark: {
                backgroundColor: 'rgba(14, 99, 156, 0.2)',
                borderRadius: '3px',
                fontWeight: 'bold',
                color: '#3794ff'
            }
        });
        
        // Update decorations initially and on document changes
        const updateDecorations = () => {
            const text = editor.document.getText();
            const commandPatterns = [
                /@workspace\b/g,
                /\/codebase\b/g,
                /!verbose\b/g,
                /#repo\b/g,
                /&debug\b/g
            ];
            
            const decorations: vscode.DecorationOptions[] = [];
            
            commandPatterns.forEach(pattern => {
                let match;
                while ((match = pattern.exec(text))) {
                    const startPos = editor.document.positionAt(match.index);
                    const endPos = editor.document.positionAt(match.index + match[0].length);
                    
                    decorations.push({
                        range: new vscode.Range(startPos, endPos),
                        hoverMessage: 'Command prefix'
                    });
                }
            });
            
            editor.setDecorations(decorationType, decorations);
        };
        
        // Update decorations on change
        const changeDisposable = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document === editor.document) {
                updateDecorations();
            }
        });
        
        disposables.push(changeDisposable);
        disposables.push({
            dispose: () => {
                editor.setDecorations(decorationType, []);
                decorationType.dispose();
            }
        });
        
        // Initial update
        updateDecorations();
        
        return disposables;
    }
}
