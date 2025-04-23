"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewChecklist = void 0;
const ReviewChecklistService_1 = require("./services/ReviewChecklistService");
const ReviewChecklistError_1 = require("./errors/ReviewChecklistError");
const LoggerService_1 = require("../services/LoggerService");
/**
 * Manages code review checklists and report generation with comprehensive error handling
 */
class ReviewChecklist {
    service;
    logger;
    disposables = [];
    constructor(context) {
        this.service = new ReviewChecklistService_1.ReviewChecklistService(context);
        this.logger = LoggerService_1.LoggerService.getInstance();
    }
    /**
     * Gets all available checklist templates
     * @throws {ReviewChecklistError} If templates cannot be retrieved
     */
    getAvailableChecklists() {
        try {
            return this.service.getAvailableChecklists();
        }
        catch (error) {
            this.handleError('Failed to get available checklists', error);
            return [];
        }
    }
    /**
     * Gets a specific checklist by name
     * @param name The name of the checklist to retrieve
     * @throws {ReviewChecklistError} If checklist cannot be found or retrieved
     */
    getChecklist(name) {
        try {
            return this.service.getChecklist(name);
        }
        catch (error) {
            this.handleError(`Failed to get checklist: ${name}`, error);
            return undefined;
        }
    }
    /**
     * Creates a new checklist template
     * @param name The name for the new checklist
     * @param items The checklist items to include
     * @throws {ReviewChecklistError} If checklist creation fails
     */
    createChecklist(name, items) {
        try {
            this.validateChecklistItems(items);
            this.service.createChecklist(name, items);
        }
        catch (error) {
            this.handleError(`Failed to create checklist: ${name}`, error);
        }
    }
    /**
     * Generates a new review report
     * @param checklistName The checklist template to use
     * @param filePaths Files to be reviewed
     * @param reviewerId ID of the reviewer
     * @throws {ReviewChecklistError} If report generation fails
     */
    generateReport(checklistName, filePaths, reviewerId) {
        try {
            return this.service.generateReport(checklistName, filePaths, reviewerId);
        }
        catch (error) {
            this.handleError('Failed to generate report', error);
            return this.createEmptyReport(checklistName, filePaths, reviewerId);
        }
    }
    /**
     * Updates an existing review report
     * @param reportId ID of the report to update
     * @param results Review results for checklist items
     * @param summary Overall review summary
     * @param approved Whether the review was approved
     * @throws {ReviewChecklistError} If report update fails
     */
    updateReport(reportId, results, summary, approved) {
        try {
            this.validateResults(results);
            this.service.updateReport(reportId, results, summary, approved);
        }
        catch (error) {
            this.handleError(`Failed to update report: ${reportId}`, error);
        }
    }
    /**
     * Gets recent review reports
     * @param limit Maximum number of reports to return
     * @throws {ReviewChecklistError} If report retrieval fails
     */
    getReportHistory(limit = 10) {
        try {
            return this.service.getReportHistory(limit);
        }
        catch (error) {
            this.handleError('Failed to get report history', error);
            return [];
        }
    }
    /**
     * Exports a report to HTML format
     * @param reportId ID of the report to export
     * @throws {ReviewChecklistError} If report export fails
     */
    exportReportToHtml(reportId) {
        try {
            return this.service.exportReportToHtml(reportId);
        }
        catch (error) {
            this.handleError(`Failed to export report: ${reportId}`, error);
            return this.createErrorReport(reportId);
        }
    }
    /**
     * Cleans up resources
     */
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
    }
    validateChecklistItems(items) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new ReviewChecklistError_1.ReviewChecklistError('Checklist items must be a non-empty array');
        }
        items.forEach(item => {
            if (!item.id || !item.description) {
                throw new ReviewChecklistError_1.ReviewChecklistError('Each checklist item must have an id and description');
            }
        });
    }
    validateResults(results) {
        if (!Array.isArray(results)) {
            throw new ReviewChecklistError_1.ReviewChecklistError('Results must be an array');
        }
        results.forEach(result => {
            if (!result.itemId || typeof result.passed !== 'boolean') {
                throw new ReviewChecklistError_1.ReviewChecklistError('Each result must have an itemId and passed status');
            }
        });
    }
    createEmptyReport(checklistName, filePaths, reviewerId) {
        return {
            id: `error-${Date.now()}`,
            checklistName,
            filePaths,
            reviewerId,
            results: [],
            summary: 'Error generating report',
            approved: false,
            timestamp: new Date().toISOString()
        };
    }
    createErrorReport(reportId) {
        return `
            <html>
                <body>
                    <h1>Error Exporting Report</h1>
                    <p>Failed to export report ID: ${reportId}</p>
                    <p>Please try again or contact support if the issue persists.</p>
                </body>
            </html>
        `;
    }
    handleError(message, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`ReviewChecklist: ${message}`, errorMessage);
        throw new ReviewChecklistError_1.ReviewChecklistError(`${message}: ${errorMessage}`);
    }
}
exports.ReviewChecklist = ReviewChecklist;
//# sourceMappingURL=reviewChecklist.js.map