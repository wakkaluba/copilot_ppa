import * as glob from 'glob';
import * as path from 'path';
import { ILogger } from '../../../services/logging/ILogger';
import { ConfigValidationError } from '../errors/ConfigValidationError';
import { IRollupConfigDetector } from '../types';
import * as fs from 'fs';

/**
 * Default logger implementation that does nothing
 */
class NoOpLogger implements ILogger {
    debug(): void {}
    info(): void {}
    warn(): void {}
    error(): void {}
}

export class RollupConfigDetector implements IRollupConfigDetector {
    private readonly configPatterns = [
        'rollup.config.js',
        'rollup.*.config.js',
        '*rollup.config.js',
        '*rollup*.js',
        'rollup.config.ts',
        'rollup.*.config.ts',
        '*rollup.config.ts',
        '*rollup*.ts',
        'rollup.config.mjs',
        'rollup.*.config.mjs'
    ];

    private readonly logger: ILogger;

    constructor(logger?: ILogger) {
        this.logger = logger || new NoOpLogger();
    }

    /**
     * Detects rollup configuration files in the given directory
     * @param workspacePath Directory to search for rollup configs
     * @returns Array of absolute paths to rollup config files
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        this.logger.debug(`Searching for rollup configs in ${workspacePath}`);

        try {
            const configs = new Set<string>();

            for (const pattern of this.configPatterns) {
                const matches = await this.findFiles(pattern, workspacePath);
                matches.forEach(match => configs.add(path.resolve(workspacePath, match)));
            }

            const configArray = Array.from(configs);
            this.logger.debug(`Found ${configArray.length} rollup config files`);
            return configArray;
        } catch (error) {
            this.logger.error('Error detecting rollup configs:', error);
            throw new Error(`Failed to detect rollup configurations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Finds files matching the given pattern in the workspace
     * @param pattern Glob pattern to match
     * @param cwd Directory to search in
     */
    private findFiles(pattern: string, cwd: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            glob(pattern, { cwd }, (err, matches) => {
                if (err) {
                    this.logger.error(`Error searching for pattern ${pattern}:`, err);
                    reject(err);
                } else {
                    resolve(matches);
                }
            });
        });
    }

    /**
     * Validates if a file is a rollup config
     * @param filePath Path to the file to validate
     * @returns true if the file appears to be a rollup config
     */
    public async validateConfigFile(filePath: string): Promise<boolean> {
        this.logger.debug(`Validating rollup config file: ${filePath}`);
        
        try {
            // Check if the file matches any of our patterns
            const fileName = path.basename(filePath);
            const isMatch = this.configPatterns.some(pattern => 
                new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$').test(fileName)
            );

            if (!isMatch) {
                this.logger.debug(`File ${fileName} does not match rollup config patterns`);
                return false;
            }

            // Additional validation could be added here, like checking file contents
            // for rollup-specific keywords or importing the config to validate it

            return true;
        } catch (error) {
            this.logger.error('Error validating rollup config file:', error);
            throw new Error(`Failed to validate rollup configuration file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Gets the default config pattern for a given language
     * @param language The programming language (js, ts, etc.)
     * @returns The default config pattern for that language
     */
    public getDefaultConfigPattern(language: string): string {
        const patterns: Record<string, string> = {
            'js': 'rollup.config.js',
            'ts': 'rollup.config.ts',
            'mjs': 'rollup.config.mjs'
        };

        return patterns[language] || patterns['js'];
    }
}