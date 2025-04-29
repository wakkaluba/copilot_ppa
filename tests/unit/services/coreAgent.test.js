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
var coreAgent_1 = require("../../../src/services/coreAgent");
jest.mock('vscode');
jest.mock('../../../src/services/conversation/ContextManager');
jest.mock('../../../src/services/conversation/ConversationMemory');
jest.mock('../../../src/services/conversation/UserPreferences');
jest.mock('../../../src/services/conversation/FilePreferences');
jest.mock('../../../src/utils/logger');

describe('CoreAgent', function () {
    var mockContext;
    var mockContextManager;
    var mockLogger;
    var agent;
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
        // Mock ContextManager
        mockContextManager = {
            initialize: jest.fn().mockResolvedValue(undefined),
            addMessage: jest.fn(),
            getConversationHistory: jest.fn().mockReturnValue([]),
            getPreferredLanguage: jest.fn().mockReturnValue('typescript'),
            getFrequentLanguages: jest.fn().mockReturnValue([]),
            getPreferredFramework: jest.fn().mockReturnValue('react'),
            getRecentFileExtensions: jest.fn().mockReturnValue([]),
            getRecentDirectories: jest.fn().mockReturnValue([]),
            getFileNamingPatterns: jest.fn().mockReturnValue([]),
            buildContextString: jest.fn().mockReturnValue('Test context'),
            processInput: jest.fn().mockResolvedValue({
                text: 'Test response', 
                context: 'Test context'
            }),
            getSuggestions: jest.fn().mockResolvedValue(['Suggestion 1', 'Suggestion 2']),
            clearContext: jest.fn().mockResolvedValue(undefined),
            dispose: jest.fn(),
        };
        
        // Mock Logger
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            log: jest.fn(),
            setLogLevel: jest.fn(),
            show: jest.fn(),
            clear: jest.fn(),
            dispose: jest.fn()
        };
        
        // Create the agent with mocked dependencies
        agent = new coreAgent_1.CoreAgent(mockContextManager, mockLogger);
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    describe('processInput', function () {
        it('should process input and return response with context', function () { return __awaiter(void 0, void 0, void 0, function () {
            var input, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        input = 'Test input';
                        return [4 /*yield*/, agent.processInput(input)];
                    case 1:
                        response = _a.sent();
                        expect(response).toEqual({
                            text: 'Test response',
                            context: 'Test context'
                        });
                        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Processing input'));
                        expect(mockContextManager.processInput).toHaveBeenCalledWith(input);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle errors during processing', function () { return __awaiter(void 0, void 0, void 0, function () {
            var input, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        input = 'Test input';
                        error = new Error('Test error');
                        mockContextManager.processInput.mockRejectedValue(error);
                        return [4 /*yield*/, expect(agent.processInput(input)).rejects.toThrow(error)];
                    case 1:
                        _a.sent();
                        expect(mockLogger.error).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getSuggestions', function () {
        it('should return suggestions based on current input', function () { return __awaiter(void 0, void 0, void 0, function () {
            var input, expectedSuggestions, suggestions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        input = 'test';
                        expectedSuggestions = ['Suggestion 1', 'Suggestion 2'];
                        mockContextManager.getSuggestions.mockResolvedValue(expectedSuggestions);
                        return [4 /*yield*/, agent.getSuggestions(input)];
                    case 1:
                        suggestions = _a.sent();
                        expect(suggestions).toEqual(expectedSuggestions);
                        expect(mockContextManager.getSuggestions).toHaveBeenCalledWith(input);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('clearContext', function () {
        it('should clear all context data', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, agent.clearContext()];
                    case 1:
                        _a.sent();
                        expect(mockContextManager.clearContext).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle errors during context clearing', function () { return __awaiter(void 0, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = new Error('Test error');
                        mockContextManager.clearContext.mockRejectedValue(error);
                        return [4 /*yield*/, expect(agent.clearContext()).rejects.toThrow(error)];
                    case 1:
                        _a.sent();
                        expect(mockLogger.error).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('dispose', function () {
        it('should dispose all resources', function () {
            agent.dispose();
            expect(mockContextManager.dispose).toHaveBeenCalled();
        });
    });
});
