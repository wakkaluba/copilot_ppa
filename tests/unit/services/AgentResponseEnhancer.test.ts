import { AgentResponseEnhancer } from '../../../src/services/AgentResponseEnhancer';
import { ConversationHistory } from '../../../src/services/ConversationHistory';

describe('AgentResponseEnhancer', () => {
    let responseEnhancer: AgentResponseEnhancer;
    let mockHistory: jest.Mocked<ConversationHistory>;

    beforeEach(() => {
        mockHistory = {
            getAllConversations: jest.fn(),
            dispose: jest.fn()
        } as any;

        responseEnhancer = new AgentResponseEnhancer(mockHistory);
    });

    describe('enhanceResponse', () => {
        it('should enhance response with ideas for general queries', async () => {
            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Conversation',
                messages: [{
                    id: '1',
                    role: 'user',
                    content: 'We should implement code completion',
                    timestamp: Date.now()
                }],
                created: Date.now(),
                updated: Date.now()
            }]);

            const baseResponse = 'Here is the base response';
            const enhanced = await responseEnhancer.enhanceResponse('implement feature', baseResponse);

            expect(enhanced).toContain(baseResponse);
            expect(enhanced).toContain('Based on previous conversations');
            expect(enhanced).toContain('implement code completion');
        });

        it('should add code suggestions for code-related queries', async () => {
            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Conversation',
                messages: [{
                    id: '1',
                    role: 'assistant',
                    content: '```typescript\nasync function test() {\n  const result = someAsyncFunction();\n}\n```',
                    timestamp: Date.now()
                }],
                created: Date.now(),
                updated: Date.now()
            }]);

            const baseResponse = 'Here is the base response';
            const enhanced = await responseEnhancer.enhanceResponse('fix this code', baseResponse);

            expect(enhanced).toContain(baseResponse);
            expect(enhanced).toContain('Code suggestions');
            expect(enhanced).toContain('await keywords');
        });

        it('should add documentation context for documentation queries', async () => {
            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Conversation',
                messages: [{
                    id: '1',
                    role: 'assistant',
                    content: '### Overview\nThis is a test overview\n\n## Usage\nHere is how to use it',
                    timestamp: Date.now()
                }],
                created: Date.now(),
                updated: Date.now()
            }]);

            const baseResponse = 'Here is the base response';
            const enhanced = await responseEnhancer.enhanceResponse('explain the documentation', baseResponse);

            expect(enhanced).toContain(baseResponse);
            expect(enhanced).toContain('Relevant documentation context');
            expect(enhanced).toContain('Overview');
            expect(enhanced).toContain('Usage');
        });

        it('should add test suggestions for test-related queries', async () => {
            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Conversation',
                messages: [{
                    id: '1',
                    role: 'user',
                    content: 'We should test that the function handles null input',
                    timestamp: Date.now()
                }],
                created: Date.now(),
                updated: Date.now()
            }]);

            const baseResponse = 'Here is the base response';
            const enhanced = await responseEnhancer.enhanceResponse('write some tests', baseResponse);

            expect(enhanced).toContain(baseResponse);
            expect(enhanced).toContain('Suggested test cases');
            expect(enhanced).toContain('handles null input');
        });
    });
});