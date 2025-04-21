import * as vscode from 'vscode';
import { CodeExampleSearchService } from './services/CodeExampleSearchService';

export class CodeExampleSearch {
    private service: CodeExampleSearchService;

    constructor(context: vscode.ExtensionContext) {
        this.service = new CodeExampleSearchService(context);
    }

    public async searchExamples(query: string, language: string): Promise<CodeExample[]> {
        return this.service.searchExamples(query, language);
    }

    public async showExampleUI(examples: CodeExample[]): Promise<void> {
        return this.service.showExampleUI(examples);
    }
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
