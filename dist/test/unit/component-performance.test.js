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
var performanceTracker_1 = require("../../services/performanceTracker");
describe('Component Performance', function () {
    var historyMock;
    var llmProviderManagerMock;
    var performanceTracker;
    var mockContext;
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        // Create mocks for the core components
        historyMock = (0, mockHelpers_1.createMockConversationHistory)();
        llmProviderManagerMock = sandbox.createStubInstance(llmProviderManager_1.LLMProviderManager);
        // Create the performance tracker
        performanceTracker = new performanceTracker_1.PerformanceTracker(mockContext);
        // Setup default responses
        llmProviderManagerMock.generateCompletion.callsFake(function (prompt) {
            return __awaiter(void 0, void 0, void 0, function () {
                var delay;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            delay = Math.random() * 200 + 100;
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, 'Test completion'];
                    }
                });
            });
        });
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('should track LLM response time', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var startTime, result, endTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        return [4 /*yield*/, performanceTracker.trackLLMPerformance(function () {
                                return llmProviderManagerMock.generateCompletion('Test prompt');
                            })];
                    case 1:
                        result = _a.sent();
                        endTime = Date.now();
                        assert.strictEqual(result.result, 'Test completion');
                        assert.ok(result.metrics.responseTime >= 100, 'Response time should be at least 100ms');
                        assert.ok(result.metrics.responseTime <= (endTime - startTime + 10), 'Response time should be accurate');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should track token processing speed', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var tokenCount, prompt, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenCount = 100;
                        prompt = 'A'.repeat(tokenCount * 4);
                        llmProviderManagerMock.countTokens = sandbox.stub().returns(tokenCount);
                        return [4 /*yield*/, performanceTracker.trackLLMPerformance(function () {
                                return llmProviderManagerMock.generateCompletion(prompt);
                            })];
                    case 1:
                        result = _a.sent();
                        // We've established that tokenCount is 100 from the mock
                        sinon.assert.calledWith(llmProviderManagerMock.countTokens, prompt);
                        assert.strictEqual(result.result, 'Test completion');
                        assert.ok(result.metrics.tokensPerSecond > 0, 'Tokens per second should be calculated');
                        assert.ok(result.metrics.tokensPerSecond <= (tokenCount / (result.metrics.responseTime / 1000)), 'Tokens per second should be accurate');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should track conversation metrics', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var conversationId, conversation, i, metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversationId = 'perf-test-conversation';
                        // Create test conversation
                        historyMock.createConversation.resolves({
                            id: conversationId,
                            title: 'Performance Test',
                            messages: [],
                            created: Date.now(),
                            updated: Date.now()
                        });
                        return [4 /*yield*/, historyMock.createConversation('Performance Test')];
                    case 1:
                        conversation = _a.sent();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < 5))
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, historyMock.addMessage(conversationId, {
                                role: i % 2 === 0 ? 'user' : 'assistant',
                                content: "Message ".concat(i),
                                timestamp: new Date()
                            })];
                    case 3:
                        _a.sent();
                        // Simulate delay between messages
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                    case 4:
                        // Simulate delay between messages
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 2];
                    case 6:
                        // Get conversation with messages for analysis
                        historyMock.getConversation.returns({
                            id: conversationId,
                            title: 'Performance Test',
                            messages: Array.from({ length: 5 }, function (_, i) {
                                return ({
                                    role: i % 2 === 0 ? 'user' : 'assistant',
                                    content: "Message ".concat(i),
                                    timestamp: new Date() - (5 - i) * 1000 // Each message 1 second apart
                                });
                            }),
                            created: Date.now() - 5000,
                            updated: Date.now()
                        });
                        return [4 /*yield*/, performanceTracker.analyzeConversationPerformance(conversationId)];
                    case 7:
                        metrics = _a.sent();
                        assert.strictEqual(metrics.messageCount, 5);
                        assert.strictEqual(metrics.userMessageCount, 3);
                        assert.strictEqual(metrics.assistantMessageCount, 2);
                        assert.ok(metrics.averageResponseTime >= 0);
                        assert.ok(metrics.conversationDuration > 0);
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should identify performance bottlenecks', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var fastResult, slowResult, bottlenecks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Setup a scenario with a slow response
                        llmProviderManagerMock.generateCompletion.onFirstCall().callsFake(function () {
                            return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/, 'Fast response'];
                                    }
                                });
                            });
                        });
                        llmProviderManagerMock.generateCompletion.onSecondCall().callsFake(function () {
                            return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/, 'Slow response'];
                                    }
                                });
                            });
                        });
                        return [4 /*yield*/, performanceTracker.trackLLMPerformance(function () {
                                return llmProviderManagerMock.generateCompletion('Fast prompt');
                            })];
                    case 1:
                        fastResult = _a.sent();
                        return [4 /*yield*/, performanceTracker.trackLLMPerformance(function () {
                                return llmProviderManagerMock.generateCompletion('Slow prompt');
                            })];
                    case 2:
                        slowResult = _a.sent();
                        bottlenecks = performanceTracker.identifyPerformanceBottlenecks([
                            fastResult.metrics,
                            slowResult.metrics
                        ]);
                        assert.ok(bottlenecks.length > 0, 'Should identify bottlenecks');
                        assert.ok(bottlenecks.some(function (b) { return b.severity === 'high' && b.type === 'responseTime'; }), 'Should identify slow response time as a bottleneck');
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=component-performance.test.js.map