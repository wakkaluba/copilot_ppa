import * as vscode from 'vscode';
import { ReviewChecklistService } from './services/ReviewChecklistService';
import { ChecklistItem, ReviewResult, Report } from './types';

export class ReviewChecklist {
    private service: ReviewChecklistService;

    constructor(context: vscode.ExtensionContext) {
        this.service = new ReviewChecklistService(context);
    }

    public getAvailableChecklists(): string[] {
        return this.service.getAvailableChecklists();
    }

    public getChecklist(name: string): ChecklistItem[] | undefined {
        return this.service.getChecklist(name);
    }

    public createChecklist(name: string, items: ChecklistItem[]): void {
        this.service.createChecklist(name, items);
    }

    public generateReport(checklistName: string, filePaths: string[], reviewerId: string): Report {
        return this.service.generateReport(checklistName, filePaths, reviewerId);
    }

    public updateReport(reportId: string, results: ReviewResult[], summary: string, approved: boolean): void {
        this.service.updateReport(reportId, results, summary, approved);
    }

    public getReportHistory(limit: number = 10): Report[] {
        return this.service.getReportHistory(limit);
    }

    public exportReportToHtml(reportId: string): string {
        return this.service.exportReportToHtml(reportId);
    }
}
