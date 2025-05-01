// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\errors\ConfigDetectionError.ts
/**
 * Error thrown when there is an issue detecting Rollup configuration files
 */
export class ConfigDetectionError extends Error {
    public readonly code?: string;
    public readonly filePath?: string;
    public readonly metadata?: Record<string, unknown>;

    constructor(message: string, code?: string, filePath?: string, metadata?: Record<string, unknown>) {
        super(message);
        this.name = 'ConfigDetectionError';
        this.code = code;
        this.filePath = filePath;
        this.metadata = metadata;

        // Ensures proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, ConfigDetectionError.prototype);
    }
}
