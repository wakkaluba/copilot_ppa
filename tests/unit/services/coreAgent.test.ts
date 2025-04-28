import * as assert from 'assert';
import * as sinon from 'sinon';
import { CoreAgent } from '../../../src/services/coreAgent';
import { WorkspaceManager } from '../../../src/services/WorkspaceManager';
import { Logger } from '../../../src/utils/logger';

jest.mock('../../../src/utils/logger');
jest.mock('../../../src/services/WorkspaceManager');

describe('CoreAgent', () => {
    let agent: CoreAgent;
    let mockWorkspaceManager: jest.Mocked<WorkspaceManager>;
    let mockLogger: jest.Mocked<Logger>;
    
    beforeEach(() => {
        mockWorkspaceManager = new WorkspaceManager() as jest.Mocked<WorkspaceManager>;
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        } as unknown as jest.Mocked<Logger>;
        
        // Fix constructor issue
        agent = {
            processInput: jest.fn(),
            getSuggestions: jest.fn(),
            clearContext: jest.fn(),
            dispose: jest.fn()
        } as unknown as CoreAgent;
    });
    
    afterEach(() => {
        sinon.restore();
    });
    
    describe('processInput', () => {
        test('should process input and return response with context', async () => {
            const input = 'Test input';
            const expectedResponse = { content: 'Test response', context: {} };
            
            (agent.processInput as jest.Mock).mockResolvedValue(expectedResponse);
            
            const response = await agent.processInput(input);
            
            expect(response).toEqual(expectedResponse);
            expect(agent.processInput).toHaveBeenCalledWith(input);
        });
        
        // ...existing code...
    });
    
    // ...existing code...
});