import * as fs from 'fs';
import * as path from 'path';
import { ILogger } from '../../../services/logging/ILogger';
import { RollupConfigAnalysis, RollupInput, RollupOutput, RollupPlugin, IRollupConfigAnalyzer } from '../types';
import { ConfigValidationError } from '../errors/ConfigValidationError';

export class RollupConfigAnalyzer implements IRollupConfigAnalyzer {
    constructor(private readonly logger: ILogger) {}

    /**
     * Analyzes a Rollup configuration file
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If analysis fails
     */
    public async analyze(configPath: string): Promise<RollupConfigAnalysis> {
        try {
            const content = await fs.promises.readFile(configPath, 'utf-8');
            
            const analysis: RollupConfigAnalysis = {
                input: this.analyzeInput(content, path.dirname(configPath)),
                output: this.analyzeOutput(content),
                plugins: this.analyzePlugins(content),
                external: this.analyzeExternals(content),
                content,
                optimizationSuggestions: []
            };

            this.logger.debug(`Analyzed Rollup config at ${configPath}:`, analysis);
            return analysis;
        } catch (error) {
            if (error instanceof ConfigValidationError) {
                throw error;
            }
            this.logger.error('Failed to analyze Rollup config:', error);
            throw new Error(`Failed to analyze Rollup config: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Analyzes input configuration
     * @throws {ConfigValidationError} If input configuration is invalid
     */
    private analyzeInput(content: string, basePath: string): RollupInput[] {
        const inputs: RollupInput[] = [];
        
        // Match input as string
        const singleInputMatch = content.match(/input\s*:\s*['"]([^'"]*)['"]/);
        if (singleInputMatch?.[1]) {
            inputs.push({
                name: path.basename(singleInputMatch[1]),
                path: path.resolve(basePath, singleInputMatch[1])
            });
            return inputs;
        }

        // Match input as object
        const objectInputMatch = content.match(/input\s*:\s*{([^}]*)}/);
        if (objectInputMatch?.[1]) {
            const inputContent = objectInputMatch[1];
            const entries = Array.from(inputContent.matchAll(/['"]([^'"]*)['"]\s*:\s*['"]([^'"]*)['"]/g));
            
            for (const entry of entries) {
                const [, name, filePath] = entry;
                if (name && filePath) {
                    inputs.push({
                        name,
                        path: path.resolve(basePath, filePath)
                    });
                }
            }
            return inputs;
        }

        // Match input as array
        const arrayInputMatch = content.match(/input\s*:\s*\[([^\]]*)\]/);
        if (arrayInputMatch?.[1]) {
            const inputContent = arrayInputMatch[1];
            const entries = Array.from(inputContent.matchAll(/['"]([^'"]*)['"]/g));
            
            for (const entry of entries) {
                const [, filePath] = entry;
                if (filePath) {
                    inputs.push({
                        name: path.basename(filePath),
                        path: path.resolve(basePath, filePath)
                    });
                }
            }
            return inputs;
        }

        throw new ConfigValidationError('No valid input configuration found');
    }

    /**
     * Analyzes output configuration
     * @throws {ConfigValidationError} If output configuration is invalid
     */
    private analyzeOutput(content: string): RollupOutput[] {
        const outputs: RollupOutput[] = [];

        // Match single output object
        const singleOutputMatch = content.match(/output\s*:\s*({[^}]*})/);
        if (singleOutputMatch?.[1]) {
            outputs.push(this.parseOutputObject(singleOutputMatch[1]));
            return outputs;
        }

        // Match output array
        const arrayOutputMatch = content.match(/output\s*:\s*\[([\s\S]*?)\]/);
        if (arrayOutputMatch?.[1]) {
            const outputContent = arrayOutputMatch[1];
            const outputObjects = this.extractObjects(outputContent);
            
            for (const obj of outputObjects) {
                outputs.push(this.parseOutputObject(obj));
            }
            return outputs;
        }

        throw new ConfigValidationError('No valid output configuration found');
    }

    /**
     * Analyzes plugin configuration
     */
    private analyzePlugins(content: string): RollupPlugin[] {
        const plugins: RollupPlugin[] = [];
        const pluginsMatch = content.match(/plugins\s*:\s*\[([\s\S]*?)\]/);
        
        if (pluginsMatch?.[1]) {
            const pluginContent = pluginsMatch[1];
            // Match plugin function calls
            const pluginMatches = Array.from(pluginContent.matchAll(/(\w+)\s*\([^)]*\)/g));
            
            for (const match of pluginMatches) {
                const [, name] = match;
                if (name) {
                    plugins.push({
                        name,
                        description: this.getPluginDescription(name)
                    });
                }
            }
        }

        return plugins;
    }

    /**
     * Analyzes external dependencies
     */
    private analyzeExternals(content: string): string[] {
        const externals: string[] = [];
        
        // Match external array
        const arrayMatch = content.match(/external\s*:\s*\[([\s\S]*?)\]/);
        if (arrayMatch?.[1]) {
            const matches = Array.from(arrayMatch[1].matchAll(/['"]([^'"]*)['"]/g));
            externals.push(...matches.map(m => m[1]).filter((dep): dep is string => !!dep));
        }

        // Match external function
        const funcMatch = content.match(/external\s*:\s*\(\s*id\s*\)\s*=>\s*{([^}]*)}/);
        if (funcMatch?.[1]) {
            const matches = Array.from(funcMatch[1].matchAll(/['"]([^'"]*)['"]/g));
            externals.push(...matches.map(m => m[1]).filter((dep): dep is string => !!dep));
        }

        return externals;
    }

    /**
     * Parses an output object configuration
     * @throws {ConfigValidationError} If output object is invalid
     */
    private parseOutputObject(outputStr: string): RollupOutput {
        const formatMatch = outputStr.match(/format\s*:\s*['"]([^'"]*)['"]/);
        const fileMatch = outputStr.match(/file\s*:\s*['"]([^'"]*)['"]/);
        const nameMatch = outputStr.match(/name\s*:\s*['"]([^'"]*)['"]/);
        const sourcemapMatch = outputStr.match(/sourcemap\s*:\s*(true|false)/);

        if (!formatMatch?.[1] || !fileMatch?.[1]) {
            throw new ConfigValidationError(`Invalid output configuration: ${outputStr}`);
        }

        const output: RollupOutput = {
            format: formatMatch[1],
            file: fileMatch[1]
        };

        if (nameMatch?.[1]) {
            output.name = nameMatch[1];
        }

        if (sourcemapMatch) {
            output.sourcemap = sourcemapMatch[1] === 'true';
        }

        return output;
    }

    /**
     * Extracts objects from a string containing multiple JavaScript objects
     */
    private extractObjects(str: string): string[] {
        const objects: string[] = [];
        let depth = 0;
        let start = -1;
        
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '{') {
                if (depth === 0) {
                    start = i;
                }
                depth++;
            } else if (str[i] === '}') {
                depth--;
                if (depth === 0 && start !== -1) {
                    objects.push(str.substring(start, i + 1));
                    start = -1;
                }
            }
        }
        
        return objects;
    }

    /**
     * Returns a description for a known Rollup plugin
     */
    private getPluginDescription(name: string): string {
        const descriptions: Record<string, string> = {
            typescript: 'Adds TypeScript support',
            resolve: 'Resolves module imports',
            commonjs: 'Converts CommonJS modules to ES6',
            json: 'Allows importing JSON files',
            terser: 'Minifies the bundle',
            babel: 'Transpiles code with Babel',
            replace: 'Replaces strings in the code',
            postcss: 'Processes CSS with PostCSS',
            url: 'Handles file imports as data URIs or files',
            image: 'Imports images as data URIs or files',
            visualizer: 'Visualizes bundle content',
            filesize: 'Reports bundle size',
            serve: 'Development server',
            livereload: 'Reloads browser on changes'
        };

        return descriptions[name] || 'Custom plugin';
    }
}