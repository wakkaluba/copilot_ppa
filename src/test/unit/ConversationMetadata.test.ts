import * as assert from 'assert';
import * as sinon from 'sinon';
import { ConversationMetadata } from '../../services/ConversationMetadata';
import { WorkspaceManager } from '../../services/WorkspaceManager';

suite('ConversationMetadata Tests', () => {
    let conversationMetadata: ConversationMetadata;
    let workspaceManagerStub: sinon.SinonStubbedInstance<WorkspaceManager>;
    let sandbox: sinon.SinonSandbox;
    const TEST_METADATA_PATH = '.conversation-metadata.json';

    setup(() => {
        sandbox = sinon.createSandbox();
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager);
        sandbox.stub(WorkspaceManager, 'getInstance').returns(workspaceManagerStub as unknown as WorkspaceManager);
        conversationMetadata = new ConversationMetadata();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should track conversation duration', () => {
        const conversationId = 'test-duration';
        const startTime = Date.now();
        
        conversationMetadata.startConversation(conversationId, startTime);
        const duration = conversationMetadata.getConversationDuration(conversationId);
        
        assert.ok(duration >= 0);
        assert.ok(duration < 1000); // Should be very small in test
    });

    test('should maintain conversation statistics', () => {
        const stats = {
            messageCount: 10,
            userMessages: 5,
            assistantMessages: 5,
            averageResponseTime: 1000,
            topicsDiscussed: ['typescript', 'testing']
        };

        conversationMetadata.updateStatistics('test-stats', stats);
        const retrieved = conversationMetadata.getStatistics('test-stats');
        
        assert.deepStrictEqual(retrieved, stats);
    });

    test('should persist metadata changes', async () => {
        const metadata = {
            id: 'test-persist',
            statistics: { messageCount: 5 },
            duration: 1000,
            lastAccessed: Date.now()
        };

        workspaceManagerStub.writeFile.resolves();
        await conversationMetadata.saveMetadata(metadata);
        
        workspaceManagerStub.readFile.resolves(JSON.stringify(metadata));
        const loaded = await conversationMetadata.loadMetadata('test-persist');
        
        assert.deepStrictEqual(loaded, metadata);
    });

    test('should handle metadata versioning', () => {
        const v1Metadata = {
            version: '1.0',
            data: { simple: 'format' }
        };

        const v2Metadata = conversationMetadata.migrateMetadata(v1Metadata);
        assert.strictEqual(v2Metadata.version, '2.0');
        assert.ok(v2Metadata.data);
    });

    test('should track conversation relationships', () => {
        const parent = 'parent-convo';
        const child = 'child-convo';
        
        conversationMetadata.addRelationship(parent, child, 'continuation');
        const relationships = conversationMetadata.getRelationships(parent);
        
        assert.strictEqual(relationships.length, 1);
        assert.strictEqual(relationships[0].childId, child);
        assert.strictEqual(relationships[0].type, 'continuation');
    });

    test('should manage conversation tags', () => {
        const conversationId = 'tagged-convo';
        const tags = ['important', 'typescript', 'bug-fix'];
        
        conversationMetadata.addTags(conversationId, tags);
        const retrievedTags = conversationMetadata.getTags(conversationId);
        
        assert.deepStrictEqual(retrievedTags, tags);
        
        conversationMetadata.removeTag(conversationId, 'bug-fix');
        const updatedTags = conversationMetadata.getTags(conversationId);
        
        assert.strictEqual(updatedTags.length, 2);
        assert.ok(!updatedTags.includes('bug-fix'));
    });

    test('should track file associations', () => {
        const conversationId = 'file-associations';
        const files = [
            { path: '/src/test.ts', changes: 5 },
            { path: '/src/impl.ts', changes: 3 }
        ];
        
        conversationMetadata.addFileAssociations(conversationId, files);
        const associations = conversationMetadata.getFileAssociations(conversationId);
        
        assert.strictEqual(associations.length, 2);
        assert.strictEqual(associations[0].changes, 5);
    });

    test('should handle metadata cleanup', async () => {
        const oldMetadata = {
            id: 'old-convo',
            lastAccessed: Date.now() - (31 * 24 * 60 * 60 * 1000) // 31 days old
        };

        workspaceManagerStub.readFile.resolves(JSON.stringify([oldMetadata]));
        await conversationMetadata.cleanupOldMetadata(30); // 30 days retention
        
        assert.ok(workspaceManagerStub.writeFile.calledOnce);
        const savedData = JSON.parse(workspaceManagerStub.writeFile.firstCall.args[1]);
        assert.strictEqual(savedData.length, 0);
    });

    test('should calculate metadata storage usage', async () => {
        const sampleMetadata = Array(10).fill(null).map((_, i) => ({
            id: `convo-${i}`,
            data: 'A'.repeat(1000) // 1KB per metadata
        }));

        workspaceManagerStub.readFile.resolves(JSON.stringify(sampleMetadata));
        const usage = await conversationMetadata.getStorageUsage();
        
        assert.ok(usage.totalSize > 0);
        assert.strictEqual(usage.conversationCount, 10);
    });
});