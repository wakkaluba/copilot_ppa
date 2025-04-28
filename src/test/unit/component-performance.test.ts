import * as assert from 'assert';
import * as sinon from 'sinon';
import { createMockConversationHistory, createMockExtensionContext } from '../helpers/mockHelpers';
import { ConversationHistory } from '../../services/ConversationHistory';
import { LLMProviderManager } from '../../services/llmProviderManager';
import { PerformanceTracker } from '../../services/performanceTracker';

describe('Component Performance', () => {
    let historyMock: sinon.SinonStubbedInstance<ConversationHistory>;
    let llmProviderManagerMock: sinon.SinonStubbedInstance<LLMProviderManager>;
    let performanceTracker: PerformanceTracker;
    let mockContext: any;
    let sandbox: sinon.SinonSandbox;
    
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockContext = createMockExtensionContext();
        
        // Create mocks for the core components
        historyMock = createMockConversationHistory();
        llmProviderManagerMock = sandbox.createStubInstance(LLMProviderManager);
        
        // Create the performance tracker
        performanceTracker = new PerformanceTracker(mockContext);
        
        // Setup default responses
        llmProviderManagerMock.generateCompletion.callsFake(async (prompt: string) => {
            // Simulate variable response time
            const delay = Math.random() * 200 + 100;
            await new Promise(resolve => setTimeout(resolve, delay));
            return 'Test completion';
        });
    });
    
    afterEach(() => {
        sandbox.restore();
    });

    it('should track LLM response time', async () => {
        const startTime = Date.now();
        const result = await performanceTracker.trackLLMPerformance(() => {
            return llmProviderManagerMock.generateCompletion('Test prompt');
        });
        const endTime = Date.now();
        
        assert.strictEqual(result.result, 'Test completion');
        assert.ok(result.metrics.responseTime >= 100, 'Response time should be at least 100ms');
        assert.ok(result.metrics.responseTime <= (endTime - startTime + 10), 'Response time should be accurate');
    });

    it('should track token processing speed', async () => {
        // Mock token count
        const tokenCount = 100;
        const prompt = 'A'.repeat(tokenCount * 4); // Roughly 4 chars per token
        
        llmProviderManagerMock.countTokens = sandbox.stub().returns(tokenCount);
        
        const result = await performanceTracker.trackLLMPerformance(() => {
            return llmProviderManagerMock.generateCompletion(prompt);
        });
        
        // We've established that tokenCount is 100 from the mock
        sinon.assert.calledWith(llmProviderManagerMock.countTokens as sinon.SinonStub, prompt);
        
        assert.strictEqual(result.result, 'Test completion');
        assert.ok(result.metrics.tokensPerSecond > 0, 'Tokens per second should be calculated');
        assert.ok(
            result.metrics.tokensPerSecond <= (tokenCount / (result.metrics.responseTime / 1000)),
            'Tokens per second should be accurate'
        );
    });
    
    it('should track conversation metrics', async () => {
        const conversationId = 'perf-test-conversation';
        
        // Create test conversation
        historyMock.createConversation.resolves({
            id: conversationId,
            title: 'Performance Test',
            messages: [],
            created: Date.now(),
            updated: Date.now()
        });
        
        const conversation = await historyMock.createConversation('Performance Test');
        
        // Add some messages
        for (let i = 0; i < 5; i++) {
            await historyMock.addMessage(conversationId, {
                role: i % 2 === 0 ? 'user' : 'assistant',
                content: `Message ${i}`,
                timestamp: Date.now()
            });
            
            // Simulate delay between messages
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Get conversation with messages for analysis
        historyMock.getConversation.returns({
            id: conversationId,
            title: 'Performance Test',
            messages: Array.from({ length: 5 }, (_, i) => ({
                role: i % 2 === 0 ? 'user' : 'assistant',
                content: `Message ${i}`,
                timestamp: Date.now() - (5 - i) * 1000 // Each message 1 second apart
            })),
            created: Date.now() - 5000,
            updated: Date.now()
        });
        
        const metrics = await performanceTracker.analyzeConversationPerformance(conversationId);
        
        assert.strictEqual(metrics.messageCount, 5);
        assert.strictEqual(metrics.userMessageCount, 3);
        assert.strictEqual(metrics.assistantMessageCount, 2);
        assert.ok(metrics.averageResponseTime >= 0);
        assert.ok(metrics.conversationDuration > 0);
    });
    
    it('should identify performance bottlenecks', async () => {
        // Setup a scenario with a slow response
        llmProviderManagerMock.generateCompletion.onFirstCall().callsFake(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'Fast response';
        });
        
        llmProviderManagerMock.generateCompletion.onSecondCall().callsFake(async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return 'Slow response';
        });
        
        // Track the first (fast) call
        const fastResult = await performanceTracker.trackLLMPerformance(() => {
            return llmProviderManagerMock.generateCompletion('Fast prompt');
        });
        
        // Track the second (slow) call
        const slowResult = await performanceTracker.trackLLMPerformance(() => {
            return llmProviderManagerMock.generateCompletion('Slow prompt');
        });
        
        // Analyze performance data
        const bottlenecks = performanceTracker.identifyPerformanceBottlenecks([
            fastResult.metrics,
            slowResult.metrics
        ]);
        
        assert.ok(bottlenecks.length > 0, 'Should identify bottlenecks');
        assert.ok(
            bottlenecks.some(b => b.severity === 'high' && b.type === 'responseTime'),
            'Should identify slow response time as a bottleneck'
        );
    });
});