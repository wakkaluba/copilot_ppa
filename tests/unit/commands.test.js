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
var commandManager_1 = require("../../src/commands/commandManager");
var agentService_1 = require("../../src/agents/agentService");
jest.mock('../../src/agents/agentService');
describe('Command Manager', function () {
    var commandManager;
    var mockContext;
    var mockAgentService;
    beforeEach(function () {
        var _a;
        mockAgentService = new agentService_1.AgentService();
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                setKeysForSync: jest.fn(),
                keys: function () { return []; }
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: function () { return []; }
            },
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn(),
                onDidChange: new vscode.EventEmitter().event
            },
            extensionUri: vscode.Uri.file('/test/path'),
            environmentVariableCollection: (_a = {
                    persistent: true,
                    replace: jest.fn(),
                    append: jest.fn(),
                    prepend: jest.fn(),
                    get: jest.fn(),
                    forEach: jest.fn(),
                    delete: jest.fn(),
                    clear: jest.fn(),
                    getScoped: jest.fn()
                },
                _a[Symbol.iterator] = jest.fn(),
                _a.description = undefined,
                _a),
            storageUri: vscode.Uri.file('/test/storage'),
            globalStorageUri: vscode.Uri.file('/test/global-storage'),
            logUri: vscode.Uri.file('/test/log'),
            extensionMode: vscode.ExtensionMode.Test
        };
        commandManager = new commandManager_1.CommandManager(mockContext, mockAgentService);
    });
    describe('Command Registration', function () {
        it('should register all commands', function () {
            var registerCommandSpy = jest.spyOn(vscode.commands, 'registerCommand');
            commandManager.registerCommands();
            expect(registerCommandSpy).toHaveBeenCalledTimes(expect.any(Number));
            expect(mockContext.subscriptions.length).toBeGreaterThan(0);
        });
    });
    describe('Agent Commands', function () {
        it('should start agent', function () { return __awaiter(void 0, void 0, void 0, function () {
            var startSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startSpy = jest.spyOn(mockAgentService, 'start');
                        return [4 /*yield*/, commandManager.startAgent()];
                    case 1:
                        _a.sent();
                        expect(startSpy).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should stop agent', function () { return __awaiter(void 0, void 0, void 0, function () {
            var stopSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stopSpy = jest.spyOn(mockAgentService, 'stop');
                        return [4 /*yield*/, commandManager.stopAgent()];
                    case 1:
                        _a.sent();
                        expect(stopSpy).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should restart agent', function () { return __awaiter(void 0, void 0, void 0, function () {
            var stopSpy, startSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stopSpy = jest.spyOn(mockAgentService, 'stop');
                        startSpy = jest.spyOn(mockAgentService, 'start');
                        return [4 /*yield*/, commandManager.restartAgent()];
                    case 1:
                        _a.sent();
                        expect(stopSpy).toHaveBeenCalled();
                        expect(startSpy).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Model Configuration', function () {
        it('should configure model', function () { return __awaiter(void 0, void 0, void 0, function () {
            var showQuickPickSpy, configureSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        showQuickPickSpy = jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValue('llama2');
                        configureSpy = jest.spyOn(mockAgentService, 'configureModel');
                        return [4 /*yield*/, commandManager.configureModel()];
                    case 1:
                        _a.sent();
                        expect(showQuickPickSpy).toHaveBeenCalled();
                        expect(configureSpy).toHaveBeenCalledWith('llama2');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle model configuration cancellation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var configureSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(vscode.window, 'showQuickPick').mockResolvedValue(undefined);
                        configureSpy = jest.spyOn(mockAgentService, 'configureModel');
                        return [4 /*yield*/, commandManager.configureModel()];
                    case 1:
                        _a.sent();
                        expect(configureSpy).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Conversation Management', function () {
        it('should clear conversation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var clearSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clearSpy = jest.spyOn(mockAgentService, 'clearConversation');
                        return [4 /*yield*/, commandManager.clearConversation()];
                    case 1:
                        _a.sent();
                        expect(clearSpy).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show confirmation before clearing', function () { return __awaiter(void 0, void 0, void 0, function () {
            var showWarningMessageSpy, clearSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        showWarningMessageSpy = jest.spyOn(vscode.window, 'showWarningMessage')
                            .mockResolvedValue('Yes');
                        clearSpy = jest.spyOn(mockAgentService, 'clearConversation');
                        return [4 /*yield*/, commandManager.clearConversation()];
                    case 1:
                        _a.sent();
                        expect(showWarningMessageSpy).toHaveBeenCalled();
                        expect(clearSpy).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not clear when confirmation is cancelled', function () { return __awaiter(void 0, void 0, void 0, function () {
            var clearSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(vscode.window, 'showWarningMessage').mockResolvedValue(undefined);
                        clearSpy = jest.spyOn(mockAgentService, 'clearConversation');
                        return [4 /*yield*/, commandManager.clearConversation()];
                    case 1:
                        _a.sent();
                        expect(clearSpy).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Error Handling', function () {
        it('should handle agent start errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var error, showErrorSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = new Error('Failed to start agent');
                        jest.spyOn(mockAgentService, 'start').mockRejectedValue(error);
                        showErrorSpy = jest.spyOn(vscode.window, 'showErrorMessage');
                        return [4 /*yield*/, commandManager.startAgent()];
                    case 1:
                        _a.sent();
                        expect(showErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to start agent'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle agent stop errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var error, showErrorSpy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = new Error('Failed to stop agent');
                        jest.spyOn(mockAgentService, 'stop').mockRejectedValue(error);
                        showErrorSpy = jest.spyOn(vscode.window, 'showErrorMessage');
                        return [4 /*yield*/, commandManager.stopAgent()];
                    case 1:
                        _a.sent();
                        expect(showErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to stop agent'));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Cleanup', function () {
        it('should dispose all commands on deactivation', function () {
            var disposeSpy = jest.fn();
            mockContext.subscriptions.push({ dispose: disposeSpy });
            commandManager.dispose();
            expect(disposeSpy).toHaveBeenCalled();
        });
    });
});
