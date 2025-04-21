import * as vscode from 'vscode';
import * as path from 'path';
import { BestPracticesService } from './services/BestPracticesService';

export interface BestPracticeIssue {
    file: string;
    line: number;
    column: number;
    severity: 'suggestion' | 'warning' | 'error';
    description: string;
    recommendation: string;
    category: 'antiPattern' | 'design' | 'consistency' | 'documentation' | 'naming';
}

export class BestPracticesChecker {
    private service: BestPracticesService;

    constructor(context: vscode.ExtensionContext) {
        this.service = new BestPracticesService(context);
    }

    public detectAntiPatterns(document: vscode.TextDocument): BestPracticeIssue[] {
        return this.service.detectAntiPatterns(document);
    }

    public suggestDesignImprovements(document: vscode.TextDocument): BestPracticeIssue[] {
        return this.service.suggestDesignImprovements(document);
    }

    public checkCodeConsistency(document: vscode.TextDocument): BestPracticeIssue[] {
        return this.service.checkCodeConsistency(document);
    }
}
