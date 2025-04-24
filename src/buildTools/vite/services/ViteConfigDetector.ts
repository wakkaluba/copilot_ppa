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

export class ViteConfigDetector {
    constructor(
        private readonly logger: ILogger,
        private readonly fs: FileSystem
    ) {}

    async detectConfig(configPath: string): Promise<ConfigDetectionResult> {
        try {
            const exists = await this.fs.exists(configPath);
            if (!exists) {
                this.logger.warn(`Configuration file not found at ${configPath}`);
                return {
                    configType: this.getConfigType(configPath),
                    path: configPath,
                    isValid: false,
                    error: new ConfigValidationError('Configuration file not found', 'CONFIG_404')
                };
            }

            const content = await this.fs.readFile(configPath);
            const configType = this.getConfigType(configPath);
            const dependencies = await this.analyzeDependencies(configPath, content);

            return {
                configType,
                path: configPath,
                isValid: true,
                dependencies: dependencies.found,
                missingDependencies: dependencies.missing
            };
        } catch (error) {
            this.logger.error(`Error detecting Vite configuration: ${error}`);
            return {
                configType: this.getConfigType(configPath),
                path: configPath,
                isValid: false,
                error: new ConfigValidationError(
                    'Failed to parse configuration',
                    'CONFIG_500',
                    { error: error.message }
                )
            };
        }
    }

    private getConfigType(path: string): 'typescript' | 'javascript' | 'esm' {
        if (path.endsWith('.ts')) {return 'typescript';}
        if (path.endsWith('.mjs')) {return 'esm';}
        return 'javascript';
    }

    private async analyzeDependencies(configPath: string, content: string): Promise<{
        found: Array<{ name: string; version: string }>;
        missing: string[];
    }> {
        const packageJsonPath = configPath.replace(/vite\.config\.(ts|js|mjs)$/, 'package.json');
        const imports = this.extractImports(content);
        
        try {
            const packageJson = JSON.parse(await this.fs.readFile(packageJsonPath));
            const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            const found = [];
            const missing = [];

            for (const imp of imports) {
                if (allDeps[imp]) {
                    found.push({ name: imp, version: allDeps[imp] });
                } else {
                    missing.push(imp);
                }
            }

            return { found, missing };
        } catch (error) {
            this.logger.error(`Error analyzing dependencies: ${error}`);
            return { found: [], missing: [] };
        }
    }

    private extractImports(content: string): string[] {
        const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
        const matches = [...content.matchAll(importRegex)];
        return matches
            .map(match => match[1])
            .filter(imp => !imp.startsWith('.') && !imp.startsWith('/'));
    }
}