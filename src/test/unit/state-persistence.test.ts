import * as assert from 'assert';
import * as sinon from 'sinon';
import { createMockConversationHistory, createMockExtensionContext } from '../helpers/mockHelpers';
import { StatePersistenceManager } from '../../services/statePersistenceManager';
import * as vscode from 'vscode';

describe('StatePersistenceManager', () => {
    let statePersistenceManager: StatePersistenceManager;
    let mockContext: vscode.ExtensionContext;
    let mockHistory: any;
    let sandbox: sinon.SinonSandbox;
    
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockContext = createMockExtensionContext();
        mockHistory = createMockConversationHistory();
        
        // Create a fresh instance for each test
        statePersistenceManager = new StatePersistenceManager(mockContext, mockHistory);
    });
    
    afterEach(() => {
        sandbox.restore();
    });
    
    it('should persist state to global storage', async () => {
        const state = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 14
            }
        };
        
        await statePersistenceManager.saveState('test-state', state);
        
        sinon.assert.calledWith(
            mockContext.globalState.update as sinon.SinonStub,
            'test-state',
            state
        );
    });
    
    it('should restore state from global storage', async () => {
        const expectedState = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 14
            }
        };
        
        (mockContext.globalState.get as sinon.SinonStub).returns(expectedState);
        
        const state = await statePersistenceManager.loadState('test-state');
        
        assert.deepStrictEqual(state, expectedState);
    });
    
    it('should return default state if no state exists', async () => {
        const defaultState = { settings: {} };
        
        (mockContext.globalState.get as sinon.SinonStub).returns(undefined);
        
        const state = await statePersistenceManager.loadState('test-state', defaultState);
        
        assert.deepStrictEqual(state, defaultState);
    });
    
    it('should clear state from global storage', async () => {
        await statePersistenceManager.clearState('test-state');
        
        sinon.assert.calledWith(
            mockContext.globalState.update as sinon.SinonStub,
            'test-state',
            undefined
        );
    });
    
    it('should export persistent state to JSON', async () => {
        const state = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 14
            }
        };
        
        (mockContext.globalState.get as sinon.SinonStub).returns(state);
        
        const json = await statePersistenceManager.exportStateToJson('test-state');
        const parsed = JSON.parse(json);
        
        assert.deepStrictEqual(parsed, state);
    });
    
    it('should import persistent state from JSON', async () => {
        const state = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 14
            }
        };
        
        const json = JSON.stringify(state);
        
        await statePersistenceManager.importStateFromJson('test-state', json);
        
        sinon.assert.calledWith(
            mockContext.globalState.update as sinon.SinonStub,
            'test-state',
            state
        );
    });
    
    it('should handle invalid JSON during import', async () => {
        const invalidJson = '{invalid:json}';
        
        try {
            await statePersistenceManager.importStateFromJson('test-state', invalidJson);
            assert.fail('Expected error was not thrown');
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.ok(error.message.includes('Invalid JSON'));
        }
    });
    
    it('should merge states with existing data', async () => {
        const existingState = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 14
            }
        };
        
        const newState = {
            settings: {
                fontSize: 16,
                fontFamily: 'Arial'
            },
            newProperty: 'value'
        };
        
        (mockContext.globalState.get as sinon.SinonStub).returns(existingState);
        
        await statePersistenceManager.mergeState('test-state', newState);
        
        const expectedMergedState = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 16,
                fontFamily: 'Arial'
            },
            newProperty: 'value'
        };
        
        sinon.assert.calledWith(
            mockContext.globalState.update as sinon.SinonStub,
            'test-state',
            expectedMergedState
        );
    });
});