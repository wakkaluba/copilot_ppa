import { ModelManager } from '../../models/modelManager';
import { TypeScriptAgent } from '../languages/typescriptAgent';

describe('TypeScriptAgent', () => {
    let modelManager: ModelManager;
    let agent: TypeScriptAgent;

    beforeEach(() => {
        // Mock ModelManager
        modelManager = {
            getActiveModel: jest.fn().mockReturnValue({
                generateResponse: jest.fn().mockResolvedValue('Test response')
            })
        } as any;

        agent = new TypeScriptAgent(modelManager);
    });

    describe('code review', () => {
        test('should process code review requests', async () => {
            const code = 'function test() { return true; }';
            await agent.reviewCode(code);

            const model = modelManager.getActiveModel();
            expect(model.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining(code)
            );
        });
    });

    describe('refactoring suggestions', () => {
        test('should process refactoring requests', async () => {
            const code = 'function oldStyle() { var x = 1; }';
            await agent.suggestRefactoring(code);

            const model = modelManager.getActiveModel();
            expect(model.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining(code)
            );
        });
    });

    describe('documentation generation', () => {
        test('should process documentation requests', async () => {
            const code = 'interface Config { debug: boolean; }';
            await agent.generateDocumentation(code);

            const model = modelManager.getActiveModel();
            expect(model.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining(code)
            );
        });
    });

    describe('prompt template processing', () => {
        test('should process templates with parameters', async () => {
            const code = 'class Example {}';
            await (agent as any).processWithTemplate('documentation', { code });

            const model = modelManager.getActiveModel();
            expect(model.generateResponse).toHaveBeenCalled();
        });

        test('should handle multiple template parameters', async () => {
            const params = {
                code: 'function test() {}',
                language: 'typescript',
                context: 'unit test'
            };
            await (agent as any).processWithTemplate('test', params);

            const model = modelManager.getActiveModel();
            expect(model.generateResponse).toHaveBeenCalled();
        });
    });
});
