"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewChecklist = void 0;
var ReviewChecklistService_1 = require("./services/ReviewChecklistService");
var ReviewChecklistError_1 = require("./errors/ReviewChecklistError");
var LoggerService_1 = require("../services/LoggerService");
/**
 * Manages code review checklists and report generation with comprehensive error handling
 */
var ReviewChecklist = /** @class */ (function () {
    function ReviewChecklist(context) {
        this.disposables = [];
        this.service = new ReviewChecklistService_1.ReviewChecklistService(context);
        this.logger = LoggerService_1.LoggerService.getInstance();
    }
    /**
     * Gets all available checklist templates
     * @throws {ReviewChecklistError} If templates cannot be retrieved
     */
    ReviewChecklist.prototype.getAvailableChecklists = function () {
        try {
            return this.service.getAvailableChecklists();
        }
        catch (error) {
            this.handleError('Failed to get available checklists', error);
            return [];
        }
    };
    /**
     * Gets a specific checklist by name
     * @param name The name of the checklist to retrieve
     * @throws {ReviewChecklistError} If checklist cannot be found or retrieved
     */
    ReviewChecklist.prototype.getChecklist = function (name) {
        try {
            return this.service.getChecklist(name);
        }
        catch (error) {
            this.handleError("Failed to get checklist: ".concat(name), error);
            return undefined;
        }
    };
    /**
     * Creates a new checklist template
     * @param name The name for the new checklist
     * @param items The checklist items to include
     * @throws {ReviewChecklistError} If checklist creation fails
     */
    ReviewChecklist.prototype.createChecklist = function (name, items) {
        try {
            this.validateChecklistItems(items);
            this.service.createChecklist(name, items);
        }
        catch (error) {
            this.handleError("Failed to create checklist: ".concat(name), error);
        }
    };
    /**
     * Generates a new review report
     * @param checklistName The checklist template to use
     * @param filePaths Files to be reviewed
     * @param reviewerId ID of the reviewer
     * @throws {ReviewChecklistError} If report generation fails
     */
    ReviewChecklist.prototype.generateReport = function (checklistName, filePaths, reviewerId) {
        try {
            return this.service.generateReport(checklistName, filePaths, reviewerId);
        }
        catch (error) {
            this.handleError('Failed to generate report', error);
            return this.createEmptyReport(checklistName, filePaths, reviewerId);
        }
    };
    /**
     * Updates an existing review report
     * @param reportId ID of the report to update
     * @param results Review results for checklist items
     * @param summary Overall review summary
     * @param approved Whether the review was approved
     * @throws {ReviewChecklistError} If report update fails
     */
    ReviewChecklist.prototype.updateReport = function (reportId, results, summary, approved) {
        try {
            this.validateResults(results);
            this.service.updateReport(reportId, results, summary, approved);
        }
        catch (error) {
            this.handleError("Failed to update report: ".concat(reportId), error);
        }
    };
    /**
     * Gets recent review reports
     * @param limit Maximum number of reports to return
     * @throws {ReviewChecklistError} If report retrieval fails
     */
    ReviewChecklist.prototype.getReportHistory = function (limit) {
        if (limit === void 0) { limit = 10; }
        try {
            return this.service.getReportHistory(limit);
        }
        catch (error) {
            this.handleError('Failed to get report history', error);
            return [];
        }
    };
    /**
     * Exports a report to HTML format
     * @param reportId ID of the report to export
     * @throws {ReviewChecklistError} If report export fails
     */
    ReviewChecklist.prototype.exportReportToHtml = function (reportId) {
        try {
            return this.service.exportReportToHtml(reportId);
        }
        catch (error) {
            this.handleError("Failed to export report: ".concat(reportId), error);
            return this.createErrorReport(reportId);
        }
    };
    /**
     * Cleans up resources
     */
    ReviewChecklist.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables.length = 0;
    };
    ReviewChecklist.prototype.validateChecklistItems = function (items) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new ReviewChecklistError_1.ReviewChecklistError('Checklist items must be a non-empty array');
        }
        items.forEach(function (item) {
            if (!item.id || !item.description) {
                throw new ReviewChecklistError_1.ReviewChecklistError('Each checklist item must have an id and description');
            }
        });
    };
    ReviewChecklist.prototype.validateResults = function (results) {
        if (!Array.isArray(results)) {
            throw new ReviewChecklistError_1.ReviewChecklistError('Results must be an array');
        }
        results.forEach(function (result) {
            if (!result.itemId || typeof result.passed !== 'boolean') {
                throw new ReviewChecklistError_1.ReviewChecklistError('Each result must have an itemId and passed status');
            }
        });
    };
    ReviewChecklist.prototype.createEmptyReport = function (checklistName, filePaths, reviewerId) {
        return {
            id: "error-".concat(Date.now()),
            checklistName: checklistName,
            filePaths: filePaths,
            reviewerId: reviewerId,
            results: [],
            summary: 'Error generating report',
            approved: false,
            timestamp: new Date().toISOString()
        };
    };
    ReviewChecklist.prototype.createErrorReport = function (reportId) {
        return "\n            <html>\n                <body>\n                    <h1>Error Exporting Report</h1>\n                    <p>Failed to export report ID: ".concat(reportId, "</p>\n                    <p>Please try again or contact support if the issue persists.</p>\n                </body>\n            </html>\n        ");
    };
    ReviewChecklist.prototype.handleError = function (message, error) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error("ReviewChecklist: ".concat(message), errorMessage);
        throw new ReviewChecklistError_1.ReviewChecklistError("".concat(message, ": ").concat(errorMessage));
    };
    return ReviewChecklist;
}());
exports.ReviewChecklist = ReviewChecklist;
