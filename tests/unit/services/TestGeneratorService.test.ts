import { TestGeneratorService } from '../../../src/services/TestGeneratorService';
import { ConversationHistory } from '../../../src/services/ConversationHistory';

describe('TestGeneratorService', () => {
    let testGenerator: TestGeneratorService;
    let mockHistory: jest.Mocked<ConversationHistory>;

    beforeEach(() => {
        mockHistory = {
            getAllConversations: jest.fn(),
            dispose: jest.fn()
        } as any;

        testGenerator = new TestGeneratorService(mockHistory);
    });

    describe('generateTests', () => {
        it('should generate unit tests from conversation history', async () => {
            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Test Discussion',
                messages: [{
                    id: '1',
                    role: 'user',
                    content: 'We should test that the function handles null input correctly',
                    timestamp: Date.now()
                }],
                created: Date.now(),
                updated: Date.now()
            }]);

            const tests = await testGenerator.generateTests('handle null input');
            expect(tests.length).toBeGreaterThan(0);
            expect(tests[0].type).toBe('unit');
            expect(tests[0].testCode).toContain('handles null input correctly');
        });

        it('should generate integration tests from conversation history', async () => {
            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Integration Discussion',
                messages: [{
                    id: '1',
                    role: 'user',
                    content: 'We need to test the interaction between the database and cache',
                    timestamp: Date.now()
                }],
                created: Date.now(),
                updated: Date.now()
            }]);

            const tests = await testGenerator.generateTests('database cache interaction');
            expect(tests.length).toBeGreaterThan(0);
            expect(tests[0].type).toBe('integration');
            expect(tests[0].testCode).toContain('interaction between the database and cache');
        });

        it('should generate e2e tests from conversation history', async () => {
            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'E2E Discussion',
                messages: [{
                    id: '1',
                    role: 'user',
                    content: 'We need an end to end test for the user registration flow',
                    timestamp: Date.now()
                }],
                created: Date.now(),
                updated: Date.now()
            }]);

            const tests = await testGenerator.generateTests('user registration');
            expect(tests.length).toBeGreaterThan(0);
            expect(tests[0].type).toBe('e2e');
            expect(tests[0].testCode).toContain('user registration flow');
        });

        it('should prioritize tests correctly', async () => {
            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Mixed Priority Tests',
                messages: [{
                    id: '1',
                    role: 'user',
                    content: `
                        We must test critical error handling
                        We should test the login process
                        We could test the theme switching
                    `,
                    timestamp: Date.now()
                }],
                created: Date.now(),
                updated: Date.now()
            }]);

            const tests = await testGenerator.generateTests('error handling login theme');
            expect(tests.length).toBe(3);
            expect(tests[0].priority).toBe('high');
            expect(tests[1].priority).toBe('medium');
            expect(tests[2].priority).toBe('low');
        });

        it('should detect test framework from conversation', async () => {
            mockHistory.getAllConversations.mockReturnValue([{
                id: '1',
                title: 'Jest Tests',
                messages: [{
                    id: '1',
                    role: 'user',
                    content: 'describe("test suite", () => { it("should work", () => {});',
                    timestamp: Date.now()
                }],
                created: Date.now(),
                updated: Date.now()
            }]);

            const tests = await testGenerator.generateTests('test suite');
            expect(tests[0].testCode).toContain('test(');
            expect(tests[0].testCode).toContain('expect(');
        });
    });
});