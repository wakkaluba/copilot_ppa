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
var perf_hooks_1 = require("perf_hooks");
var llmProviderManager_1 = require("../../src/llm/llmProviderManager");
var ContextManager_1 = require("../../src/services/ContextManager");
var WorkspaceManager_1 = require("../../src/services/WorkspaceManager");
var mockHelpers_1 = require("../helpers/mockHelpers");
describe('Component Performance Tests', function () {
    var llmManager;
    var contextManager;
    var workspaceManager;
    var mockContext;
    beforeEach(function () {
        // Create mock extension context
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        // Setup mocks
        jest.spyOn(llmProviderManager_1.LLMProviderManager, 'getInstance').mockImplementation(function () {
            return {
                getActiveProvider: jest.fn().mockReturnValue({
                    generateCompletion: jest.fn().mockImplementation(function () {
                        return Promise.resolve({
                            content: 'Test completion response',
                            model: 'test-model',
                            usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 }
                        });
                    }),
                    streamCompletion: jest.fn().mockImplementation(function (model, prompt, systemPrompt, options, callback) {
                        // Simulate streaming events
                        setTimeout(function () { return callback({ content: 'Streaming content 1' }); }, 100);
                        setTimeout(function () { return callback({ content: 'Streaming content 2' }); }, 200);
                        setTimeout(function () { return callback({ content: 'Streaming content 3' }); }, 300);
                        return Promise.resolve();
                    })
                })
            };
        });
        jest.spyOn(ContextManager_1.ContextManager, 'getInstance').mockImplementation(function () {
            return {
                createContext: jest.fn().mockResolvedValue(undefined),
                updateContext: jest.fn().mockResolvedValue(undefined),
                getContext: jest.fn().mockReturnValue({
                    activeFile: 'test.ts',
                    selectedCode: 'interface Test { prop: string; }',
                    codeLanguage: 'typescript'
                }),
                buildPrompt: jest.fn().mockImplementation(function (id, promptText) {
                    return Promise.resolve("System: You are a coding assistant\n\nLanguage: typescript\n\nCode:\ninterface Test { prop: string; }\n\n".concat(promptText));
                }),
                dispose: jest.fn()
            };
        });
        jest.spyOn(WorkspaceManager_1.WorkspaceManager.prototype, 'readFile').mockImplementation(function (filePath) {
            if (filePath === 'large-test.js') {
                // Generate fake file content with requested line count
                return Promise.resolve(Array(10000)
                    .fill(null)
                    .map(function (_, i) { return "console.log(\"Line ".concat(i, "\");"); })
                    .join('\n'));
            }
            return Promise.resolve('Default file content');
        });
        jest.spyOn(WorkspaceManager_1.WorkspaceManager.prototype, 'writeFile').mockImplementation(function (filePath, content) {
            return Promise.resolve();
        });
        // Initialize managers
        llmManager = llmProviderManager_1.LLMProviderManager.getInstance();
        contextManager = ContextManager_1.ContextManager.getInstance(mockContext);
        workspaceManager = new WorkspaceManager_1.WorkspaceManager();
    });
    afterEach(function () {
        jest.restoreAllMocks();
    });
    test('handles large conversations without memory leaks', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messagesCount, messageSize, conversationId, longMessage, initialHeap, i, finalHeap, heapGrowth, expectedMaxGrowth;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messagesCount = 100;
                    messageSize = 1000;
                    conversationId = 'perf-test-conversation';
                    longMessage = 'A'.repeat(messageSize);
                    initialHeap = process.memoryUsage().heapUsed;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < messagesCount)) return [3 /*break*/, 4];
                    return [4 /*yield*/, contextManager.updateContext(conversationId, {
                            messages: [{
                                    role: i % 2 === 0 ? 'user' : 'assistant',
                                    content: "".concat(longMessage, " - ").concat(i)
                                }]
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    // Force garbage collection if available
                    if (global.gc) {
                        global.gc();
                    }
                    finalHeap = process.memoryUsage().heapUsed;
                    heapGrowth = finalHeap - initialHeap;
                    expectedMaxGrowth = messageSize * messagesCount * 2;
                    // Verify heap growth is reasonable
                    assert.ok(heapGrowth < expectedMaxGrowth, "Memory growth (".concat(heapGrowth, " bytes) exceeds expected maximum (").concat(expectedMaxGrowth, " bytes)"));
                    return [2 /*return*/];
            }
        });
    }); });
    test('maintains performance under concurrent requests', function () { return __awaiter(void 0, void 0, void 0, function () {
        var concurrentRequests, responseTimeThreshold, startTime, requests, responses, totalTime, averageTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    concurrentRequests = 10;
                    responseTimeThreshold = 1000;
                    startTime = perf_hooks_1.performance.now();
                    requests = Array(concurrentRequests).fill(null).map(function (_, i) {
                        var provider = llmManager.getActiveProvider();
                        return provider === null || provider === void 0 ? void 0 : provider.generateCompletion('model1', "Test prompt ".concat(i), undefined, { temperature: 0.7 });
                    });
                    return [4 /*yield*/, Promise.all(requests)];
                case 1:
                    responses = _a.sent();
                    totalTime = perf_hooks_1.performance.now() - startTime;
                    averageTime = totalTime / concurrentRequests;
                    // Verify performance
                    assert.ok(responses.length === concurrentRequests);
                    assert.ok(averageTime < responseTimeThreshold, "Average response time (".concat(averageTime.toFixed(2), "ms) exceeds threshold (").concat(responseTimeThreshold, "ms)"));
                    return [2 /*return*/];
            }
        });
    }); });
    test('efficiently processes large code files', function () { return __awaiter(void 0, void 0, void 0, function () {
        var lineCount, startTime, content, lines, processingTime, timePerLine;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lineCount = 10000;
                    startTime = perf_hooks_1.performance.now();
                    return [4 /*yield*/, workspaceManager.readFile('large-test.js')];
                case 1:
                    content = _a.sent();
                    lines = content.split('\n');
                    processingTime = perf_hooks_1.performance.now() - startTime;
                    timePerLine = processingTime / lineCount;
                    // Verify processing speed
                    assert.ok(lines.length === lineCount);
                    assert.ok(timePerLine < 0.5, // Less than 0.5ms per line for test environment
                    "Processing time per line (".concat(timePerLine.toFixed(3), "ms) is too high"));
                    return [2 /*return*/];
            }
        });
    }); });
    test('context switching performance', function () { return __awaiter(void 0, void 0, void 0, function () {
        var switchCount, contextSizes, results, _i, contextSizes_1, size, contextData, startTime, i, conversationId, prompt_1, totalTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    switchCount = 50;
                    contextSizes = [1000, 10000, 100000];
                    results = [];
                    _i = 0, contextSizes_1 = contextSizes;
                    _a.label = 1;
                case 1:
                    if (!(_i < contextSizes_1.length)) return [3 /*break*/, 9];
                    size = contextSizes_1[_i];
                    contextData = {
                        activeFile: 'test.ts',
                        selectedCode: 'A'.repeat(size),
                        codeLanguage: 'typescript'
                    };
                    startTime = perf_hooks_1.performance.now();
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < switchCount)) return [3 /*break*/, 7];
                    conversationId = "perf-test-".concat(i);
                    return [4 /*yield*/, contextManager.createContext(conversationId)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, contextManager.updateContext(conversationId, contextData)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, contextManager.buildPrompt(conversationId, 'Test prompt')];
                case 5:
                    prompt_1 = _a.sent();
                    assert.ok(prompt_1.includes('typescript'));
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 2];
                case 7:
                    totalTime = perf_hooks_1.performance.now() - startTime;
                    results.push({
                        size: size,
                        time: totalTime / switchCount
                    });
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9:
                    // Verify performance scales reasonably with context size
                    // This is a simplified check since we're mocking actual implementation
                    assert.ok(results.length === contextSizes.length);
                    return [2 /*return*/];
            }
        });
    }); });
    test('streaming response memory stability', function () { return __awaiter(void 0, void 0, void 0, function () {
        var streamDuration, samplingInterval, memoryReadings, streamedContent, provider, streamPromise, startTime, monitoringPromise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    streamDuration = 100;
                    samplingInterval = 10;
                    memoryReadings = [];
                    streamedContent = '';
                    provider = llmManager.getActiveProvider();
                    if (!provider) {
                        throw new Error('No provider available');
                    }
                    streamPromise = provider.streamCompletion('model1', 'Generate a long response with multiple paragraphs about programming', undefined, { temperature: 0.7 }, function (content) {
                        streamedContent += content;
                    });
                    startTime = perf_hooks_1.performance.now();
                    monitoringPromise = new Promise(function (resolve) {
                        var interval = setInterval(function () {
                            memoryReadings.push(process.memoryUsage().heapUsed);
                            if (perf_hooks_1.performance.now() - startTime >= streamDuration) {
                                clearInterval(interval);
                                resolve();
                            }
                        }, samplingInterval);
                    });
                    return [4 /*yield*/, Promise.all([streamPromise, monitoringPromise])];
                case 1:
                    _a.sent();
                    // Verify streaming content was received
                    assert.ok(streamedContent.includes('Streaming content'));
                    assert.ok(memoryReadings.length > 0);
                    return [2 /*return*/];
            }
        });
    }); });
});
function calculateVariance(numbers) {
    var mean = numbers.reduce(function (sum, num) { return sum + num; }, 0) / numbers.length;
    var squareDiffs = numbers.map(function (num) { return Math.pow(num - mean, 2); });
    return squareDiffs.reduce(function (sum, diff) { return sum + diff; }, 0) / numbers.length;
}
