"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const sinon = __importStar(require("sinon"));
const mockHelpers_1 = require("../helpers/mockHelpers");
const errorRecoveryManager_1 = require("../../services/errorRecoveryManager");
describe('ErrorRecoveryManager', () => {
    let errorRecoveryManager;
    let mockHistory;
    let mockContext;
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        mockHistory = (0, mockHelpers_1.createMockConversationHistory)();
        // Create a fresh instance for each test
        errorRecoveryManager = new errorRecoveryManager_1.ErrorRecoveryManager(mockContext, mockHistory);
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
            messages: [{ corrupted: true }],
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
        const logSpy = sinon.spy(errorRecoveryManager, 'logError');
        await errorRecoveryManager.recoverFromError(error);
        sinon.assert.calledOnce(logSpy);
        sinon.assert.calledWith(logSpy, error);
    });
});
//# sourceMappingURL=error-recovery-scenarios.test.js.map