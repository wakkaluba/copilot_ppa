import { BaseAgent } from '../../../src/agents/baseAgent';
import { LanguageAgentConfig, LanguageAgentFactory } from '../../../src/agents/languageAgentFactory';
import { ModelManager } from '../../../src/models/modelManager';

jest.mock('../../../src/models/modelManager');

describe('LanguageAgentFactory', () => {
    let mockModelManager: ModelManager;

    beforeEach(() => {
        mockModelManager = {
            getActiveModel: jest.fn()
        } as unknown as ModelManager;

        // Reset any registered agents between tests
        jest.isolateModules(() => {
            require('../../../src/agents/languageAgentFactory');
        });
    });

    describe('registerAgent', () => {
        it('should register an agent class for a language', () => {
            class TestAgent extends BaseAgent {
                async processRequest(input: string): Promise<string> {
                    return `Test: ${input}`;
                }
            }

            LanguageAgentFactory.registerAgent('test', TestAgent);

            const agent = LanguageAgentFactory.createAgent('test', mockModelManager);
            expect(agent).toBeInstanceOf(TestAgent);
        });

        it('should register agent with case-insensitive language name', () => {
            class TestAgent extends BaseAgent {
                async processRequest(input: string): Promise<string> {
                    return `Test: ${input}`;
                }
            }

            LanguageAgentFactory.registerAgent('TEST', TestAgent);

            const agent = LanguageAgentFactory.createAgent('test', mockModelManager);
            expect(agent).toBeInstanceOf(TestAgent);
        });
    });

    describe('createAgent', () => {
        it('should create an agent instance with provided model manager', () => {
            class TestAgent extends BaseAgent {
                async processRequest(input: string): Promise<string> {
                    return `Test: ${input}`;
                }
            }
            LanguageAgentFactory.registerAgent('test', TestAgent);

            const agent = LanguageAgentFactory.createAgent('test', mockModelManager);

            expect(agent).toBeInstanceOf(TestAgent);
            expect(agent['modelManager']).toBe(mockModelManager);
        });

        it('should throw error for unregistered language', () => {
            expect(() => {
                LanguageAgentFactory.createAgent('unknown', mockModelManager);
            }).toThrow('No agent available for language: unknown');
        });

        it('should handle case-insensitive language names when creating agent', () => {
            class TestAgent extends BaseAgent {
                async processRequest(input: string): Promise<string> {
                    return `Test: ${input}`;
                }
            }
            LanguageAgentFactory.registerAgent('test', TestAgent);

            const agent = LanguageAgentFactory.createAgent('TEST', mockModelManager);
            expect(agent).toBeInstanceOf(TestAgent);
        });
    });

    describe('LanguageAgentConfig', () => {
        it('should properly type language agent configuration', () => {
            const config: LanguageAgentConfig = {
                language: 'typescript',
                fileExtensions: ['.ts', '.tsx'],
                promptTemplates: {
                    review: 'Review this code: {code}',
                    suggest: 'Suggest improvements: {code}'
                }
            };

            expect(config.language).toBe('typescript');
            expect(config.fileExtensions).toContain('.ts');
            expect(config.promptTemplates.review).toContain('{code}');
        });
    });
});
