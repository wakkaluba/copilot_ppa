"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViteConfigDetector = void 0;
const ConfigValidationError_1 = require("../errors/ConfigValidationError");
class ViteConfigDetector {
    constructor(logger, fs) {
        this.logger = logger;
        this.fs = fs;
    }
    async detectConfig(configPath) {
        try {
            const exists = await this.fs.exists(configPath);
            if (!exists) {
                this.logger.warn(`Configuration file not found at ${configPath}`);
                return {
                    configType: this.getConfigType(configPath),
                    path: configPath,
                    isValid: false,
                    error: new ConfigValidationError_1.ConfigValidationError('Configuration file not found', 'CONFIG_404')
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
        }
        catch (error) {
            this.logger.error(`Error detecting Vite configuration: ${error}`);
            return {
                configType: this.getConfigType(configPath),
                path: configPath,
                isValid: false,
                error: new ConfigValidationError_1.ConfigValidationError('Failed to parse configuration', 'CONFIG_500', { error: error.message })
            };
        }
    }
    getConfigType(path) {
        if (path.endsWith('.ts')) {
            return 'typescript';
        }
        if (path.endsWith('.mjs')) {
            return 'esm';
        }
        return 'javascript';
    }
    async analyzeDependencies(configPath, content) {
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
                }
                else {
                    missing.push(imp);
                }
            }
            return { found, missing };
        }
        catch (error) {
            this.logger.error(`Error analyzing dependencies: ${error}`);
            return { found: [], missing: [] };
        }
    }
    extractImports(content) {
        const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
        const matches = [...content.matchAll(importRegex)];
        return matches
            .map(match => match[1])
            .filter(imp => !imp.startsWith('.') && !imp.startsWith('/'));
    }
}
exports.ViteConfigDetector = ViteConfigDetector;
//# sourceMappingURL=ViteConfigDetector.js.map