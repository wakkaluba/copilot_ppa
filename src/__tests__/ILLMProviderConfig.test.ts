// filepath: d:\___coding\tools\copilot_ppa\src\__tests__\ILLMProviderConfig.test.ts
import { ILLMProviderConfig, ILLMRequestOptions } from '../llm-providers/llm-provider.interface';

describe('ILLMProviderConfig Interface', () => {
  // Test for basic configuration
  describe('Basic Configuration', () => {
    it('should create a valid provider config with required fields', () => {
      const config: ILLMProviderConfig = {
        apiEndpoint: 'http://localhost:11434/api',
        model: 'llama2'
      };

      expect(config.apiEndpoint).toBe('http://localhost:11434/api');
      expect(config.model).toBe('llama2');
      expect(config.defaultOptions).toBeUndefined();
    });

    it('should create a config with all available properties', () => {
      const defaultOptions: ILLMRequestOptions = {
        temperature: 0.7,
        maxTokens: 2000,
        stopSequences: ['\n\n', 'END'],
        stream: false
      };

      const config: ILLMProviderConfig = {
        apiEndpoint: 'http://localhost:1234/v1',
        model: 'TheBloke/Llama-2-7B-Chat-GGUF',
        defaultOptions: defaultOptions
      };

      expect(config.apiEndpoint).toBe('http://localhost:1234/v1');
      expect(config.model).toBe('TheBloke/Llama-2-7B-Chat-GGUF');
      expect(config.defaultOptions).toBeDefined();
      expect(config.defaultOptions?.temperature).toBe(0.7);
      expect(config.defaultOptions?.maxTokens).toBe(2000);
      expect(config.defaultOptions?.stopSequences).toEqual(['\n\n', 'END']);
      expect(config.defaultOptions?.stream).toBe(false);
    });
  });

  // Test for different provider configurations
  describe('Provider-Specific Configurations', () => {
    it('should work with Ollama configuration', () => {
      const config: ILLMProviderConfig = {
        apiEndpoint: 'http://localhost:11434',
        model: 'codellama',
        defaultOptions: {
          temperature: 0.5,
          maxTokens: 1500
        }
      };
      
      expect(config.apiEndpoint).toContain('localhost:11434');
      expect(config.model).toBe('codellama');
      expect(config.defaultOptions?.temperature).toBe(0.5);
    });

    it('should work with LM Studio configuration', () => {
      const config: ILLMProviderConfig = {
        apiEndpoint: 'http://localhost:1234',
        model: 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
        defaultOptions: {
          temperature: 0.8,
          maxTokens: 4000,
          stream: true
        }
      };
      
      expect(config.apiEndpoint).toContain('localhost:1234');
      expect(config.model).toContain('Mistral');
      expect(config.defaultOptions?.stream).toBe(true);
    });

    it('should work with custom provider configuration', () => {
      const config: ILLMProviderConfig = {
        apiEndpoint: 'https://api.custom-llm.example.com',
        model: 'custom-model-v1',
        defaultOptions: {
          temperature: 0.3,
          // Custom provider-specific option
          customParam: 'value'
        }
      };
      
      expect(config.apiEndpoint).toContain('api.custom-llm.example.com');
      expect(config.model).toBe('custom-model-v1');
      expect(config.defaultOptions?.['customParam']).toBe('value');
    });
  });

  // Test for URL validation
  describe('API Endpoint URL Validation', () => {
    it('should accept valid URL formats', () => {
      const validURLs = [
        'http://localhost:11434/api',
        'https://api.example.com/v1',
        'http://127.0.0.1:8080',
        'https://llm.service.com/api/generate'
      ];
      
      validURLs.forEach(url => {
        const config: ILLMProviderConfig = {
          apiEndpoint: url,
          model: 'test-model'
        };
        
        expect(config.apiEndpoint).toBe(url);
        // Simple URL validation check
        expect(url.startsWith('http://') || url.startsWith('https://')).toBe(true);
      });
    });
  });

  // Test for default request options configuration
  describe('Default Request Options', () => {
    it('should properly configure temperature values', () => {
      // Test with different valid temperature values
      [0, 0.1, 0.5, 0.7, 1.0].forEach(temp => {
        const config: ILLMProviderConfig = {
          apiEndpoint: 'http://localhost:11434',
          model: 'llama2',
          defaultOptions: {
            temperature: temp
          }
        };
        
        expect(config.defaultOptions?.temperature).toBe(temp);
        expect(config.defaultOptions?.temperature).toBeGreaterThanOrEqual(0);
        expect(config.defaultOptions?.temperature).toBeLessThanOrEqual(1);
      });
    });

    it('should properly configure maxTokens values', () => {
      // Test with different token limits
      [100, 500, 1000, 2000, 4000].forEach(tokens => {
        const config: ILLMProviderConfig = {
          apiEndpoint: 'http://localhost:11434',
          model: 'llama2',
          defaultOptions: {
            maxTokens: tokens
          }
        };
        
        expect(config.defaultOptions?.maxTokens).toBe(tokens);
        expect(config.defaultOptions?.maxTokens).toBeGreaterThan(0);
      });
    });

    it('should properly configure streaming option', () => {
      // Test with streaming enabled and disabled
      [true, false].forEach(streamEnabled => {
        const config: ILLMProviderConfig = {
          apiEndpoint: 'http://localhost:11434',
          model: 'llama2',
          defaultOptions: {
            stream: streamEnabled
          }
        };
        
        expect(config.defaultOptions?.stream).toBe(streamEnabled);
      });
    });

    it('should handle custom provider-specific options', () => {
      const config: ILLMProviderConfig = {
        apiEndpoint: 'http://localhost:11434',
        model: 'llama2',
        defaultOptions: {
          temperature: 0.7,
          // Custom provider-specific options
          top_p: 0.95,
          frequency_penalty: 0.5,
          presence_penalty: 0.2,
          logitBias: { '50256': -100 }
        }
      };
      
      expect(config.defaultOptions?.['top_p']).toBe(0.95);
      expect(config.defaultOptions?.['frequency_penalty']).toBe(0.5);
      expect(config.defaultOptions?.['presence_penalty']).toBe(0.2);
      expect(config.defaultOptions?.['logitBias']).toEqual({ '50256': -100 });
    });
  });
});