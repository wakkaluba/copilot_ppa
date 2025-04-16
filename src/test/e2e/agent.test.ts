import * as vscode from 'vscode';
import { Agent } from '../../agents/agent';
import { TestWorkspace } from '../helpers/testWorkspace';
import { LLMProviderFactory } from '../../llmProviders/llmProviderFactory';

describe('Agent E2E Tests', () => {
  let agent: Agent;
  let testWorkspace: TestWorkspace;
  let mockProviderFactory: LLMProviderFactory;
  
  beforeEach(async () => {
    // Set up mock provider factory
    mockProviderFactory = new LLMProviderFactory();
    jest.spyOn(mockProviderFactory, 'createProvider').mockImplementation(() => ({
      sendMessage: jest.fn().mockResolvedValue('Mock response'),
      getContext: jest.fn().mockResolvedValue({}),
      getCapabilities: jest.fn().mockReturnValue({
        streamingSupported: true,
        contextWindow: 4096,
        multimodalSupported: false
      })
    }));

    // Initialize test workspace
    testWorkspace = new TestWorkspace();
    await testWorkspace.setup();

    // Create agent with mocked dependencies
    agent = new Agent(mockProviderFactory, testWorkspace);
  });

  afterEach(async () => {
    await testWorkspace.cleanup();
    jest.clearAllMocks();
  });

  describe('Code Generation', () => {
    test('generates code from prompt', async () => {
      const prompt = 'Create a function that adds two numbers';
      const response = await agent.processRequest(prompt);

      expect(response).toBeDefined();
      expect(mockProviderFactory.createProvider).toHaveBeenCalled();
      expect(await testWorkspace.fileExists('add.ts')).toBe(true);
    });

    test('handles code generation errors gracefully', async () => {
      const mockError = new Error('Generation failed');
      jest.spyOn(mockProviderFactory, 'createProvider').mockImplementation(() => ({
        sendMessage: jest.fn().mockRejectedValue(mockError),
        getContext: jest.fn(),
        getCapabilities: jest.fn()
      }));

      await expect(agent.processRequest('Invalid prompt'))
        .rejects.toThrow('Generation failed');
    });
  });

  describe('Code Review', () => {
    test('reviews existing code', async () => {
      // Create test file
      await testWorkspace.createFile('test.ts', 'function test() { return true; }');

      const response = await agent.reviewCode('test.ts');

      expect(response).toBeDefined();
      expect(response).toContain('review');
      expect(response).toContain('suggestions');
    });

    test('provides meaningful review comments', async () => {
      const testCode = `
        function processData(data) {
          return data.map(x => x + 1);
        }
      `;
      await testWorkspace.createFile('process.ts', testCode);

      const review = await agent.reviewCode('process.ts');

      expect(review).toContain('type');
      expect(review).toContain('parameter');
    });
  });

  describe('Context Handling', () => {
    test('maintains conversation context', async () => {
      const firstPrompt = 'Create a User class';
      const secondPrompt = 'Add an age property to it';

      await agent.processRequest(firstPrompt);
      const response = await agent.processRequest(secondPrompt);

      expect(response).toContain('age');
      expect(await testWorkspace.fileContent('user.ts')).toContain('age');
    });

    test('uses workspace context for responses', async () => {
      await testWorkspace.createFile('config.ts', 'export const DEBUG = true;');
      
      const response = await agent.processRequest('What is in config.ts?');
      
      expect(response).toContain('DEBUG');
      expect(response).toContain('true');
    });
  });

  describe('Error Handling', () => {
    test('validates generated code', async () => {
      jest.spyOn(mockProviderFactory, 'createProvider').mockImplementation(() => ({
        sendMessage: jest.fn().mockResolvedValue('invalid typescript code'),
        getContext: jest.fn(),
        getCapabilities: jest.fn()
      }));

      const response = await agent.processRequest('Generate invalid code');
      
      expect(response).toContain('error');
      expect(response).toContain('invalid');
    });

    test('handles workspace errors', async () => {
      jest.spyOn(testWorkspace, 'createFile').mockRejectedValue(new Error('Write failed'));

      await expect(agent.processRequest('Create a new file'))
        .rejects.toThrow('Write failed');
    });
  });
});
