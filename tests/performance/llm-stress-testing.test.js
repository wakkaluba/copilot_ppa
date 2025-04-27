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
var llmProviderManager_1 = require("../../src/llm/llmProviderManager");
var modelManager_1 = require("../../src/models/modelManager");
var performanceManager_1 = require("../../src/performance/performanceManager");
var tokenManager_1 = require("../../src/llm/tokenManager");
describe('LLM Stress Testing', function () {
    var llmProviderManager;
    var modelManager;
    var performanceManager;
    var tokenManager;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var context;
        return __generator(this, function (_a) {
            context = {
                subscriptions: [],
                workspaceState: new MockMemento(),
                globalState: new MockMemento(),
                extensionPath: '/test/path',
                storagePath: '/test/storage'
            };
            llmProviderManager = llmProviderManager_1.LLMProviderManager.getInstance();
            modelManager = new modelManager_1.ModelManager();
            performanceManager = performanceManager_1.PerformanceManager.getInstance();
            tokenManager = new tokenManager_1.TokenManager();
            // Initialize performance monitoring
            performanceManager.setEnabled(true);
            return [2 /*return*/];
        });
    }); });
    test('handles rapid request bursts within rate limits', function () { return __awaiter(void 0, void 0, void 0, function () {
        var burstSize, requestIntervals, results, _loop_1, _i, requestIntervals_1, interval, metrics, successRates, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    burstSize = 10;
                    requestIntervals = [0, 50, 100, 200];
                    results = new Map();
                    _loop_1 = function (interval) {
                        var responses;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, Promise.all(Array(burstSize).fill(null).map(function (_, i) { return __awaiter(void 0, void 0, void 0, function () {
                                        var response, error_1;
                                        var _a;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    if (!(interval > 0)) return [3 /*break*/, 2];
                                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, interval * i); })];
                                                case 1:
                                                    _b.sent();
                                                    _b.label = 2;
                                                case 2:
                                                    _b.trys.push([2, 4, , 5]);
                                                    return [4 /*yield*/, ((_a = llmProviderManager.getActiveProvider()) === null || _a === void 0 ? void 0 : _a.generateCompletion('model1', 'Quick test prompt ' + i, undefined, { temperature: 0.7 }))];
                                                case 3:
                                                    response = _b.sent();
                                                    return [2 /*return*/, { success: true, response: response }];
                                                case 4:
                                                    error_1 = _b.sent();
                                                    return [2 /*return*/, { success: false, error: error_1 }];
                                                case 5: return [2 /*return*/];
                                            }
                                        });
                                    }); }))];
                                case 1:
                                    responses = _b.sent();
                                    results.set(interval, {
                                        success: responses.filter(function (r) { return r.success; }).length,
                                        failure: responses.filter(function (r) { return !r.success; }).length
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, requestIntervals_1 = requestIntervals;
                    _a.label = 1;
                case 1:
                    if (!(_i < requestIntervals_1.length)) return [3 /*break*/, 4];
                    interval = requestIntervals_1[_i];
                    return [5 /*yield**/, _loop_1(interval)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, performanceManager.getMetrics()];
                case 5:
                    metrics = _a.sent();
                    successRates = Array.from(results.entries())
                        .map(function (_a) {
                        var interval = _a[0], result = _a[1];
                        return ({
                            interval: interval,
                            rate: result.success / burstSize
                        });
                    });
                    // Success rate should improve with longer intervals
                    for (i = 1; i < successRates.length; i++) {
                        assert.ok(successRates[i].rate >= successRates[i - 1].rate, "Success rate should improve with longer intervals");
                    }
                    // Verify response times stayed within acceptable range
                    assert.ok(metrics.responseTime < 2000, 'Response time exceeded threshold');
                    return [2 /*return*/];
            }
        });
    }); });
    test('manages token limits correctly under load', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testPrompts, _loop_2, _i, testPrompts_1, prompt_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    testPrompts = [
                        'short prompt',
                        'medium length prompt with some additional context about the task',
                        'A'.repeat(1000), // Long prompt
                        'B'.repeat(2000) // Very long prompt
                    ];
                    _loop_2 = function (prompt_1) {
                        var tokenCount, maxTokens, response;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, tokenManager.countTokens(prompt_1)];
                                case 1:
                                    tokenCount = _c.sent();
                                    return [4 /*yield*/, tokenManager.getMaxTokens('model1')];
                                case 2:
                                    maxTokens = _c.sent();
                                    if (!(tokenCount > maxTokens)) return [3 /*break*/, 4];
                                    // Should throw error for exceeding token limit
                                    return [4 /*yield*/, assert.rejects(function () { return __awaiter(void 0, void 0, void 0, function () {
                                            var _a;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0: return [4 /*yield*/, ((_a = llmProviderManager.getActiveProvider()) === null || _a === void 0 ? void 0 : _a.generateCompletion('model1', prompt_1, undefined, { temperature: 0.7 }))];
                                                    case 1:
                                                        _b.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }, /Token limit exceeded/)];
                                case 3:
                                    // Should throw error for exceeding token limit
                                    _c.sent();
                                    return [3 /*break*/, 6];
                                case 4: return [4 /*yield*/, ((_a = llmProviderManager.getActiveProvider()) === null || _a === void 0 ? void 0 : _a.generateCompletion('model1', prompt_1, undefined, { temperature: 0.7 }))];
                                case 5:
                                    response = _c.sent();
                                    assert.ok(response === null || response === void 0 ? void 0 : response.content);
                                    _c.label = 6;
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, testPrompts_1 = testPrompts;
                    _b.label = 1;
                case 1:
                    if (!(_i < testPrompts_1.length)) return [3 /*break*/, 4];
                    prompt_1 = testPrompts_1[_i];
                    return [5 /*yield**/, _loop_2(prompt_1)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    test('handles concurrent streaming connections', function () { return __awaiter(void 0, void 0, void 0, function () {
        var streamCount, responses, errors, streamPromises, _i, _a, chunks, fullContent;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    streamCount = 5;
                    responses = new Map();
                    errors = new Map();
                    streamPromises = Array(streamCount).fill(null).map(function (_, i) { return __awaiter(void 0, void 0, void 0, function () {
                        var chunks, error_2;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    chunks = [];
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, ((_a = llmProviderManager.getActiveProvider()) === null || _a === void 0 ? void 0 : _a.streamCompletion('model1', "Stream test ".concat(i), undefined, { temperature: 0.7 }, function (event) {
                                            chunks.push(event.content);
                                        }))];
                                case 2:
                                    _b.sent();
                                    responses.set(i, chunks);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_2 = _b.sent();
                                    errors.set(i, error_2);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(streamPromises)];
                case 1:
                    _b.sent();
                    // Verify stream integrity
                    assert.strictEqual(responses.size + errors.size, streamCount, 'All streams should complete');
                    // Each successful stream should have content
                    for (_i = 0, _a = responses.values(); _i < _a.length; _i++) {
                        chunks = _a[_i];
                        assert.ok(chunks.length > 0, 'Stream should have content');
                        fullContent = chunks.join('');
                        assert.ok(fullContent.length > 0);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    test('recovers from provider errors under load', function () { return __awaiter(void 0, void 0, void 0, function () {
        var operations, results, consecutiveFailures, maxConsecutiveFailures, i, response, error_3, successCount, successRate;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    operations = 20;
                    results = new Map();
                    consecutiveFailures = 0;
                    maxConsecutiveFailures = 3;
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < operations)) return [3 /*break*/, 11];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 7, , 8]);
                    if (!(consecutiveFailures >= maxConsecutiveFailures)) return [3 /*break*/, 5];
                    // Force provider reconnect after too many failures
                    return [4 /*yield*/, ((_a = llmProviderManager.getActiveProvider()) === null || _a === void 0 ? void 0 : _a.disconnect())];
                case 3:
                    // Force provider reconnect after too many failures
                    _c.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 4:
                    _c.sent();
                    consecutiveFailures = 0;
                    _c.label = 5;
                case 5: return [4 /*yield*/, ((_b = llmProviderManager.getActiveProvider()) === null || _b === void 0 ? void 0 : _b.generateCompletion('model1', "Recovery test ".concat(i), undefined, { temperature: 0.7 }))];
                case 6:
                    response = _c.sent();
                    results.set(i, !!(response === null || response === void 0 ? void 0 : response.content));
                    consecutiveFailures = 0;
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _c.sent();
                    results.set(i, false);
                    consecutiveFailures++;
                    return [3 /*break*/, 8];
                case 8: 
                // Add small delay between requests
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                case 9:
                    // Add small delay between requests
                    _c.sent();
                    _c.label = 10;
                case 10:
                    i++;
                    return [3 /*break*/, 1];
                case 11:
                    successCount = Array.from(results.values()).filter(function (success) { return success; }).length;
                    successRate = successCount / operations;
                    // Success rate should be reasonable even with errors
                    assert.ok(successRate > 0.7, "Success rate ".concat(successRate, " below threshold"));
                    return [2 /*return*/];
            }
        });
    }); });
    test('maintains response quality under load', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testCases, iterations, results, _i, testCases_1, testCase, stats, i, response, _a, _b, _c, prompt_2, stats, qualityRate;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    testCases = [
                        { prompt: 'Simple addition', expectedPattern: /\d+\s*\+\s*\d+/ },
                        { prompt: 'Basic function', expectedPattern: /function\s+\w+\s*\(.*\)/ },
                        { prompt: 'Variable declaration', expectedPattern: /(const|let|var)\s+\w+/ }
                    ];
                    iterations = 5;
                    results = new Map();
                    _i = 0, testCases_1 = testCases;
                    _e.label = 1;
                case 1:
                    if (!(_i < testCases_1.length)) return [3 /*break*/, 7];
                    testCase = testCases_1[_i];
                    stats = { valid: 0, total: 0 };
                    i = 0;
                    _e.label = 2;
                case 2:
                    if (!(i < iterations)) return [3 /*break*/, 5];
                    return [4 /*yield*/, ((_d = llmProviderManager.getActiveProvider()) === null || _d === void 0 ? void 0 : _d.generateCompletion('model1', testCase.prompt, undefined, { temperature: 0.7 }))];
                case 3:
                    response = _e.sent();
                    if (response === null || response === void 0 ? void 0 : response.content) {
                        stats.total++;
                        if (testCase.expectedPattern.test(response.content)) {
                            stats.valid++;
                        }
                    }
                    _e.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    results.set(testCase.prompt, stats);
                    _e.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    // Verify response quality
                    for (_a = 0, _b = results.entries(); _a < _b.length; _a++) {
                        _c = _b[_a], prompt_2 = _c[0], stats = _c[1];
                        qualityRate = stats.valid / stats.total;
                        assert.ok(qualityRate >= 0.8, "Quality rate ".concat(qualityRate, " for \"").concat(prompt_2, "\" below threshold"));
                    }
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
    return MockMemento;
}());
