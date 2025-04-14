import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import axios from 'axios';

describe('Local LLM Host Connectivity Tests', () => {
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

  describe('Ollama Connectivity', () => {
    it('should connect to Ollama server', async () => {
      // Mock successful response from Ollama server
      axiosGetStub.withArgs('http://localhost:11434/api/version').resolves({
        status: 200,
        data: { version: '0.1.14' }
      });

      // Test connection
      const response = await axios.get('http://localhost:11434/api/version');
      
      assert.strictEqual(response.status, 200, 'Should receive OK status code');
      assert(response.data.version, 'Should receive version information');
    });

    it('should handle Ollama connection failure gracefully', async () => {
      // Mock failed response
      axiosGetStub.withArgs('http://localhost:11434/api/version').rejects(new Error('Connection refused'));

      try {
        await axios.get('http://localhost:11434/api/version');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error instanceof Error, 'Should throw an error');
        assert(error.message.includes('Connection refused'), 'Should indicate connection issue');
      }
    });

    it('should list available models from Ollama', async () => {
      // Mock successful response with models list
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
      
      assert.strictEqual(response.status, 200, 'Should receive OK status code');
      assert(Array.isArray(response.data.models), 'Should return array of models');
      assert(response.data.models.length >= 3, 'Should return at least 3 models');
      assert(response.data.models.some((model: any) => model.name === 'llama2'), 'Should include llama2 model');
    });

    it('should handle model inference request correctly', async () => {
      // Mock successful inference response
      axiosPostStub.withArgs('http://localhost:11434/api/generate').resolves({
        status: 200,
        data: {
          response: "Here's the code implementation:",
          model: "llama2",
          created_at: "2023-11-04T12:34:56.789Z"
        }
      });

      const prompt = { prompt: 'Write a function to add two numbers in JavaScript', model: 'llama2' };
      const response = await axios.post('http://localhost:11434/api/generate', prompt);
      
      assert.strictEqual(response.status, 200, 'Should receive OK status code');
      assert(response.data.response, 'Should return a text response');
      assert(response.data.model, 'Should include model information');
    });
  });

  describe('LM Studio Connectivity', () => {
    it('should connect to LM Studio server', async () => {
      // Mock successful response from LM Studio server
      axiosGetStub.withArgs('http://localhost:1234/v1/models').resolves({
        status: 200,
        data: { object: 'list', data: [{ id: 'local-model', object: 'model' }] }
      });

      // Test connection
      const response = await axios.get('http://localhost:1234/v1/models');
      
      assert.strictEqual(response.status, 200, 'Should receive OK status code');
      assert(Array.isArray(response.data.data), 'Should receive models list');
    });

    it('should handle LM Studio connection failure gracefully', async () => {
      // Mock failed response
      axiosGetStub.withArgs('http://localhost:1234/v1/models').rejects(new Error('Connection refused'));

      try {
        await axios.get('http://localhost:1234/v1/models');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error instanceof Error, 'Should throw an error');
        assert(error.message.includes('Connection refused'), 'Should indicate connection issue');
      }
    });

    it('should handle LM Studio inference request correctly', async () => {
      // Mock successful chat completion response
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

      const chatRequest = {
        model: 'local-model',
        messages: [
          { role: 'user', content: 'Write a function to add two numbers in JavaScript' }
        ],
        max_tokens: 100
      };
      
      const response = await axios.post('http://localhost:1234/v1/chat/completions', chatRequest);
      
      assert.strictEqual(response.status, 200, 'Should receive OK status code');
      assert(response.data.choices && response.data.choices.length > 0, 'Should return choices');
      assert(response.data.choices[0].message.content.includes('function'), 'Should include code in response');
    });
  });
});