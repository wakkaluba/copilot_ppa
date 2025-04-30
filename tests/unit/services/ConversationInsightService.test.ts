import { ConversationInsightService } from '../../../src/services/ConversationInsightService';
import { ConversationHistory } from '../../../src/services/ConversationHistory';
import { ChatMessage } from '../../../src/services/types';

describe('ConversationInsightService', () => {
    let insightService: ConversationInsightService;
    let mockHistory: jest.Mocked<ConversationHistory>;

    beforeEach(() => {
        mockHistory = {
            getAllConversations: jest.fn(),
            dispose: jest.fn()
        } as any;

        insightService = new ConversationInsightService(mockHistory);
    });

    describe('generateIdeas', () => {
        it('should extract feature ideas from conversations', async () => {
            const mockMessages = [{
                id: '1',
                role: 'user',
                content: 'We should be able to implement code completion',
                timestamp: Date.now()
            }];

            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Conversation',
                messages: mockMessages,
                created: Date.now(),
                updated: Date.now()
            }]);

            const ideas = await insightService.generateIdeas('implement');
            expect(ideas).toContain('Consider implementing code completion');
        });

        it('should extract improvement suggestions', async () => {
            const mockMessages = [{
                id: '1',
                role: 'user',
                content: 'We need to improve error handling',
                timestamp: Date.now()
            }];

            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Conversation',
                messages: mockMessages,
                created: Date.now(),
                updated: Date.now()
            }]);

            const ideas = await insightService.generateIdeas('error');
            expect(ideas).toContain('Look into improving error handling');
        });
    });

    describe('generateCodeSuggestions', () => {
        it('should analyze code blocks for patterns', async () => {
            const mockMessages = [{
                id: '1',
                role: 'assistant',
                content: '```typescript\nasync function test() {\n  const result = someAsyncFunction();\n}\n```',
                timestamp: Date.now()
            }];

            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Conversation',
                messages: mockMessages,
                created: Date.now(),
                updated: Date.now()
            }]);

            const suggestions = await insightService.generateCodeSuggestions('async');
            expect(suggestions).toContain('Check for missing await keywords in async functions');
        });
    });

    describe('generateDocumentation', () => {
        it('should generate structured documentation from conversations', async () => {
            const mockMessages = [{
                id: '1',
                role: 'assistant',
                content: '### Overview\nThis is a test overview\n\n## Usage\nHere is how to use it',
                timestamp: Date.now()
            }];

            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Conversation',
                messages: mockMessages,
                created: Date.now(),
                updated: Date.now()
            }]);

            const documentation = await insightService.generateDocumentation('test');
            expect(documentation).toContain('# Overview');
            expect(documentation).toContain('## Usage');
        });
    });

    describe('generateTests', () => {
        it('should generate test cases from conversations', async () => {
            const mockMessages = [{
                id: '1',
                role: 'user',
                content: 'We should test that the function handles null input',
                timestamp: Date.now()
            }];

            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Conversation',
                messages: mockMessages,
                created: Date.now(),
                updated: Date.now()
            }]);

            const tests = await insightService.generateTests('handles null');
            expect(tests[0]).toContain("it('should handles null input'");
        });

        it('should generate edge case tests', async () => {
            const mockMessages = [{
                id: '1',
                role: 'user',
                content: 'edge case: empty array input',
                timestamp: Date.now()
            }];

            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Conversation',
                messages: mockMessages,
                created: Date.now(),
                updated: Date.now()
            }]);

            const tests = await insightService.generateTests('empty array');
            expect(tests[0]).toContain('edge case: empty array input');
        });
    });
});