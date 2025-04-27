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
var llmService_1 = require("../../services/llm/llmService");
var llmCacheService_1 = require("../../services/cache/llmCacheService");
// Mock LLMProvider implementation for testing
var MockLLMProvider = /** @class */ (function () {
    function MockLLMProvider() {
        this.generateText = sinon.stub();
        this.getDefaultModel = sinon.stub();
        this.getAvailableModels = sinon.stub();
        this.getDefaultModel.returns('default-model');
        this.getAvailableModels.resolves(['default-model', 'alternative-model']);
    }
    return MockLLMProvider;
}());
suite('LLMService Tests', function () {
    var llmService;
    var mockProvider;
    var cacheServiceStub;
    var sandbox;
    // Original constructor
    var originalLLMCacheService;
    setup(function () {
        sandbox = sinon.createSandbox();
        // Create a mock provider
        mockProvider = new MockLLMProvider();
        // Stub the LLMCacheService
        cacheServiceStub = sandbox.createStubInstance(llmCacheService_1.LLMCacheService);
        // Save and replace the LLMCacheService constructor
        originalLLMCacheService = global.LLMCacheService;
        global.LLMCacheService = function () {
            return cacheServiceStub;
        };
        // Create a fresh instance of LLMService for each test
        llmService = new llmService_1.LLMService(mockProvider);
    });
    teardown(function () {
        sandbox.restore();
        // Restore the original constructor
        global.LLMCacheService = originalLLMCacheService;
    });
    test('generateResponse should use the provider to generate text', function () { return __awaiter(void 0, void 0, void 0, function () {
        var prompt, expectedResponse, response, _a, calledPrompt, calledModel, calledParams, _b, cachedPrompt, cachedModel, cachedParams, cachedResponse;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    prompt = 'Hello, world!';
                    expectedResponse = 'Generated response';
                    // Set up the provider to return a response
                    mockProvider.generateText.resolves(expectedResponse);
                    // Set up the cache service to return no cache hit
                    cacheServiceStub.get.resolves(null);
                    return [4 /*yield*/, llmService.generateResponse(prompt)];
                case 1:
                    response = _c.sent();
                    // Verify the provider was called with the correct arguments
                    assert.strictEqual(mockProvider.generateText.calledOnce, true);
                    _a = mockProvider.generateText.firstCall.args, calledPrompt = _a[0], calledModel = _a[1], calledParams = _a[2];
                    assert.strictEqual(calledPrompt, prompt);
                    assert.strictEqual(calledModel, 'default-model');
                    assert.deepStrictEqual(calledParams, {
                        temperature: 0.7,
                        maxTokens: 2000
                    });
                    // Verify the response
                    assert.strictEqual(response, expectedResponse);
                    // Verify the response was cached
                    assert.strictEqual(cacheServiceStub.set.calledOnce, true);
                    _b = cacheServiceStub.set.firstCall.args, cachedPrompt = _b[0], cachedModel = _b[1], cachedParams = _b[2], cachedResponse = _b[3];
                    assert.strictEqual(cachedPrompt, prompt);
                    assert.strictEqual(cachedModel, 'default-model');
                    assert.deepStrictEqual(cachedParams, {
                        temperature: 0.7,
                        maxTokens: 2000
                    });
                    assert.strictEqual(cachedResponse, expectedResponse);
                    return [2 /*return*/];
            }
        });
    }); });
    test('generateResponse should use custom options if provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var prompt, expectedResponse, options, response, _a, calledPrompt, calledModel, calledParams;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    prompt = 'Hello, world!';
                    expectedResponse = 'Generated response';
                    options = {
                        model: 'custom-model',
                        temperature: 0.5,
                        maxTokens: 1000
                    };
                    // Set up the provider to return a response
                    mockProvider.generateText.resolves(expectedResponse);
                    // Set up the cache service to return no cache hit
                    cacheServiceStub.get.resolves(null);
                    return [4 /*yield*/, llmService.generateResponse(prompt, options)];
                case 1:
                    response = _b.sent();
                    // Verify the provider was called with the correct arguments
                    assert.strictEqual(mockProvider.generateText.calledOnce, true);
                    _a = mockProvider.generateText.firstCall.args, calledPrompt = _a[0], calledModel = _a[1], calledParams = _a[2];
                    assert.strictEqual(calledPrompt, prompt);
                    assert.strictEqual(calledModel, 'custom-model');
                    assert.deepStrictEqual(calledParams, {
                        temperature: 0.5,
                        maxTokens: 1000
                    });
                    // Verify the response
                    assert.strictEqual(response, expectedResponse);
                    return [2 /*return*/];
            }
        });
    }); });
    test('generateResponse should return cached response if available', function () { return __awaiter(void 0, void 0, void 0, function () {
        var prompt, cachedResponse, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = 'Hello, world!';
                    cachedResponse = 'Cached response';
                    // Set up the cache service to return a cache hit
                    cacheServiceStub.get.resolves(cachedResponse);
                    return [4 /*yield*/, llmService.generateResponse(prompt)];
                case 1:
                    response = _a.sent();
                    // Verify the cache was checked
                    assert.strictEqual(cacheServiceStub.get.calledOnce, true);
                    // Verify the provider was not called
                    assert.strictEqual(mockProvider.generateText.called, false);
                    // Verify the response
                    assert.strictEqual(response, cachedResponse);
                    // Verify the response was not cached again
                    assert.strictEqual(cacheServiceStub.set.called, false);
                    return [2 /*return*/];
            }
        });
    }); });
    test('clearCache should call the cache service clearCache method', function () {
        llmService.clearCache();
        assert.strictEqual(cacheServiceStub.clearCache.calledOnce, true);
    });
    test('clearExpiredCache should call the cache service clearExpiredCache method', function () {
        llmService.clearExpiredCache();
        assert.strictEqual(cacheServiceStub.clearExpiredCache.calledOnce, true);
    });
    test('generateResponse should handle provider errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var prompt, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = 'Hello, world!';
                    error = new Error('Provider error');
                    // Set up the provider to throw an error
                    mockProvider.generateText.rejects(error);
                    // Set up the cache service to return no cache hit
                    cacheServiceStub.get.resolves(null);
                    // Call the method and expect it to reject
                    return [4 /*yield*/, assert.rejects(function () { return llmService.generateResponse(prompt); }, error)];
                case 1:
                    // Call the method and expect it to reject
                    _a.sent();
                    // Verify the cache was checked
                    assert.strictEqual(cacheServiceStub.get.calledOnce, true);
                    // Verify the provider was called
                    assert.strictEqual(mockProvider.generateText.calledOnce, true);
                    // Verify the response was not cached
                    assert.strictEqual(cacheServiceStub.set.called, false);
                    return [2 /*return*/];
            }
        });
    }); });
});
