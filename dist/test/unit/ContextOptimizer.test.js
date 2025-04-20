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
const ContextOptimizer_1 = require("../../services/ContextOptimizer");
const WorkspaceManager_1 = require("../../services/WorkspaceManager");
suite('ContextOptimizer Tests', () => {
    let contextOptimizer;
    let workspaceManagerStub;
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        contextOptimizer = new ContextOptimizer_1.ContextOptimizer();
    });
    teardown(() => {
        sandbox.restore();
    });
    test('should prune irrelevant context', () => {
        const context = [
            { role: 'user', content: 'How do I implement a binary search?', relevance: 0.9 },
            { role: 'assistant', content: 'Here is the implementation...', relevance: 0.9 },
            { role: 'user', content: 'What is the weather like?', relevance: 0.1 },
            { role: 'assistant', content: 'I cannot provide weather information', relevance: 0.1 }
        ];
        const prunedContext = contextOptimizer.pruneContext(context, 0.5);
        assert.strictEqual(prunedContext.length, 2);
        assert.strictEqual(prunedContext[0].content, 'How do I implement a binary search?');
    });
    test('should merge similar contexts', () => {
        const contexts = [
            { topic: 'arrays', content: 'Array methods in JavaScript' },
            { topic: 'arrays', content: 'Array manipulation in JavaScript' },
            { topic: 'functions', content: 'Function declarations' }
        ];
        const mergedContexts = contextOptimizer.mergeSimilarContexts(contexts);
        assert.strictEqual(mergedContexts.length, 2);
        assert.ok(mergedContexts.some(c => c.topic === 'arrays'));
        assert.ok(mergedContexts.some(c => c.topic === 'functions'));
    });
    test('should optimize context size based on token limit', () => {
        const longContext = Array(100).fill({ role: 'user', content: 'A'.repeat(100) });
        const optimizedContext = contextOptimizer.optimizeContextSize(longContext, 1000);
        assert.ok(optimizedContext.length < longContext.length);
        assert.ok(contextOptimizer.estimateTokenCount(optimizedContext) <= 1000);
    });
    test('should preserve conversation coherence during optimization', () => {
        const conversation = [
            { role: 'user', content: 'Question 1', id: 1 },
            { role: 'assistant', content: 'Answer 1', id: 2 },
            { role: 'user', content: 'Follow-up 1', id: 3, parentId: 2 },
            { role: 'assistant', content: 'Follow-up answer', id: 4, parentId: 3 }
        ];
        const optimized = contextOptimizer.optimizeWithCoherence(conversation);
        // Ensure related messages stay together
        const ids = optimized.map(m => m.id);
        assert.ok(ids.indexOf(3) > ids.indexOf(2)); // Follow-up after original
        assert.ok(ids.indexOf(4) > ids.indexOf(3)); // Answer after question
    });
    test('should calculate context relevance scores', () => {
        const currentContext = { topic: 'typescript' };
        const messages = [
            { content: 'How do I use TypeScript interfaces?', score: null },
            { content: 'What is the weather like?', score: null }
        ];
        const scoredMessages = contextOptimizer.calculateRelevanceScores(messages, currentContext);
        assert.ok(scoredMessages[0].score > scoredMessages[1].score);
        assert.ok(typeof scoredMessages[0].score === 'number');
    });
    test('should handle context window sliding', () => {
        const messages = Array(20).fill(null).map((_, i) => ({
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: `Message ${i}`,
            timestamp: Date.now() + i * 1000
        }));
        const window = contextOptimizer.slideContextWindow(messages, 10);
        assert.strictEqual(window.length, 10);
        assert.strictEqual(window[window.length - 1].content, 'Message 19');
    });
});
//# sourceMappingURL=ContextOptimizer.test.js.map