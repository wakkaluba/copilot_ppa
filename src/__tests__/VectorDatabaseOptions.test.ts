// filepath: d:\___coding\tools\copilot_ppa\src\__tests__\VectorDatabaseOptions.test.ts
import { VectorDatabaseOptions } from '../services/vectordb/models';

describe('VectorDatabaseOptions Interface', () => {
  // Test for creating options with various properties
  describe('Option Properties', () => {
    it('should create options with dimensions', () => {
      const options: VectorDatabaseOptions = {
        dimensions: 1536
      };

      expect(options.dimensions).toBe(1536);
    });

    it('should create options with metric', () => {
      const options: VectorDatabaseOptions = {
        metric: 'cosine'
      };

      expect(options.metric).toBe('cosine');
    });

    it('should create options with all properties', () => {
      const options: VectorDatabaseOptions = {
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
      const options: VectorDatabaseOptions = { dimensions: 384 };

      expect(Number.isInteger(options.dimensions)).toBe(true);
      expect(options.dimensions).toBeGreaterThan(0);
    });

    it('should accept valid metric values', () => {
      const options1: VectorDatabaseOptions = { metric: 'cosine' };
      const options2: VectorDatabaseOptions = { metric: 'euclidean' };
      const options3: VectorDatabaseOptions = { metric: 'dot' };

      expect(['cosine', 'euclidean', 'dot']).toContain(options1.metric);
      expect(['cosine', 'euclidean', 'dot']).toContain(options2.metric);
      expect(['cosine', 'euclidean', 'dot']).toContain(options3.metric);
    });
  });

  // Test for usage in typical scenarios
  describe('Usage Scenarios', () => {
    it('should work with OpenAI embedding dimensions', () => {
      const options: VectorDatabaseOptions = {
        dimensions: 1536,
        metric: 'cosine'
      };

      expect(options).toEqual({
        dimensions: 1536,
        metric: 'cosine'
      });
    });

    it('should work with custom embedding dimensions', () => {
      const options: VectorDatabaseOptions = {
        dimensions: 384,
        metric: 'euclidean'
      };

      expect(options).toEqual({
        dimensions: 384,
        metric: 'euclidean'
      });
    });

    it('should work with dot product similarity', () => {
      const options: VectorDatabaseOptions = {
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
      const faissOptions: VectorDatabaseOptions = {
        dimensions: 1536,
        metric: 'cosine'
      };

      expect(faissOptions.dimensions).toBe(1536);
      expect(faissOptions.metric).toBe('cosine');
    });

    it('should work with Chroma configurations', () => {
      const chromaOptions: VectorDatabaseOptions = {
        dimensions: 768,
        metric: 'euclidean'
      };

      expect(chromaOptions.dimensions).toBe(768);
      expect(chromaOptions.metric).toBe('euclidean');
    });
  });
});