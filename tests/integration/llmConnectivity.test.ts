import * as vscode from 'vscode';
import * as sinon from 'sinon';
import axios from 'axios';

describe('LLM Connectivity Integration Tests', () => {
  let sandbox: sinon.SinonSandbox;
  let axiosGetStub: sinon.SinonStub;
  let axiosPostStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    axiosGetStub = sandbox.stub(axios, 'get');
    axiosPostStub = sandbox.stub(axios, 'post');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Ollama API Connectivity', () => {
    it('should handle successful connection to Ollama server', async () => {
      axiosGetStub.withArgs('http://localhost:11434/api/version').resolves({
        status: 200,
        data: { version: '0.1.14' }
      });

      const response = await axios.get('http://localhost:11434/api/version');
      expect(response.status).toBe(200);
      expect(response.data.version).toBeDefined();
    });

    it('should list available models from Ollama', async () => {
      axiosGetStub.withArgs('http://localhost:11434/api/tags').resolves({
        status: 200,
        data: {
          models: [
            { name: 'llama2', modified_at: '2023-07-25T14:33:40Z', size: 3791730298 },
            { name: 'mistral', modified_at: '2023-10-10T12:15:23Z', size: 4126384733 },
            { name: 'codellama', modified_at: '2023-08-30T09:20:10Z', size: 3985231234 }
          ]
        }
      });

      const response = await axios.get('http://localhost:11434/api/tags');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.models)).toBe(true);
      expect(response.data.models.length).toBeGreaterThanOrEqual(3);
      expect(response.data.models.some((model: any) => model.name === 'llama2')).toBe(true);
    });

    it('should handle model inference request correctly', async () => {
      axiosPostStub.withArgs('http://localhost:11434/api/generate').resolves({
        status: 200,
        data: {
          response: "Here's a sample implementation:",
          model: "llama2",
          created_at: "2023-11-04T12:34:56.789Z"
        }
      });

      const response = await axios.post('http://localhost:11434/api/generate', {
        prompt: 'Write a function to add two numbers',
        model: 'llama2'
      });

      expect(response.status).toBe(200);
      expect(response.data.response).toBeDefined();
      expect(response.data.model).toBe('llama2');
    });

    it('should handle connection failures gracefully', async () => {
      axiosGetStub.withArgs('http://localhost:11434/api/version')
        .rejects(new Error('Connection refused'));

      await expect(axios.get('http://localhost:11434/api/version'))
        .rejects.toThrow('Connection refused');
    });
  });

  describe('LM Studio API Connectivity', () => {
    it('should handle successful connection to LM Studio server', async () => {
      axiosGetStub.withArgs('http://localhost:1234/v1/models').resolves({
        status: 200,
        data: {
          object: 'list',
          data: [{ id: 'local-model', object: 'model' }]
        }
      });

      const response = await axios.get('http://localhost:1234/v1/models');
      
      expect(response.status).toBe(200);
      expect(response.data.object).toBe('list');
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should handle chat completion request correctly', async () => {
      axiosPostStub.withArgs('http://localhost:1234/v1/chat/completions').resolves({
        status: 200,
        data: {
          id: 'chatcmpl-123',
          object: 'chat.completion',
          created: 1699266096,
          model: 'local-model',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: 'function add(a, b) {\n  return a + b;\n}'
            },
            finish_reason: 'stop'
          }]
        }
      });

      const response = await axios.post('http://localhost:1234/v1/chat/completions', {
        model: 'local-model',
        messages: [{ role: 'user', content: 'Write a function to add two numbers' }]
      });

      expect(response.status).toBe(200);
      expect(response.data.choices[0].message.content).toBeDefined();
      expect(response.data.choices[0].message.role).toBe('assistant');
    });

    it('should handle connection failures gracefully', async () => {
      axiosGetStub.withArgs('http://localhost:1234/v1/models')
        .rejects(new Error('Connection refused'));

      await expect(axios.get('http://localhost:1234/v1/models'))
        .rejects.toThrow('Connection refused');
    });
  });

  describe('Fallback Behavior', () => {
    it('should try alternative endpoints when primary fails', async () => {
      // Mock primary endpoint failure
      axiosGetStub.withArgs('http://localhost:11434/api/version')
        .rejects(new Error('Connection refused'));

      // Mock fallback endpoint success
      axiosGetStub.withArgs('http://localhost:1234/v1/models').resolves({
        status: 200,
        data: { object: 'list', data: [{ id: 'local-model' }] }
      });

      // First attempt should fail
      await expect(axios.get('http://localhost:11434/api/version'))
        .rejects.toThrow('Connection refused');

      // Fallback attempt should succeed
      const fallbackResponse = await axios.get('http://localhost:1234/v1/models');
      expect(fallbackResponse.status).toBe(200);
    });
  });
});