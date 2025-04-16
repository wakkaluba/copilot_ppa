"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('LLMRequestOptions Interface', () => {
    // Test for creating options with various properties
    describe('Option Properties', () => {
        it('should create options with temperature', () => {
            const options = {
                temperature: 0.7
            };
            expect(options.temperature).toBe(0.7);
        });
        it('should create options with maxTokens', () => {
            const options = {
                maxTokens: 2048
            };
            expect(options.maxTokens).toBe(2048);
        });
        it('should create options with stream flag', () => {
            const options = {
                stream: true
            };
            expect(options.stream).toBe(true);
        });
        it('should create options with all properties', () => {
            const options = {
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
    describe('Property Types and Validation', () => {
        it('should have temperature as a number between 0 and 1', () => {
            const options1 = { temperature: 0 };
            const options2 = { temperature: 0.5 };
            const options3 = { temperature: 1 };
            expect(typeof options1.temperature).toBe('number');
            expect(options1.temperature).toBeGreaterThanOrEqual(0);
            expect(options3.temperature).toBeLessThanOrEqual(1);
        });
        it('should have maxTokens as a positive integer', () => {
            const options = { maxTokens: 100 };
            expect(Number.isInteger(options.maxTokens)).toBe(true);
            expect(options.maxTokens).toBeGreaterThan(0);
        });
        it('should have stream as a boolean', () => {
            const options1 = { stream: true };
            const options2 = { stream: false };
            expect(typeof options1.stream).toBe('boolean');
            expect(typeof options2.stream).toBe('boolean');
        });
    });
    // Test for usage in typical scenarios
    describe('Usage Scenarios', () => {
        it('should work with typical chat completion options', () => {
            const options = {
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
        it('should work with streaming options', () => {
            const options = {
                temperature: 0.5,
                stream: true
            };
            expect(options).toEqual({
                temperature: 0.5,
                stream: true
            });
        });
        it('should work with creative generation options', () => {
            const options = {
                temperature: 0.9,
                maxTokens: 4000
            };
            expect(options).toEqual({
                temperature: 0.9,
                maxTokens: 4000
            });
        });
        it('should work with precise generation options', () => {
            const options = {
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
    describe('Custom Properties', () => {
        it('should allow custom provider-specific properties', () => {
            const options = {
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
//# sourceMappingURL=LLMRequestOptions.test.js.map