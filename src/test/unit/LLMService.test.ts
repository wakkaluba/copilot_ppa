import * as assert from 'assert';
import * as sinon from 'sinon';
import { LLMService, LLMRequestOptions, LLMProvider } from '../../services/llm/llmService';
import { LLMCacheService } from '../../services/cache/llmCacheService';

// Mock LLMProvider implementation for testing
class MockLLMProvider implements LLMProvider {
    public generateText = sinon.stub();
    public getDefaultModel = sinon.stub();
    public getAvailableModels = sinon.stub();

    constructor() {
        this.getDefaultModel.returns('default-model');
        this.getAvailableModels.resolves(['default-model', 'alternative-model']);
    }
}

describe('LLMService Tests', () => {
    let llmService: LLMService;
    let mockProvider: MockLLMProvider;
    let cacheServiceStub: sinon.SinonStubbedInstance<LLMCacheService>;
    let sandbox: sinon.SinonSandbox;
    // Original constructor
    let originalLLMCacheService: any;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Create a mock provider
        mockProvider = new MockLLMProvider();
        
        // Stub the LLMCacheService
        cacheServiceStub = sandbox.createStubInstance(LLMCacheService);
        
        // Save and replace the LLMCacheService constructor
        originalLLMCacheService = (global as any).LLMCacheService;
        (global as any).LLMCacheService = function() {
            return cacheServiceStub;
        };
        
        // Create a fresh instance of LLMService for each test
        llmService = new LLMService(mockProvider);
    });

    teardown(() => {
        sandbox.restore();
        // Restore the original constructor
        (global as any).LLMCacheService = originalLLMCacheService;
    });

    it('generateResponse should use the provider to generate text', async () => {
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

    it('generateResponse should use custom options if provided', async () => {
        const prompt = 'Hello, world!';
        const expectedResponse = 'Generated response';
        const options: LLMRequestOptions = {
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

    it('generateResponse should return cached response if available', async () => {
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

    it('clearCache should call the cache service clearCache method', () => {
        llmService.clearCache();
        
        assert.strictEqual(cacheServiceStub.clearCache.calledOnce, true);
    });

    it('clearExpiredCache should call the cache service clearExpiredCache method', () => {
        llmService.clearExpiredCache();
        
        assert.strictEqual(cacheServiceStub.clearExpiredCache.calledOnce, true);
    });

    it('generateResponse should handle provider errors', async () => {
        const prompt = 'Hello, world!';
        const error = new Error('Provider error');
        
        // Set up the provider to throw an error
        mockProvider.generateText.rejects(error);
        
        // Set up the cache service to return no cache hit
        cacheServiceStub.get.resolves(null);
        
        // Call the method and expect it to reject
        await assert.rejects(
            () => llmService.generateResponse(prompt),
            error
        );
        
        // Verify the cache was checked
        assert.strictEqual(cacheServiceStub.get.calledOnce, true);
        
        // Verify the provider was called
        assert.strictEqual(mockProvider.generateText.calledOnce, true);
        
        // Verify the response was not cached
        assert.strictEqual(cacheServiceStub.set.called, false);
    });
});