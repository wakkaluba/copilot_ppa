const { BaseAgent } = require('../../../src/agents/baseAgent');

// Create a concrete implementation of BaseAgent for testing
class TestAgent extends BaseAgent {
    async processRequest(input) {
        return `Processed: ${input}`;
    }
}

describe('BaseAgent', () => {
    let modelManager;
    let agent;

    beforeEach(() => {
        // Mock ModelManager
        modelManager = {
            getActiveModel: jest.fn().mockReturnValue({
                generateResponse: jest.fn().mockResolvedValue('test response')
            })
        };

        agent = new TestAgent(modelManager);
    });

    test('constructor initializes with model manager', () => {
        expect(agent.modelManager).toBe(modelManager);
    });

    test('processRequest returns processed input', async () => {
        const input = 'test input';
        const result = await agent.processRequest(input);
        expect(result).toBe('Processed: test input');
    });

    test('model manager is accessible to child classes', () => {
        expect(agent.modelManager.getActiveModel).toBeDefined();
        expect(agent.modelManager.getActiveModel().generateResponse).toBeDefined();
    });

    test('model manager generates responses correctly', async () => {
        const model = agent.modelManager.getActiveModel();
        const response = await model.generateResponse('test');
        expect(response).toBe('test response');
        expect(model.generateResponse).toHaveBeenCalledWith('test');
    });
});
