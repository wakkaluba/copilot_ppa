import { CoreAgent } from '../../../src/services/CoreAgent';
import { PromptManager } from '../../../src/services/PromptManager';
import { ContextManager } from '../../../src/services/ContextManager';
import { CommandParser } from '../../../src/services/CommandParser';
import { ConversationManager } from '../../../src/services/ConversationManager';

jest.mock('../../../src/services/PromptManager');
jest.mock('../../../src/services/ContextManager');
jest.mock('../../../src/services/CommandParser');
jest.mock('../../../src/services/ConversationManager');

describe('CoreAgent', () => {
    let coreAgent: CoreAgent;
    let mockPromptManager: jest.Mocked<PromptManager>;
    let mockContextManager: jest.Mocked<ContextManager>;
    let mockCommandParser: jest.Mocked<CommandParser>;
    let mockConversationManager: jest.Mocked<ConversationManager>;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock implementations
        mockPromptManager = {
            getInstance: jest.fn().mockReturnThis(),
            generatePrompt: jest.fn().mockReturnValue('Generated prompt')
        } as any;

        mockContextManager = {
            getInstance: jest.fn().mockReturnThis(),
            buildContext: jest.fn().mockResolvedValue(['Context 1', 'Context 2'])
        } as any;

        mockCommandParser = {
            getInstance: jest.fn().mockReturnThis(),
            parseCommand: jest.fn().mockReturnValue({ type: 'test', args: {} })
        } as any;

        mockConversationManager = {
            getInstance: jest.fn().mockReturnThis(),
            addMessage: jest.fn(),
            getCurrentContext: jest.fn().mockReturnValue([
                { role: 'user', content: 'Test message' }
            ])
        } as any;

        (PromptManager.getInstance as jest.Mock).mockReturnValue(mockPromptManager);
        (ContextManager.getInstance as jest.Mock).mockReturnValue(mockContextManager);
        (CommandParser.getInstance as jest.Mock).mockReturnValue(mockCommandParser);
        (ConversationManager.getInstance as jest.Mock).mockReturnValue(mockConversationManager);

        // Reset singleton instance between tests
        (CoreAgent as any).instance = undefined;
        
        // Get instance for testing
        coreAgent = CoreAgent.getInstance();
    });

    describe('Initialization', () => {
        test('should initialize singleton instance with required services', () => {
            expect(PromptManager.getInstance).toHaveBeenCalled();
            expect(ContextManager.getInstance).toHaveBeenCalled();
            expect(CommandParser.getInstance).toHaveBeenCalled();
            expect(ConversationManager.getInstance).toHaveBeenCalled();
        });

        test('should return same instance on multiple getInstance calls', () => {
            const instance1 = CoreAgent.getInstance();
            const instance2 = CoreAgent.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('Input Processing', () => {
        test('should process user input successfully', async () => {
            const input = 'Test user input';
            
            await coreAgent.processInput(input);

            expect(mockContextManager.buildContext).toHaveBeenCalledWith('current', input);
            expect(mockPromptManager.generatePrompt).toHaveBeenCalledWith('agent-task', {
                input,
                context: expect.any(String)
            });
            expect(mockConversationManager.addMessage).toHaveBeenCalledWith('user', input);
        });

        test('should handle processing errors gracefully', async () => {
            const error = new Error('Test error');
            mockContextManager.buildContext.mockRejectedValue(error);

            await expect(coreAgent.processInput('test')).rejects.toThrow(error);
            expect(coreAgent.getStatus()).toBe('error');
        });
    });

    describe('Code Analysis', () => {
        test('should analyze code with context', async () => {
            const code = 'function test() { }';
            const context = 'Test context';

            await coreAgent.analyzeCode(code, context);

            expect(mockPromptManager.generatePrompt).toHaveBeenCalledWith('code-analysis', {
                code,
                context
            });
        });

        test('should analyze code without context', async () => {
            const code = 'function test() { }';

            await coreAgent.analyzeCode(code);

            expect(mockPromptManager.generatePrompt).toHaveBeenCalledWith('code-analysis', {
                code,
                context: undefined
            });
        });
    });

    describe('Code Improvements', () => {
        test('should suggest code improvements', async () => {
            const code = 'function test() { }';
            mockPromptManager.generatePrompt.mockReturnValue('Suggested improvements');

            const result = await coreAgent.suggestImprovements(code);

            expect(mockPromptManager.generatePrompt).toHaveBeenCalledWith('code-improvements', {
                code
            });
            expect(result).toBe('Suggested improvements');
        });
    });

    describe('Status Management', () => {
        test('should track agent status', async () => {
            expect(coreAgent.getStatus()).toBe('idle');

            const processPromise = coreAgent.processInput('test');
            expect(coreAgent.getStatus()).toBe('processing');

            await processPromise;
            expect(coreAgent.getStatus()).toBe('idle');
        });

        test('should set error status on failure', async () => {
            mockContextManager.buildContext.mockRejectedValue(new Error('Test error'));

            try {
                await coreAgent.processInput('test');
            } catch (error) {
                expect(coreAgent.getStatus()).toBe('error');
            }
        });
    });
});