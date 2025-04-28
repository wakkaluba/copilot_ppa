import * as assert from 'assert';
import * as sinon from 'sinon';
import { CoreAgent } from '../../../src/services/coreAgent';
import { PromptManager } from '../../../src/services/promptManager';
import { LLMProvider } from '../../../src/llm/llmProvider';
import { WorkspaceManager } from '../../../src/services/workspaceManager';
import { ContextManager } from '../../../src/services/contextManager';

describe('CoreAgent', () => {
  let agent: CoreAgent;
  let mockLLM: sinon.SinonStubbedInstance<LLMProvider>;
  let mockWorkspace: sinon.SinonStubbedInstance<WorkspaceManager>;
  let mockContext: sinon.SinonStubbedInstance<ContextManager>;
  let mockPromptManager: sinon.SinonStubbedInstance<PromptManager>;
  
  beforeEach(() => {
    // Set up mocks
    mockLLM = sinon.createStubInstance(LLMProvider);
    mockWorkspace = sinon.createStubInstance(WorkspaceManager);
    mockContext = sinon.createStubInstance(ContextManager);
    
    // Create mock context object required by PromptManager
    const contextObject = {
      language: 'typescript',
      activeFile: 'test.ts',
      project: 'testProject',
      workspace: '/test/workspace',
      // Add any other required context properties
    };
    
    // Create a stubbed PromptManager with the context
    mockPromptManager = sinon.createStubInstance(PromptManager);
    
    // Stub the PromptManager constructor or factory method
    sinon.stub(PromptManager, 'create').returns(mockPromptManager);
    // Or if using direct instantiation:
    // const originalPromptManager = PromptManager;
    // global.PromptManager = sinon.stub().returns(mockPromptManager);
    
    // Setup contextManager getContext to return our mock context
    mockContext.getContext.returns(contextObject);
    
    // Initialize the agent with mocks
    agent = new CoreAgent(mockLLM, mockWorkspace, mockContext, mockPromptManager);
  });
  
  afterEach(() => {
    sinon.restore();
  });

  describe('processInput', () => {
    it('should process input and return response with context', async () => {
      const input = 'Write a function to add two numbers';
      const llmResponse = { content: 'Here is a function:\n```ts\nfunction add(a: number, b: number) {\n  return a + b;\n}\n```' };
      
      mockLLM.generateResponse.resolves(llmResponse);
      mockPromptManager.createPrompt.returns('Enhanced prompt with context');
      
      const result = await agent.processInput(input);
      
      assert.ok(result);
      assert.strictEqual(result.response.content, llmResponse.content);
      assert(mockPromptManager.createPrompt.calledOnce);
      assert(mockLLM.generateResponse.calledOnce);
    });

    it('should handle errors during processing', async () => {
      const input = 'Write a function';
      const error = new Error('LLM connection failed');
      
      mockPromptManager.createPrompt.returns('Enhanced prompt with context');
      mockLLM.generateResponse.rejects(error);
      
      try {
        await agent.processInput(input);
        assert.fail('Expected an error to be thrown');
      } catch (e) {
        assert.strictEqual(e, error);
      }
    });
  });

  // Additional tests...
  describe('getSuggestions', () => {
    it('should return suggestions based on current input', async () => {
      // Test implementation
    });
  });

  describe('clearContext', () => {
    it('should clear all context data', async () => {
      // Test implementation
    });

    it('should handle errors during context clearing', async () => {
      // Test implementation
    });
  });

  describe('dispose', () => {
    it('should dispose all resources', () => {
      // Test implementation
    });
  });
});