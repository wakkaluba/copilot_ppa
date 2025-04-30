import { ModelManager } from '../../models/modelManager';
import { BaseAgent } from '../baseAgent';
import { LanguageAgentFactory } from '../languageAgentFactory';

// Mock agent class for testing
class TestLanguageAgent extends BaseAgent {
    async processRequest(input: string): Promise<string> {
        return `Test processed: ${input}`;
    }
}

describe('LanguageAgentFactory', () => {
    let modelManager: ModelManager;

    beforeEach(() => {
        // Clear registered agents before each test
        (LanguageAgentFactory as any).agents = new Map();

        // Mock ModelManager
        modelManager = {
            getActiveModel: jest.fn().mockReturnValue({
                generateResponse: jest.fn().mockResolvedValue('Test response')
            })
        } as any;
    });

    describe('registerAgent', () => {
        test('should register an agent for a language', () => {
            LanguageAgentFactory.registerAgent('typescript', TestLanguageAgent);
            expect((LanguageAgentFactory as any).agents.has('typescript')).toBe(true);
        });

        test('should register agent with case-insensitive language name', () => {
            LanguageAgentFactory.registerAgent('TypeScript', TestLanguageAgent);
            expect((LanguageAgentFactory as any).agents.has('typescript')).toBe(true);
        });

        test('should override existing agent registration', () => {
            class AnotherAgent extends BaseAgent {
                async processRequest(input: string): Promise<string> {
                    return input;
                }
            }

            LanguageAgentFactory.registerAgent('typescript', TestLanguageAgent);
            LanguageAgentFactory.registerAgent('typescript', AnotherAgent);

            const registeredAgent = (LanguageAgentFactory as any).agents.get('typescript');
            expect(registeredAgent).toBe(AnotherAgent);
        });
    });

    describe('createAgent', () => {
        test('should create agent instance for registered language', () => {
            LanguageAgentFactory.registerAgent('typescript', TestLanguageAgent);
            const agent = LanguageAgentFactory.createAgent('typescript', modelManager);

            expect(agent).toBeInstanceOf(TestLanguageAgent);
            expect(agent['modelManager']).toBe(modelManager);
        });

        test('should create agent with case-insensitive language name', () => {
            LanguageAgentFactory.registerAgent('typescript', TestLanguageAgent);
            const agent = LanguageAgentFactory.createAgent('TypeScript', modelManager);

            expect(agent).toBeInstanceOf(TestLanguageAgent);
        });

        test('should throw error for unregistered language', () => {
            expect(() => {
                LanguageAgentFactory.createAgent('unknown', modelManager);
            }).toThrow('No agent available for language: unknown');
        });

        test('should create functional agent that can process requests', async () => {
            LanguageAgentFactory.registerAgent('typescript', TestLanguageAgent);
            const agent = LanguageAgentFactory.createAgent('typescript', modelManager);

            const result = await agent.processRequest('test input');
            expect(result).toBe('Test processed: test input');
        });
    });
});
