import * as vscode from 'vscode';

type DocumentCallback = (document: vscode.TextDocument) => void;
type EditorCallback = (editor?: vscode.TextEditor) => void;

export class PerformanceFileMonitorService implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];
    private readonly documentCallbacks = new Set<DocumentCallback>();
    private readonly editorCallbacks = new Set<EditorCallback>();
    private readonly throttleMap = new Map<string, NodeJS.Timeout>();

    constructor() {
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument(doc => this.notifyDocumentSaved(doc)),
            vscode.window.onDidChangeActiveTextEditor(editor => this.notifyEditorChanged(editor))
        );
    }

    public async findAnalyzableFiles(): Promise<vscode.Uri[]> {
        if (!vscode.workspace.workspaceFolders) {
            return [];
        }

        const files = await vscode.workspace.findFiles(
            '**/*.{js,jsx,ts,tsx,vue,java,py,cs,go}',
            '**/node_modules/**'
        );

        return files;
    }

    public onDocumentSaved(callback: DocumentCallback): void {
        this.documentCallbacks.add(callback);
    }

    public onActiveEditorChanged(callback: EditorCallback): void {
        this.editorCallbacks.add(callback);
    }

    public throttleDocumentChange(document: vscode.TextDocument, callback: () => Promise<void>): void {
        const key = document.uri.toString();
        const existingTimeout = this.throttleMap.get(key);
        
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        this.throttleMap.set(key, setTimeout(async () => {
            try {
                await callback();
            } catch (error) {
                console.error('Error in throttled document change handler:', error);
            } finally {
                this.throttleMap.delete(key);
            }
        }, 500));
    }

    private notifyDocumentSaved(document: vscode.TextDocument): void {
        this.documentCallbacks.forEach(callback => {
            try {
                callback(document);
            } catch (error) {
                console.error('Error in document saved callback:', error);
            }
        });
    }

    private notifyEditorChanged(editor?: vscode.TextEditor): void {
        this.editorCallbacks.forEach(callback => {
            try {
                callback(editor);
            } catch (error) {
                console.error('Error in editor changed callback:', error);
            }
        });
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.throttleMap.forEach(timeout => clearTimeout(timeout));
        this.throttleMap.clear();
        this.documentCallbacks.clear();
        this.editorCallbacks.clear();
    }
}