"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrettierMock = exports.ESLintMock = void 0;
/**
 * Mock ESLint and Prettier implementations for static analysis
 * This allows for dependency resolution without needing the actual packages
 */
const fs = __importStar(require("fs"));
/**
 * Mock ESLint implementation
 */
class ESLintMock {
    /**
     * Mock lint files implementation
     * @param files Files to lint
     * @returns Array of lint results
     */
    async lintFiles(files) {
        const fileList = Array.isArray(files) ? files : [files];
        const results = [];
        for (const file of fileList) {
            try {
                const content = await fs.promises.readFile(file, 'utf8');
                const lines = content.split('\n');
                const messages = [];
                // Simple linting checks
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    // Check for common issues
                    // 1. Check for console.log statements
                    if (line.includes('console.log')) {
                        messages.push({
                            line: i + 1,
                            column: line.indexOf('console.log') + 1,
                            message: 'Unexpected console.log statement',
                            ruleId: 'no-console',
                            severity: 1
                        });
                    }
                    // 2. Check for TODO comments
                    if (line.includes('TODO')) {
                        messages.push({
                            line: i + 1,
                            column: line.indexOf('TODO') + 1,
                            message: 'TODO comment found',
                            ruleId: 'no-todo',
                            severity: 0
                        });
                    }
                    // 3. Check for very long lines
                    if (line.length > 100) {
                        messages.push({
                            line: i + 1,
                            column: 101,
                            message: 'Line exceeds maximum line length of 100',
                            ruleId: 'max-len',
                            severity: 1
                        });
                    }
                }
                results.push({
                    filePath: file,
                    messages
                });
            }
            catch (error) {
                results.push({
                    filePath: file,
                    messages: [{
                            line: 1,
                            column: 1,
                            message: `Error reading file: ${error instanceof Error ? error.message : String(error)}`,
                            ruleId: 'file-error',
                            severity: 2
                        }]
                });
            }
        }
        return results;
    }
}
exports.ESLintMock = ESLintMock;
/**
 * Mock Prettier implementation
 */
exports.PrettierMock = {
    /**
     * Mock resolveConfig implementation
     * @param file File path
     * @returns File content
     */
    async resolveConfig(file) {
        try {
            return await fs.promises.readFile(file, 'utf8');
        }
        catch (error) {
            return '';
        }
    },
    /**
     * Mock check implementation - simple formatting checks
     * @param content File content
     * @param options Options including filepath
     * @returns Whether the file is formatted correctly
     */
    async check(content, options) {
        // Simple formatting check - just check a few rules
        if (!content) {
            return true;
        }
        const lines = content.split('\n');
        for (const line of lines) {
            // Check for missing semicolons in JS/TS files
            if ((options.filepath.endsWith('.js') || options.filepath.endsWith('.ts')) &&
                !line.trim().endsWith('{') &&
                !line.trim().endsWith('}') &&
                !line.trim().endsWith(';') &&
                !line.trim().startsWith('//') &&
                !line.trim().startsWith('import') &&
                !line.trim().startsWith('export') &&
                line.trim().length > 0) {
                return false;
            }
            // Check for inconsistent indentation
            if (line.startsWith(' ') && !line.startsWith('  ')) {
                return false;
            }
            // Check for trailing whitespace
            if (line.endsWith(' ') || line.endsWith('\t')) {
                return false;
            }
        }
        return true;
    }
};
//# sourceMappingURL=mockLinters.js.map