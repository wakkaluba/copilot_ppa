import * as glob from 'glob';
import { ILogger } from '../../../services/logging/ILogger';

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

    constructor(private readonly logger: ILogger) {}

    /**
     * Detects webpack configuration files in the given directory
     * @param workspacePath The root directory to search for webpack configs
     * @returns Array of absolute paths to webpack config files
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        this.logger.debug(`Detecting webpack configs in ${workspacePath}`);
        
        try {
            const configs = new Set<string>();

            for (const pattern of this.configPatterns) {
                const matches = await this.findFiles(workspacePath, pattern);
                matches.forEach(match => configs.add(match));
            }

            const uniqueConfigs = [...configs];
            this.logger.debug(`Found ${uniqueConfigs.length} webpack config files`);
            return uniqueConfigs;
        } catch (error) {
            this.logger.error('Error detecting webpack configs:', error);
            throw new Error(`Failed to detect webpack configurations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private findFiles(workspacePath: string, pattern: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const globInstance = glob.default || glob;
            globInstance(pattern, { 
                cwd: workspacePath,
                absolute: true,
                ignore: ['**/node_modules/**']
            }, (error: Error | null, matches: string[]) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(matches);
                }
            });
        });
    }
}