"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewChecklist = void 0;
const ReviewChecklistService_1 = require("./services/ReviewChecklistService");
class ReviewChecklist {
    service;
    constructor(context) {
        this.service = new ReviewChecklistService_1.ReviewChecklistService(context);
    }
    getAvailableChecklists() {
        return this.service.getAvailableChecklists();
    }
    getChecklist(name) {
        return this.service.getChecklist(name);
    }
    createChecklist(name, items) {
        this.service.createChecklist(name, items);
    }
    generateReport(checklistName, filePaths, reviewerId) {
        return this.service.generateReport(checklistName, filePaths, reviewerId);
    }
    updateReport(reportId, results, summary, approved) {
        this.service.updateReport(reportId, results, summary, approved);
    }
    getReportHistory(limit = 10) {
        return this.service.getReportHistory(limit);
    }
    exportReportToHtml(reportId) {
        return this.service.exportReportToHtml(reportId);
    }
}
exports.ReviewChecklist = ReviewChecklist;
//# sourceMappingURL=reviewChecklist.js.map