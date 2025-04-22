"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisError = void 0;
// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\errors\AnalysisError.ts
/**
 * Error thrown when there is an issue analyzing Rollup configuration files
 */
class AnalysisError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AnalysisError';
    }
}
exports.AnalysisError = AnalysisError;
//# sourceMappingURL=AnalysisError.js.map