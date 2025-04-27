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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticAnalysisServiceImpl = void 0;
const mockLinters_1 = require("./mockLinters");
const fs = __importStar(require("fs"));
const eslint_1 = require("eslint");
const prettier = __importStar(require("prettier"));
class StaticAnalysisServiceImpl {
    constructor() {
        this.eslintInstance = new mockLinters_1.ESLintMock();
        this.useRealEslint = false;
        this.useRealPrettier = false;
        this.prettier = mockLinters_1.PrettierMock;
        this.initializeLinters();
    }
    async initializeLinters() {
        try {
            this.eslintInstance = new eslint_1.ESLint();
            this.useRealEslint = true;
            console.log('Using real ESLint');
        }
        catch (error) {
            console.log('ESLint not available, using mock implementation:', error);
            this.eslintInstance = new mockLinters_1.ESLintMock();
            this.useRealEslint = false;
        }
        try {
            // Test if Prettier is available
            await prettier.resolveConfig('test.js');
            this.useRealPrettier = true;
            this.prettier = prettier;
            console.log('Using real Prettier');
        }
        catch (error) {
            console.log('Prettier not available, using mock implementation:', error);
            this.useRealPrettier = false;
            this.prettier = mockLinters_1.PrettierMock;
        }
    }
    async runESLintAnalysis(options) {
        const issues = await this.lintFiles(options.files);
        return {
            totalTests: issues.length,
            passed: 0,
            failed: issues.length,
            skipped: 0,
            duration: 0,
            suites: [{
                    id: 'eslint',
                    name: 'ESLint Analysis',
                    tests: issues.map(issue => ({
                        id: `${issue.filePath}:${issue.line}`,
                        name: `${issue.message} (${issue.filePath}:${issue.line})`,
                        status: 'failed',
                        duration: 0,
                        error: issue.message
                    })),
                    suites: []
                }],
            timestamp: new Date(),
            success: issues.length === 0,
            message: `Found ${issues.length} ESLint issues${this.useRealEslint ? '' : ' (using mock implementation)'}`,
            details: this.formatIssuesDetails(issues)
        };
    }
    async runPrettierAnalysis(options) {
        const unformattedFiles = await this.checkFormatting(options.files);
        return {
            totalTests: options.files.length,
            passed: options.files.length - unformattedFiles.length,
            failed: unformattedFiles.length,
            skipped: 0,
            duration: 0,
            suites: [{
                    id: 'prettier',
                    name: 'Prettier Analysis',
                    tests: unformattedFiles.map(file => ({
                        id: file,
                        name: `File not properly formatted: ${file}`,
                        status: 'failed',
                        duration: 0,
                        error: 'File does not match Prettier formatting rules'
                    })),
                    suites: []
                }],
            timestamp: new Date(),
            success: unformattedFiles.length === 0,
            message: `Found ${unformattedFiles.length} files with formatting issues${this.useRealPrettier ? '' : ' (using mock implementation)'}`,
            details: this.formatPrettierDetails(unformattedFiles)
        };
    }
    async lintFiles(files) {
        if (this.useRealEslint) {
            try {
                const results = await Promise.all(files.map(file => this.eslintInstance.lintFiles(file)));
                return results.flat().map(result => result.messages.map((msg) => ({
                    filePath: result.filePath,
                    line: msg.line,
                    column: msg.column,
                    message: msg.message,
                    ruleId: msg.ruleId || 'unknown',
                    severity: msg.severity
                }))).flat();
            }
            catch (error) {
                console.error('Error using real ESLint, falling back to mock:', error);
                const mockResults = await (new mockLinters_1.ESLintMock()).lintFiles(files);
                return this.convertMockResults(mockResults);
            }
        }
        else {
            const mockResults = await this.eslintInstance.lintFiles(files);
            return this.convertMockResults(mockResults);
        }
    }
    convertMockResults(results) {
        return results.flatMap(result => result.messages.map(msg => ({
            filePath: result.filePath,
            line: msg.line,
            column: msg.column,
            message: msg.message,
            ruleId: msg.ruleId || 'unknown',
            severity: msg.severity
        })));
    }
    async checkFormatting(files) {
        const unformattedFiles = [];
        for (const file of files) {
            try {
                const fileContent = await fs.promises.readFile(file, 'utf8');
                let isFormatted = false;
                if (this.useRealPrettier && this.prettier.format) {
                    try {
                        const options = await this.prettier.resolveConfig(file) || {};
                        const formatted = await this.prettier.format(fileContent, {
                            ...options,
                            filepath: file
                        });
                        isFormatted = fileContent === formatted;
                    }
                    catch (formatError) {
                        console.error(`Error formatting ${file}:`, formatError);
                        isFormatted = false;
                    }
                }
                else if (this.prettier.check) {
                    // Use mock or fallback implementation
                    isFormatted = await this.prettier.check(fileContent, { filepath: file });
                }
                else {
                    console.error('Neither format nor check method available for Prettier');
                    isFormatted = false;
                }
                if (!isFormatted) {
                    unformattedFiles.push(file);
                }
            }
            catch (error) {
                console.error(`Error checking formatting for ${file}:`, error);
                unformattedFiles.push(file);
            }
        }
        return unformattedFiles;
    }
    formatIssuesDetails(issues) {
        return issues.map(issue => `${issue.filePath}:${issue.line}:${issue.column} - ${issue.message} (${issue.ruleId})`).join('\n');
    }
    formatPrettierDetails(files) {
        return files.map(file => `${file} - File does not match Prettier formatting rules`).join('\n');
    }
}
exports.StaticAnalysisServiceImpl = StaticAnalysisServiceImpl;
//# sourceMappingURL=StaticAnalysisServiceImpl.js.map