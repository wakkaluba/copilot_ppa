const { LanguageAgentFactory } = require('../../../src/agents/languageAgentFactory');
const { BaseAgent } = require('../../../src/agents/baseAgent');
const { ModelManager } = require('../../../src/models/modelManager');

jest.mock('../../../src/models/modelManager');

describe('LanguageAgentFactory', () => {
    let mockModelManager;

    beforeEach(() => {
        mockModelManager = {
            getActiveModel: jest.fn()
        };
        // Clear any registered agents between tests
        LanguageAgentFactory.agents = new Map();
    });

    describe('registerAgent', () => {
        it('should register an agent class for a language', () => {
            class TestAgent extends BaseAgent {}

            LanguageAgentFactory.registerAgent('test', TestAgent);

            const agent = LanguageAgentFactory.createAgent('test', mockModelManager);
            expect(agent).toBeInstanceOf(TestAgent);
        });

        it('should register agent with case-insensitive language name', () => {
            class TestAgent extends BaseAgent {}

            LanguageAgentFactory.registerAgent('TEST', TestAgent);

            const agent = LanguageAgentFactory.createAgent('test', mockModelManager);
            expect(agent).toBeInstanceOf(TestAgent);
        });
    });

    describe('createAgent', () => {
        it('should create an agent instance with provided model manager', () => {
            class TestAgent extends BaseAgent {}
            LanguageAgentFactory.registerAgent('test', TestAgent);

            const agent = LanguageAgentFactory.createAgent('test', mockModelManager);

            expect(agent).toBeInstanceOf(TestAgent);
            expect(agent.modelManager).toBe(mockModelManager);
        });

        it('should throw error for unregistered language', () => {
            expect(() => {
                LanguageAgentFactory.createAgent('unknown', mockModelManager);
            }).toThrow('No agent available for language: unknown');
        });

        it('should handle case-insensitive language names when creating agent', () => {
            class TestAgent extends BaseAgent {}
            LanguageAgentFactory.registerAgent('test', TestAgent);

            const agent = LanguageAgentFactory.createAgent('TEST', mockModelManager);
            expect(agent).toBeInstanceOf(TestAgent);
        });
    });
});
