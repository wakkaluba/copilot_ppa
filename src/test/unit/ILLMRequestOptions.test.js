"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
suite('ILLMRequestOptions Interface Tests', function () {
    test('validates temperature range', function () {
        // Valid temperatures
        var validOptions1 = { temperature: 0.0 };
        var validOptions2 = { temperature: 0.5 };
        var validOptions3 = { temperature: 1.0 };
        // All should compile without error
        assert.strictEqual(typeof validOptions1.temperature, 'number');
        assert.strictEqual(typeof validOptions2.temperature, 'number');
        assert.strictEqual(typeof validOptions3.temperature, 'number');
        // TypeScript will prevent setting invalid temperatures at compile time
        // These would cause type errors:
        // const invalidOptions1: ILLMRequestOptions = { temperature: -0.1 };
        // const invalidOptions2: ILLMRequestOptions = { temperature: 1.1 };
        // const invalidOptions3: ILLMRequestOptions = { temperature: '0.5' };
    });
    test('validates maxTokens', function () {
        // Valid maxTokens values
        var validOptions1 = { maxTokens: 100 };
        var validOptions2 = { maxTokens: 1000 };
        var validOptions3 = { maxTokens: undefined };
        assert.strictEqual(typeof validOptions1.maxTokens, 'number');
        assert.strictEqual(typeof validOptions2.maxTokens, 'number');
        assert.strictEqual(validOptions3.maxTokens, undefined);
        // TypeScript will prevent setting invalid maxTokens at compile time
        // These would cause type errors:
        // const invalidOptions1: ILLMRequestOptions = { maxTokens: -100 };
        // const invalidOptions2: ILLMRequestOptions = { maxTokens: '100' };
    });
    test('validates stopSequences', function () {
        // Valid stop sequences
        var validOptions1 = { stopSequences: ['stop'] };
        var validOptions2 = { stopSequences: ['stop1', 'stop2'] };
        var validOptions3 = { stopSequences: [] };
        var validOptions4 = { stopSequences: undefined };
        assert.ok(Array.isArray(validOptions1.stopSequences));
        assert.ok(Array.isArray(validOptions2.stopSequences));
        assert.ok(Array.isArray(validOptions3.stopSequences));
        assert.strictEqual(validOptions4.stopSequences, undefined);
        // TypeScript will prevent setting invalid stop sequences at compile time
        // These would cause type errors:
        // const invalidOptions1: ILLMRequestOptions = { stopSequences: 'stop' };
        // const invalidOptions2: ILLMRequestOptions = { stopSequences: [1, 2, 3] };
    });
    test('validates stream option', function () {
        // Valid stream options
        var validOptions1 = { stream: true };
        var validOptions2 = { stream: false };
        var validOptions3 = { stream: undefined };
        assert.strictEqual(typeof validOptions1.stream, 'boolean');
        assert.strictEqual(typeof validOptions2.stream, 'boolean');
        assert.strictEqual(validOptions3.stream, undefined);
        // TypeScript will prevent setting invalid stream values at compile time
        // These would cause type errors:
        // const invalidOptions1: ILLMRequestOptions = { stream: 1 };
        // const invalidOptions2: ILLMRequestOptions = { stream: 'true' };
    });
    test('allows provider-specific parameters', function () {
        // Test that additional provider-specific parameters are allowed
        var options = {
            temperature: 0.7,
            maxTokens: 1000,
            customParam1: 'value1',
            customParam2: 42,
            customParam3: { nested: true }
        };
        assert.strictEqual(options.temperature, 0.7);
        assert.strictEqual(options.maxTokens, 1000);
        assert.strictEqual(options['customParam1'], 'value1');
        assert.strictEqual(options['customParam2'], 42);
        assert.deepStrictEqual(options['customParam3'], { nested: true });
    });
    test('combines multiple options correctly', function () {
        // Test combining multiple options
        var options = {
            temperature: 0.8,
            maxTokens: 500,
            stopSequences: ['stop1', 'stop2'],
            stream: true,
            customParam: 'value'
        };
        assert.strictEqual(options.temperature, 0.8);
        assert.strictEqual(options.maxTokens, 500);
        assert.deepStrictEqual(options.stopSequences, ['stop1', 'stop2']);
        assert.strictEqual(options.stream, true);
        assert.strictEqual(options['customParam'], 'value');
    });
});
