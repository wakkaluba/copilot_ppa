"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITerminalHelper = void 0;
var vscode = require("vscode");
var types_1 = require("./types");
var fs = require("fs");
var path = require("path");
var child_process_1 = require("child_process");
/**
 * Provides AI-powered assistance for terminal commands
 */
var AITerminalHelper = /** @class */ (function () {
    function AITerminalHelper(llmManager, interactiveShell, context) {
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
    AITerminalHelper.prototype.suggestCommands = function (context_1) {
        return __awaiter(this, arguments, void 0, function (context, shellType) {
            var historyText, prompt_1, response, suggestions, error_1;
            if (shellType === void 0) { shellType = types_1.TerminalShellType.VSCodeDefault; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        historyText = this.formatCommandHistoryForPrompt(shellType);
                        prompt_1 = "\nYou are an expert in terminal commands and shell scripting. Generate command suggestions for the following task.\n\nTASK: ".concat(context, "\n\nTARGET SHELL: ").concat(shellType, "\n").concat(historyText ? "\nRECENT COMMAND HISTORY:\n".concat(historyText) : '', "\n\nProvide 3-5 possible commands that would help accomplish the task. For each suggestion, provide:\n1. The exact command to run\n2. A brief explanation of what the command does\n3. Any potential warnings or side effects\n\nFormat each suggestion like this:\n- `command` - explanation\n\nONLY suggest commands that are relevant to the task and appropriate for the specified shell.\n            ");
                        return [4 /*yield*/, this.llmManager.getCurrentProvider().sendPrompt(prompt_1, {
                                maxTokens: 800,
                                temperature: 0.3,
                                model: this.llmManager.getCurrentModelId()
                            })];
                    case 1:
                        response = _a.sent();
                        suggestions = this.parseCommandSuggestions(response);
                        return [2 /*return*/, suggestions];
                    case 2:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to generate command suggestions: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyzes a failed command and suggests fixes
     * @param command The command that failed
     * @param error The error message
     * @param shellType The shell type used
     * @returns Promise that resolves with suggested fixes
     */
    AITerminalHelper.prototype.analyzeFailedCommand = function (command, error, shellType) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt_2, response, fixes, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        prompt_2 = "\nYou are an expert in debugging terminal commands and shell scripting. Analyze this failed command and suggest fixes.\n\nCOMMAND: ".concat(command, "\n\nERROR MESSAGE:\n").concat(error, "\n\nSHELL TYPE: ").concat(shellType, "\n\nProvide 3-5 possible fixes for this command. For each suggestion:\n1. Explain what might be causing the error\n2. Provide a corrected command that would fix the issue\n3. Explain why your fix addresses the problem\n\nFormat each suggestion like this:\n- Issue: [brief description of the problem]\n- Fixed command: `corrected command`\n- Explanation: [why this fixes the issue]\n\nOnly suggest realistic fixes based on the error message and command context.\n            ");
                        return [4 /*yield*/, this.llmManager.getCurrentProvider().sendPrompt(prompt_2, {
                                maxTokens: 800,
                                temperature: 0.3,
                                model: this.llmManager.getCurrentModelId()
                            })];
                    case 1:
                        response = _a.sent();
                        fixes = this.parseFixSuggestions(response);
                        return [2 /*return*/, fixes];
                    case 2:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Failed to analyze command: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generates a terminal command from natural language description with enhanced context awareness
     * @param description Natural language description of what to do
     * @param shellType Target shell type
     * @param includeContextualInfo Whether to include workspace context in the prompt
     * @returns Promise that resolves with generated command
     */
    AITerminalHelper.prototype.generateCommandFromDescription = function (description_1, shellType_1) {
        return __awaiter(this, arguments, void 0, function (description, shellType, includeContextualInfo) {
            var workspaceFolder, contextInfo, historyText, prompt_3, response, result, error_3;
            var _a, _b;
            if (includeContextualInfo === void 0) { includeContextualInfo = true; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        workspaceFolder = ((_b = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.uri.fsPath) || '';
                        contextInfo = '';
                        if (!includeContextualInfo) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.buildContextInformation(workspaceFolder)];
                    case 1:
                        contextInfo = _c.sent();
                        _c.label = 2;
                    case 2:
                        historyText = this.formatCommandHistoryForPrompt(shellType);
                        prompt_3 = "\nYou are an expert command-line interface assistant. Convert this natural language description into a working terminal command.\n\nDESCRIPTION: ".concat(description, "\n\nSHELL TYPE: ").concat(shellType, "\nCURRENT WORKING DIRECTORY: ").concat(workspaceFolder, "\n").concat(historyText ? "\nRECENT COMMAND HISTORY:\n".concat(historyText) : '', "\n").concat(contextInfo ? "\nWORKSPACE CONTEXT:\n".concat(contextInfo) : '', "\n\nGenerate a terminal command that accomplishes the described task. Your response should follow this exact format:\n\nCOMMAND: <the actual command to run, must be valid shell syntax for the specified shell>\n\nEXPLANATION: <brief explanation of what the command does and how it works>\n\nWARNINGS: <any potential side effects, risks, or considerations the user should be aware of>\n\nALTERNATIVES: <optional alternative approaches or variations of the command>\n\nEnsure the command is:\n1. Fully functional and ready to run\n2. Follows best practices for the specified shell\n3. Uses relative paths when appropriate\n4. Includes necessary escape characters and quotes\n");
                        return [4 /*yield*/, this.llmManager.getCurrentProvider().sendPrompt(prompt_3, {
                                maxTokens: 800,
                                temperature: 0.2,
                                model: this.llmManager.getCurrentModelId()
                            })];
                    case 3:
                        response = _c.sent();
                        result = this.parseCommandGenerationResponse(response);
                        // Validate the command for basic shell syntax
                        result.isValid = this.validateCommandSyntax(result.command, shellType);
                        return [2 /*return*/, result];
                    case 4:
                        error_3 = _c.sent();
                        vscode.window.showErrorMessage("Failed to generate command: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                        return [2 /*return*/, {
                                command: '',
                                explanation: '',
                                warnings: "Error: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)),
                                alternatives: [],
                                isValid: false
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Builds contextual information about the workspace to improve command generation
     * @param workspacePath Path to the workspace
     * @returns Contextual information as a string
     */
    AITerminalHelper.prototype.buildContextInformation = function (workspacePath) {
        return __awaiter(this, void 0, void 0, function () {
            var contextInfo, isGitRepo, gitStatus, modifiedFiles, error_4, hasPackageJson, packageJson, deps, hasPythonFiles, hasRequirements, hasSetupPy, hasDockerfile, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!workspacePath) {
                            return [2 /*return*/, ''];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        contextInfo = '';
                        isGitRepo = fs.existsSync(path.join(workspacePath, '.git'));
                        if (!isGitRepo) return [3 /*break*/, 5];
                        contextInfo += '- This is a git repository\n';
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var process = (0, child_process_1.spawn)('git', ['status', '--porcelain'], {
                                    cwd: workspacePath
                                });
                                var output = '';
                                process.stdout.on('data', function (data) {
                                    output += data.toString();
                                });
                                process.on('close', function () {
                                    resolve(output);
                                });
                            })];
                    case 3:
                        gitStatus = _a.sent();
                        modifiedFiles = gitStatus.split('\n').filter(function (line) { return line.trim(); }).length;
                        if (modifiedFiles > 0) {
                            contextInfo += "- ".concat(modifiedFiles, " modified/untracked files in git\n");
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        hasPackageJson = fs.existsSync(path.join(workspacePath, 'package.json'));
                        if (hasPackageJson) {
                            contextInfo += '- This is a Node.js/JavaScript project\n';
                            // Read package.json to get dependencies
                            try {
                                packageJson = JSON.parse(fs.readFileSync(path.join(workspacePath, 'package.json'), 'utf8'));
                                deps = __spreadArray(__spreadArray([], Object.keys(packageJson.dependencies || {}), true), Object.keys(packageJson.devDependencies || {}), true);
                                if (deps.length > 0) {
                                    contextInfo += "- Common dependencies: ".concat(deps.slice(0, 5).join(', ')).concat(deps.length > 5 ? '...' : '', "\n");
                                }
                            }
                            catch (error) {
                                // Ignore package.json errors
                            }
                        }
                        hasPythonFiles = this.checkForFileTypes(workspacePath, ['.py', '.ipynb']);
                        if (hasPythonFiles) {
                            contextInfo += '- This workspace contains Python files\n';
                            hasRequirements = fs.existsSync(path.join(workspacePath, 'requirements.txt'));
                            hasSetupPy = fs.existsSync(path.join(workspacePath, 'setup.py'));
                            if (hasRequirements || hasSetupPy) {
                                contextInfo += '- Python package management files present\n';
                            }
                        }
                        hasDockerfile = fs.existsSync(path.join(workspacePath, 'Dockerfile')) ||
                            fs.existsSync(path.join(workspacePath, 'docker-compose.yml'));
                        if (hasDockerfile) {
                            contextInfo += '- Docker configuration present in workspace\n';
                        }
                        return [2 /*return*/, contextInfo || 'No specific context detected'];
                    case 6:
                        error_5 = _a.sent();
                        console.error('Error building context information:', error_5);
                        return [2 /*return*/, ''];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks if a directory contains files with specific extensions
     * @param directory Directory to check
     * @param extensions File extensions to look for
     * @returns True if files with the specified extensions exist
     */
    AITerminalHelper.prototype.checkForFileTypes = function (directory, extensions) {
        try {
            // Get top-level files only (for performance)
            var files = fs.readdirSync(directory);
            return files.some(function (file) {
                var filePath = path.join(directory, file);
                if (fs.statSync(filePath).isFile()) {
                    return extensions.some(function (ext) { return file.endsWith(ext); });
                }
                return false;
            });
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Parses the structured response from command generation
     * @param response LLM response text
     * @returns Parsed command generation result
     */
    AITerminalHelper.prototype.parseCommandGenerationResponse = function (response) {
        var result = {
            command: '',
            explanation: '',
            warnings: '',
            alternatives: [],
            isValid: false
        };
        // Extract command
        var commandMatch = response.match(/COMMAND:\s*(.*?)(?=\n\n|\nEXPLANATION:|\nWARNINGS:|\nALTERNATIVES:|$)/s);
        if (commandMatch && commandMatch[1]) {
            result.command = this.cleanGeneratedCommand(commandMatch[1]);
        }
        // Extract explanation
        var explanationMatch = response.match(/EXPLANATION:\s*(.*?)(?=\n\n|\nCOMMAND:|\nWARNINGS:|\nALTERNATIVES:|$)/s);
        if (explanationMatch && explanationMatch[1]) {
            result.explanation = explanationMatch[1].trim();
        }
        // Extract warnings
        var warningsMatch = response.match(/WARNINGS:\s*(.*?)(?=\n\n|\nCOMMAND:|\nEXPLANATION:|\nALTERNATIVES:|$)/s);
        if (warningsMatch && warningsMatch[1]) {
            result.warnings = warningsMatch[1].trim();
        }
        // Extract alternatives
        var alternativesMatch = response.match(/ALTERNATIVES:\s*(.*?)(?=\n\n|\nCOMMAND:|\nEXPLANATION:|\nWARNINGS:|$)/s);
        if (alternativesMatch && alternativesMatch[1]) {
            var alternativesText = alternativesMatch[1].trim();
            // Split alternatives by bullet points or numbered list
            var alternatives = alternativesText
                .split(/\n-|\n\d+\./)
                .map(function (alt) { return alt.trim(); })
                .filter(function (alt) { return alt.length > 0; });
            result.alternatives = alternatives;
        }
        return result;
    };
    /**
     * Validates basic shell syntax for a generated command
     * @param command Command to validate
     * @param shellType Shell type to validate against
     * @returns Whether the command appears syntactically valid
     */
    AITerminalHelper.prototype.validateCommandSyntax = function (command, shellType) {
        if (!command || command.trim().length === 0) {
            return false;
        }
        // Check for basic syntax errors
        var unbalancedQuotes = (command.match(/"/g) || []).length % 2 !== 0 &&
            (command.match(/'/g) || []).length % 2 !== 0;
        if (unbalancedQuotes) {
            return false;
        }
        // Check for unescaped special characters in different shells
        if (shellType === types_1.TerminalShellType.PowerShell) {
            // Check for PowerShell syntax issues
            var invalidPowerShellSyntax = /[^\\];$|[^\\]\|$/.test(command);
            if (invalidPowerShellSyntax) {
                return false;
            }
        }
        // More validation could be added here for other shell types
        return true;
    };
    /**
     * Analyzes a command to provide detailed explanations of its components
     * @param command Command to analyze
     * @param shellType Shell type to analyze for
     * @returns Promise that resolves with command analysis
     */
    AITerminalHelper.prototype.analyzeCommand = function (command, shellType) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt_4, response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        prompt_4 = "\nYou are an expert in terminal commands and shell scripting. Analyze this command and explain its components in detail.\n\nCOMMAND: ".concat(command, "\n\nSHELL TYPE: ").concat(shellType, "\n\nProvide a detailed analysis of the command with:\n1. Overall purpose - what does this command accomplish?\n2. Component breakdown - explain each part of the command\n3. Potential risks or side effects\n4. Performance considerations\n5. Alternatives that might be more efficient\n\nFormat your response using these exact headings.\n");
                        return [4 /*yield*/, this.llmManager.getCurrentProvider().sendPrompt(prompt_4, {
                                maxTokens: 800,
                                temperature: 0.3,
                                model: this.llmManager.getCurrentModelId()
                            })];
                    case 1:
                        response = _a.sent();
                        // Parse the analysis
                        return [2 /*return*/, this.parseCommandAnalysis(response)];
                    case 2:
                        error_6 = _a.sent();
                        vscode.window.showErrorMessage("Failed to analyze command: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)));
                        return [2 /*return*/, {
                                purpose: "Error analyzing command: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)),
                                components: [],
                                risks: [],
                                performance: '',
                                alternatives: []
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Parses command analysis from LLM response
     * @param response LLM response text
     * @returns Parsed command analysis
     */
    AITerminalHelper.prototype.parseCommandAnalysis = function (response) {
        var analysis = {
            purpose: '',
            components: [],
            risks: [],
            performance: '',
            alternatives: []
        };
        // Extract purpose (overall purpose section)
        var purposeMatch = response.match(/(?:Overall purpose|Purpose)(?:[:-])?\s*(.*?)(?=Component breakdown|$)/si);
        if (purposeMatch && purposeMatch[1]) {
            analysis.purpose = purposeMatch[1].trim();
        }
        // Extract component breakdown
        var componentsMatch = response.match(/Component breakdown(?:[:-])?\s*(.*?)(?=Potential risks|Risks|$)/si);
        if (componentsMatch && componentsMatch[1]) {
            // Split components by bullet points or numbered list
            var componentsText = componentsMatch[1].trim();
            analysis.components = componentsText
                .split(/\n-|\n\d+\./)
                .map(function (component) { return component.trim(); })
                .filter(function (component) { return component.length > 0; });
        }
        // Extract risks
        var risksMatch = response.match(/(?:Potential risks|Risks)(?:[:-])?\s*(.*?)(?=Performance|$)/si);
        if (risksMatch && risksMatch[1]) {
            // Split risks by bullet points or numbered list
            var risksText = risksMatch[1].trim();
            analysis.risks = risksText
                .split(/\n-|\n\d+\./)
                .map(function (risk) { return risk.trim(); })
                .filter(function (risk) { return risk.length > 0; });
        }
        // Extract performance considerations
        var performanceMatch = response.match(/Performance(?:[:-])?\s*(.*?)(?=Alternatives|$)/si);
        if (performanceMatch && performanceMatch[1]) {
            analysis.performance = performanceMatch[1].trim();
        }
        // Extract alternatives
        var alternativesMatch = response.match(/Alternatives(?:[:-])?\s*(.*?)(?=$)/si);
        if (alternativesMatch && alternativesMatch[1]) {
            // Split alternatives by bullet points or numbered list
            var alternativesText = alternativesMatch[1].trim();
            analysis.alternatives = alternativesText
                .split(/\n-|\n\d+\./)
                .map(function (alternative) { return alternative.trim(); })
                .filter(function (alternative) { return alternative.length > 0; });
        }
        return analysis;
    };
    /**
     * Generates command variations with different parameters
     * @param baseCommand Base command to vary
     * @param description Description of what variations are needed
     * @param shellType Shell type to use
     * @returns Promise that resolves with command variations
     */
    AITerminalHelper.prototype.generateCommandVariations = function (baseCommand, description, shellType) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt_5, response, variations, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        prompt_5 = "\nYou are an expert in terminal commands and shell scripting. Generate variations of this base command.\n\nBASE COMMAND: ".concat(baseCommand, "\n\nVARIATION REQUEST: ").concat(description, "\n\nSHELL TYPE: ").concat(shellType, "\n\nGenerate 3-5 variations of the base command that accomplish the same task but with different parameters, options, or approaches.\nFor each variation:\n1. Provide the exact command\n2. BRIEFLY explain how it differs from the base command\n\nFormat each variation as:\n- `variation command` - brief explanation\n\nONLY provide valid commands for the specified shell.\n");
                        return [4 /*yield*/, this.llmManager.getCurrentProvider().sendPrompt(prompt_5, {
                                maxTokens: 800,
                                temperature: 0.4,
                                model: this.llmManager.getCurrentModelId()
                            })];
                    case 1:
                        response = _a.sent();
                        variations = this.parseCommandVariations(response);
                        return [2 /*return*/, variations];
                    case 2:
                        error_7 = _a.sent();
                        vscode.window.showErrorMessage("Failed to generate command variations: ".concat(error_7 instanceof Error ? error_7.message : String(error_7)));
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Parses command variations from LLM response
     * @param response LLM response text
     * @returns Array of command variations
     */
    AITerminalHelper.prototype.parseCommandVariations = function (response) {
        var variations = [];
        // Look for commands enclosed in backticks
        var commandRegex = /[`'"](.*?)[`'"]/g;
        var match;
        while ((match = commandRegex.exec(response)) !== null) {
            var command = match[1].trim();
            if (command && !variations.includes(command)) {
                variations.push(command);
            }
        }
        return variations;
    };
    /**
     * Parses command suggestions from LLM response
     * @param response LLM response text
     * @returns Array of suggested commands
     */
    AITerminalHelper.prototype.parseCommandSuggestions = function (response) {
        var suggestions = [];
        // Look for commands enclosed in backticks
        var commandRegex = /[`'"](.*?)[`'"]/g;
        var match;
        while ((match = commandRegex.exec(response)) !== null) {
            var command = match[1].trim();
            if (command && !suggestions.includes(command)) {
                suggestions.push(command);
            }
        }
        return suggestions;
    };
    /**
     * Parses fix suggestions from LLM response
     * @param response LLM response text
     * @returns Array of suggested fixes
     */
    AITerminalHelper.prototype.parseFixSuggestions = function (response) {
        var fixes = [];
        // Look for commands after "Fixed command:" or similar indicators
        var fixedCommandRegex = /(?:Fixed command|Corrected command|Fix):\s*[`'"](.*?)[`'"]/gi;
        var match;
        while ((match = fixedCommandRegex.exec(response)) !== null) {
            var command = match[1].trim();
            if (command && !fixes.includes(command)) {
                fixes.push(command);
            }
        }
        return fixes;
    };
    /**
     * Cleans up the generated command response
     * @param response LLM response text
     * @returns Clean command string
     */
    AITerminalHelper.prototype.cleanGeneratedCommand = function (response) {
        // Remove any markdown backticks
        var cleaned = response.replace(/```[a-z]*\n|```/g, '');
        // Remove any explanation text
        cleaned = cleaned.split('\n').filter(function (line) { return !line.startsWith('#') && line.trim(); }).join('\n');
        // Remove any leading/trailing quotes
        cleaned = cleaned.replace(/^['"`]|['"`]$/g, '');
        return cleaned.trim();
    };
    /**
     * Formats command history for inclusion in prompts
     * @param shellType Shell type to filter by
     * @returns Formatted command history text
     */
    AITerminalHelper.prototype.formatCommandHistoryForPrompt = function (shellType) {
        // Get recent command history (last 5 commands)
        var history = this.interactiveShell.getCommandHistory(shellType, 5);
        if (history.length === 0) {
            return '';
        }
        // Format history entries
        return history.map(function (entry) {
            var _a;
            var status = ((_a = entry.result) === null || _a === void 0 ? void 0 : _a.success) ? 'SUCCESS' : 'FAILED';
            return "- ".concat(entry.command, " (").concat(status, ")");
        }).join('\n');
    };
    return AITerminalHelper;
}());
exports.AITerminalHelper = AITerminalHelper;
// Add proper type to the file parameter (around line 308)
function processFile(file) {
    // ...existing code...
}
