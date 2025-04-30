import * as vscode from 'vscode';
import { ChecklistItem, ReviewResult, Report } from './types';
/**
 * Manages code review checklists and report generation with comprehensive error handling
 */
export declare class ReviewChecklist {
    private readonly service;
    private readonly logger;
    private readonly disposables;
    constructor(context: vscode.ExtensionContext);
    /**
     * Gets all available checklist templates
     * @throws {ReviewChecklistError} If templates cannot be retrieved
     */
    getAvailableChecklists(): string[];
    /**
     * Gets a specific checklist by name
     * @param name The name of the checklist to retrieve
     * @throws {ReviewChecklistError} If checklist cannot be found or retrieved
     */
    getChecklist(name: string): ChecklistItem[] | undefined;
    /**
     * Creates a new checklist template
     * @param name The name for the new checklist
     * @param items The checklist items to include
     * @throws {ReviewChecklistError} If checklist creation fails
     */
    createChecklist(name: string, items: ChecklistItem[]): void;
    /**
     * Generates a new review report
     * @param checklistName The checklist template to use
     * @param filePaths Files to be reviewed
     * @param reviewerId ID of the reviewer
     * @throws {ReviewChecklistError} If report generation fails
     */
    generateReport(checklistName: string, filePaths: string[], reviewerId: string): Report;
    /**
     * Updates an existing review report
     * @param reportId ID of the report to update
     * @param results Review results for checklist items
     * @param summary Overall review summary
     * @param approved Whether the review was approved
     * @throws {ReviewChecklistError} If report update fails
     */
    updateReport(reportId: string, results: ReviewResult[], summary: string, approved: boolean): void;
    /**
     * Gets recent review reports
     * @param limit Maximum number of reports to return
     * @throws {ReviewChecklistError} If report retrieval fails
     */
    getReportHistory(limit?: number): Report[];
    /**
     * Exports a report to HTML format
     * @param reportId ID of the report to export
     * @throws {ReviewChecklistError} If report export fails
     */
    exportReportToHtml(reportId: string): string;
    /**
     * Cleans up resources
     */
    dispose(): void;
    private validateChecklistItems;
    private validateResults;
    private createEmptyReport;
    private createErrorReport;
    private handleError;
}
