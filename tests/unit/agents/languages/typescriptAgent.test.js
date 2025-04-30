const { TypeScriptAgent } = require('../../../../src/agents/languages/typescriptAgent');
const { ModelManager } = require('../../../../src/models/modelManager');

jest.mock('../../../../src/models/modelManager');

describe('TypeScriptAgent', () => {
    let agent;
    let mockModelManager;
    let mockModel;

    beforeEach(() => {
        mockModel = {
            generateResponse: jest.fn()
        };
        mockModelManager = {
            getActiveModel: jest.fn().mockReturnValue(mockModel)
        };
        agent = new TypeScriptAgent(mockModelManager);
    });

    describe('reviewCode', () => {
        it('should process code review template with given code', async () => {
            const code = 'const x: number = 5;';
            mockModel.generateResponse.mockResolvedValue('Code review result');

            const result = await agent.reviewCode(code);

            expect(mockModelManager.getActiveModel).toHaveBeenCalled();
            expect(mockModel.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining('Review this TypeScript code')
            );
            expect(mockModel.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining(code)
            );
            expect(result).toBe('Code review result');
        });
    });

    describe('suggestRefactoring', () => {
        it('should process refactor template with given code', async () => {
            const code = 'function add(a: any, b: any) { return a + b; }';
            mockModel.generateResponse.mockResolvedValue('Refactoring suggestions');

            const result = await agent.suggestRefactoring(code);

            expect(mockModelManager.getActiveModel).toHaveBeenCalled();
            expect(mockModel.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining('Refactor this TypeScript code')
            );
            expect(mockModel.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining(code)
            );
            expect(result).toBe('Refactoring suggestions');
        });
    });

    describe('generateDocumentation', () => {
        it('should process documentation template with given code', async () => {
            const code = 'class User { name: string; }';
            mockModel.generateResponse.mockResolvedValue('Documentation generated');

            const result = await agent.generateDocumentation(code);

            expect(mockModelManager.getActiveModel).toHaveBeenCalled();
            expect(mockModel.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining('Generate TypeScript documentation')
            );
            expect(mockModel.generateResponse).toHaveBeenCalledWith(
                expect.stringContaining(code)
            );
            expect(result).toBe('Documentation generated');
        });
    });

    describe('error handling', () => {
        it('should propagate errors from model generation', async () => {
            mockModel.generateResponse.mockRejectedValue(new Error('Generation failed'));

            await expect(agent.reviewCode('code')).rejects.toThrow('Generation failed');
        });
    });
});
