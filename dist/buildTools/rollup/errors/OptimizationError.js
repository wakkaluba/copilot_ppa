"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizationError = void 0;
// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\errors\OptimizationError.ts
/**
 * Error thrown when there is an issue generating optimization suggestions
 */
class OptimizationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'OptimizationError';
    }
}
exports.OptimizationError = OptimizationError;
//# sourceMappingURL=OptimizationError.js.map