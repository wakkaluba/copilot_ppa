// Linting and refactor: Remove unused imports/variables, add explicit types/return types, replace console statements with logger calls, and follow workspace coding standards.
// NOTE: Interface names should not use the "I" prefix per workspace rules.

import * as fs from 'fs';
import * as path from 'path';
import { ILogger } from '../utils/logger';

export type DependencyNode = {
    file: string;
    imports: string[];
    dependencies: string[];
};

export class DependencyAnalyzer {
    private logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    public analyzeFileImports(filePath: string): DependencyNode {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const importRegex = /import\s+(?:type\s+)?(?:\{[^}]+\}|\w+)(?:\s+from)?\s*['"]([^'"]+)['"]/g;
            const imports: string[] = [];
            let match: RegExpExecArray | null;
            while ((match = importRegex.exec(content)) !== null) {
                imports.push(match[1]);
            }
            this.logger.info && this.logger.info(`Analyzed imports for ${filePath}`, { imports });
            return {
                file: filePath,
                imports,
                dependencies: imports // For now, treat imports as dependencies
            };
        } catch (error) {
            this.logger.error(`Failed to analyze imports for ${filePath}`, { error });
            return {
                file: filePath,
                imports: [],
                dependencies: []
            };
        }
    }

    public analyzeDirectory(directory: string): DependencyNode[] {
        const results: DependencyNode[] = [];
        const files = fs.readdirSync(directory);
        for (const file of files) {
            const fullPath = path.join(directory, file);
            if (fs.statSync(fullPath).isFile() && fullPath.endsWith('.ts')) {
                results.push(this.analyzeFileImports(fullPath));
            }
        }
        this.logger.info && this.logger.info(`Analyzed directory ${directory}`, { fileCount: results.length });
        return results;
    }
}
