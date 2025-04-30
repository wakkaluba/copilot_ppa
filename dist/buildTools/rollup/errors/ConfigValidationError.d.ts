export declare class ConfigValidationError extends Error {
    readonly configPath: string;
    readonly validationErrors: string[];
    constructor(message: string, configPath: string, validationErrors: string[]);
}
