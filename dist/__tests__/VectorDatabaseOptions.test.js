"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('VectorDatabaseOptions Interface', () => {
    // Test for creating options with various properties
    describe('Option Properties', () => {
        it('should create options with dimensions', () => {
            const options = {
                dimensions: 1536
            };
            expect(options.dimensions).toBe(1536);
        });
        it('should create options with metric', () => {
            const options = {
                metric: 'cosine'
            };
            expect(options.metric).toBe('cosine');
        });
        it('should create options with all properties', () => {
            const options = {
                dimensions: 768,
                metric: 'euclidean'
            };
            expect(options.dimensions).toBe(768);
            expect(options.metric).toBe('euclidean');
        });
    });
    // Test for property types and valid values
    describe('Property Types and Validation', () => {
        it('should have dimensions as a positive integer', () => {
            const options = { dimensions: 384 };
            expect(Number.isInteger(options.dimensions)).toBe(true);
            expect(options.dimensions).toBeGreaterThan(0);
        });
        it('should accept valid metric values', () => {
            const options1 = { metric: 'cosine' };
            const options2 = { metric: 'euclidean' };
            const options3 = { metric: 'dot' };
            expect(['cosine', 'euclidean', 'dot']).toContain(options1.metric);
            expect(['cosine', 'euclidean', 'dot']).toContain(options2.metric);
            expect(['cosine', 'euclidean', 'dot']).toContain(options3.metric);
        });
    });
    // Test for usage in typical scenarios
    describe('Usage Scenarios', () => {
        it('should work with OpenAI embedding dimensions', () => {
            const options = {
                dimensions: 1536,
                metric: 'cosine'
            };
            expect(options).toEqual({
                dimensions: 1536,
                metric: 'cosine'
            });
        });
        it('should work with custom embedding dimensions', () => {
            const options = {
                dimensions: 384,
                metric: 'euclidean'
            };
            expect(options).toEqual({
                dimensions: 384,
                metric: 'euclidean'
            });
        });
        it('should work with dot product similarity', () => {
            const options = {
                dimensions: 768,
                metric: 'dot'
            };
            expect(options).toEqual({
                dimensions: 768,
                metric: 'dot'
            });
        });
    });
    // Test for provider-specific implementations
    describe('Provider Implementations', () => {
        it('should work with FAISS configurations', () => {
            const faissOptions = {
                dimensions: 1536,
                metric: 'cosine'
            };
            expect(faissOptions.dimensions).toBe(1536);
            expect(faissOptions.metric).toBe('cosine');
        });
        it('should work with Chroma configurations', () => {
            const chromaOptions = {
                dimensions: 768,
                metric: 'euclidean'
            };
            expect(chromaOptions.dimensions).toBe(768);
            expect(chromaOptions.metric).toBe('euclidean');
        });
    });
});
//# sourceMappingURL=VectorDatabaseOptions.test.js.map