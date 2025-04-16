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
exports.StaticAnalysisService = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Service for performing static code analysis
 */
class StaticAnalysisService {
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Static Analysis');
    }
    /**
     * Run static code analysis using ESLint
     */
    async runESLint(options) {
        return this.runAnalysis({
            ...options,
            tool: 'eslint'
        });
    }
    /**
     * Run static code analysis using Prettier
     */
    async runPrettier(options) {
        return this.runAnalysis({
            ...options,
            tool: 'prettier'
        });
    }
    /**
     * Run static code analysis using a specified tool
     */
    async runAnalysis(options) {
        const workspacePath = options.path || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            return {
                success: false,
                message: 'No workspace folder found'
            };
        }
        this.outputChannel.appendLine(`Running static analysis on ${workspacePath} using ${options.tool || 'auto-detected tool'}`);
        this.outputChannel.show();
        try {
            // Auto-detect tool if not specified
            const tool = options.tool || await this.detectStaticAnalysisTool(workspacePath);
            if (!tool) {
                return {
                    success: false,
                    message: 'No static analysis tool detected'
                };
            }
            // Build the command based on the tool
            let command = options.command;
            if (!command) {
                command = this.buildAnalysisCommand(tool, options);
            }
            this.outputChannel.appendLine(`Running command: ${command}`);
            // Execute the command
            const result = await this.executeCommand(command, workspacePath);
            // Parse and process results
            const processedResult = this.processAnalysisResult(tool, result);
            this.outputChannel.appendLine(`Analysis completed. Found ${processedResult.issueCount || 0} issues.`);
            return processedResult;
        }
        catch (error) {
            const errorMsg = `Error running static code analysis: ${error instanceof Error ? error.message : String(error)}`;
            this.outputChannel.appendLine(errorMsg);
            return {
                success: false,
                message: errorMsg,
                details: error instanceof Error ? error.stack : undefined
            };
        }
    }
    /**
     * Execute a command and return the result
     */
    async executeCommand(command, cwd) {
        return new Promise((resolve) => {
            const process = cp.exec(command, { cwd });
            let stdout = '';
            let stderr = '';
            process.stdout?.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                this.outputChannel.append(output);
            });
            process.stderr?.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                this.outputChannel.append(output);
            });
            process.on('close', (code) => {
                const success = code === 0;
                const result = {
                    success,
                    message: success ? 'Static analysis completed successfully' : 'Static analysis found issues',
                    exitCode: code,
                    stdout,
                    stderr,
                    staticAnalysis: {
                        raw: stdout + stderr
                    }
                };
                resolve(result);
            });
        });
    }
    /**
     * Process the analysis result and extract useful information
     */
    processAnalysisResult(tool, result) {
        if (!result.staticAnalysis) {
            result.staticAnalysis = { raw: result.stdout || '' };
        }
        const output = result.stdout || '';
        const errorOutput = result.stderr || '';
        // Count issues based on the tool's output format
        let issueCount = 0;
        let issues = [];
        switch (tool) {
            case 'eslint':
                // Count problems in ESLint output
                const problemMatches = output.match(/problems?/gi);
                if (problemMatches) {
                    issueCount = problemMatches.length;
                }
                // Parse ESLint output for issues
                const eslintRegex = /(.+): line (\d+), col (\d+), (.+) - (.+)/g;
                let match;
                while ((match = eslintRegex.exec(output)) !== null) {
                    issues.push({
                        file: match[1],
                        line: parseInt(match[2]),
                        col: parseInt(match[3]),
                        severity: match[4],
                        message: match[5]
                    });
                }
                break;
            case 'prettier':
                // Count files with formatting issues
                const fileMatches = output.match(/would be reformatted/g);
                if (fileMatches) {
                    issueCount = fileMatches.length;
                }
                break;
            case 'stylelint':
                // Count CSS issues
                const cssIssueMatches = output.match(/✖/g);
                if (cssIssueMatches) {
                    issueCount = cssIssueMatches.length;
                }
                break;
            case 'sonarqube':
                // Extract SonarQube issues from JSON output
                try {
                    if (output.includes('{') && output.includes('}')) {
                        const jsonStr = output.substring(output.indexOf('{'), output.lastIndexOf('}') + 1);
                        const jsonData = JSON.parse(jsonStr);
                        if (jsonData.issues) {
                            issueCount = jsonData.issues.length;
                            issues = jsonData.issues.map((issue) => ({
                                message: issue.message,
                                file: issue.component,
                                line: issue.line,
                                severity: issue.severity
                            }));
                        }
                    }
                }
                catch (e) {
                    // JSON parsing failed
                }
                break;
            default:
                // General issue counting by looking for common patterns
                const errorMatches = output.match(/error|warning|issue|problem/gi);
                if (errorMatches) {
                    issueCount = errorMatches.length;
                }
                break;
        }
        // Update the result with processed information
        result.staticAnalysis.issueCount = issueCount;
        result.staticAnalysis.issues = issues;
        // For tools where no issues doesn't mean failure
        if (tool === 'prettier' || tool === 'eslint') {
            // For these tools, a non-zero exit code usually means issues were found, not that the tool failed
            result.success = true;
            result.message = issueCount > 0
                ? `Found ${issueCount} issues that need to be fixed`
                : 'No issues found';
        }
        return result;
    }
    /**
     * Detect which static analysis tools are available in the project
     */
    async detectStaticAnalysisTool(workspacePath) {
        // Check for common configuration files
        if (this.hasFile(workspacePath, '.eslintrc') ||
            this.hasFile(workspacePath, '.eslintrc.js') ||
            this.hasFile(workspacePath, '.eslintrc.json')) {
            return 'eslint';
        }
        if (this.hasFile(workspacePath, '.prettierrc') ||
            this.hasFile(workspacePath, '.prettierrc.js') ||
            this.hasFile(workspacePath, '.prettierrc.json')) {
            return 'prettier';
        }
        if (this.hasFile(workspacePath, '.stylelintrc') ||
            this.hasFile(workspacePath, '.stylelintrc.js') ||
            this.hasFile(workspacePath, '.stylelintrc.json')) {
            return 'stylelint';
        }
        if (this.hasFile(workspacePath, 'sonar-project.properties')) {
            return 'sonarqube';
        }
        // Check package.json for dependencies
        const packageJsonPath = path.join(workspacePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const allDeps = {
                    ...(packageJson.dependencies || {}),
                    ...(packageJson.devDependencies || {})
                };
                if (allDeps.eslint) {
                    return 'eslint';
                }
                if (allDeps.prettier) {
                    return 'prettier';
                }
                if (allDeps.stylelint) {
                    return 'stylelint';
                }
                if (allDeps.tslint) {
                    return 'tslint';
                }
            }
            catch (error) {
                // Ignore JSON parsing errors
            }
        }
        // If project has JS/TS files, default to ESLint
        const hasJsFiles = await this.hasFilesWithExtension(workspacePath, ['.js', '.jsx', '.ts', '.tsx']);
        if (hasJsFiles) {
            return 'eslint';
        }
        // If project has CSS files, default to stylelint
        const hasCssFiles = await this.hasFilesWithExtension(workspacePath, ['.css', '.scss', '.less']);
        if (hasCssFiles) {
            return 'stylelint';
        }
        return undefined;
    }
    /**
     * Build the command to run the analysis tool
     */
    buildAnalysisCommand(tool, options) {
        const fixFlag = options.autoFix ? ' --fix' : '';
        const configFlag = options.configPath ? ` --config ${options.configPath}` : '';
        // Build include/exclude patterns
        let includePattern = '';
        if (options.include && options.include.length > 0) {
            includePattern = ' ' + options.include.join(' ');
        }
        let excludeFlag = '';
        if (options.exclude && options.exclude.length > 0) {
            excludeFlag = ' --ignore-pattern ' + options.exclude.join(' --ignore-pattern ');
        }
        switch (tool) {
            case 'eslint':
                return `npx eslint${fixFlag}${configFlag}${excludeFlag} .${includePattern}`;
            case 'prettier':
                return `npx prettier --check${fixFlag ? ' --write' : ''}${configFlag} .${includePattern}`;
            case 'stylelint':
                return `npx stylelint${fixFlag}${configFlag} "**/*.css"${includePattern}`;
            case 'tslint':
                return `npx tslint${fixFlag}${configFlag} -p tsconfig.json${includePattern}`;
            case 'sonarqube':
                return 'npx sonarqube-scanner';
            default:
                return options.command || 'npx eslint .';
        }
    }
    /**
     * Check if a file exists in the workspace
     */
    hasFile(workspacePath, fileName) {
        // Check for exact file name
        if (fs.existsSync(path.join(workspacePath, fileName))) {
            return true;
        }
        // Check for files that start with the given name
        try {
            const files = fs.readdirSync(workspacePath);
            return files.some(file => file.startsWith(fileName));
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Check if the workspace has files with specific extensions
     */
    async hasFilesWithExtension(workspacePath, extensions) {
        // Use VS Code API to search for files with the given extensions
        for (const ext of extensions) {
            const pattern = new vscode.RelativePattern(workspacePath, `**/*${ext}`);
            const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 1);
            if (files.length > 0) {
                return true;
            }
        }
        return false;
    }
    /**
     * Clean up resources
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.StaticAnalysisService = StaticAnalysisService;
//# sourceMappingURL=staticAnalysisService.js.map