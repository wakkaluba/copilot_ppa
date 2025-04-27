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
var globals_1 = require("@jest/globals");
var ContextManager_1 = require("../../../src/services/ContextManager");
var ConversationHistory_1 = require("../../../src/services/ConversationHistory");
var conversationManager_1 = require("../../../src/services/conversationManager");
var PromptManager_1 = require("../../../src/services/PromptManager");
// Mock the dependencies
globals_1.jest.mock('../../../src/services/ConversationHistory');
globals_1.jest.mock('../../../src/services/ConversationManager');
globals_1.jest.mock('../../../src/services/PromptManager');
(0, globals_1.describe)('ContextManager', function () {
    var contextManager;
    var mockHistory;
    var mockConversationManager;
    var mockPromptManager;
    (0, globals_1.beforeEach)(function () {
        // Reset mocks
        globals_1.jest.clearAllMocks();
        // Create mock instances
        mockHistory = new ConversationHistory_1.ConversationHistory();
        mockConversationManager = {
            getInstance: globals_1.jest.fn().mockReturnValue(mockConversationManager),
            getCurrentContext: globals_1.jest.fn().mockReturnValue([]),
            // Add other methods as needed
        };
        mockPromptManager = {
            getInstance: globals_1.jest.fn().mockReturnValue(mockPromptManager),
            // Add other methods as needed
        };
        // Mock getInstance methods on the classes
        conversationManager_1.ConversationManager.getInstance.mockReturnValue(mockConversationManager);
        PromptManager_1.PromptManager.getInstance.mockReturnValue(mockPromptManager);
        // Create instance of ContextManager
        contextManager = ContextManager_1.ContextManager.getInstance(mockHistory);
    });
    (0, globals_1.afterEach)(function () {
        globals_1.jest.resetAllMocks();
    });
    (0, globals_1.test)('getInstance should return singleton instance', function () {
        var instance1 = ContextManager_1.ContextManager.getInstance(mockHistory);
        var instance2 = ContextManager_1.ContextManager.getInstance(mockHistory);
        (0, globals_1.expect)(instance1).toBe(instance2);
    });
    (0, globals_1.test)('createContext should initialize a new context with default values', function () {
        var conversationId = 'test_conversation';
        var context = contextManager.createContext(conversationId);
        (0, globals_1.expect)(context.conversationId).toBe(conversationId);
        (0, globals_1.expect)(context.relevantFiles).toEqual([]);
        (0, globals_1.expect)(context.systemPrompt).toContain('You are a helpful VS Code extension assistant');
    });
    (0, globals_1.test)('updateContext should modify an existing context', function () {
        var conversationId = 'test_conversation';
        contextManager.createContext(conversationId);
        contextManager.updateContext(conversationId, {
            activeFile: 'test.ts',
            selectedCode: 'console.log("Hello");',
            codeLanguage: 'typescript'
        });
        var context = contextManager.getContext(conversationId);
        (0, globals_1.expect)(context.activeFile).toBe('test.ts');
        (0, globals_1.expect)(context.selectedCode).toBe('console.log("Hello");');
        (0, globals_1.expect)(context.codeLanguage).toBe('typescript');
    });
    (0, globals_1.test)('updateContext should throw error for non-existent context', function () {
        (0, globals_1.expect)(function () {
            contextManager.updateContext('nonexistent_id', {
                activeFile: 'test.ts'
            });
        }).toThrow(/Context not found/);
    });
    (0, globals_1.test)('getContext should create a new context if it does not exist', function () {
        var conversationId = 'new_conversation';
        var context = contextManager.getContext(conversationId);
        (0, globals_1.expect)(context.conversationId).toBe(conversationId);
        (0, globals_1.expect)(context.systemPrompt).toContain('VS Code extension assistant');
    });
    (0, globals_1.test)('buildPrompt should incorporate context into the prompt', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, prompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = 'test_conversation';
                    // Create a context with specific values
                    contextManager.createContext(conversationId);
                    contextManager.updateContext(conversationId, {
                        activeFile: 'test.ts',
                        selectedCode: 'function add(a, b) { return a + b; }',
                        codeLanguage: 'typescript'
                    });
                    // Mock conversation history
                    mockHistory.getConversation = globals_1.jest.fn().mockReturnValue({
                        id: conversationId,
                        title: "Test Conversation",
                        created: Date.now(),
                        updated: Date.now(),
                        messages: [
                            { role: 'user', content: 'Help me understand this code', timestamp: new Date() },
                            { role: 'assistant', content: 'This is a function that adds two numbers', timestamp: new Date() }
                        ]
                    });
                    return [4 /*yield*/, contextManager.buildPrompt(conversationId, 'What does this function do?')];
                case 1:
                    prompt = _a.sent();
                    // Verify the prompt contains the expected elements
                    (0, globals_1.expect)(prompt).toContain('Current file: test.ts');
                    (0, globals_1.expect)(prompt).toContain('Selected code:');
                    (0, globals_1.expect)(prompt).toContain('function add(a, b) { return a + b; }');
                    (0, globals_1.expect)(prompt).toContain('What does this function do?');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('buildContext should return relevant context and conversation history', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, userPrompt, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = 'test_conversation';
                    userPrompt = 'Help me with this code';
                    // Mock conversation manager to return some context
                    mockConversationManager.getCurrentContext.mockReturnValue([
                        { role: 'user', content: 'Previous user message' },
                        { role: 'assistant', content: 'Previous assistant response' }
                    ]);
                    return [4 /*yield*/, contextManager.buildContext(conversationId, userPrompt)];
                case 1:
                    result = _a.sent();
                    // Check that the context includes both history messages
                    (0, globals_1.expect)(result).toContain('Previous user message');
                    (0, globals_1.expect)(result).toContain('Previous assistant response');
                    // Verify that getCurrentContext was called with the correct parameters
                    (0, globals_1.expect)(mockConversationManager.getCurrentContext).toHaveBeenCalledWith(globals_1.expect.any(Number) // The max window size
                    );
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('updateContext with a sliding window should keep only recent messages', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, maxWindowSize, i, contextWindows, window, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = 'test_conversation';
                    maxWindowSize = contextManager.maxWindowSize;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < maxWindowSize + 3)) return [3 /*break*/, 4];
                    return [4 /*yield*/, contextManager.updateContext(conversationId, "Message ".concat(i), 1.0)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    contextWindows = contextManager.contextWindows;
                    window = contextWindows.get(conversationId);
                    (0, globals_1.expect)(window.messages.length).toBe(maxWindowSize);
                    // The window should contain the most recent messages
                    for (i = 0; i < maxWindowSize; i++) {
                        (0, globals_1.expect)(window.messages[i]).toBe("Message ".concat(i + 3));
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('setMaxWindowSize changes the maximum window size', function () {
        var newSize = 5;
        contextManager.setMaxWindowSize(newSize);
        (0, globals_1.expect)(contextManager.maxWindowSize).toBe(newSize);
    });
    (0, globals_1.test)('setRelevanceThreshold changes the relevance threshold', function () {
        var newThreshold = 0.75;
        contextManager.setRelevanceThreshold(newThreshold);
        (0, globals_1.expect)(contextManager.relevanceThreshold).toBe(newThreshold);
    });
    (0, globals_1.describe)('Language and Framework Preferences', function () {
        (0, globals_1.test)('extractLanguagePreferences should detect language from code mentions', function () {
            var context = contextManager.createContext('test_conversation');
            contextManager.updateContext('test_conversation', {
                activeFile: 'test.ts',
                messageContent: 'I am working on a TypeScript project with React'
            });
            var preferences = contextManager.getPreferredLanguage();
            (0, globals_1.expect)(preferences).toBe('typescript');
        });
        (0, globals_1.test)('extractLanguagePreferences should detect framework from conversation', function () {
            var context = contextManager.createContext('test_conversation');
            contextManager.updateContext('test_conversation', {
                messageContent: 'I need help with my Laravel application'
            });
            var framework = contextManager.getPreferredFramework();
            (0, globals_1.expect)(framework).toBe('laravel');
            (0, globals_1.expect)(contextManager.getPreferredLanguage()).toBe('php');
        });
    });
    (0, globals_1.describe)('File Management', function () {
        (0, globals_1.test)('should track recently accessed directories', function () {
            contextManager.createContext('test_conversation');
            contextManager.updateContext('test_conversation', {
                messageContent: 'Looking at files in src/components/'
            });
            var recentDirs = contextManager.getRecentDirectories();
            (0, globals_1.expect)(recentDirs).toContain('src/components');
        });
        (0, globals_1.test)('should detect file naming patterns', function () {
            contextManager.createContext('test_conversation');
            contextManager.updateContext('test_conversation', {
                messageContent: 'Name the files like user.service.ts'
            });
            var patterns = contextManager.getFileNamingPatterns();
            (0, globals_1.expect)(patterns).toContain('user.service.ts');
        });
        (0, globals_1.test)('should track file extensions from active files', function () {
            contextManager.createContext('test_conversation');
            contextManager.updateContext('test_conversation', {
                activeFile: 'component.tsx',
                messageContent: 'Working on React components'
            });
            var extensions = contextManager.getRecentFileExtensions();
            (0, globals_1.expect)(extensions).toContain('tsx');
        });
    });
    (0, globals_1.describe)('Topic Extraction and Context Building', function () {
        (0, globals_1.test)('should extract topics from conversation messages', function () {
            var messages = [
                { role: 'user', content: 'Help with TypeScript interfaces', timestamp: new Date() },
                { role: 'assistant', content: 'Here\'s how to define interfaces', timestamp: new Date() },
                { role: 'user', content: 'How to use generics?', timestamp: new Date() }
            ];
            var topics = contextManager.extractTopics(messages);
            (0, globals_1.expect)(topics).toContain('TypeScript interfaces');
            (0, globals_1.expect)(topics).toContain('generics');
        });
        (0, globals_1.test)('should build rich context string with all relevant information', function () { return __awaiter(void 0, void 0, void 0, function () {
            var conversationId, context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversationId = 'test_conversation';
                        contextManager.createContext(conversationId);
                        // Set up various context elements
                        contextManager.updateContext(conversationId, {
                            activeFile: 'app.tsx',
                            selectedCode: 'interface User { id: number; name: string; }',
                            codeLanguage: 'typescript',
                            messageContent: 'Working on user management in React'
                        });
                        return [4 /*yield*/, contextManager.buildContext(conversationId, 'Help with this interface')];
                    case 1:
                        context = _a.sent();
                        (0, globals_1.expect)(context).toContain('typescript');
                        (0, globals_1.expect)(context).toContain('React');
                        (0, globals_1.expect)(context).toContain('interface User');
                        (0, globals_1.expect)(context).toContain('app.tsx');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should prune irrelevant context based on relevance threshold', function () { return __awaiter(void 0, void 0, void 0, function () {
            var conversationId, context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversationId = 'test_conversation';
                        contextManager.setRelevanceThreshold(0.7);
                        // Add several messages with varying relevance scores
                        return [4 /*yield*/, contextManager.updateContext(conversationId, 'Relevant message about TypeScript', 0.8)];
                    case 1:
                        // Add several messages with varying relevance scores
                        _a.sent();
                        return [4 /*yield*/, contextManager.updateContext(conversationId, 'Less relevant message about CSS', 0.5)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, contextManager.updateContext(conversationId, 'Another relevant TypeScript message', 0.9)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, contextManager.buildContext(conversationId, 'Help with TypeScript')];
                    case 4:
                        context = _a.sent();
                        (0, globals_1.expect)(context).toContain('Relevant message about TypeScript');
                        (0, globals_1.expect)(context).toContain('Another relevant TypeScript message');
                        (0, globals_1.expect)(context).not.toContain('Less relevant message about CSS');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
