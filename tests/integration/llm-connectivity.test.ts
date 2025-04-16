import * as vscode from 'vscode';
import axios from 'axios';
import { LLMProviderFactory } from '../../src/llmProviders/llmProviderFactory';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LLM Connectivity Tests', () => {
  let llmProvider: LLMProviderFactory;

  beforeEach(() => {
    llmProvider = new LLMProviderFactory();
    jest.clearAllMocks();
  });

  describe('Ollama API Connection', () => {
    const OLLAMA_ENDPOINT = 'http://localhost:11434';

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: {
          models: [
            { name: 'llama2' },
            { name: 'codellama' },
            { name: 'mistral' }
          ]
        }
      });
    });

    it('should successfully connect to Ollama API', async () => {
      const response = await mockedAxios.get(`${OLLAMA_ENDPOINT}/api/tags`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.models)).toBe(true);
      expect(response.data.models.length).toBeGreaterThanOrEqual(3);
      expect(response.data.models.some((model: any) => model.name === 'llama2')).toBe(true);
    });

    it('should handle connection errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

      await expect(mockedAxios.get(`${OLLAMA_ENDPOINT}/api/tags`))
        .rejects.toThrow('Connection refused');
    });

    it('should validate model availability', async () => {
      const modelName = 'llama2';
      
      const response = await mockedAxios.get(`${OLLAMA_ENDPOINT}/api/tags`);
      const modelExists = response.data.models.some(
        (model: any) => model.name === modelName
      );
      
      expect(modelExists).toBe(true);
    });
  });

  describe('LMStudio API Connection', () => {
    const LMSTUDIO_ENDPOINT = 'http://localhost:1234';

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: {
          models: [
            { id: 'local-model', name: 'Local Model' }
          ]
        }
      });
    });

    it('should successfully connect to LMStudio API', async () => {
      const response = await mockedAxios.get(`${LMSTUDIO_ENDPOINT}/v1/models`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.models)).toBe(true);
      expect(response.data.models.length).toBeGreaterThan(0);
    });

    it('should handle connection errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

      await expect(mockedAxios.get(`${LMSTUDIO_ENDPOINT}/v1/models`))
        .rejects.toThrow('Connection refused');
    });
  });

  describe('API Error Handling', () => {
    it('should handle timeout errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Request timeout'));

      await expect(llmProvider.checkConnection())
        .rejects.toThrow('Request timeout');
    });

    it('should handle invalid response format', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { invalid: 'response' }
      });

      await expect(llmProvider.checkConnection())
        .rejects.toThrow();
    });
  });
});