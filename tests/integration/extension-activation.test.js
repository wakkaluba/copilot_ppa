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
jest.mock('vscode', function () { return ({
    commands: {
        registerCommand: jest.fn(),
        getCommands: jest.fn().mockResolvedValue([
            'copilot-ppa.startAgent',
            'copilot-ppa.stopAgent',
            'copilot-ppa.showWelcomeMessage'
        ])
    },
    window: {
        showInformationMessage: jest.fn()
    },
    ExtensionContext: jest.fn(),
    ExtensionMode: {
        Test: 2
    },
    ExtensionKind: {
        UI: 1,
        Workspace: 2
    },
    Uri: {
        file: jest.fn(function (path) { return ({ path: path, scheme: 'file', fsPath: path }); })
    }
}); }, { virtual: true });
describe('Extension Activation Integration Test', function () {
    var mockContext;
    beforeEach(function () {
        var _a;
        mockContext = {
            subscriptions: [],
            extensionPath: '',
            storagePath: '/test/storage',
            globalStoragePath: '/test/global/storage',
            logPath: '/test/log',
            extensionUri: vscode.Uri.file(''),
            globalStorageUri: vscode.Uri.file('/test/global/storage'),
            logUri: vscode.Uri.file('/test/log'),
            storageUri: vscode.Uri.file('/test/storage'),
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                setKeysForSync: jest.fn(),
                keys: jest.fn().mockReturnValue([])
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn().mockReturnValue([])
            },
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn(),
                onDidChange: jest.fn()
            },
            environmentVariableCollection: (_a = {
                    persistent: true,
                    replace: jest.fn(),
                    append: jest.fn(),
                    prepend: jest.fn(),
                    get: jest.fn(),
                    forEach: jest.fn(),
                    delete: jest.fn(),
                    clear: jest.fn(),
                    getScoped: jest.fn(),
                    description: ''
                },
                _a[Symbol.iterator] = jest.fn(),
                _a),
            extensionMode: vscode.ExtensionMode.Test,
            asAbsolutePath: jest.fn(function (path) { return "/test/path/".concat(path); }),
            extension: {
                id: 'test-extension',
                extensionUri: vscode.Uri.file(''),
                extensionPath: '',
                isActive: true,
                packageJSON: {},
                exports: {},
                activate: jest.fn(),
                extensionKind: 1 // ExtensionKind.UI
            },
            languageModelAccessInformation: {
                onDidChange: jest.fn(),
                canSendRequest: jest.fn(function (chat) { return true; })
            }
        };
        jest.clearAllMocks();
    });
    it('should activate and register commands', function () { return __awaiter(void 0, void 0, void 0, function () {
        var commands;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, extension_1.activate)(mockContext)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, vscode.commands.getCommands()];
                case 2:
                    commands = _a.sent();
                    expect(commands).toContain('copilot-ppa.startAgent');
                    expect(commands).toContain('copilot-ppa.stopAgent');
                    expect(mockContext.subscriptions.length).toBeGreaterThan(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should register the welcome message command', function () { return __awaiter(void 0, void 0, void 0, function () {
        var commands;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, extension_1.activate)(mockContext)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, vscode.commands.getCommands()];
                case 2:
                    commands = _a.sent();
                    expect(commands).toContain('copilot-ppa.showWelcomeMessage');
                    expect(vscode.commands.registerCommand).toHaveBeenCalledWith('copilot-ppa.showWelcomeMessage', expect.any(Function));
                    return [2 /*return*/];
            }
        });
    }); });
    it('should add command registrations to subscriptions', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, extension_1.activate)(mockContext)];
                case 1:
                    _a.sent();
                    expect(mockContext.subscriptions.length).toBeGreaterThan(0);
                    expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(expect.any(Number));
                    return [2 /*return*/];
            }
        });
    }); });
});
