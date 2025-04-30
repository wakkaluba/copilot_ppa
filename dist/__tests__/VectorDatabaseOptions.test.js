"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('VectorDatabaseOptions Interface', function () {
    // Test for creating options with various properties
    describe('Option Properties', function () {
        it('should create options with dimensions', function () {
            var options = {
                dimensions: 1536
            };
            expect(options.dimensions).toBe(1536);
        });
        it('should create options with metric', function () {
            var options = {
                metric: 'cosine'
            };
            expect(options.metric).toBe('cosine');
        });
        it('should create options with all properties', function () {
            var options = {
                dimensions: 768,
                metric: 'euclidean'
            };
            expect(options.dimensions).toBe(768);
            expect(options.metric).toBe('euclidean');
        });
        it('should allow undefined optional properties', function () {
            var options = {};
            expect(options.dimensions).toBeUndefined();
            expect(options.metric).toBeUndefined();
        });
        it('should allow partial options', function () {
            var dimensionsOnly = { dimensions: 512 };
            var metricOnly = { metric: 'cosine' };
            expect(dimensionsOnly.metric).toBeUndefined();
            expect(metricOnly.dimensions).toBeUndefined();
        });
    });
    // Test for property types and valid values
    describe('Property Types and Validation', function () {
        it('should have dimensions as a positive integer', function () {
            var options = { dimensions: 384 };
            expect(Number.isInteger(options.dimensions)).toBe(true);
            expect(options.dimensions).toBeGreaterThan(0);
        });
        it('should accept valid metric values', function () {
            var options1 = { metric: 'cosine' };
            var options2 = { metric: 'euclidean' };
            var options3 = { metric: 'dot' };
            expect(['cosine', 'euclidean', 'dot']).toContain(options1.metric);
            expect(['cosine', 'euclidean', 'dot']).toContain(options2.metric);
            expect(['cosine', 'euclidean', 'dot']).toContain(options3.metric);
        });
        it('should enforce metric type safety', function () {
            // @ts-expect-error - Invalid metric value
            var invalidMetric = { metric: 'invalid' };
            // @ts-expect-error - Invalid metric type
            var wrongType = { metric: 123 };
            var validOptions = { metric: 'cosine' };
            expect(validOptions.metric).toBe('cosine');
        });
        it('should enforce dimensions type safety', function () {
            // @ts-expect-error - Invalid dimensions type
            var invalidType = { dimensions: '512' };
            var validOptions = { dimensions: 512 };
            expect(validOptions.dimensions).toBe(512);
        });
    });
    // Test for usage in typical scenarios
    describe('Usage Scenarios', function () {
        it('should work with OpenAI embedding dimensions', function () {
            var options = {
                dimensions: 1536,
                metric: 'cosine'
            };
            expect(options).toEqual({
                dimensions: 1536,
                metric: 'cosine'
            });
        });
        it('should work with custom embedding dimensions', function () {
            var options = {
                dimensions: 384,
                metric: 'euclidean'
            };
            expect(options).toEqual({
                dimensions: 384,
                metric: 'euclidean'
            });
        });
        it('should work with dot product similarity', function () {
            var options = {
                dimensions: 768,
                metric: 'dot'
            };
            expect(options).toEqual({
                dimensions: 768,
                metric: 'dot'
            });
        });
        it('should work with minimal configuration', function () {
            var options = { dimensions: 1024 };
            expect(options.dimensions).toBe(1024);
        });
        it('should support common embedding model dimensions', function () {
            // OpenAI ada-002
            var adaOptions = {
                dimensions: 1536,
                metric: 'cosine'
            };
            expect(adaOptions.dimensions).toBe(1536);
            // Cohere embed-english-v3.0
            var cohereOptions = {
                dimensions: 1024,
                metric: 'dot'
            };
            expect(cohereOptions.dimensions).toBe(1024);
            // Sentence transformers
            var senbOptions = {
                dimensions: 384,
                metric: 'cosine'
            };
            expect(senbOptions.dimensions).toBe(384);
        });
    });
    // Test for provider-specific implementations
    describe('Provider Implementations', function () {
        it('should work with FAISS configurations', function () {
            var faissOptions = {
                dimensions: 1536,
                metric: 'cosine'
            };
            expect(faissOptions.dimensions).toBe(1536);
            expect(faissOptions.metric).toBe('cosine');
        });
        it('should work with Chroma configurations', function () {
            var chromaOptions = {
                dimensions: 768,
                metric: 'euclidean'
            };
            expect(chromaOptions.dimensions).toBe(768);
            expect(chromaOptions.metric).toBe('euclidean');
        });
        it('should work with Qdrant configurations', function () {
            var qdrantOptions = {
                dimensions: 768,
                metric: 'cosine'
            };
            expect(qdrantOptions).toEqual({
                dimensions: 768,
                metric: 'cosine'
            });
        });
        it('should work with Milvus configurations', function () {
            var milvusOptions = {
                dimensions: 1536,
                metric: 'euclidean'
            };
            expect(milvusOptions).toEqual({
                dimensions: 1536,
                metric: 'euclidean'
            });
        });
        it('should work with PGVector configurations', function () {
            var pgvectorOptions = {
                dimensions: 1536,
                metric: 'cosine'
            };
            expect(pgvectorOptions).toEqual({
                dimensions: 1536,
                metric: 'cosine'
            });
        });
    });
    // Test runtime type validation
    describe('Runtime Type Validation', function () {
        var validateOptions = function (options) {
            if (options.dimensions !== undefined &&
                (!Number.isInteger(options.dimensions) || options.dimensions <= 0)) {
                return false;
            }
            if (options.metric !== undefined &&
                !['cosine', 'euclidean', 'dot'].includes(options.metric)) {
                return false;
            }
            return true;
        };
        it('should validate correct options', function () {
            var validOptions = [
                { dimensions: 1536, metric: 'cosine' },
                { dimensions: 768 },
                { metric: 'euclidean' },
                {}
            ];
            validOptions.forEach(function (options) {
                expect(validateOptions(options)).toBe(true);
            });
        });
        it('should catch invalid options at runtime', function () {
            var invalidOptions = [
                { dimensions: -1, metric: 'cosine' },
                { dimensions: 1.5, metric: 'euclidean' },
                { dimensions: 768, metric: 'invalid' }
            ];
            invalidOptions.forEach(function (options) {
                expect(validateOptions(options)).toBe(false);
            });
        });
    });
});
//# sourceMappingURL=VectorDatabaseOptions.test.js.map