import * as vscode from 'vscode';
type DocumentCallback = (document: vscode.TextDocument) => void;
type EditorCallback = (editor?: vscode.TextEditor) => void;
export declare class PerformanceFileMonitorService implements vscode.Disposable {
    private readonly disposables;
    private readonly documentCallbacks;
    private readonly editorCallbacks;
    private readonly throttleMap;
    constructor();
    findAnalyzableFiles(): Promise<vscode.Uri[]>;
    onDocumentSaved(callback: DocumentCallback): void;
    onActiveEditorChanged(callback: EditorCallback): void;
    throttleDocumentChange(document: vscode.TextDocument, callback: () => Promise<void>): void;
    private notifyDocumentSaved;
    private notifyEditorChanged;
    dispose(): void;
}
export {};
