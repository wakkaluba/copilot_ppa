"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
var ContextManager_1 = require("../../../../src/services/conversation/ContextManager");
describe('ContextManager', function () {
    var mockContext;
    var contextManager;
    beforeEach(function () {
        // Mock VS Code extension context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
            },
        };
        // Create new instance for each test
        contextManager = new ContextManager_1.ContextManager(mockContext);
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    describe('initialization', function () {
        it('should initialize successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(contextManager.initialize()).resolves.not.toThrow()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle initialization errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockContext.globalState.get.mockImplementation(function () {
                            throw new Error('Storage error');
                        });
                        return [4 /*yield*/, expect(contextManager.initialize()).rejects.toThrow('Failed to initialize context manager: Storage error')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('message handling', function () {
        var testMessage = {
            id: '123',
            role: 'user',
            content: 'Test message in typescript using react',
            timestamp: new Date()
        };
        it('should add message and extract preferences', function () {
            contextManager.addMessage(testMessage);
            expect(contextManager.getPreferredLanguage()).toBe('typescript');
            expect(contextManager.getPreferredFramework()).toBe('react');
        });
        it('should not analyze non-user messages', function () {
            var assistantMessage = __assign(__assign({}, testMessage), { role: 'assistant' });
            contextManager.addMessage(assistantMessage);
            expect(contextManager.getPreferredLanguage()).toBeUndefined();
        });
    });
    describe('language preferences', function () {
        it('should detect language preferences from messages', function () {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Help me with this Python code',
                timestamp: new Date()
            });
            expect(contextManager.getPreferredLanguage()).toBe('python');
        });
        it('should track multiple language usages', function () {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'JavaScript code',
                timestamp: new Date()
            });
            contextManager.addMessage({
                id: '2',
                role: 'user',
                content: 'More JavaScript',
                timestamp: new Date()
            });
            var frequentLangs = contextManager.getFrequentLanguages(1);
            expect(frequentLangs[0].language).toBe('javascript');
            expect(frequentLangs[0].count).toBe(2);
        });
    });
    describe('file preferences', function () {
        it('should detect file extensions from messages', function () {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Open the file test.ts',
                timestamp: new Date()
            });
            var extensions = contextManager.getRecentFileExtensions();
            expect(extensions).toContain('ts');
        });
        it('should detect directory preferences', function () {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Look in the src/components directory',
                timestamp: new Date()
            });
            var dirs = contextManager.getRecentDirectories();
            expect(dirs).toContain('src/components');
        });
        it('should detect file naming patterns', function () {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Name it like test.component.ts',
                timestamp: new Date()
            });
            var patterns = contextManager.getFileNamingPatterns();
            expect(patterns).toContain('test.component.ts');
        });
    });
    describe('context building', function () {
        it('should build context string with all preferences', function () {
            // Add messages to set up preferences
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Help with TypeScript React component in src/components',
                timestamp: new Date()
            });
            var contextString = contextManager.buildContextString();
            expect(contextString).toContain('TypeScript');
            expect(contextString).toContain('React');
            expect(contextString).toContain('src/components');
        });
    });
    describe('suggestions', function () {
        it('should generate context-aware suggestions', function () {
            // Set up context first
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Help with React components',
                timestamp: new Date()
            });
            var suggestions = contextManager.generateSuggestions('component');
            expect(suggestions).toContain('Create a new component');
            expect(suggestions).toContain('Add component styles');
        });
        it('should include framework-specific suggestions', function () {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Help with React state management',
                timestamp: new Date()
            });
            var suggestions = contextManager.generateSuggestions('state');
            expect(suggestions).toContain('Add state management with Redux/Context');
        });
    });
    describe('data clearing', function () {
        it('should clear all context data', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set up some data first
                        contextManager.addMessage({
                            id: '1',
                            role: 'user',
                            content: 'TypeScript React code',
                            timestamp: new Date()
                        });
                        return [4 /*yield*/, contextManager.clearAllContextData()];
                    case 1:
                        _a.sent();
                        expect(contextManager.getPreferredLanguage()).toBeUndefined();
                        expect(contextManager.getPreferredFramework()).toBeUndefined();
                        expect(contextManager.getRecentFileExtensions()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle errors during clearing', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockContext.globalState.update.mockRejectedValue(new Error('Clear error'));
                        return [4 /*yield*/, expect(contextManager.clearAllContextData()).rejects.toThrow('Failed to clear context data: Clear error')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
