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
exports.AITerminalHelper = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("./types");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
/**
 * Provides AI-powered assistance for terminal commands
 */
class AITerminalHelper {
    constructor(llmManager, interactiveShell, context) {
        this.llmManager = llmManager;
        this.interactiveShell = interactiveShell;
        this.context = context;
    }
    /**
     * Suggests terminal commands based on the current context
     * @param context Text description of what the user wants to do
     * @param shellType Target shell for command suggestions
     * @returns Promise that resolves with suggested commands
     */
    async suggestCommands(context, shellType = types_1.TerminalShellType.VSCodeDefault) {
        try {
            // Prepare prompt for the LLM
            const historyText = this.formatCommandHistoryForPrompt(shellType);
            const prompt = `
You are an expert in terminal commands and shell scripting. Generate command suggestions for the following task.

TASK: ${context}

TARGET SHELL: ${shellType}
${historyText ? `\nRECENT COMMAND HISTORY:\n${historyText}` : ''}

Provide 3-5 possible commands that would help accomplish the task. For each suggestion, provide:
1. The exact command to run
2. A brief explanation of what the command does
3. Any potential warnings or side effects

Format each suggestion like this:
- \`command\` - explanation

ONLY suggest commands that are relevant to the task and appropriate for the specified shell.
            `;
            // Get response from LLM
            const response = await this.llmManager.getCurrentProvider().sendPrompt(prompt, {
                maxTokens: 800,
                temperature: 0.3,
                model: this.llmManager.getCurrentModelId()
            });
            // Parse suggestions from response
            const suggestions = this.parseCommandSuggestions(response);
            return suggestions;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to generate command suggestions: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    /**
     * Analyzes a failed command and suggests fixes
     * @param command The command that failed
     * @param error The error message
     * @param shellType The shell type used
     * @returns Promise that resolves with suggested fixes
     */
    async analyzeFailedCommand(command, error, shellType) {
        try {
            // Prepare prompt for the LLM
            const prompt = `
You are an expert in debugging terminal commands and shell scripting. Analyze this failed command and suggest fixes.

COMMAND: ${command}

ERROR MESSAGE:
${error}

SHELL TYPE: ${shellType}

Provide 3-5 possible fixes for this command. For each suggestion:
1. Explain what might be causing the error
2. Provide a corrected command that would fix the issue
3. Explain why your fix addresses the problem

Format each suggestion like this:
- Issue: [brief description of the problem]
- Fixed command: \`corrected command\`
- Explanation: [why this fixes the issue]

Only suggest realistic fixes based on the error message and command context.
            `;
            // Get response from LLM
            const response = await this.llmManager.getCurrentProvider().sendPrompt(prompt, {
                maxTokens: 800,
                temperature: 0.3,
                model: this.llmManager.getCurrentModelId()
            });
            // Parse fixes from response
            const fixes = this.parseFixSuggestions(response);
            return fixes;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to analyze command: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    /**
     * Generates a terminal command from natural language description with enhanced context awareness
     * @param description Natural language description of what to do
     * @param shellType Target shell type
     * @param includeContextualInfo Whether to include workspace context in the prompt
     * @returns Promise that resolves with generated command
     */
    async generateCommandFromDescription(description, shellType, includeContextualInfo = true) {
        try {
            // Get current workspace directory
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
            // Build context information if requested
            let contextInfo = '';
            if (includeContextualInfo) {
                contextInfo = await this.buildContextInformation(workspaceFolder);
            }
            // Get recent command history
            const historyText = this.formatCommandHistoryForPrompt(shellType);
            // Prepare prompt for the LLM
            const prompt = `
You are an expert command-line interface assistant. Convert this natural language description into a working terminal command.

DESCRIPTION: ${description}

SHELL TYPE: ${shellType}
CURRENT WORKING DIRECTORY: ${workspaceFolder}
${historyText ? `\nRECENT COMMAND HISTORY:\n${historyText}` : ''}
${contextInfo ? `\nWORKSPACE CONTEXT:\n${contextInfo}` : ''}

Generate a terminal command that accomplishes the described task. Your response should follow this exact format:

COMMAND: <the actual command to run, must be valid shell syntax for the specified shell>

EXPLANATION: <brief explanation of what the command does and how it works>

WARNINGS: <any potential side effects, risks, or considerations the user should be aware of>

ALTERNATIVES: <optional alternative approaches or variations of the command>

Ensure the command is:
1. Fully functional and ready to run
2. Follows best practices for the specified shell
3. Uses relative paths when appropriate
4. Includes necessary escape characters and quotes
`;
            // Get response from LLM
            const response = await this.llmManager.getCurrentProvider().sendPrompt(prompt, {
                maxTokens: 800,
                temperature: 0.2,
                model: this.llmManager.getCurrentModelId()
            });
            // Parse the structured response
            const result = this.parseCommandGenerationResponse(response);
            // Validate the command for basic shell syntax
            result.isValid = this.validateCommandSyntax(result.command, shellType);
            return result;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to generate command: ${error instanceof Error ? error.message : String(error)}`);
            return {
                command: '',
                explanation: '',
                warnings: `Error: ${error instanceof Error ? error.message : String(error)}`,
                alternatives: [],
                isValid: false
            };
        }
    }
    /**
     * Builds contextual information about the workspace to improve command generation
     * @param workspacePath Path to the workspace
     * @returns Contextual information as a string
     */
    async buildContextInformation(workspacePath) {
        if (!workspacePath) {
            return '';
        }
        try {
            let contextInfo = '';
            // Check if it's a git repository
            const isGitRepo = fs.existsSync(path.join(workspacePath, '.git'));
            if (isGitRepo) {
                contextInfo += '- This is a git repository\n';
                // Get git status summary
                try {
                    const gitStatus = await new Promise((resolve) => {
                        const process = (0, child_process_1.spawn)('git', ['status', '--porcelain'], {
                            cwd: workspacePath
                        });
                        let output = '';
                        process.stdout.on('data', (data) => {
                            output += data.toString();
                        });
                        process.on('close', () => {
                            resolve(output);
                        });
                    });
                    const modifiedFiles = gitStatus.split('\n').filter(line => line.trim()).length;
                    if (modifiedFiles > 0) {
                        contextInfo += `- ${modifiedFiles} modified/untracked files in git\n`;
                    }
                }
                catch (error) {
                    // Ignore git errors
                }
            }
            // Detect project type
            const hasPackageJson = fs.existsSync(path.join(workspacePath, 'package.json'));
            if (hasPackageJson) {
                contextInfo += '- This is a Node.js/JavaScript project\n';
                // Read package.json to get dependencies
                try {
                    const packageJson = JSON.parse(fs.readFileSync(path.join(workspacePath, 'package.json'), 'utf8'));
                    const deps = [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.devDependencies || {})];
                    if (deps.length > 0) {
                        contextInfo += `- Common dependencies: ${deps.slice(0, 5).join(', ')}${deps.length > 5 ? '...' : ''}\n`;
                    }
                }
                catch (error) {
                    // Ignore package.json errors
                }
            }
            const hasPythonFiles = this.checkForFileTypes(workspacePath, ['.py', '.ipynb']);
            if (hasPythonFiles) {
                contextInfo += '- This workspace contains Python files\n';
                // Check for requirements.txt or setup.py
                const hasRequirements = fs.existsSync(path.join(workspacePath, 'requirements.txt'));
                const hasSetupPy = fs.existsSync(path.join(workspacePath, 'setup.py'));
                if (hasRequirements || hasSetupPy) {
                    contextInfo += '- Python package management files present\n';
                }
            }
            const hasDockerfile = fs.existsSync(path.join(workspacePath, 'Dockerfile')) ||
                fs.existsSync(path.join(workspacePath, 'docker-compose.yml'));
            if (hasDockerfile) {
                contextInfo += '- Docker configuration present in workspace\n';
            }
            return contextInfo || 'No specific context detected';
        }
        catch (error) {
            console.error('Error building context information:', error);
            return '';
        }
    }
    /**
     * Checks if a directory contains files with specific extensions
     * @param directory Directory to check
     * @param extensions File extensions to look for
     * @returns True if files with the specified extensions exist
     */
    checkForFileTypes(directory, extensions) {
        try {
            // Get top-level files only (for performance)
            const files = fs.readdirSync(directory);
            return files.some((file) => {
                const filePath = path.join(directory, file);
                if (fs.statSync(filePath).isFile()) {
                    return extensions.some((ext) => file.endsWith(ext));
                }
                return false;
            });
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Parses the structured response from command generation
     * @param response LLM response text
     * @returns Parsed command generation result
     */
    parseCommandGenerationResponse(response) {
        const result = {
            command: '',
            explanation: '',
            warnings: '',
            alternatives: [],
            isValid: false
        };
        // Extract command
        const commandMatch = response.match(/COMMAND:\s*(.*?)(?=\n\n|\nEXPLANATION:|\nWARNINGS:|\nALTERNATIVES:|$)/s);
        if (commandMatch && commandMatch[1]) {
            result.command = this.cleanGeneratedCommand(commandMatch[1]);
        }
        // Extract explanation
        const explanationMatch = response.match(/EXPLANATION:\s*(.*?)(?=\n\n|\nCOMMAND:|\nWARNINGS:|\nALTERNATIVES:|$)/s);
        if (explanationMatch && explanationMatch[1]) {
            result.explanation = explanationMatch[1].trim();
        }
        // Extract warnings
        const warningsMatch = response.match(/WARNINGS:\s*(.*?)(?=\n\n|\nCOMMAND:|\nEXPLANATION:|\nALTERNATIVES:|$)/s);
        if (warningsMatch && warningsMatch[1]) {
            result.warnings = warningsMatch[1].trim();
        }
        // Extract alternatives
        const alternativesMatch = response.match(/ALTERNATIVES:\s*(.*?)(?=\n\n|\nCOMMAND:|\nEXPLANATION:|\nWARNINGS:|$)/s);
        if (alternativesMatch && alternativesMatch[1]) {
            const alternativesText = alternativesMatch[1].trim();
            // Split alternatives by bullet points or numbered list
            const alternatives = alternativesText
                .split(/\n-|\n\d+\./)
                .map(alt => alt.trim())
                .filter(alt => alt.length > 0);
            result.alternatives = alternatives;
        }
        return result;
    }
    /**
     * Validates basic shell syntax for a generated command
     * @param command Command to validate
     * @param shellType Shell type to validate against
     * @returns Whether the command appears syntactically valid
     */
    validateCommandSyntax(command, shellType) {
        if (!command || command.trim().length === 0) {
            return false;
        }
        // Check for basic syntax errors
        const unbalancedQuotes = (command.match(/"/g) || []).length % 2 !== 0 &&
            (command.match(/'/g) || []).length % 2 !== 0;
        if (unbalancedQuotes) {
            return false;
        }
        // Check for unescaped special characters in different shells
        if (shellType === types_1.TerminalShellType.PowerShell) {
            // Check for PowerShell syntax issues
            const invalidPowerShellSyntax = /[^\\];$|[^\\]\|$/.test(command);
            if (invalidPowerShellSyntax) {
                return false;
            }
        }
        // More validation could be added here for other shell types
        return true;
    }
    /**
     * Analyzes a command to provide detailed explanations of its components
     * @param command Command to analyze
     * @param shellType Shell type to analyze for
     * @returns Promise that resolves with command analysis
     */
    async analyzeCommand(command, shellType) {
        try {
            const prompt = `
You are an expert in terminal commands and shell scripting. Analyze this command and explain its components in detail.

COMMAND: ${command}

SHELL TYPE: ${shellType}

Provide a detailed analysis of the command with:
1. Overall purpose - what does this command accomplish?
2. Component breakdown - explain each part of the command
3. Potential risks or side effects
4. Performance considerations
5. Alternatives that might be more efficient

Format your response using these exact headings.
`;
            // Get response from LLM
            const response = await this.llmManager.getCurrentProvider().sendPrompt(prompt, {
                maxTokens: 800,
                temperature: 0.3,
                model: this.llmManager.getCurrentModelId()
            });
            // Parse the analysis
            return this.parseCommandAnalysis(response);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to analyze command: ${error instanceof Error ? error.message : String(error)}`);
            return {
                purpose: `Error analyzing command: ${error instanceof Error ? error.message : String(error)}`,
                components: [],
                risks: [],
                performance: '',
                alternatives: []
            };
        }
    }
    /**
     * Parses command analysis from LLM response
     * @param response LLM response text
     * @returns Parsed command analysis
     */
    parseCommandAnalysis(response) {
        const analysis = {
            purpose: '',
            components: [],
            risks: [],
            performance: '',
            alternatives: []
        };
        // Extract purpose (overall purpose section)
        const purposeMatch = response.match(/(?:Overall purpose|Purpose)(?:[:-])?\s*(.*?)(?=Component breakdown|$)/si);
        if (purposeMatch && purposeMatch[1]) {
            analysis.purpose = purposeMatch[1].trim();
        }
        // Extract component breakdown
        const componentsMatch = response.match(/Component breakdown(?:[:-])?\s*(.*?)(?=Potential risks|Risks|$)/si);
        if (componentsMatch && componentsMatch[1]) {
            // Split components by bullet points or numbered list
            const componentsText = componentsMatch[1].trim();
            analysis.components = componentsText
                .split(/\n-|\n\d+\./)
                .map(component => component.trim())
                .filter(component => component.length > 0);
        }
        // Extract risks
        const risksMatch = response.match(/(?:Potential risks|Risks)(?:[:-])?\s*(.*?)(?=Performance|$)/si);
        if (risksMatch && risksMatch[1]) {
            // Split risks by bullet points or numbered list
            const risksText = risksMatch[1].trim();
            analysis.risks = risksText
                .split(/\n-|\n\d+\./)
                .map(risk => risk.trim())
                .filter(risk => risk.length > 0);
        }
        // Extract performance considerations
        const performanceMatch = response.match(/Performance(?:[:-])?\s*(.*?)(?=Alternatives|$)/si);
        if (performanceMatch && performanceMatch[1]) {
            analysis.performance = performanceMatch[1].trim();
        }
        // Extract alternatives
        const alternativesMatch = response.match(/Alternatives(?:[:-])?\s*(.*?)(?=$)/si);
        if (alternativesMatch && alternativesMatch[1]) {
            // Split alternatives by bullet points or numbered list
            const alternativesText = alternativesMatch[1].trim();
            analysis.alternatives = alternativesText
                .split(/\n-|\n\d+\./)
                .map(alternative => alternative.trim())
                .filter(alternative => alternative.length > 0);
        }
        return analysis;
    }
    /**
     * Generates command variations with different parameters
     * @param baseCommand Base command to vary
     * @param description Description of what variations are needed
     * @param shellType Shell type to use
     * @returns Promise that resolves with command variations
     */
    async generateCommandVariations(baseCommand, description, shellType) {
        try {
            const prompt = `
You are an expert in terminal commands and shell scripting. Generate variations of this base command.

BASE COMMAND: ${baseCommand}

VARIATION REQUEST: ${description}

SHELL TYPE: ${shellType}

Generate 3-5 variations of the base command that accomplish the same task but with different parameters, options, or approaches.
For each variation:
1. Provide the exact command
2. BRIEFLY explain how it differs from the base command

Format each variation as:
- \`variation command\` - brief explanation

ONLY provide valid commands for the specified shell.
`;
            // Get response from LLM
            const response = await this.llmManager.getCurrentProvider().sendPrompt(prompt, {
                maxTokens: 800,
                temperature: 0.4,
                model: this.llmManager.getCurrentModelId()
            });
            // Parse variations from response
            const variations = this.parseCommandVariations(response);
            return variations;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to generate command variations: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    /**
     * Parses command variations from LLM response
     * @param response LLM response text
     * @returns Array of command variations
     */
    parseCommandVariations(response) {
        const variations = [];
        // Look for commands enclosed in backticks
        const commandRegex = /[`'"](.*?)[`'"]/g;
        let match;
        while ((match = commandRegex.exec(response)) !== null) {
            const command = match[1].trim();
            if (command && !variations.includes(command)) {
                variations.push(command);
            }
        }
        return variations;
    }
    /**
     * Parses command suggestions from LLM response
     * @param response LLM response text
     * @returns Array of suggested commands
     */
    parseCommandSuggestions(response) {
        const suggestions = [];
        // Look for commands enclosed in backticks
        const commandRegex = /[`'"](.*?)[`'"]/g;
        let match;
        while ((match = commandRegex.exec(response)) !== null) {
            const command = match[1].trim();
            if (command && !suggestions.includes(command)) {
                suggestions.push(command);
            }
        }
        return suggestions;
    }
    /**
     * Parses fix suggestions from LLM response
     * @param response LLM response text
     * @returns Array of suggested fixes
     */
    parseFixSuggestions(response) {
        const fixes = [];
        // Look for commands after "Fixed command:" or similar indicators
        const fixedCommandRegex = /(?:Fixed command|Corrected command|Fix):\s*[`'"](.*?)[`'"]/gi;
        let match;
        while ((match = fixedCommandRegex.exec(response)) !== null) {
            const command = match[1].trim();
            if (command && !fixes.includes(command)) {
                fixes.push(command);
            }
        }
        return fixes;
    }
    /**
     * Cleans up the generated command response
     * @param response LLM response text
     * @returns Clean command string
     */
    cleanGeneratedCommand(response) {
        // Remove any markdown backticks
        let cleaned = response.replace(/```[a-z]*\n|```/g, '');
        // Remove any explanation text
        cleaned = cleaned.split('\n').filter(line => !line.startsWith('#') && line.trim()).join('\n');
        // Remove any leading/trailing quotes
        cleaned = cleaned.replace(/^['"`]|['"`]$/g, '');
        return cleaned.trim();
    }
    /**
     * Formats command history for inclusion in prompts
     * @param shellType Shell type to filter by
     * @returns Formatted command history text
     */
    formatCommandHistoryForPrompt(shellType) {
        // Get recent command history (last 5 commands)
        const history = this.interactiveShell.getCommandHistory(shellType, 5);
        if (history.length === 0) {
            return '';
        }
        // Format history entries
        return history.map(entry => {
            const status = entry.result?.success ? 'SUCCESS' : 'FAILED';
            return `- ${entry.command} (${status})`;
        }).join('\n');
    }
}
exports.AITerminalHelper = AITerminalHelper;
// Add proper type to the file parameter (around line 308)
function processFile(file) {
    // ...existing code...
}
//# sourceMappingURL=aiTerminalHelper.js.map