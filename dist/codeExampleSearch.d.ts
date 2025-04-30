import * as vscode from 'vscode';
export declare class CodeExampleSearch {
    private service;
    constructor(context: vscode.ExtensionContext);
    searchExamples(query: string, language: string): Promise<CodeExample[]>;
    showExampleUI(examples: CodeExample[]): Promise<void>;
}
export interface CodeExample {
    id: string;
    filename: string;
    content: string;
    language: string;
    url: string;
    repository: string;
    relevanceScore: number;
}
