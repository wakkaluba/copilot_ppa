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

    it('should allow undefined optional properties', () => {
      const options: VectorDatabaseOptions = {};
      expect(options.dimensions).toBeUndefined();
      expect(options.metric).toBeUndefined();
    });

    it('should allow partial options', () => {
      const dimensionsOnly: VectorDatabaseOptions = { dimensions: 512 };
      const metricOnly: VectorDatabaseOptions = { metric: 'cosine' };

      expect(dimensionsOnly.metric).toBeUndefined();
      expect(metricOnly.dimensions).toBeUndefined();
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

    it('should enforce metric type safety', () => {
      // @ts-expect-error - Invalid metric value
      const invalidMetric: VectorDatabaseOptions = { metric: 'invalid' };
      // @ts-expect-error - Invalid metric type
      const wrongType: VectorDatabaseOptions = { metric: 123 };

      const validOptions: VectorDatabaseOptions = { metric: 'cosine' };
      expect(validOptions.metric).toBe('cosine');
    });

    it('should enforce dimensions type safety', () => {
      // @ts-expect-error - Invalid dimensions type
      const invalidType: VectorDatabaseOptions = { dimensions: '512' };
      
      const validOptions: VectorDatabaseOptions = { dimensions: 512 };
      expect(validOptions.dimensions).toBe(512);
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

    it('should work with minimal configuration', () => {
      const options: VectorDatabaseOptions = { dimensions: 1024 };
      expect(options.dimensions).toBe(1024);
    });

    it('should support common embedding model dimensions', () => {
      // OpenAI ada-002
      const adaOptions: VectorDatabaseOptions = { 
        dimensions: 1536, 
        metric: 'cosine' 
      };
      expect(adaOptions.dimensions).toBe(1536);

      // Cohere embed-english-v3.0
      const cohereOptions: VectorDatabaseOptions = {
        dimensions: 1024,
        metric: 'dot'
      };
      expect(cohereOptions.dimensions).toBe(1024);

      // Sentence transformers
      const senbOptions: VectorDatabaseOptions = {
        dimensions: 384,
        metric: 'cosine'
      };
      expect(senbOptions.dimensions).toBe(384);
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

    it('should work with Qdrant configurations', () => {
      const qdrantOptions: VectorDatabaseOptions = {
        dimensions: 768,
        metric: 'cosine'
      };
      expect(qdrantOptions).toEqual({
        dimensions: 768,
        metric: 'cosine'
      });
    });

    it('should work with Milvus configurations', () => {
      const milvusOptions: VectorDatabaseOptions = {
        dimensions: 1536,
        metric: 'euclidean'
      };
      expect(milvusOptions).toEqual({
        dimensions: 1536,
        metric: 'euclidean'
      });
    });

    it('should work with PGVector configurations', () => {
      const pgvectorOptions: VectorDatabaseOptions = {
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
  describe('Runtime Type Validation', () => {
    const validateOptions = (options: VectorDatabaseOptions): boolean => {
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

    it('should validate correct options', () => {
      const validOptions: VectorDatabaseOptions[] = [
        { dimensions: 1536, metric: 'cosine' },
        { dimensions: 768 },
        { metric: 'euclidean' },
        {}
      ];

      validOptions.forEach(options => {
        expect(validateOptions(options)).toBe(true);
      });
    });

    it('should catch invalid options at runtime', () => {
      const invalidOptions = [
        { dimensions: -1, metric: 'cosine' },
        { dimensions: 1.5, metric: 'euclidean' },
        { dimensions: 768, metric: 'invalid' }
      ];

      invalidOptions.forEach(options => {
        expect(validateOptions(options as VectorDatabaseOptions)).toBe(false);
      });
    });
  });
});