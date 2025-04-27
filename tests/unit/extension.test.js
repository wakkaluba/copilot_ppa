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
var extension_1 = require("../../src/extension");
describe('Extension Tests', function () {
    var mockContext;
    beforeEach(function () {
        var _a;
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            storagePath: '/mock/storage/path',
            globalStoragePath: '/mock/global/storage/path',
            logPath: '/mock/log/path',
            extensionUri: vscode.Uri.file('/mock/extension/path'),
            storageUri: vscode.Uri.file('/mock/storage/path'),
            globalStorageUri: vscode.Uri.file('/mock/global/storage/path'),
            logUri: vscode.Uri.file('/mock/log/path'),
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn().mockReturnValue([]),
                setKeysForSync: jest.fn(),
            }, // Use 'as any' for simplicity if strict type isn't needed for test
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn().mockReturnValue([]),
            },
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn(),
                onDidChange: jest.fn(),
            },
            environmentVariableCollection: (_a = {
                    persistent: false,
                    replace: jest.fn(),
                    append: jest.fn(),
                    prepend: jest.fn(),
                    get: jest.fn(),
                    forEach: jest.fn(),
                    delete: jest.fn(),
                    clear: jest.fn()
                },
                _a[Symbol.iterator] = jest.fn(),
                _a.getScoped = jest.fn(),
                _a.description = undefined,
                _a),
            extensionMode: vscode.ExtensionMode.Test,
            asAbsolutePath: jest.fn(function (relativePath) { return "/mock/extension/path/".concat(relativePath); }),
            extension: {
                id: 'test.extension',
                extensionPath: '/mock/extension/path',
                isActive: false,
                packageJSON: {},
                extensionKind: vscode.ExtensionKind.Workspace,
                exports: {},
                activate: jest.fn().mockResolvedValue({}),
                extensionUri: vscode.Uri.file('/mock/extension/path'),
            },
            languageModelAccessInformation: {
                onDidChange: jest.fn(),
                canSendRequest: jest.fn().mockReturnValue(true)
            }
        };
    });
    describe('Activation', function () {
        it('should register commands on activation', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, extension_1.activate)(mockContext)];
                    case 1:
                        _a.sent();
                        expect(vscode.commands.registerCommand).toHaveBeenCalled();
                        expect(mockContext.subscriptions.length).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should register the welcome message command', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, extension_1.activate)(mockContext)];
                    case 1:
                        _a.sent();
                        expect(vscode.commands.registerCommand).toHaveBeenCalledWith('copilot-ppa.showWelcomeMessage', expect.any(Function));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should initialize services', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, extension_1.activate)(mockContext)];
                    case 1:
                        _a.sent();
                        // Verify service initialization through mocked commands
                        expect(vscode.commands.registerCommand).toHaveBeenCalledWith('copilot-ppa.startAgent', expect.any(Function));
                        expect(vscode.commands.registerCommand).toHaveBeenCalledWith('copilot-ppa.stopAgent', expect.any(Function));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Deactivation', function () {
        it('should clean up on deactivation', function () {
            var disposeStub = jest.fn();
            mockContext.subscriptions.push({ dispose: disposeStub });
            (0, extension_1.deactivate)();
            expect(disposeStub).toHaveBeenCalled();
        });
    });
    describe('Command Execution', function () {
        it('should show welcome message when command is executed', function () { return __awaiter(void 0, void 0, void 0, function () {
            var commandHandler;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, extension_1.activate)(mockContext)];
                    case 1:
                        _b.sent();
                        commandHandler = (_a = vscode.commands.registerCommand.mock.calls.find(function (call) { return call[0] === 'copilot-ppa.showWelcomeMessage'; })) === null || _a === void 0 ? void 0 : _a[1];
                        if (!commandHandler) return [3 /*break*/, 3];
                        return [4 /*yield*/, commandHandler()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Copilot Productivity and Performance Analyzer is active!');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle agent start/stop commands', function () { return __awaiter(void 0, void 0, void 0, function () {
            var startHandler;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, extension_1.activate)(mockContext)];
                    case 1:
                        _b.sent();
                        startHandler = (_a = vscode.commands.registerCommand.mock.calls.find(function (call) { return call[0] === 'copilot-ppa.startAgent'; })) === null || _a === void 0 ? void 0 : _a[1];
                        if (!startHandler) return [3 /*break*/, 3];
                        return [4 /*yield*/, startHandler()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(expect.stringContaining('Starting'));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
