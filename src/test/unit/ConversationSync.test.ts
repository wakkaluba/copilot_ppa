import * as assert from 'assert';
import * as sinon from 'sinon';
import { ConversationSync } from '../../services/ConversationSync';
import { WorkspaceManager } from '../../services/WorkspaceManager';

suite('ConversationSync Tests', () => {
    let conversationSync: ConversationSync;
    let workspaceManagerStub: sinon.SinonStubbedInstance<WorkspaceManager>;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager);
        sandbox.stub(WorkspaceManager, 'getInstance').returns(workspaceManagerStub as unknown as WorkspaceManager);
        conversationSync = new ConversationSync();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should handle interrupted conversation recovery', async () => {
        const partialConversation = {
            id: 'interrupted-convo',
            messages: [
                { role: 'user', content: 'Start task' },
                { role: 'assistant', content: 'Working on it...' }
            ],
            status: 'interrupted'
        };

        const recoveryPoint = await conversationSync.createRecoveryPoint(partialConversation);
        assert.ok(recoveryPoint.timestamp);
        assert.strictEqual(recoveryPoint.conversationState, 'interrupted');

        const recovered = await conversationSync.recoverConversation(recoveryPoint);
        assert.strictEqual(recovered.messages.length, 2);
        assert.strictEqual(recovered.status, 'recovered');
    });

    test('should maintain conversation state consistency', async () => {
        const stateA = { count: 1, data: 'test' };
        const stateB = { count: 2, data: 'updated' };

        await conversationSync.saveState('convo-1', stateA);
        await conversationSync.saveState('convo-1', stateB);

        const finalState = await conversationSync.getState('convo-1');
        assert.deepStrictEqual(finalState, stateB);
        
        const stateVersion = await conversationSync.getStateVersion('convo-1');
        assert.strictEqual(stateVersion, 2);
    });

    test('should handle concurrent conversation updates', async () => {
        const baseState = { value: 0 };
        
        // Simulate concurrent updates
        const update1 = conversationSync.updateState('convo-2', state => ({ value: state.value + 1 }));
        const update2 = conversationSync.updateState('convo-2', state => ({ value: state.value + 2 }));

        await Promise.all([update1, update2]);
        const finalState = await conversationSync.getState('convo-2');
        
        assert.strictEqual(finalState.value, 3);
    });

    test('should detect and resolve conflicts', async () => {
        const original = { data: 'original' };
        const update1 = { data: 'update1' };
        const update2 = { data: 'update2' };

        const conflict = await conversationSync.detectConflict('convo-3', original, [update1, update2]);
        assert.ok(conflict.hasConflict);
        
        const resolved = await conversationSync.resolveConflict(conflict);
        assert.ok(resolved.data);
        assert.ok(resolved.resolutionStrategy);
    });

    test('should maintain conversation checkpoints', async () => {
        const checkpoint1 = {
            id: 'checkpoint-1',
            state: { progress: 50 },
            timestamp: new Date()
        };

        await conversationSync.createCheckpoint('convo-4', checkpoint1);
        const restored = await conversationSync.restoreFromCheckpoint('convo-4', 'checkpoint-1');
        
        assert.deepStrictEqual(restored.state, checkpoint1.state);
    });

    test('should handle state rollback', async () => {
        const states = [
            { version: 1, data: 'initial' },
            { version: 2, data: 'updated' },
            { version: 3, data: 'corrupted' }
        ];

        for (const state of states) {
            await conversationSync.saveState('convo-5', state);
        }

        const rolledBack = await conversationSync.rollbackTo('convo-5', 2);
        assert.strictEqual(rolledBack.version, 2);
        assert.strictEqual(rolledBack.data, 'updated');
    });

    test('should sync conversation across sessions', async () => {
        const sessionA = {
            id: 'session-A',
            conversation: { messages: [{ role: 'user', content: 'Test' }] }
        };

        await conversationSync.syncSession(sessionA);
        const synced = await conversationSync.getSyncedSession('session-A');
        
        assert.deepStrictEqual(synced.conversation, sessionA.conversation);
    });

    test('should handle partial state updates', async () => {
        const initialState = {
            messages: [],
            metadata: { lastUpdate: Date.now() },
            settings: { theme: 'dark' }
        };

        await conversationSync.saveState('convo-6', initialState);
        
        await conversationSync.updatePartialState('convo-6', {
            'settings.theme': 'light'
        });

        const updatedState = await conversationSync.getState('convo-6');
        assert.strictEqual(updatedState.settings.theme, 'light');
        assert.ok(updatedState.metadata.lastUpdate);
    });
});