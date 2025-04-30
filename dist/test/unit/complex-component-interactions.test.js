"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var mockHelpers_1 = require("../helpers/mockHelpers");
var llmProviderManager_1 = require("../../services/llmProviderManager");
var contextManager_1 = require("../../services/contextManager");
describe('Component Interactions', function () {
    var historyMock;
    var contextManagerMock;
    var llmProviderManagerMock;
    var mockContext;
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        // Create mocks for the core components
        historyMock = (0, mockHelpers_1.createMockConversationHistory)();
        contextManagerMock = sandbox.createStubInstance(contextManager_1.ContextManager);
        llmProviderManagerMock = sandbox.createStubInstance(llmProviderManager_1.LLMProviderManager);
        // Setup standard behaviors
        contextManagerMock.buildPrompt = sandbox.stub().resolves('Test prompt');
        llmProviderManagerMock.generateCompletion = sandbox.stub().resolves('Test completion');
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should process a full conversation flow', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var conversationId, testTitle, testMessage, conversation, promptText, assistantResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversationId = 'test-conversation';
                        testTitle = 'Test Conversation';
                        testMessage = 'Hello, assistant';
                        historyMock.createConversation.resolves({
                            id: conversationId,
                            title: testTitle,
                            messages: [],
                            created: Date.now(),
                            updated: Date.now()
                        });
                        return [4 /*yield*/, historyMock.createConversation(testTitle)];
                    case 1:
                        conversation = _a.sent();
                        assert.strictEqual(conversation.id, conversationId);
                        // 2. Add a user message
                        return [4 /*yield*/, historyMock.addMessage(conversationId, {
                                role: 'user',
                                content: testMessage,
                                timestamp: new Date()
                            })];
                    case 2:
                        // 2. Add a user message
                        _a.sent();
                        sinon.assert.calledWith(historyMock.addMessage, conversationId, sinon.match({ role: 'user', content: testMessage }));
                        return [4 /*yield*/, contextManagerMock.buildPrompt(conversationId, testMessage)];
                    case 3:
                        promptText = _a.sent();
                        assert.strictEqual(promptText, 'Test prompt');
                        return [4 /*yield*/, llmProviderManagerMock.generateCompletion(promptText)];
                    case 4:
                        assistantResponse = _a.sent();
                        assert.strictEqual(assistantResponse, 'Test completion');
                        // 5. Save the assistant's response
                        return [4 /*yield*/, historyMock.addMessage(conversationId, {
                                role: 'assistant',
                                content: assistantResponse,
                                timestamp: new Date()
                            })];
                    case 5:
                        // 5. Save the assistant's response
                        _a.sent();
                        sinon.assert.calledWith(historyMock.addMessage, conversationId, sinon.match({ role: 'assistant', content: 'Test completion' }));
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should handle error recovery during conversation flow', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var conversationId, error_1, recoveryResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversationId = 'error-test-conversation';
                        // Setup error in LLM
                        llmProviderManagerMock.generateCompletion.rejects(new Error('Network error'));
                        // Mock recovery behavior
                        llmProviderManagerMock.recoverFromError = sandbox.stub().resolves({
                            success: true,
                            result: 'Recovered response'
                        });
                        // 1. Create conversation and add message
                        historyMock.createConversation.resolves({
                            id: conversationId,
                            title: 'Error Test',
                            messages: [],
                            created: Date.now(),
                            updated: Date.now()
                        });
                        return [4 /*yield*/, historyMock.createConversation('Error Test')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, historyMock.addMessage(conversationId, {
                                role: 'user',
                                content: 'This will trigger an error',
                                timestamp: new Date()
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, llmProviderManagerMock.generateCompletion('This will trigger an error')];
                    case 4:
                        _a.sent();
                        assert.fail('Expected error was not thrown');
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        assert.strictEqual(error_1.message, 'Network error');
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, llmProviderManagerMock.recoverFromError(new Error('Network error'))];
                    case 7:
                        recoveryResult = _a.sent();
                        assert.strictEqual(recoveryResult.success, true);
                        assert.strictEqual(recoveryResult.result, 'Recovered response');
                        // 4. Save the recovered response
                        return [4 /*yield*/, historyMock.addMessage(conversationId, {
                                role: 'assistant',
                                content: recoveryResult.result,
                                timestamp: new Date()
                            })];
                    case 8:
                        // 4. Save the recovered response
                        _a.sent();
                        sinon.assert.calledWith(historyMock.addMessage, conversationId, sinon.match({ role: 'assistant', content: 'Recovered response' }));
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should handle context update with file changes', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var conversationId, fileContent, prompt, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversationId = 'file-context-conversation';
                        fileContent = 'function test() { return true; }';
                        // Setup conversation
                        historyMock.createConversation.resolves({
                            id: conversationId,
                            title: 'File Context Test',
                            messages: [],
                            created: Date.now(),
                            updated: Date.now()
                        });
                        return [4 /*yield*/, historyMock.createConversation('File Context Test')];
                    case 1:
                        _a.sent();
                        // Update context with file content
                        return [4 /*yield*/, contextManagerMock.updateContext(conversationId, {
                                activeFile: 'test.js',
                                selectedCode: fileContent,
                                codeLanguage: 'javascript'
                            })];
                    case 2:
                        // Update context with file content
                        _a.sent();
                        sinon.assert.calledWith(contextManagerMock.updateContext, conversationId, sinon.match({
                            activeFile: 'test.js',
                            selectedCode: fileContent,
                            codeLanguage: 'javascript'
                        }));
                        // User asks about the file
                        return [4 /*yield*/, historyMock.addMessage(conversationId, {
                                role: 'user',
                                content: 'What does this function do?',
                                timestamp: new Date()
                            })];
                    case 3:
                        // User asks about the file
                        _a.sent();
                        // Generate response with context
                        contextManagerMock.buildPrompt.resolves("Here's the context:\nActive file: test.js\nCode: ".concat(fileContent, "\nUser question: What does this function do?"));
                        return [4 /*yield*/, contextManagerMock.buildPrompt(conversationId, 'What does this function do?')];
                    case 4:
                        prompt = _a.sent();
                        llmProviderManagerMock.generateCompletion.withArgs(prompt).resolves('This function named "test" returns true.');
                        return [4 /*yield*/, llmProviderManagerMock.generateCompletion(prompt)];
                    case 5:
                        response = _a.sent();
                        assert.strictEqual(response, 'This function named "test" returns true.');
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=complex-component-interactions.test.js.map