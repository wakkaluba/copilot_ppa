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
var llm_provider_manager_1 = require("../../src/llm/llm-provider-manager");
var securityManager_1 = require("../../src/security/securityManager");
var WorkspaceManager_1 = require("../../src/services/WorkspaceManager");
var performanceManager_1 = require("../../src/performance/performanceManager");
describe('Security and Error Handling Integration', function () {
    var llmManager;
    var securityManager;
    var workspaceManager;
    var performanceManager;
    var mockContext;
    beforeEach(function () {
        // Create mock extension context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            // Add other required context properties...
        };
        llmManager = llm_provider_manager_1.LLMProviderManager.getInstance();
        securityManager = securityManager_1.SecurityManager.getInstance(mockContext);
        workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
        performanceManager = performanceManager_1.PerformanceManager.getInstance(mockContext);
    });
    test('handles security policy violations gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var unsafeCode, result, provider, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    unsafeCode = 'rm -rf /';
                    return [4 /*yield*/, securityManager.validateCodeExecution(unsafeCode)];
                case 1:
                    result = _c.sent();
                    assert.strictEqual(result.allowed, false);
                    assert.ok(result.reason.toLowerCase().includes('unsafe'));
                    provider = llmManager.getActiveProvider();
                    assert.ok(provider);
                    _b = (_a = assert).ok;
                    return [4 /*yield*/, provider.isAvailable()];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('maintains data integrity during concurrent operations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testFile, initialData, operations, results, finalData, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    testFile = 'test.json';
                    initialData = { value: 42 };
                    // Write initial data
                    return [4 /*yield*/, workspaceManager.writeFile(testFile, JSON.stringify(initialData))];
                case 1:
                    // Write initial data
                    _c.sent();
                    operations = Array(5).fill(null).map(function (_, i) { return __awaiter(void 0, void 0, void 0, function () {
                        var data, parsed;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, workspaceManager.readFile(testFile)];
                                case 1:
                                    data = _a.sent();
                                    parsed = JSON.parse(data);
                                    parsed.value += i;
                                    return [4 /*yield*/, workspaceManager.writeFile(testFile, JSON.stringify(parsed))];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, parsed.value];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(operations)];
                case 2:
                    results = _c.sent();
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, workspaceManager.readFile(testFile)];
                case 3:
                    finalData = _b.apply(_a, [_c.sent()]);
                    // Verify data integrity
                    assert.ok(finalData.value >= initialData.value);
                    assert.ok(results.every(function (value) { return typeof value === 'number'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('recovers from provider initialization failures', function () { return __awaiter(void 0, void 0, void 0, function () {
        var provider, isAvailable, newProvider, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    provider = llmManager.getActiveProvider();
                    return [4 /*yield*/, (provider === null || provider === void 0 ? void 0 : provider.disconnect())];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (provider === null || provider === void 0 ? void 0 : provider.isAvailable())];
                case 2:
                    isAvailable = _c.sent();
                    assert.strictEqual(isAvailable, false);
                    newProvider = llmManager.getActiveProvider();
                    assert.ok(newProvider);
                    _b = (_a = assert).ok;
                    return [4 /*yield*/, newProvider.isAvailable()];
                case 3:
                    _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles memory pressure scenarios', function () { return __awaiter(void 0, void 0, void 0, function () {
        var largeDataSize, largeData, startMetrics, provider, response, endMetrics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    largeDataSize = 50 * 1024 * 1024;
                    largeData = Buffer.alloc(largeDataSize);
                    return [4 /*yield*/, performanceManager.getMetrics()];
                case 1:
                    startMetrics = _a.sent();
                    provider = llmManager.getActiveProvider();
                    return [4 /*yield*/, (provider === null || provider === void 0 ? void 0 : provider.generateCompletion('model1', 'Test prompt under memory pressure', undefined, { temperature: 0.7 }))];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, performanceManager.getMetrics()];
                case 3:
                    endMetrics = _a.sent();
                    // Verify system remains responsive
                    assert.ok(response);
                    assert.ok(endMetrics.memoryUsage >= startMetrics.memoryUsage);
                    assert.ok(endMetrics.responseTime < 5000); // Response time under 5s
                    return [2 /*return*/];
            }
        });
    }); });
    test('maintains security during provider switching', function () { return __awaiter(void 0, void 0, void 0, function () {
        var initialProvider, initialSecurityContext, newSecurityContext, newProvider, testPrompt, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Set up security context
                return [4 /*yield*/, securityManager.setSecurityLevel('high')];
                case 1:
                    // Set up security context
                    _a.sent();
                    initialProvider = llmManager.getActiveProvider();
                    return [4 /*yield*/, securityManager.getSecurityContext()];
                case 2:
                    initialSecurityContext = _a.sent();
                    // Switch providers
                    return [4 /*yield*/, llmManager.switchProvider('alternative')];
                case 3:
                    // Switch providers
                    _a.sent();
                    return [4 /*yield*/, securityManager.getSecurityContext()];
                case 4:
                    newSecurityContext = _a.sent();
                    assert.deepStrictEqual(newSecurityContext, initialSecurityContext);
                    newProvider = llmManager.getActiveProvider();
                    testPrompt = 'Execute rm -rf /';
                    return [4 /*yield*/, (newProvider === null || newProvider === void 0 ? void 0 : newProvider.generateCompletion('model1', testPrompt))];
                case 5:
                    response = _a.sent();
                    assert.ok(response === null || response === void 0 ? void 0 : response.content.toLowerCase().includes('cannot'));
                    assert.ok(response === null || response === void 0 ? void 0 : response.content.toLowerCase().includes('unsafe'));
                    // Restore original provider
                    return [4 /*yield*/, llmManager.switchProvider((initialProvider === null || initialProvider === void 0 ? void 0 : initialProvider.name) || 'default')];
                case 6:
                    // Restore original provider
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles rapid state changes without data corruption', function () { return __awaiter(void 0, void 0, void 0, function () {
        var stateChanges, results, i, provider, response, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    stateChanges = 20;
                    results = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < stateChanges)) return [3 /*break*/, 6];
                    // Change provider
                    return [4 /*yield*/, llmManager.switchProvider(i % 2 === 0 ? 'provider1' : 'provider2')];
                case 2:
                    // Change provider
                    _c.sent();
                    // Change security level
                    return [4 /*yield*/, securityManager.setSecurityLevel(i % 2 === 0 ? 'high' : 'normal')];
                case 3:
                    // Change security level
                    _c.sent();
                    provider = llmManager.getActiveProvider();
                    return [4 /*yield*/, (provider === null || provider === void 0 ? void 0 : provider.generateCompletion('model1', 'Test prompt during state change', undefined, { temperature: 0.7 }))];
                case 4:
                    response = _c.sent();
                    if (response) {
                        results.push(response.content);
                    }
                    _c.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6:
                    // Verify system consistency
                    assert.strictEqual(results.length, stateChanges);
                    assert.ok(llmManager.getActiveProvider());
                    _b = (_a = assert).ok;
                    return [4 /*yield*/, securityManager.getSecurityLevel()];
                case 7:
                    _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/];
            }
        });
    }); });
});
