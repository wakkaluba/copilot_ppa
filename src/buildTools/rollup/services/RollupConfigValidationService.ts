import { ILogger } from '../../../services/logging/ILogger';
import { ConfigValidationError } from '../errors/ConfigValidationError';
import { RollupConfigAnalysis } from '../types';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Service responsible for validating Rollup configuration files and paths
 */
export class RollupConfigValidationService {
    constructor(private readonly logger: ILogger) {}

    /**
     * Validates the configuration analysis results
     * @throws {ConfigValidationError} If validation fails
     */
    public validateConfig(analysis: RollupConfigAnalysis): void {
        if (!analysis.input || analysis.input.length === 0) {
            throw new ConfigValidationError('No input files specified in configuration');
        }

        if (!analysis.output || analysis.output.length === 0) {
            throw new ConfigValidationError('No output configuration specified');
        }

        // Validate input paths exist
        for (const input of analysis.input) {
            if (!input.path) {
                throw new ConfigValidationError(`Invalid input configuration: ${JSON.stringify(input)}`);
            }
            if (!fs.existsSync(input.path)) {
                throw new ConfigValidationError(`Input file does not exist: ${input.path}`);
            }
        }

        // Validate output configurations
        for (const output of analysis.output) {
            if (!output.format || !output.file) {
                throw new ConfigValidationError(`Invalid output configuration: ${JSON.stringify(output)}`);
            }
            if (!['es', 'cjs', 'umd', 'amd', 'iife', 'system'].includes(output.format)) {
                throw new ConfigValidationError(`Invalid output format: ${output.format}`);
            }
        }

        this.logger.debug('Rollup configuration validation successful');
    }

    /**
     * Validates a workspace path
     * @throws {ConfigValidationError} If the path is invalid
     */
    public validateWorkspacePath(workspacePath: string): void {
        if (!workspacePath) {
            throw new ConfigValidationError('No workspace path provided');
        }
        if (!path.isAbsolute(workspacePath)) {
            throw new ConfigValidationError('Workspace path must be absolute');
        }
        if (!fs.existsSync(workspacePath)) {
            throw new ConfigValidationError(`Workspace path does not exist: ${workspacePath}`);
        }
        if (!fs.statSync(workspacePath).isDirectory()) {
            throw new ConfigValidationError(`Workspace path is not a directory: ${workspacePath}`);
        }

        this.logger.debug(`Workspace path validation successful: ${workspacePath}`);
    }

    /**
     * Validates a config file path
     * @throws {ConfigValidationError} If the path is invalid
     */
    public validateConfigPath(configPath: string): void {
        if (!configPath) {
            throw new ConfigValidationError('No config path provided');
        }
        if (!path.isAbsolute(configPath)) {
            throw new ConfigValidationError('Config path must be absolute');
        }
        if (!fs.existsSync(configPath)) {
            throw new ConfigValidationError(`Config file does not exist: ${configPath}`);
        }
        if (!fs.statSync(configPath).isFile()) {
            throw new ConfigValidationError(`Config path is not a file: ${configPath}`);
        }

        this.logger.debug(`Config path validation successful: ${configPath}`);
    }
}