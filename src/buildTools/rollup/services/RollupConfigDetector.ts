import { ILogger } from '../../../services/logging/ILogger';
import { ConfigValidationError } from '../errors/ConfigValidationError';
import { IRollupConfigDetector } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import glob = require('glob');

export class RollupConfigDetector implements IRollupConfigDetector {
    private readonly configPatterns = [
        'rollup.config.js',
        'rollup.config.mjs',
        'rollup.config.ts',
        'rollup.*.js',
        'rollup.*.mjs',
        'rollup.*.ts'
    ];

    constructor(private readonly logger: ILogger) {}

    /**
     * Detects Rollup configuration files in the given directory
     * @throws {ConfigValidationError} If workspace path is invalid
     * @throws {Error} If detection fails
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        try {
            this.validateWorkspacePath(workspacePath);

            const configPromises = this.configPatterns.map(pattern => 
                this.findConfigFiles(workspacePath, pattern)
            );

            const configLists = await Promise.all(configPromises);
            const configs = Array.from(new Set(configLists.flat())).sort();

            if (configs.length === 0) {
                this.logger.warn(`No Rollup configuration files found in ${workspacePath}`);
            } else {
                this.logger.info(`Found ${configs.length} Rollup configuration file(s) in ${workspacePath}`);
                configs.forEach(config => this.logger.debug(`Found config: ${config}`));
            }

            // Filter out invalid config files
            const validConfigs = await Promise.all(
                configs.map(async config => {
                    const isValid = await this.isValidConfigFile(config);
                    return isValid ? config : null;
                })
            );

            return validConfigs.filter((config): config is string => config !== null);
        } catch (error) {
            if (error instanceof ConfigValidationError) {
                throw error;
            }
            this.logger.error('Error detecting Rollup configs:', error);
            throw new Error(`Failed to detect Rollup configs: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Finds configuration files matching a pattern
     */
    private findConfigFiles(workspacePath: string, pattern: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            glob(pattern, {
                cwd: workspacePath,
                absolute: true,
                nodir: true,
                ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
            }, (error: Error | null, files: string[]) => {
                if (error) {
                    this.logger.error(`Error finding config files with pattern ${pattern}:`, error);
                    reject(error);
                } else {
                    resolve(files);
                }
            });
        });
    }

    /**
     * Validates the workspace path
     * @throws {ConfigValidationError} If the path is invalid
     */
    private validateWorkspacePath(workspacePath: string): void {
        if (!workspacePath) {
            throw new ConfigValidationError('No workspace path provided');
        }

        if (!path.isAbsolute(workspacePath)) {
            throw new ConfigValidationError('Workspace path must be absolute');
        }

        try {
            const stats = fs.statSync(workspacePath);
            if (!stats.isDirectory()) {
                throw new ConfigValidationError(`Workspace path is not a directory: ${workspacePath}`);
            }
        } catch (error) {
            if (error instanceof ConfigValidationError) {
                throw error;
            }
            throw new ConfigValidationError(`Invalid workspace path: ${workspacePath}`);
        }
    }

    /**
     * Checks if a file is a valid Rollup config file
     */
    private async isValidConfigFile(filePath: string): Promise<boolean> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            
            // Check for common Rollup config patterns
            const hasRollupConfig = content.includes('export default') && (
                content.includes('rollup') ||
                content.includes('input:') ||
                content.includes('output:') ||
                content.includes('plugins:')
            );

            return hasRollupConfig;
        } catch (error) {
            this.logger.warn(`Error reading potential config file ${filePath}:`, error);
            return false;
        }
    }
}