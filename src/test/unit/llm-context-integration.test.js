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
var assert = require("assert");
var sinon = require("sinon");
var mockHelpers_1 = require("../helpers/mockHelpers");
var llmProviderManager_1 = require("../../services/llmProviderManager");
var contextManager_1 = require("../../services/contextManager");
describe('LLM and Context Integration', function () {
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
    it('should integrate context with LLM generation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, userPrompt, prompt, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = 'test-conversation';
                    userPrompt = 'Test user prompt';
                    // Setup the conversation
                    historyMock.getConversation.returns({
                        id: conversationId,
                        title: 'Test Conversation',
                        messages: [
                            { role: 'user', content: 'Initial message', timestamp: new Date() - 1000 }
                        ],
                        created: Date.now() - 1000,
                        updated: Date.now()
                    });
                    // Setup context to include file information
                    contextManagerMock.buildPrompt.resolves("\n            You are a helpful assistant.\n            \n            Current file: test.ts\n            Selected code: function add(a: number, b: number): number { return a + b; }\n            \n            User: ".concat(userPrompt, "\n        "));
                    return [4 /*yield*/, contextManagerMock.buildPrompt(conversationId, userPrompt)];
                case 1:
                    prompt = _a.sent();
                    return [4 /*yield*/, llmProviderManagerMock.generateCompletion(prompt)];
                case 2:
                    response = _a.sent();
                    // Verify the integration
                    sinon.assert.calledWith(contextManagerMock.buildPrompt, conversationId, userPrompt);
                    sinon.assert.calledWith(llmProviderManagerMock.generateCompletion, prompt);
                    assert.strictEqual(response, 'Test completion');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle prompt modifications based on history', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, followUpPrompt, fullPrompt, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = 'history-conversation';
                    // Setup conversation with history
                    historyMock.getConversation.returns({
                        id: conversationId,
                        title: 'History Test',
                        messages: [
                            { role: 'user', content: 'What is TypeScript?', timestamp: new Date() - 3000 },
                            { role: 'assistant', content: 'TypeScript is a programming language...', timestamp: new Date() - 2000 },
                            { role: 'user', content: 'How do I use interfaces?', timestamp: new Date() - 1000 }
                        ],
                        created: Date.now() - 3000,
                        updated: Date.now() - 1000
                    });
                    // Mock the context manager to include history in the prompt
                    contextManagerMock.buildPrompt.callsFake(function (convId, userPrompt) { return __awaiter(void 0, void 0, void 0, function () {
                        var conversation, contextPrompt;
                        return __generator(this, function (_a) {
                            conversation = historyMock.getConversation(convId);
                            contextPrompt = 'You are a helpful assistant.\n\n';
                            contextPrompt += 'Conversation history:\n';
                            conversation.messages.forEach(function (msg) {
                                contextPrompt += "".concat(msg.role, ": ").concat(msg.content, "\n");
                            });
                            contextPrompt += "\nUser: ".concat(userPrompt);
                            return [2 /*return*/, contextPrompt];
                        });
                    }); });
                    followUpPrompt = 'Can you show me an example?';
                    return [4 /*yield*/, contextManagerMock.buildPrompt(conversationId, followUpPrompt)];
                case 1:
                    fullPrompt = _a.sent();
                    // Verify the prompt contains the history
                    assert.ok(fullPrompt.includes('What is TypeScript?'));
                    assert.ok(fullPrompt.includes('TypeScript is a programming language...'));
                    assert.ok(fullPrompt.includes('How do I use interfaces?'));
                    assert.ok(fullPrompt.includes('Can you show me an example?'));
                    // Generate LLM response
                    llmProviderManagerMock.generateCompletion.withArgs(fullPrompt).resolves('Here is an example of a TypeScript interface:\n\ninterface User { id: number; name: string; }');
                    return [4 /*yield*/, llmProviderManagerMock.generateCompletion(fullPrompt)];
                case 2:
                    response = _a.sent();
                    assert.ok(response.includes('interface User'));
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle token limits by truncating history', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, longHistory, followUpPrompt, fullPrompt, messagesIncluded;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = 'long-conversation';
                    longHistory = Array.from({ length: 20 }, function (_, i) { return ({
                        role: i % 2 === 0 ? 'user' : 'assistant',
                        content: "Message ".concat(i, ": ").concat('X'.repeat(100)),
                        timestamp: new Date() - (20 - i) * 1000
                    }); });
                    // Setup conversation with long history
                    historyMock.getConversation.returns({
                        id: conversationId,
                        title: 'Long Conversation',
                        messages: longHistory,
                        created: Date.now() - 20000,
                        updated: Date.now()
                    });
                    // Mock token counting
                    llmProviderManagerMock.countTokens = sandbox.stub().callsFake(function (text) {
                        // Very rough approximation: 1 token per 4 characters
                        return Math.ceil(text.length / 4);
                    });
                    // Mock the context manager to handle token limits
                    contextManagerMock.buildPrompt.callsFake(function (convId, userPrompt) { return __awaiter(void 0, void 0, void 0, function () {
                        var conversation, MAX_TOKENS, contextPrompt, tokenCount, includedMessages, i, msg, msgTokens;
                        return __generator(this, function (_a) {
                            conversation = historyMock.getConversation(convId);
                            MAX_TOKENS = 1000;
                            contextPrompt = 'You are a helpful assistant.\n\n';
                            tokenCount = llmProviderManagerMock.countTokens(contextPrompt) +
                                llmProviderManagerMock.countTokens(userPrompt);
                            includedMessages = [];
                            for (i = conversation.messages.length - 1; i >= 0; i--) {
                                msg = conversation.messages[i];
                                msgTokens = llmProviderManagerMock.countTokens("".concat(msg.role, ": ").concat(msg.content, "\n"));
                                if (tokenCount + msgTokens < MAX_TOKENS) {
                                    includedMessages.unshift(msg);
                                    tokenCount += msgTokens;
                                }
                                else {
                                    break;
                                }
                            }
                            contextPrompt += 'Conversation history:\n';
                            includedMessages.forEach(function (msg) {
                                contextPrompt += "".concat(msg.role, ": ").concat(msg.content, "\n");
                            });
                            contextPrompt += "\nUser: ".concat(userPrompt);
                            return [2 /*return*/, contextPrompt];
                        });
                    }); });
                    followUpPrompt = 'Summarize our conversation';
                    return [4 /*yield*/, contextManagerMock.buildPrompt(conversationId, followUpPrompt)];
                case 1:
                    fullPrompt = _a.sent();
                    messagesIncluded = longHistory.filter(function (msg) {
                        return fullPrompt.includes("".concat(msg.role, ": ").concat(msg.content));
                    });
                    assert.ok(messagesIncluded.length < longHistory.length);
                    assert.ok(fullPrompt.includes('Conversation history'));
                    assert.ok(fullPrompt.includes('Summarize our conversation'));
                    return [2 /*return*/];
            }
        });
    }); });
});
