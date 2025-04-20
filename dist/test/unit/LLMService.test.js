"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const sinon = __importStar(require("sinon"));
const llmService_1 = require("../../services/llm/llmService");
const llmCacheService_1 = require("../../services/cache/llmCacheService");
// Mock LLMProvider implementation for testing
class MockLLMProvider {
    generateText = sinon.stub();
    getDefaultModel = sinon.stub();
    getAvailableModels = sinon.stub();
    constructor() {
        this.getDefaultModel.returns('default-model');
        this.getAvailableModels.resolves(['default-model', 'alternative-model']);
    }
}
suite('LLMService Tests', () => {
    let llmService;
    let mockProvider;
    let cacheServiceStub;
    let sandbox;
    // Original constructor
    let originalLLMCacheService;
    setup(() => {
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
    teardown(() => {
        sandbox.restore();
        // Restore the original constructor
        global.LLMCacheService = originalLLMCacheService;
    });
    test('generateResponse should use the provider to generate text', async () => {
        const prompt = 'Hello, world!';
        const expectedResponse = 'Generated response';
        // Set up the provider to return a response
        mockProvider.generateText.resolves(expectedResponse);
        // Set up the cache service to return no cache hit
        cacheServiceStub.get.resolves(null);
        // Call the method
        const response = await llmService.generateResponse(prompt);
        // Verify the provider was called with the correct arguments
        assert.strictEqual(mockProvider.generateText.calledOnce, true);
        const [calledPrompt, calledModel, calledParams] = mockProvider.generateText.firstCall.args;
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
        const [cachedPrompt, cachedModel, cachedParams, cachedResponse] = cacheServiceStub.set.firstCall.args;
        assert.strictEqual(cachedPrompt, prompt);
        assert.strictEqual(cachedModel, 'default-model');
        assert.deepStrictEqual(cachedParams, {
            temperature: 0.7,
            maxTokens: 2000
        });
        assert.strictEqual(cachedResponse, expectedResponse);
    });
    test('generateResponse should use custom options if provided', async () => {
        const prompt = 'Hello, world!';
        const expectedResponse = 'Generated response';
        const options = {
            model: 'custom-model',
            temperature: 0.5,
            maxTokens: 1000
        };
        // Set up the provider to return a response
        mockProvider.generateText.resolves(expectedResponse);
        // Set up the cache service to return no cache hit
        cacheServiceStub.get.resolves(null);
        // Call the method with custom options
        const response = await llmService.generateResponse(prompt, options);
        // Verify the provider was called with the correct arguments
        assert.strictEqual(mockProvider.generateText.calledOnce, true);
        const [calledPrompt, calledModel, calledParams] = mockProvider.generateText.firstCall.args;
        assert.strictEqual(calledPrompt, prompt);
        assert.strictEqual(calledModel, 'custom-model');
        assert.deepStrictEqual(calledParams, {
            temperature: 0.5,
            maxTokens: 1000
        });
        // Verify the response
        assert.strictEqual(response, expectedResponse);
    });
    test('generateResponse should return cached response if available', async () => {
        const prompt = 'Hello, world!';
        const cachedResponse = 'Cached response';
        // Set up the cache service to return a cache hit
        cacheServiceStub.get.resolves(cachedResponse);
        // Call the method
        const response = await llmService.generateResponse(prompt);
        // Verify the cache was checked
        assert.strictEqual(cacheServiceStub.get.calledOnce, true);
        // Verify the provider was not called
        assert.strictEqual(mockProvider.generateText.called, false);
        // Verify the response
        assert.strictEqual(response, cachedResponse);
        // Verify the response was not cached again
        assert.strictEqual(cacheServiceStub.set.called, false);
    });
    test('clearCache should call the cache service clearCache method', () => {
        llmService.clearCache();
        assert.strictEqual(cacheServiceStub.clearCache.calledOnce, true);
    });
    test('clearExpiredCache should call the cache service clearExpiredCache method', () => {
        llmService.clearExpiredCache();
        assert.strictEqual(cacheServiceStub.clearExpiredCache.calledOnce, true);
    });
    test('generateResponse should handle provider errors', async () => {
        const prompt = 'Hello, world!';
        const error = new Error('Provider error');
        // Set up the provider to throw an error
        mockProvider.generateText.rejects(error);
        // Set up the cache service to return no cache hit
        cacheServiceStub.get.resolves(null);
        // Call the method and expect it to reject
        await assert.rejects(() => llmService.generateResponse(prompt), error);
        // Verify the cache was checked
        assert.strictEqual(cacheServiceStub.get.calledOnce, true);
        // Verify the provider was called
        assert.strictEqual(mockProvider.generateText.calledOnce, true);
        // Verify the response was not cached
        assert.strictEqual(cacheServiceStub.set.called, false);
    });
});
//# sourceMappingURL=LLMService.test.js.map