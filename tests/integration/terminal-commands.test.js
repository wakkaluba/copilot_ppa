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
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var terminalManager_1 = require("../../src/terminal/terminalManager");
var types_1 = require("../../src/terminal/types");
var llmProviderManager_1 = require("../../src/llm/llmProviderManager");
var connectionStatusService_1 = require("../../src/status/connectionStatusService");
describe('Terminal Commands Integration', function () {
    var terminalManager;
    var llmProviderManager;
    var connectionStatusService;
    var terminal;
    beforeEach(function () {
        // Initialize managers
        this.connectionStatusService = new connectionStatusService_1.ConnectionStatusService();
        this.terminalManager = new terminalManager_1.TerminalManager();
        this.llmProviderManager = new llmProviderManager_1.LLMProviderManager(this.connectionStatusService);
        // Create a test terminal
        this.terminal = this.terminalManager.createTerminal('Test Terminal', types_1.TerminalShellType.VSCodeDefault);
    });
    afterEach(function () {
        // Clean up terminals
        this.terminalManager.closeAllTerminals();
    });
    describe('Command Generation', function () {
        it('generates git commands based on context', function () {
            return __awaiter(this, void 0, void 0, function () {
                var prompt, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            prompt = 'Generate a git command to commit with message "Initial commit"';
                            return [4 /*yield*/, this.llmProviderManager.sendPromptWithLanguage(prompt)];
                        case 1:
                            response = _a.sent();
                            expect(response).toContain('git commit');
                            expect(response).toContain('-m');
                            expect(response).toContain('Initial commit');
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('generates npm commands based on context', function () {
            return __awaiter(this, void 0, void 0, function () {
                var prompt, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            prompt = 'Generate an npm command to install jest';
                            return [4 /*yield*/, this.llmProviderManager.sendPromptWithLanguage(prompt)];
                        case 1:
                            response = _a.sent();
                            expect(response).toContain('npm');
                            expect(response).toContain('install');
                            expect(response).toContain('jest');
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('handles complex multi-step commands', function () {
            return __awaiter(this, void 0, void 0, function () {
                var prompt, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            prompt = 'Generate git commands to add all files, commit with message "Update files", and push';
                            return [4 /*yield*/, this.llmProviderManager.sendPromptWithLanguage(prompt)];
                        case 1:
                            response = _a.sent();
                            expect(response).toContain('git add .');
                            expect(response).toContain('git commit');
                            expect(response).toContain('git push');
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe('Command Execution', function () {
        it('executes simple command and captures output', function () {
            return __awaiter(this, void 0, void 0, function () {
                var output;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.terminalManager.executeCommandWithOutput('echo "test"', types_1.TerminalShellType.VSCodeDefault)];
                        case 1:
                            output = _a.sent();
                            expect(output.trim()).toBe('test');
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('handles environment variables', function () {
            return __awaiter(this, void 0, void 0, function () {
                var output;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.terminalManager.executeCommandWithOutput('echo $TEST_VAR', types_1.TerminalShellType.VSCodeDefault)];
                        case 1:
                            output = _a.sent();
                            expect(output).toBeDefined();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('respects working directory', function () {
            return __awaiter(this, void 0, void 0, function () {
                var testDir, output;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            testDir = ((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath) || process.cwd();
                            return [4 /*yield*/, this.terminalManager.executeCommandWithOutput('pwd', types_1.TerminalShellType.VSCodeDefault)];
                        case 1:
                            output = _b.sent();
                            expect(output.trim()).toBe(testDir);
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('handles command failure gracefully', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, expect(this.terminalManager.executeCommandWithOutput('nonexistent-command', types_1.TerminalShellType.VSCodeDefault))
                                .rejects.toThrow()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe('Terminal Management', function () {
        it('creates and closes terminals', function () {
            return __awaiter(this, void 0, void 0, function () {
                var terminal1, terminal2;
                return __generator(this, function (_a) {
                    terminal1 = this.terminalManager.createTerminal('Test 1', types_1.TerminalShellType.VSCodeDefault);
                    terminal2 = this.terminalManager.createTerminal('Test 2', types_1.TerminalShellType.VSCodeDefault);
                    expect(this.terminalManager.getActiveTerminals().size).toBe(3); // Including the one from beforeEach
                    this.terminalManager.closeTerminal('Test 1');
                    expect(this.terminalManager.getActiveTerminals().size).toBe(2);
                    this.terminalManager.closeTerminal('Test 2');
                    expect(this.terminalManager.getActiveTerminals().size).toBe(1);
                    return [2 /*return*/];
                });
            });
        });
        it('handles multiple terminals', function () {
            return __awaiter(this, void 0, void 0, function () {
                var terminal1, terminal2, output1, output2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            terminal1 = this.terminalManager.createTerminal('Test 1', types_1.TerminalShellType.VSCodeDefault);
                            terminal2 = this.terminalManager.createTerminal('Test 2', types_1.TerminalShellType.VSCodeDefault);
                            // Execute commands in different terminals
                            return [4 /*yield*/, this.terminalManager.executeCommand('echo "test1"', 'Test 1')];
                        case 1:
                            // Execute commands in different terminals
                            _a.sent();
                            return [4 /*yield*/, this.terminalManager.executeCommand('echo "test2"', 'Test 2')];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.terminalManager.executeCommandWithOutput('echo "test1"', types_1.TerminalShellType.VSCodeDefault)];
                        case 3:
                            output1 = _a.sent();
                            return [4 /*yield*/, this.terminalManager.executeCommandWithOutput('echo "test2"', types_1.TerminalShellType.VSCodeDefault)];
                        case 4:
                            output2 = _a.sent();
                            expect(output1.trim()).toBe('test1');
                            expect(output2.trim()).toBe('test2');
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe('Shell Type Support', function () {
        it('supports PowerShell commands', function () {
            return __awaiter(this, void 0, void 0, function () {
                var terminal, output;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            terminal = this.terminalManager.createTerminal('PowerShell Test', types_1.TerminalShellType.PowerShell);
                            return [4 /*yield*/, this.terminalManager.executeCommandWithOutput('Write-Host "test"', types_1.TerminalShellType.PowerShell)];
                        case 1:
                            output = _a.sent();
                            expect(output.trim()).toBe('test');
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('supports Git Bash commands', function () {
            return __awaiter(this, void 0, void 0, function () {
                var terminal, output;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            terminal = this.terminalManager.createTerminal('Git Bash Test', types_1.TerminalShellType.GitBash);
                            return [4 /*yield*/, this.terminalManager.executeCommandWithOutput('echo "test"', types_1.TerminalShellType.GitBash)];
                        case 1:
                            output = _a.sent();
                            expect(output.trim()).toBe('test');
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('supports WSL Bash commands on Windows', function () {
            return __awaiter(this, void 0, void 0, function () {
                var terminal_1, output;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(process.platform === 'win32')) return [3 /*break*/, 2];
                            terminal_1 = this.terminalManager.createTerminal('WSL Test', types_1.TerminalShellType.WSLBash);
                            return [4 /*yield*/, this.terminalManager.executeCommandWithOutput('echo "test"', types_1.TerminalShellType.WSLBash)];
                        case 1:
                            output = _a.sent();
                            expect(output.trim()).toBe('test');
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        });
    });
});
