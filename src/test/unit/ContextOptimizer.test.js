"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var ContextOptimizer_1 = require("../../services/ContextOptimizer");
var WorkspaceManager_1 = require("../../services/WorkspaceManager");
suite('ContextOptimizer Tests', function () {
    var contextOptimizer;
    var workspaceManagerStub;
    var sandbox;
    setup(function () {
        sandbox = sinon.createSandbox();
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        contextOptimizer = new ContextOptimizer_1.ContextOptimizer();
    });
    teardown(function () {
        sandbox.restore();
    });
    test('should prune irrelevant context', function () {
        var context = [
            { role: 'user', content: 'How do I implement a binary search?', relevance: 0.9 },
            { role: 'assistant', content: 'Here is the implementation...', relevance: 0.9 },
            { role: 'user', content: 'What is the weather like?', relevance: 0.1 },
            { role: 'assistant', content: 'I cannot provide weather information', relevance: 0.1 }
        ];
        var prunedContext = contextOptimizer.pruneContext(context, 0.5);
        assert.strictEqual(prunedContext.length, 2);
        assert.strictEqual(prunedContext[0].content, 'How do I implement a binary search?');
    });
    test('should merge similar contexts', function () {
        var contexts = [
            { topic: 'arrays', content: 'Array methods in JavaScript' },
            { topic: 'arrays', content: 'Array manipulation in JavaScript' },
            { topic: 'functions', content: 'Function declarations' }
        ];
        var mergedContexts = contextOptimizer.mergeSimilarContexts(contexts);
        assert.strictEqual(mergedContexts.length, 2);
        assert.ok(mergedContexts.some(function (c) { return c.topic === 'arrays'; }));
        assert.ok(mergedContexts.some(function (c) { return c.topic === 'functions'; }));
    });
    test('should optimize context size based on token limit', function () {
        var longContext = Array(100).fill({ role: 'user', content: 'A'.repeat(100) });
        var optimizedContext = contextOptimizer.optimizeContextSize(longContext, 1000);
        assert.ok(optimizedContext.length < longContext.length);
        assert.ok(contextOptimizer.estimateTokenCount(optimizedContext) <= 1000);
    });
    test('should preserve conversation coherence during optimization', function () {
        var conversation = [
            { role: 'user', content: 'Question 1', id: 1 },
            { role: 'assistant', content: 'Answer 1', id: 2 },
            { role: 'user', content: 'Follow-up 1', id: 3, parentId: 2 },
            { role: 'assistant', content: 'Follow-up answer', id: 4, parentId: 3 }
        ];
        var optimized = contextOptimizer.optimizeWithCoherence(conversation);
        // Ensure related messages stay together
        var ids = optimized.map(function (m) { return m.id; });
        assert.ok(ids.indexOf(3) > ids.indexOf(2)); // Follow-up after original
        assert.ok(ids.indexOf(4) > ids.indexOf(3)); // Answer after question
    });
    test('should calculate context relevance scores', function () {
        var currentContext = { topic: 'typescript' };
        var messages = [
            { content: 'How do I use TypeScript interfaces?', score: null },
            { content: 'What is the weather like?', score: null }
        ];
        var scoredMessages = contextOptimizer.calculateRelevanceScores(messages, currentContext);
        assert.ok(scoredMessages[0].score > scoredMessages[1].score);
        assert.ok(typeof scoredMessages[0].score === 'number');
    });
    test('should handle context window sliding', function () {
        var messages = Array(20).fill(null).map(function (_, i) { return ({
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: "Message ".concat(i),
            timestamp: new Date() + i * 1000
        }); });
        var window = contextOptimizer.slideContextWindow(messages, 10);
        assert.strictEqual(window.length, 10);
        assert.strictEqual(window[window.length - 1].content, 'Message 19');
    });
});
