import * as glob from 'glob';
import * as path from 'path';
import { ILogger } from '../../../services/logging/ILogger';

/**
 * Default logger implementation that does nothing
 */
class NoOpLogger implements ILogger {
    debug(): void {}
    info(): void {}
    warn(): void {}
    error(): void {}
}

export class WebpackConfigDetector {
    private readonly configPatterns = [
        'webpack.config.js',
        'webpack.*.config.js',
        '*webpack.config.js',
        '*webpack*.js',
        'webpack.config.ts',
        'webpack.*.config.ts',
        '*webpack.config.ts',
        '*webpack*.ts'
    ];

    private readonly logger: ILogger;

    constructor(logger?: ILogger) {
        this.logger = logger || new NoOpLogger();
    }

    /**
     * Detects webpack configuration files in the given directory
     * @param workspacePath Directory to search for webpack configs
     * @returns Array of absolute paths to webpack config files
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        this.logger.debug(`Searching for webpack configs in ${workspacePath}`);

        try {
            const configs = new Set<string>();

            for (const pattern of this.configPatterns) {
                const matches = await this.findFiles(pattern, workspacePath);
                matches.forEach(match => configs.add(path.resolve(workspacePath, match)));
            }

            const configArray = Array.from(configs);
            this.logger.debug(`Found ${configArray.length} webpack config files`);
            return configArray;
        } catch (error) {
            this.logger.error('Error detecting webpack configs:', error);
            throw new Error(`Failed to detect webpack configurations: ${error instanceof Error ? error.message : String(error)}`);
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
     * Validates if a file is a webpack config
     * @param filePath Path to the file to validate
     * @returns true if the file appears to be a webpack config
     */
    public async validateConfigFile(filePath: string): Promise<boolean> {
        this.logger.debug(`Validating webpack config file: ${filePath}`);
        
        try {
            // Check if the file matches any of our patterns
            const fileName = path.basename(filePath);
            const isMatch = this.configPatterns.some(pattern => 
                new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$').test(fileName)
            );

            if (!isMatch) {
                this.logger.debug(`File ${fileName} does not match webpack config patterns`);
                return false;
            }

            // Additional validation could be added here, like checking file contents
            // for webpack-specific keywords or importing the config to validate it

            return true;
        } catch (error) {
            this.logger.error('Error validating webpack config file:', error);
            throw new Error(`Failed to validate webpack configuration file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}