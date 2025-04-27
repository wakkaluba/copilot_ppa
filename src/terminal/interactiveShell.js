"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.InteractiveShell = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var terminalManager_1 = require("./terminalManager");
var ILogger_1 = require("../logging/ILogger");
var types_1 = require("./types");
var ShellConfigurationService_1 = require("./services/ShellConfigurationService");
var CommandExecutionService_1 = require("./services/CommandExecutionService");
var OutputProcessingService_1 = require("./services/OutputProcessingService");
var InteractiveShell = /** @class */ (function () {
    function InteractiveShell(terminalManager, logger, shellConfig, commandExecutor, outputProcessor) {
        this.terminalManager = terminalManager;
        this.logger = logger;
        this.shellConfig = shellConfig;
        this.commandExecutor = commandExecutor;
        this.outputProcessor = outputProcessor;
        this.commandHistory = [];
        this.outputChannel = vscode.window.createOutputChannel('Terminal Output');
    }
    InteractiveShell.prototype.executeCommand = function (command_1) {
        return __awaiter(this, arguments, void 0, function (command, shellType, showOutput) {
            var historyEntry, output, error_1;
            if (shellType === void 0) { shellType = types_1.TerminalShellType.VSCodeDefault; }
            if (showOutput === void 0) { showOutput = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("Executing command: ".concat(command, " (shell: ").concat(shellType, ")"));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        historyEntry = {
                            command: command,
                            timestamp: new Date(),
                            shellType: shellType
                        };
                        return [4 /*yield*/, this.commandExecutor.executeWithOutput(command, shellType)];
                    case 2:
                        output = _a.sent();
                        // Update history
                        historyEntry.result = output;
                        this.addToCommandHistory(historyEntry);
                        // Show output if requested
                        if (showOutput) {
                            this.showCommandOutput(command, output.stdout);
                        }
                        return [2 /*return*/, output.stdout];
                    case 3:
                        error_1 = _a.sent();
                        this.handleCommandError(command, error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes a command in a visible terminal without capturing output
     * @param command Command to execute
     * @param terminalName Name for the terminal
     * @param shellType Shell type to use
     */
    InteractiveShell.prototype.executeInTerminal = function (command_1) {
        return __awaiter(this, arguments, void 0, function (command, terminalName, shellType) {
            if (terminalName === void 0) { terminalName = 'Agent Terminal'; }
            if (shellType === void 0) { shellType = types_1.TerminalShellType.VSCodeDefault; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Create or show terminal
                        this.terminalManager.showTerminal(terminalName, shellType);
                        // Execute command
                        return [4 /*yield*/, this.terminalManager.executeCommand(command, terminalName)];
                    case 1:
                        // Execute command
                        _a.sent();
                        // Add to history without result (we don't capture output in this mode)
                        this.addToCommandHistory({
                            command: command,
                            timestamp: new Date(),
                            shellType: shellType
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes multiple commands in sequence
     * @param commands Array of commands to execute
     * @param shellType Shell type to use
     * @param showOutput Whether to show output
     * @returns Promise that resolves with array of outputs
     */
    InteractiveShell.prototype.executeCommands = function (commands_1) {
        return __awaiter(this, arguments, void 0, function (commands, shellType, showOutput) {
            var results, _i, commands_2, command, output, error_2, continueExecution;
            if (shellType === void 0) { shellType = types_1.TerminalShellType.VSCodeDefault; }
            if (showOutput === void 0) { showOutput = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, commands_2 = commands;
                        _a.label = 1;
                    case 1:
                        if (!(_i < commands_2.length)) return [3 /*break*/, 7];
                        command = commands_2[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, this.executeCommand(command, shellType, showOutput)];
                    case 3:
                        output = _a.sent();
                        results.push(output);
                        return [3 /*break*/, 6];
                    case 4:
                        error_2 = _a.sent();
                        // Add error output as undefined
                        results.push('');
                        return [4 /*yield*/, vscode.window.showErrorMessage("Command failed: ".concat(command), 'Continue', 'Stop')];
                    case 5:
                        continueExecution = _a.sent();
                        if (continueExecution !== 'Continue') {
                            return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Formats and displays command output in an OutputChannel
     * @param command The executed command
     * @param output The command output
     */
    InteractiveShell.prototype.showCommandOutput = function (command, output) {
        this.outputChannel.appendLine("> ".concat(command));
        this.outputChannel.appendLine(output);
        this.outputChannel.appendLine(''); // Empty line for separation
        this.outputChannel.show();
    };
    /**
     * Formats and displays command error in an OutputChannel
     * @param command The executed command
     * @param error The error
     */
    InteractiveShell.prototype.showCommandError = function (command, error) {
        this.outputChannel.appendLine("> ".concat(command));
        this.outputChannel.appendLine("Error: ".concat(error instanceof Error ? error.message : String(error)));
        this.outputChannel.appendLine(''); // Empty line for separation
        this.outputChannel.show();
    };
    /**
     * Get command history for the specified shell
     * @param shellType Shell type to filter by, or undefined for all shell types
     * @param limit Maximum number of history entries to return
     */
    InteractiveShell.prototype.getCommandHistory = function (shellType, limit) {
        var history = __spreadArray([], this.commandHistory, true);
        // Filter by shell type if specified
        if (shellType) {
            history = history.filter(function (entry) { return entry.shellType === shellType; });
        }
        // Sort by timestamp (newest first)
        history.sort(function (a, b) { return b.timestamp.getTime() - a.timestamp.getTime(); });
        // Apply limit if specified
        if (limit && limit > 0) {
            history = history.slice(0, limit);
        }
        return history;
    };
    /**
     * Clears command history
     */
    InteractiveShell.prototype.clearCommandHistory = function () {
        this.commandHistory = [];
    };
    /**
     * Adds a command to history, maintaining the max history size
     * @param entry Command history entry to add
     */
    InteractiveShell.prototype.addToCommandHistory = function (entry) {
        this.commandHistory.push(entry);
        // Trim history if it exceeds max size
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory = this.commandHistory.slice(-this.maxHistorySize);
        }
    };
    /**
     * Process terminal output with various transformations
     * @param output Raw terminal output
     * @param options Processing options
     */
    InteractiveShell.prototype.processOutput = function (output, options) {
        var processedOutput = output;
        if (options.removeAnsiCodes) {
            processedOutput = this.stripAnsiCodes(processedOutput);
        }
        if (options.trimWhitespace) {
            processedOutput = processedOutput.trim();
        }
        if (options.limitLines && options.limitLines > 0) {
            var lines = processedOutput.split('\n');
            processedOutput = lines.slice(0, options.limitLines).join('\n');
            // Add indicator if lines were removed
            if (lines.length > options.limitLines) {
                processedOutput += "\n... (".concat(lines.length - options.limitLines, " more lines)");
            }
        }
        if (options.filterPattern) {
            try {
                var regex_1 = new RegExp(options.filterPattern, options.filterFlags || '');
                if (options.filterMode === 'include') {
                    // Include only lines that match the pattern
                    var lines = processedOutput.split('\n');
                    processedOutput = lines.filter(function (line) { return regex_1.test(line); }).join('\n');
                }
                else {
                    // Exclude lines that match the pattern
                    var lines = processedOutput.split('\n');
                    processedOutput = lines.filter(function (line) { return !regex_1.test(line); }).join('\n');
                }
            }
            catch (error) {
                vscode.window.showErrorMessage("Invalid regex pattern: ".concat(error instanceof Error ? error.message : String(error)));
            }
        }
        return processedOutput;
    };
    /**
     * Strips ANSI escape codes from terminal output
     * @param text Text to process
     */
    InteractiveShell.prototype.stripAnsiCodes = function (text) {
        // This regex pattern matches ANSI escape sequences
        return text.replace(/\\u001B\[[0-9;]*[a-zA-Z]/g, '');
    };
    /**
     * Gets command suggestions from the AI helper based on natural language
     * @param description Natural language description
     * @param shellType Shell type to use
     * @returns Promise with generated command result
     */
    InteractiveShell.prototype.getCommandFromNaturalLanguage = function (description_1) {
        return __awaiter(this, arguments, void 0, function (description, shellType) {
            var aiHelper, result;
            if (shellType === void 0) { shellType = types_1.TerminalShellType.VSCodeDefault; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAIHelper()];
                    case 1:
                        aiHelper = _a.sent();
                        if (!aiHelper) {
                            vscode.window.showErrorMessage('AI Terminal Helper is not available');
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, aiHelper.generateCommandFromDescription(description, shellType, true)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Gets command analysis from the AI helper
     * @param command Command to analyze
     * @param shellType Shell type
     * @returns Promise with command analysis
     */
    InteractiveShell.prototype.getCommandAnalysis = function (command_1) {
        return __awaiter(this, arguments, void 0, function (command, shellType) {
            var aiHelper, analysis;
            if (shellType === void 0) { shellType = types_1.TerminalShellType.VSCodeDefault; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAIHelper()];
                    case 1:
                        aiHelper = _a.sent();
                        if (!aiHelper) {
                            vscode.window.showErrorMessage('AI Terminal Helper is not available');
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, aiHelper.analyzeCommand(command, shellType)];
                    case 2:
                        analysis = _a.sent();
                        return [2 /*return*/, analysis];
                }
            });
        });
    };
    /**
     * Gets command variations from the AI helper
     * @param command Base command
     * @param description Description of variations needed
     * @param shellType Shell type
     * @returns Promise with array of command variations
     */
    InteractiveShell.prototype.getCommandVariations = function (command_1, description_1) {
        return __awaiter(this, arguments, void 0, function (command, description, shellType) {
            var aiHelper, variations;
            if (shellType === void 0) { shellType = types_1.TerminalShellType.VSCodeDefault; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAIHelper()];
                    case 1:
                        aiHelper = _a.sent();
                        if (!aiHelper) {
                            vscode.window.showErrorMessage('AI Terminal Helper is not available');
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, aiHelper.generateCommandVariations(command, description, shellType)];
                    case 2:
                        variations = _a.sent();
                        return [2 /*return*/, variations];
                }
            });
        });
    };
    /**
     * Gets the AI Terminal Helper from the extension
     * @returns Promise with AI Terminal Helper or null
     */
    InteractiveShell.prototype.getAIHelper = function () {
        return __awaiter(this, void 0, void 0, function () {
            var terminalModule, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.commands.executeCommand('localLlmAgent.getTerminalModule')];
                    case 1:
                        terminalModule = _a.sent();
                        if (terminalModule) {
                            return [2 /*return*/, terminalModule.getAIHelper()];
                        }
                        return [2 /*return*/, null];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Failed to get AI Terminal Helper:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    InteractiveShell.prototype.handleCommandError = function (command, error) {
        this.logger.error("Command failed: ".concat(command), error);
        var historyEntry = {
            command: command,
            timestamp: new Date(),
            shellType: types_1.TerminalShellType.VSCodeDefault,
            result: {
                stdout: '',
                stderr: error instanceof Error ? error.message : String(error),
                exitCode: 1,
                success: false
            }
        };
        this.addToCommandHistory(historyEntry);
        this.showCommandError(command, error);
    };
    InteractiveShell.prototype.dispose = function () {
        this.outputChannel.dispose();
    };
    var _a, _b, _c, _d;
    InteractiveShell = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(terminalManager_1.TerminalManager)),
        __param(1, (0, inversify_1.inject)(ILogger_1.ILogger)),
        __param(2, (0, inversify_1.inject)(ShellConfigurationService_1.ShellConfigurationService)),
        __param(3, (0, inversify_1.inject)(CommandExecutionService_1.CommandExecutionService)),
        __param(4, (0, inversify_1.inject)(OutputProcessingService_1.OutputProcessingService)),
        __metadata("design:paramtypes", [terminalManager_1.TerminalManager, typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ShellConfigurationService_1.ShellConfigurationService !== "undefined" && ShellConfigurationService_1.ShellConfigurationService) === "function" ? _b : Object, typeof (_c = typeof CommandExecutionService_1.CommandExecutionService !== "undefined" && CommandExecutionService_1.CommandExecutionService) === "function" ? _c : Object, typeof (_d = typeof OutputProcessingService_1.OutputProcessingService !== "undefined" && OutputProcessingService_1.OutputProcessingService) === "function" ? _d : Object])
    ], InteractiveShell);
    return InteractiveShell;
}());
exports.InteractiveShell = InteractiveShell;
