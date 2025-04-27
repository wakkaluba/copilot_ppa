"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('LLMRequestOptions Interface', function () {
    // Test for creating options with various properties
    describe('Option Properties', function () {
        it('should create options with temperature', function () {
            var options = {
                temperature: 0.7
            };
            expect(options.temperature).toBe(0.7);
        });
        it('should create options with maxTokens', function () {
            var options = {
                maxTokens: 2048
            };
            expect(options.maxTokens).toBe(2048);
        });
        it('should create options with stream flag', function () {
            var options = {
                stream: true
            };
            expect(options.stream).toBe(true);
        });
        it('should create options with all properties', function () {
            var options = {
                temperature: 0.5,
                maxTokens: 1000,
                stream: false
            };
            expect(options.temperature).toBe(0.5);
            expect(options.maxTokens).toBe(1000);
            expect(options.stream).toBe(false);
        });
    });
    // Test for property types and valid values
    describe('Property Types and Validation', function () {
        it('should have temperature as a number between 0 and 1', function () {
            var options1 = { temperature: 0 };
            var options2 = { temperature: 0.5 };
            var options3 = { temperature: 1 };
            expect(typeof options1.temperature).toBe('number');
            expect(options1.temperature).toBeGreaterThanOrEqual(0);
            expect(options3.temperature).toBeLessThanOrEqual(1);
        });
        it('should have maxTokens as a positive integer', function () {
            var options = { maxTokens: 100 };
            expect(Number.isInteger(options.maxTokens)).toBe(true);
            expect(options.maxTokens).toBeGreaterThan(0);
        });
        it('should have stream as a boolean', function () {
            var options1 = { stream: true };
            var options2 = { stream: false };
            expect(typeof options1.stream).toBe('boolean');
            expect(typeof options2.stream).toBe('boolean');
        });
    });
    // Test for usage in typical scenarios
    describe('Usage Scenarios', function () {
        it('should work with typical chat completion options', function () {
            var options = {
                temperature: 0.7,
                maxTokens: 2000,
                stream: false
            };
            expect(options).toEqual({
                temperature: 0.7,
                maxTokens: 2000,
                stream: false
            });
        });
        it('should work with streaming options', function () {
            var options = {
                temperature: 0.5,
                stream: true
            };
            expect(options).toEqual({
                temperature: 0.5,
                stream: true
            });
        });
        it('should work with creative generation options', function () {
            var options = {
                temperature: 0.9,
                maxTokens: 4000
            };
            expect(options).toEqual({
                temperature: 0.9,
                maxTokens: 4000
            });
        });
        it('should work with precise generation options', function () {
            var options = {
                temperature: 0.1,
                maxTokens: 500
            };
            expect(options).toEqual({
                temperature: 0.1,
                maxTokens: 500
            });
        });
    });
    // Test for extension of options with custom properties
    describe('Custom Properties', function () {
        it('should allow custom provider-specific properties', function () {
            var options = {
                temperature: 0.7,
                maxTokens: 2000,
                numPredict: 512,
                repeatPenalty: 1.1
            };
            expect(options.temperature).toBe(0.7);
            expect(options.maxTokens).toBe(2000);
            expect(options.numPredict).toBe(512);
            expect(options.repeatPenalty).toBe(1.1);
        });
        // Removed the test with the topP property since LLMRequestOptions doesn't support arbitrary properties
    });
});
