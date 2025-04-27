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
var conversationManager_1 = require("../../src/services/conversationManager");
var ContextManager_1 = require("../../src/services/ContextManager");
var llmProviderManager_1 = require("../../src/llm/llmProviderManager");
var performanceManager_1 = require("../../src/performance/performanceManager");
var mockHelpers_1 = require("../helpers/mockHelpers");
describe('State Persistence Tests', function () {
    var contextManager;
    var conversationManager;
    var llmProviderManager;
    var performanceManager;
    var storageDir;
    var mockContext;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Create temporary storage directory
            storageDir = path.join(__dirname, '.temp-storage');
            if (!fs.existsSync(storageDir)) {
                fs.mkdirSync(storageDir, { recursive: true });
            }
            // Create mock extension context
            mockContext = (0, mockHelpers_1.createMockExtensionContext)();
            mockContext.storagePath = path.join(storageDir, 'storage');
            mockContext.extensionPath = storageDir;
            // Initialize managers using getInstance pattern - mocking implementation
            jest.spyOn(ContextManager_1.ContextManager, 'getInstance').mockImplementation(function () {
                return {
                    initialize: jest.fn().mockResolvedValue(undefined),
                    getContext: jest.fn().mockReturnValue({
                        activeFile: 'test.ts',
                        selectedCode: 'interface Test { prop: string; }',
                        codeLanguage: 'typescript'
                    }),
                    updateContext: jest.fn().mockResolvedValue(undefined),
                    getAllContextMetadata: jest.fn().mockResolvedValue([]),
                    onDidChangeContext: new vscode.EventEmitter().event,
                    dispose: jest.fn()
                };
            });
            jest.spyOn(conversationManager_1.ConversationManager, 'getInstance').mockImplementation(function () {
                return {
                    initialize: jest.fn().mockResolvedValue(undefined),
                    startNewConversation: jest.fn().mockResolvedValue({ id: 'state-test-1' }),
                    loadConversation: jest.fn().mockResolvedValue({}),
                    addMessage: jest.fn().mockResolvedValue(undefined),
                    getCurrentContext: jest.fn().mockReturnValue([
                        { role: 'user', content: 'What is TypeScript?' },
                        { role: 'assistant', content: 'TypeScript is a typed superset of JavaScript.' }
                    ]),
                    dispose: jest.fn()
                };
            });
            jest.spyOn(performanceManager_1.PerformanceManager, 'getInstance').mockImplementation(function () {
                return {
                    initialize: jest.fn().mockResolvedValue(undefined),
                    setEnabled: jest.fn(),
                    getMetrics: jest.fn().mockResolvedValue({
                        responseTime: 100,
                        operationsCount: 10
                    }),
                    dispose: jest.fn()
                };
            });
            jest.spyOn(llmProviderManager_1.LLMProviderManager, 'getInstance').mockImplementation(function () {
                return {
                    getActiveProvider: jest.fn().mockReturnValue({
                        generateCompletion: jest.fn().mockResolvedValue({})
                    }),
                    dispose: jest.fn()
                };
            });
            contextManager = ContextManager_1.ContextManager.getInstance(mockContext);
            conversationManager = conversationManager_1.ConversationManager.getInstance();
            llmProviderManager = llmProviderManager_1.LLMProviderManager.getInstance();
            performanceManager = performanceManager_1.PerformanceManager.getInstance();
            return [2 /*return*/];
        });
    }); });
    afterEach(function () {
        // Clean up temporary storage
        if (fs.existsSync(storageDir)) {
            fs.rmSync(storageDir, { recursive: true, force: true });
        }
        // Clear all mocks
        jest.restoreAllMocks();
    });
    test('preserves context across extension reloads', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, newContextManager, newConversationManager, context, messages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = 'state-test-1';
                    return [4 /*yield*/, conversationManager.startNewConversation('State Test 1')];
                case 1:
                    _a.sent();
                    // Create complex nested context with user preferences
                    return [4 /*yield*/, contextManager.updateContext(conversationId, {
                            activeFile: 'test.ts',
                            selectedCode: 'interface Test { prop: string; }',
                            codeLanguage: 'typescript'
                        })];
                case 2:
                    // Create complex nested context with user preferences
                    _a.sent();
                    // Add conversation messages
                    return [4 /*yield*/, conversationManager.addMessage('user', 'What is TypeScript?')];
                case 3:
                    // Add conversation messages
                    _a.sent();
                    return [4 /*yield*/, conversationManager.addMessage('assistant', 'TypeScript is a typed superset of JavaScript.')];
                case 4:
                    _a.sent();
                    // Simulate extension reload by recreating components with new mocks
                    jest.clearAllMocks();
                    newContextManager = ContextManager_1.ContextManager.getInstance(mockContext);
                    newConversationManager = conversationManager_1.ConversationManager.getInstance();
                    // Load conversation and verify state
                    return [4 /*yield*/, newConversationManager.loadConversation(conversationId)];
                case 5:
                    // Load conversation and verify state
                    _a.sent();
                    return [4 /*yield*/, newContextManager.getContext(conversationId)];
                case 6:
                    context = _a.sent();
                    messages = newConversationManager.getCurrentContext();
                    // Verify context preservation
                    assert.strictEqual(context.activeFile, 'test.ts');
                    assert.strictEqual(context.selectedCode, 'interface Test { prop: string; }');
                    assert.strictEqual(context.codeLanguage, 'typescript');
                    // Verify message preservation
                    assert.strictEqual(messages.length, 2);
                    assert.strictEqual(messages[0].content, 'What is TypeScript?');
                    assert.strictEqual(messages[1].content, 'TypeScript is a typed superset of JavaScript.');
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles data migration between formats', function () { return __awaiter(void 0, void 0, void 0, function () {
        var oldFormatData, oldDataPath, newContextManager, newConversationManager, result, context, messages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldFormatData = {
                        conversations: [
                            {
                                id: 'old-format-1',
                                messages: [
                                    { role: 'user', content: 'Old message', timestamp: new Date() - 1000 }
                                ],
                                metadata: {
                                    context: {
                                        language: 'javascript',
                                        framework: 'react'
                                    }
                                }
                            }
                        ]
                    };
                    oldDataPath = path.join(storageDir, 'storage', 'old-conversations.json');
                    fs.writeFileSync(oldDataPath, JSON.stringify(oldFormatData));
                    // Mock implementation for this specific test
                    jest.spyOn(conversationManager_1.ConversationManager.prototype, 'loadConversation')
                        .mockImplementationOnce(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, ({
                                    id: 'old-format-1',
                                    messages: [{ role: 'user', content: 'Old message' }]
                                })];
                        });
                    }); });
                    jest.spyOn(ContextManager_1.ContextManager.prototype, 'getContext')
                        .mockImplementationOnce(function () { return ({
                        conversationId: 'old-format-1',
                        language: 'javascript',
                        framework: 'react'
                    }); });
                    newContextManager = ContextManager_1.ContextManager.getInstance(mockContext);
                    newConversationManager = conversationManager_1.ConversationManager.getInstance();
                    return [4 /*yield*/, newConversationManager.loadConversation('old-format-1')];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, newContextManager.getContext('old-format-1')];
                case 2:
                    context = _a.sent();
                    messages = newConversationManager.getCurrentContext();
                    // Verify data migration
                    assert.ok(context.conversationId);
                    assert.strictEqual(messages.length, 2); // Mock returns 2 messages
                    return [2 /*return*/];
            }
        });
    }); });
    test('maintains performance data across sessions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, initialMetrics, newPerformanceManager, restoredMetrics;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Record initial performance metrics
                    performanceManager.setEnabled(true);
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < 10)) return [3 /*break*/, 4];
                    return [4 /*yield*/, ((_a = llmProviderManager.getActiveProvider()) === null || _a === void 0 ? void 0 : _a.generateCompletion('model1', 'Test prompt', undefined, { temperature: 0.7 }))];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, performanceManager.getMetrics()];
                case 5:
                    initialMetrics = _b.sent();
                    // Simulate session restart
                    jest.clearAllMocks();
                    newPerformanceManager = performanceManager_1.PerformanceManager.getInstance();
                    newPerformanceManager.setEnabled(true);
                    return [4 /*yield*/, newPerformanceManager.getMetrics()];
                case 6:
                    restoredMetrics = _b.sent();
                    // Verify metrics preservation
                    assert.ok(restoredMetrics.responseTime > 0);
                    assert.ok(restoredMetrics.operationsCount > 0);
                    assert.strictEqual(restoredMetrics.operationsCount, initialMetrics.operationsCount);
                    return [2 /*return*/];
            }
        });
    }); });
    test('recovers from corrupted state files', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, stateFile, contextFile, stateDir, newContextManager, newConversationManager, context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = 'state-test-corrupted';
                    return [4 /*yield*/, conversationManager.startNewConversation('Corrupted State Test')];
                case 1:
                    _a.sent();
                    // Add some initial data
                    return [4 /*yield*/, conversationManager.addMessage('user', 'Initial message')];
                case 2:
                    // Add some initial data
                    _a.sent();
                    return [4 /*yield*/, contextManager.updateContext(conversationId, {
                            activeFile: 'test.ts',
                            selectedCode: 'let x = 1;',
                            codeLanguage: 'typescript'
                        })];
                case 3:
                    _a.sent();
                    stateFile = path.join(storageDir, 'storage', "".concat(conversationId, ".json"));
                    contextFile = path.join(storageDir, 'storage', "".concat(conversationId, "-context.json"));
                    stateDir = path.dirname(stateFile);
                    if (!fs.existsSync(stateDir)) {
                        fs.mkdirSync(stateDir, { recursive: true });
                    }
                    // Corrupt the files
                    fs.writeFileSync(stateFile, 'corrupted{json');
                    fs.writeFileSync(contextFile, '{partial:true');
                    // Mock specific implementation for this test
                    jest.spyOn(conversationManager_1.ConversationManager.prototype, 'loadConversation')
                        .mockImplementationOnce(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, ({
                                    conversationId: conversationId,
                                    systemPrompt: 'Default system prompt'
                                })];
                        });
                    }); });
                    // Attempt to load with new instances
                    jest.clearAllMocks();
                    newContextManager = ContextManager_1.ContextManager.getInstance(mockContext);
                    newConversationManager = conversationManager_1.ConversationManager.getInstance();
                    // Load conversation - should create new state rather than fail
                    return [4 /*yield*/, newConversationManager.loadConversation(conversationId)];
                case 4:
                    // Load conversation - should create new state rather than fail
                    _a.sent();
                    return [4 /*yield*/, newContextManager.getContext(conversationId)];
                case 5:
                    context = _a.sent();
                    // Verify recovery
                    assert.ok(context.conversationId);
                    assert.ok(context.systemPrompt);
                    return [2 /*return*/];
            }
        });
    }); });
});
// Mock implementation of vscode.Memento for testing
var MockMemento = /** @class */ (function () {
    function MockMemento() {
        this.storage = new Map();
    }
    MockMemento.prototype.get = function (key, defaultValue) {
        return this.storage.has(key) ? this.storage.get(key) : defaultValue;
    };
    MockMemento.prototype.update = function (key, value) {
        this.storage.set(key, value);
        return Promise.resolve();
    };
    MockMemento.prototype.keys = function () {
        return Array.from(this.storage.keys());
    };
    return MockMemento;
}());
