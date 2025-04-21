// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\errors\ConfigDetectionError.ts
/**
 * Error thrown when there is an issue detecting Rollup configuration files
 */
export class ConfigDetectionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConfigDetectionError';
    }
}