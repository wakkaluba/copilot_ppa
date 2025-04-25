import * as assert from 'assert';
import * as sinon from 'sinon';
import { createMockConversationHistory, createMockExtensionContext } from '../helpers/mockHelpers';
import { ErrorRecoveryManager } from '../../services/errorRecoveryManager';
import { ConversationHistory } from '../../services/ConversationHistory';

describe('ErrorRecoveryManager', () => {
    let errorRecoveryManager: ErrorRecoveryManager;
    let mockHistory: sinon.SinonStubbedInstance<ConversationHistory>;
    let mockContext: any;
    let sandbox: sinon.SinonSandbox;
    
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockContext = createMockExtensionContext();
        mockHistory = createMockConversationHistory();
        
        // Create a fresh instance for each test
        errorRecoveryManager = new ErrorRecoveryManager(mockContext, mockHistory);
    });
    
    afterEach(() => {
        sandbox.restore();
    });

    it('should recover from a network error', async () => {
        // Setup
        const networkError = new Error('Network connection failed');
        networkError.name = 'NetworkError';
        
        const recoveryResult = await errorRecoveryManager.recoverFromError(networkError);
        
        assert.strictEqual(recoveryResult.success, true);
        assert.strictEqual(recoveryResult.strategy, 'retry');
    });

    it('should recover from an authentication error', async () => {
        // Setup
        const authError = new Error('Authentication failed');
        authError.name = 'AuthenticationError';
        
        const recoveryResult = await errorRecoveryManager.recoverFromError(authError);
        
        assert.strictEqual(recoveryResult.success, true);
        assert.strictEqual(recoveryResult.strategy, 'refresh-token');
    });

    it('should recover from a conversation corruption error', async () => {
        // Setup
        const corruptionError = new Error('Conversation data is corrupted');
        corruptionError.name = 'DataCorruptionError';
        
        const conversationId = 'corrupted-conversation';
        
        // Simulate a corrupted conversation
        mockHistory.getConversation.withArgs(conversationId).returns({
            id: conversationId,
            title: 'Corrupted Conversation',
            messages: [{ corrupted: true } as any],
            created: Date.now(),
            updated: Date.now()
        });
        
        const recoveryResult = await errorRecoveryManager.recoverCorruptedConversation(conversationId);
        
        assert.strictEqual(recoveryResult.success, true);
        sinon.assert.called(mockHistory.addMessage);
    });

    it('should handle an unrecoverable error', async () => {
        // Setup
        const fatalError = new Error('System crash');
        fatalError.name = 'FatalError';
        
        const recoveryResult = await errorRecoveryManager.recoverFromError(fatalError);
        
        assert.strictEqual(recoveryResult.success, false);
        assert.strictEqual(recoveryResult.strategy, 'report');
    });

    it('should log error details for diagnostics', async () => {
        // Setup
        const error = new Error('Test error');
        error.name = 'TestError';
        
        const logSpy = sinon.spy(errorRecoveryManager as any, 'logError');
        
        await errorRecoveryManager.recoverFromError(error);
        
        sinon.assert.calledOnce(logSpy);
        sinon.assert.calledWith(logSpy, error);
    });
});