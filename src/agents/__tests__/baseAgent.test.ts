import { ModelManager } from '../../models/modelManager';
import { BaseAgent } from '../baseAgent';

// Concrete implementation of BaseAgent for testing
class TestAgent extends BaseAgent {
    async processRequest(input: string): Promise<string> {
        return `Processed: ${input}`;
    }
}

describe('BaseAgent', () => {
    let modelManager: ModelManager;
    let agent: TestAgent;

    beforeEach(() => {
        // Mock ModelManager
        modelManager = {
            getActiveModel: jest.fn().mockReturnValue({
                generateResponse: jest.fn().mockResolvedValue('Test response')
            })
        } as any;

        agent = new TestAgent(modelManager);
    });

    describe('constructor', () => {
        test('should initialize with model manager', () => {
            expect(agent['modelManager']).toBe(modelManager);
        });
    });

    describe('processRequest', () => {
        test('should process input correctly', async () => {
            const input = 'test input';
            const result = await agent.processRequest(input);
            expect(result).toBe('Processed: test input');
        });
    });

    describe('modelManager access', () => {
        test('should have access to model manager', () => {
            expect(agent['modelManager'].getActiveModel).toBeDefined();
            agent['modelManager'].getActiveModel();
            expect(modelManager.getActiveModel).toHaveBeenCalled();
        });

        test('should be able to generate responses through model manager', async () => {
            const model = agent['modelManager'].getActiveModel();
            await model.generateResponse('test');
            expect(model.generateResponse).toHaveBeenCalledWith('test');
        });
    });
});
