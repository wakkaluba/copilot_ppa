import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import axios from 'axios';

/**
 * Integration test to validate connectivity to local LLM hosts
 * These tests check both successful connections and graceful error handling
 */
describe('LLM Host Connectivity Integration Tests', () => {
  let sandbox: sinon.SinonSandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  
  afterEach(() => {
    sandbox.restore();
  });

  /**
   * Test suite for Ollama connectivity
   */
  describe('Ollama API Connectivity', () => {
    const ollamaEndpoint = 'http://localhost:11434';
    
    it('should handle successful connection to Ollama server', async function() {
      // Skip test if running in CI environment
      if (process.env.CI) {
        this.skip();
        return;
      }
      
      try {
        const response = await axios.get(`${ollamaEndpoint}/api/version`, { 
          timeout: 3000 
        });
        
        assert.strictEqual(response.status, 200, 'Should return status 200');
        assert.ok(response.data, 'Should return data');
        assert.ok(response.data.version, 'Should include version in response');
        console.log(`Connected to Ollama version: ${response.data.version}`);
      } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          // If not running Ollama locally, skip the test instead of failing
          console.log('Skipping Ollama connectivity test - server not available');
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it('should handle list models request to Ollama', async function() {
      // Skip test if running in CI environment
      if (process.env.CI) {
        this.skip();
        return;
      }
      
      try {
        const response = await axios.get(`${ollamaEndpoint}/api/tags`, { 
          timeout: 3000 
        });
        
        assert.strictEqual(response.status, 200, 'Should return status 200');
        assert.ok(response.data, 'Should return data');
        assert.ok(Array.isArray(response.data.models), 'Should return models array');
        console.log(`Found ${response.data.models.length} models in Ollama`);
      } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          console.log('Skipping Ollama models test - server not available');
          this.skip();
        } else {
          throw error;
        }
      }
    });
    
    it('should gracefully handle Ollama connection failures', async function() {
      // Use a non-existent endpoint to force an error
      const nonExistentEndpoint = 'http://localhost:11111';
      
      try {
        await axios.get(`${nonExistentEndpoint}/api/version`, { 
          timeout: 1000 
        });
        // If we get here, the request somehow succeeded, which is unexpected
        assert.fail('Request to non-existent endpoint should fail');
      } catch (error) {
        // This is the expected path
        assert.ok(error, 'Should throw an error');
        assert.ok(error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT', 
          `Error should be connection-related: ${error.code}`);
      }
    });
  });

  /**
   * Test suite for LM Studio connectivity
   */
  describe('LM Studio API Connectivity', () => {
    const lmStudioEndpoint = 'http://localhost:1234';
    
    it('should handle successful connection to LM Studio server', function() {
      // Skip test if running in CI environment
      if (process.env.CI) {
        this.skip();
        return;
      }
      
      return axios.get(`${lmStudioEndpoint}/v1/models`, { 
        timeout: 3000 
      })
      .then(response => {
        assert.strictEqual(response.status, 200, 'Should return status 200');
        assert.ok(response.data, 'Should return data');
        assert.ok(response.data.object === 'list', 'Should include object type in response');
        console.log(`Connected to LM Studio, found ${response.data.data?.length || 0} models`);
      })
      .catch(error => {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          // If not running LM Studio locally, skip the test instead of failing
          console.log('Skipping LM Studio connectivity test - server not available');
          this.skip();
        } else {
          throw error;
        }
      });
    });
    
    it('should gracefully handle LM Studio connection failures', async function() {
      // Use a non-existent endpoint to force an error
      const nonExistentEndpoint = 'http://localhost:12111';
      
      try {
        await axios.get(`${nonExistentEndpoint}/v1/models`, { 
          timeout: 1000 
        });
        // If we get here, the request somehow succeeded, which is unexpected
        assert.fail('Request to non-existent endpoint should fail');
      } catch (error) {
        // This is the expected path
        assert.ok(error, 'Should throw an error');
        assert.ok(error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT', 
          `Error should be connection-related: ${error.code}`);
      }
    });
  });

  /**
   * Test connection fallback logic
   */
  describe('LLM Connection Fallback Logic', () => {
    let axiosGetStub: sinon.SinonStub;
    
    beforeEach(() => {
      axiosGetStub = sandbox.stub(axios, 'get');
    });
    
    it('should try multiple endpoints until successful connection', async () => {
      // Simulate first endpoint failure, second successful
      axiosGetStub.withArgs('http://localhost:11434/api/version').rejects(new Error('Connection refused'));
      axiosGetStub.withArgs('http://localhost:1234/v1/models').resolves({ 
        status: 200, 
        data: { 
          object: 'list', 
          data: [{ id: 'test-model', object: 'model' }] 
        } 
      });
      
      // Function that tries multiple endpoints
      const tryConnections = async () => {
        try {
          await axios.get('http://localhost:11434/api/version');
          return 'ollama';
        } catch (e) {
          try {
            await axios.get('http://localhost:1234/v1/models');
            return 'lmstudio';
          } catch (e) {
            return 'none';
          }
        }
      };
      
      const result = await tryConnections();
      assert.strictEqual(result, 'lmstudio', 'Should fall back to LM Studio');
    });
    
    it('should return appropriate error message when all connections fail', async () => {
      // Simulate all endpoints failing
      axiosGetStub.rejects(new Error('Connection refused'));
      
      // Function that tries multiple endpoints and returns failure message
      const tryConnections = async () => {
        try {
          await axios.get('http://localhost:11434/api/version');
          return 'Connected to Ollama';
        } catch (e) {
          try {
            await axios.get('http://localhost:1234/v1/models');
            return 'Connected to LM Studio';
          } catch (e) {
            return 'No LLM servers available. Please ensure Ollama or LM Studio is running.';
          }
        }
      };
      
      const result = await tryConnections();
      assert.strictEqual(
        result, 
        'No LLM servers available. Please ensure Ollama or LM Studio is running.',
        'Should return appropriate error message'
      );
    });
  });
});