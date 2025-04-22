"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigDetectionError = void 0;
// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\errors\ConfigDetectionError.ts
/**
 * Error thrown when there is an issue detecting Rollup configuration files
 */
class ConfigDetectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfigDetectionError';
    }
}
exports.ConfigDetectionError = ConfigDetectionError;
//# sourceMappingURL=ConfigDetectionError.js.map