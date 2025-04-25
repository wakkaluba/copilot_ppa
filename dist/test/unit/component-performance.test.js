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
const mockHelpers_1 = require("../helpers/mockHelpers");
const llmProviderManager_1 = require("../../services/llmProviderManager");
const performanceTracker_1 = require("../../services/performanceTracker");
describe('Component Performance', () => {
    let historyMock;
    let llmProviderManagerMock;
    let performanceTracker;
    let mockContext;
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        // Create mocks for the core components
        historyMock = (0, mockHelpers_1.createMockConversationHistory)();
        llmProviderManagerMock = sandbox.createStubInstance(llmProviderManager_1.LLMProviderManager);
        // Create the performance tracker
        performanceTracker = new performanceTracker_1.PerformanceTracker(mockContext);
        // Setup default responses
        llmProviderManagerMock.generateCompletion.callsFake(async (prompt) => {
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
        sinon.assert.calledWith(llmProviderManagerMock.countTokens, prompt);
        assert.strictEqual(result.result, 'Test completion');
        assert.ok(result.metrics.tokensPerSecond > 0, 'Tokens per second should be calculated');
        assert.ok(result.metrics.tokensPerSecond <= (tokenCount / (result.metrics.responseTime / 1000)), 'Tokens per second should be accurate');
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
        assert.ok(bottlenecks.some(b => b.severity === 'high' && b.type === 'responseTime'), 'Should identify slow response time as a bottleneck');
    });
});
//# sourceMappingURL=component-performance.test.js.map