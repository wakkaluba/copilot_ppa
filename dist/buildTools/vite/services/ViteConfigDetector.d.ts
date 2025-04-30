import { ILogger } from '../../../services/logging/ILogger';
import { FileSystem } from '../../../services/FileSystem';
import { ConfigValidationError } from '../errors/ConfigValidationError';
export interface ConfigDetectionResult {
    configType: 'typescript' | 'javascript' | 'esm';
    path: string;
    isValid: boolean;
    error?: ConfigValidationError;
    dependencies?: Array<{
        name: string;
        version: string;
    }>;
    missingDependencies?: string[];
}
export declare class ViteConfigDetector {
    private readonly logger;
    private readonly fs;
    constructor(logger: ILogger, fs: FileSystem);
    detectConfig(configPath: string): Promise<ConfigDetectionResult>;
    private getConfigType;
    private analyzeDependencies;
    private extractImports;
}
