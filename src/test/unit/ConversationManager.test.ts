import * as assert from 'assert';
import * as sinon from 'sinon';
import { ConversationManager } from '../../services/ConversationManager';
import { WorkspaceManager } from '../../services/WorkspaceManager';

suite('ConversationManager Tests', () => {
    let conversationManager: ConversationManager;
    let workspaceManagerStub: sinon.SinonStubbedInstance<WorkspaceManager>;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Create stub for WorkspaceManager
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager);
        
        // Replace the getInstance method to return our stub
        sandbox.stub(WorkspaceManager, 'getInstance').returns(workspaceManagerStub as unknown as WorkspaceManager);
        
        // Create a fresh instance of ConversationManager for each test
        conversationManager = ConversationManager.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return singleton instance', () => {
        const instance1 = ConversationManager.getInstance();
        const instance2 = ConversationManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('startNewConversation should create a new conversation', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();
        
        await conversationManager.startNewConversation('Test Conversation');
        
        // Verify that the directory was created
        assert.strictEqual(workspaceManagerStub.createDirectory.calledOnce, true);
        
        // Verify that writeFile was called to save the conversation
        assert.strictEqual(workspaceManagerStub.writeFile.calledOnce, true);
        
        // Verify the content of the saved conversation
        const writeFileCall = workspaceManagerStub.writeFile.getCall(0);
        const savedContent = JSON.parse(writeFileCall.args[1]);
        assert.strictEqual(savedContent.title, 'Test Conversation');
        assert.deepStrictEqual(savedContent.messages, []);
    });

    test('addMessage should add a message to the current conversation', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();
        
        // Start with a new conversation
        await conversationManager.startNewConversation('Test Conversation');
        
        // Add a message
        await conversationManager.addMessage('user', 'Hello, world!');
        
        // Verify that writeFile was called to save the conversation
        assert.strictEqual(workspaceManagerStub.writeFile.callCount, 2); // Once for startNewConversation, once for addMessage
        
        // Verify the content of the saved conversation
        const writeFileCall = workspaceManagerStub.writeFile.getCall(1);
        const savedContent = JSON.parse(writeFileCall.args[1]);
        assert.strictEqual(savedContent.title, 'Test Conversation');
        assert.strictEqual(savedContent.messages.length, 1);
        assert.strictEqual(savedContent.messages[0].role, 'user');
        assert.strictEqual(savedContent.messages[0].content, 'Hello, world!');
    });

    test('addMessage should create a new conversation if none exists', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();
        
        // Add a message without starting a conversation first
        await conversationManager.addMessage('user', 'Hello, world!');
        
        // Verify that writeFile was called to save the conversation
        assert.strictEqual(workspaceManagerStub.writeFile.calledOnce, true);
        
        // Verify the content of the saved conversation
        const writeFileCall = workspaceManagerStub.writeFile.getCall(0);
        const savedContent = JSON.parse(writeFileCall.args[1]);
        assert.strictEqual(savedContent.title, 'New Conversation');
        assert.strictEqual(savedContent.messages.length, 1);
        assert.strictEqual(savedContent.messages[0].role, 'user');
        assert.strictEqual(savedContent.messages[0].content, 'Hello, world!');
    });

    test('loadConversation should load an existing conversation', async () => {
        const conversationId = 'test_id';
        const conversationData = {
            id: conversationId,
            title: 'Test Conversation',
            messages: [
                { role: 'user', content: 'Hello', timestamp: Date.now() }
            ],
            created: Date.now(),
            updated: Date.now()
        };
        
        workspaceManagerStub.readFile.resolves(JSON.stringify(conversationData));
        
        const result = await conversationManager.loadConversation(conversationId);
        
        assert.strictEqual(result, true);
        assert.strictEqual(workspaceManagerStub.readFile.calledOnce, true);
        
        // Verify the context contains the loaded message
        const context = conversationManager.getCurrentContext();
        assert.strictEqual(context.length, 1);
        assert.strictEqual(context[0].content, 'Hello');
    });

    test('loadConversation should return false for non-existent conversation', async () => {
        workspaceManagerStub.readFile.rejects(new Error('File not found'));
        
        const result = await conversationManager.loadConversation('nonexistent_id');
        
        assert.strictEqual(result, false);
    });

    test('listConversations should return sorted conversations', async () => {
        const conv1 = {
            id: 'conv1',
            title: 'First Conversation',
            messages: [],
            created: Date.now() - 1000,
            updated: Date.now() - 1000
        };
        
        const conv2 = {
            id: 'conv2',
            title: 'Second Conversation',
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
        
        workspaceManagerStub.listFiles.resolves(['conversations/conv1.json', 'conversations/conv2.json']);
        workspaceManagerStub.readFile.onFirstCall().resolves(JSON.stringify(conv1));
        workspaceManagerStub.readFile.onSecondCall().resolves(JSON.stringify(conv2));
        
        const conversations = await conversationManager.listConversations();
        
        assert.strictEqual(conversations.length, 2);
        // Should be sorted by updated timestamp (most recent first)
        assert.strictEqual(conversations[0].id, 'conv2');
        assert.strictEqual(conversations[1].id, 'conv1');
    });

    test('getCurrentContext should limit the number of messages returned', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();
        
        await conversationManager.startNewConversation('Test Conversation');
        
        // Add several messages
        for (let i = 0; i < 15; i++) {
            await conversationManager.addMessage('user', `Message ${i}`);
        }
        
        // Get context with default limit (10)
        const defaultContext = conversationManager.getCurrentContext();
        assert.strictEqual(defaultContext.length, 10);
        assert.strictEqual(defaultContext[0].content, 'Message 5');
        assert.strictEqual(defaultContext[9].content, 'Message 14');
        
        // Get context with custom limit
        const customContext = conversationManager.getCurrentContext(5);
        assert.strictEqual(customContext.length, 5);
        assert.strictEqual(customContext[0].content, 'Message 10');
        assert.strictEqual(customContext[4].content, 'Message 14');
    });

    test('archiveConversation should mark conversation as archived', async () => {
        const conversationId = 'test_id';
        const conversationData = {
            id: conversationId,
            title: 'Test Conversation',
            messages: [{ role: 'user', content: 'Hello', timestamp: Date.now() }],
            created: Date.now(),
            updated: Date.now(),
            archived: false
        };
        
        workspaceManagerStub.readFile.resolves(JSON.stringify(conversationData));
        workspaceManagerStub.writeFile.resolves();
        
        await conversationManager.archiveConversation(conversationId);
        
        // Verify that writeFile was called with archived=true
        const writeFileCall = workspaceManagerStub.writeFile.getCall(0);
        const savedContent = JSON.parse(writeFileCall.args[1]);
        assert.strictEqual(savedContent.archived, true);
    });

    test('searchMessages should return messages matching the search term', async () => {
        const conversations = [
            {
                id: 'conv1',
                title: 'First Conversation',
                messages: [
                    { role: 'user', content: 'Hello world', timestamp: Date.now() },
                    { role: 'assistant', content: 'Hi there', timestamp: Date.now() }
                ],
                created: Date.now() - 1000,
                updated: Date.now() - 1000
            },
            {
                id: 'conv2',
                title: 'Second Conversation',
                messages: [
                    { role: 'user', content: 'Testing search', timestamp: Date.now() },
                    { role: 'assistant', content: 'World of testing', timestamp: Date.now() }
                ],
                created: Date.now(),
                updated: Date.now()
            }
        ];

        workspaceManagerStub.listFiles.resolves(['conversations/conv1.json', 'conversations/conv2.json']);
        workspaceManagerStub.readFile.onFirstCall().resolves(JSON.stringify(conversations[0]));
        workspaceManagerStub.readFile.onSecondCall().resolves(JSON.stringify(conversations[1]));

        const results = await conversationManager.searchMessages('world');
        
        assert.strictEqual(results.length, 2);
        assert.ok(results.some(r => r.content === 'Hello world'));
        assert.ok(results.some(r => r.content === 'World of testing'));
    });

    test('persistContextState should save and restore conversation context', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.readFile.resolves(JSON.stringify({
            contextState: {
                lastActiveConversation: 'test_id',
                recentKeywords: ['typescript', 'testing'],
                contextWindow: 10
            }
        }));

        // Save some context state
        await conversationManager.persistContextState({
            lastActiveConversation: 'test_id',
            recentKeywords: ['typescript', 'testing'],
            contextWindow: 10
        });

        // Restore context state
        const restoredState = await conversationManager.restoreContextState();
        
        assert.strictEqual(restoredState.lastActiveConversation, 'test_id');
        assert.deepStrictEqual(restoredState.recentKeywords, ['typescript', 'testing']);
        assert.strictEqual(restoredState.contextWindow, 10);
    });

    test('deleteConversation should remove conversation and its context', async () => {
        const conversationId = 'test_id';
        workspaceManagerStub.deleteFile.resolves();
        
        await conversationManager.deleteConversation(conversationId);
        
        assert.strictEqual(workspaceManagerStub.deleteFile.calledOnce, true);
        const deleteCall = workspaceManagerStub.deleteFile.getCall(0);
        assert.ok(deleteCall.args[0].includes(conversationId));
        
        // Verify the conversation is not in current context
        const context = conversationManager.getCurrentContext();
        assert.strictEqual(context.length, 0);
    });

    test('mergeConversations should combine messages from multiple conversations', async () => {
        const conv1 = {
            id: 'conv1',
            title: 'First Conversation',
            messages: [
                { role: 'user', content: 'Message 1', timestamp: Date.now() - 2000 }
            ],
            created: Date.now() - 2000,
            updated: Date.now() - 2000
        };

        const conv2 = {
            id: 'conv2',
            title: 'Second Conversation',
            messages: [
                { role: 'user', content: 'Message 2', timestamp: Date.now() - 1000 }
            ],
            created: Date.now() - 1000,
            updated: Date.now() - 1000
        };

        workspaceManagerStub.readFile.onFirstCall().resolves(JSON.stringify(conv1));
        workspaceManagerStub.readFile.onSecondCall().resolves(JSON.stringify(conv2));
        workspaceManagerStub.writeFile.resolves();

        const mergedId = await conversationManager.mergeConversations(['conv1', 'conv2'], 'Merged Conversation');

        // Verify the merged conversation was saved
        const writeFileCall = workspaceManagerStub.writeFile.getCall(0);
        const savedContent = JSON.parse(writeFileCall.args[1]);
        assert.strictEqual(savedContent.title, 'Merged Conversation');
        assert.strictEqual(savedContent.messages.length, 2);
        assert.ok(savedContent.messages.some(m => m.content === 'Message 1'));
        assert.ok(savedContent.messages.some(m => m.content === 'Message 2'));
        assert.strictEqual(typeof mergedId, 'string');
    });

    test('searchConversations should find conversations by content', async () => {
        const conversations = [
            {
                id: 'conv1',
                title: 'First Conversation',
                messages: [
                    { role: 'user', content: 'Hello TypeScript', timestamp: Date.now() - 2000 },
                    { role: 'assistant', content: 'Hi there!', timestamp: Date.now() - 1000 }
                ],
                created: Date.now() - 2000,
                updated: Date.now() - 1000
            },
            {
                id: 'conv2',
                title: 'Second Conversation',
                messages: [
                    { role: 'user', content: 'How to use React hooks?', timestamp: Date.now() - 500 }
                ],
                created: Date.now() - 500,
                updated: Date.now() - 500
            }
        ];

        workspaceManagerStub.listFiles.resolves(['conversations/conv1.json', 'conversations/conv2.json']);
        workspaceManagerStub.readFile.onFirstCall().resolves(JSON.stringify(conversations[0]));
        workspaceManagerStub.readFile.onSecondCall().resolves(JSON.stringify(conversations[1]));

        const results = await conversationManager.searchConversations('typescript');
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].id, 'conv1');
    });

    test('deleteConversation should remove conversation and its messages', async () => {
        workspaceManagerStub.deleteFile.resolves();

        await conversationManager.deleteConversation('test_id');

        assert.strictEqual(workspaceManagerStub.deleteFile.calledOnce, true);
        const deletePath = workspaceManagerStub.deleteFile.getCall(0).args[0];
        assert.ok(deletePath.includes('test_id.json'));
    });

    test('getConversationsByDateRange should return conversations within range', async () => {
        const now = Date.now();
        const conversations = [
            {
                id: 'conv1',
                title: 'Old Conversation',
                messages: [],
                created: now - 100000,
                updated: now - 90000
            },
            {
                id: 'conv2',
                title: 'Recent Conversation',
                messages: [],
                created: now - 1000,
                updated: now - 500
            }
        ];

        workspaceManagerStub.listFiles.resolves(['conversations/conv1.json', 'conversations/conv2.json']);
        workspaceManagerStub.readFile.onFirstCall().resolves(JSON.stringify(conversations[0]));
        workspaceManagerStub.readFile.onSecondCall().resolves(JSON.stringify(conversations[1]));

        const results = await conversationManager.getConversationsByDateRange(now - 50000, now);
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].id, 'conv2');
    });

    test('clearConversationHistory should delete all conversations', async () => {
        workspaceManagerStub.listFiles.resolves(['conversations/conv1.json', 'conversations/conv2.json']);
        workspaceManagerStub.deleteFile.resolves();

        await conversationManager.clearConversationHistory();

        assert.strictEqual(workspaceManagerStub.deleteFile.callCount, 2);
    });

    test('should handle message history cleanup correctly', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();

        // Initialize with max history size
        const maxHistorySize = 5;
        conversationManager.setMaxHistorySize(maxHistorySize);

        await conversationManager.startNewConversation('History Test');

        // Add more messages than the limit
        for (let i = 0; i < maxHistorySize + 3; i++) {
            await conversationManager.addMessage('user', `Message ${i}`);
        }

        const context = conversationManager.getCurrentContext();
        assert.strictEqual(context.length, maxHistorySize);
        assert.strictEqual(context[0].content, `Message ${maxHistorySize - 2}`);
        assert.strictEqual(context[maxHistorySize - 1].content, `Message ${maxHistorySize + 2}`);
    });

    test('should handle date range filtering', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();

        await conversationManager.startNewConversation('Date Range Test');

        const startTime = Date.now();
        await conversationManager.addMessage('user', 'Message 1');
        await new Promise(resolve => setTimeout(resolve, 100));
        await conversationManager.addMessage('user', 'Message 2');
        const endTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 100));
        await conversationManager.addMessage('user', 'Message 3');

        const messages = conversationManager.getMessagesByDateRange(startTime, endTime);
        assert.strictEqual(messages.length, 2);
        assert.strictEqual(messages[0].content, 'Message 1');
        assert.strictEqual(messages[1].content, 'Message 2');
    });

    test('should handle message search functionality', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();

        await conversationManager.startNewConversation('Search Test');
        await conversationManager.addMessage('user', 'How do I use TypeScript?');
        await conversationManager.addMessage('assistant', 'TypeScript is a typed superset of JavaScript');
        await conversationManager.addMessage('user', 'What about JavaScript?');

        const typescriptResults = conversationManager.searchMessages('typescript');
        assert.strictEqual(typescriptResults.length, 2);
        
        const javascriptResults = conversationManager.searchMessages('javascript');
        assert.strictEqual(javascriptResults.length, 2);

        const noResults = conversationManager.searchMessages('python');
        assert.strictEqual(noResults.length, 0);
    });

    test('should handle empty and invalid conversations gracefully', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();
        workspaceManagerStub.readFile.rejects(new Error('Invalid JSON'));

        const result = await conversationManager.loadConversation('invalid_conversation');
        assert.strictEqual(result, false);

        // Should not throw when getting context from empty conversation
        const context = conversationManager.getCurrentContext();
        assert.strictEqual(context.length, 0);
    });

    test('should preserve conversation metadata across saves', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();

        const title = 'Metadata Test';
        await conversationManager.startNewConversation(title);
        const conversationId = conversationManager.getCurrentConversationId();
        
        await conversationManager.addMessage('user', 'Test message');
        await conversationManager.addMessage('assistant', 'Response message');

        // Verify metadata preservation in current conversation
        const conversation = conversationManager.getCurrentConversation();
        assert.ok(conversation);
        assert.strictEqual(conversation.title, title);
        assert.ok(conversation.created);
        assert.ok(conversation.updated);
        assert.ok(conversation.updated >= conversation.created);
        assert.strictEqual(conversation.messages.length, 2);
    });

    test('searchConversations should find conversations by content', async () => {
        const conversations = [
            {
                id: 'conv1',
                title: 'First Conversation',
                messages: [
                    { role: 'user', content: 'Hello world', timestamp: Date.now() - 2000 }
                ],
                created: Date.now() - 2000,
                updated: Date.now() - 2000
            },
            {
                id: 'conv2',
                title: 'Second Conversation',
                messages: [
                    { role: 'user', content: 'Testing search functionality', timestamp: Date.now() - 1000 }
                ],
                created: Date.now() - 1000,
                updated: Date.now() - 1000
            }
        ];

        workspaceManagerStub.listFiles.resolves(['conversations/conv1.json', 'conversations/conv2.json']);
        workspaceManagerStub.readFile.onFirstCall().resolves(JSON.stringify(conversations[0]));
        workspaceManagerStub.readFile.onSecondCall().resolves(JSON.stringify(conversations[1]));

        const results = await conversationManager.searchConversations('search');
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].id, 'conv2');
    });

    test('getConversationsByDateRange should return conversations within range', async () => {
        const now = Date.now();
        const conversations = [
            {
                id: 'conv1',
                title: 'Old Conversation',
                messages: [],
                created: now - 5000,
                updated: now - 5000
            },
            {
                id: 'conv2',
                title: 'Recent Conversation',
                messages: [],
                created: now - 1000,
                updated: now - 1000
            }
        ];

        workspaceManagerStub.listFiles.resolves(['conversations/conv1.json', 'conversations/conv2.json']);
        workspaceManagerStub.readFile.onFirstCall().resolves(JSON.stringify(conversations[0]));
        workspaceManagerStub.readFile.onSecondCall().resolves(JSON.stringify(conversations[1]));

        const results = await conversationManager.getConversationsByDateRange(now - 3000, now);
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].id, 'conv2');
    });

    test('should handle concurrent conversation updates gracefully', async () => {
        const conversation = {
            id: 'concurrent-test',
            title: 'Concurrent Test',
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };

        workspaceManagerStub.readFile.resolves(JSON.stringify(conversation));
        workspaceManagerStub.writeFile.resolves();

        // Simulate concurrent updates
        const update1 = conversationManager.addMessage({
            role: 'user',
            content: 'Message 1',
            timestamp: Date.now()
        });
        
        const update2 = conversationManager.addMessage({
            role: 'user',
            content: 'Message 2',
            timestamp: Date.now()
        });

        await Promise.all([update1, update2]);
        
        // Both messages should be saved
        const messages = await conversationManager.getCurrentContext();
        assert.strictEqual(messages.length, 2);
    });

    test('should recover from corrupted conversation files', async () => {
        workspaceManagerStub.listFiles.resolves(['conversations/corrupted.json']);
        workspaceManagerStub.readFile.rejects(new Error('Invalid JSON'));

        // Should not throw error and return empty array
        const conversations = await conversationManager.listConversations();
        assert.strictEqual(conversations.length, 0);
    });

    test('should maintain correct message order during merges', async () => {
        const conv1 = {
            id: 'conv1',
            title: 'First Conv',
            messages: [
                { role: 'user', content: 'Message 1', timestamp: Date.now() - 3000 },
                { role: 'assistant', content: 'Response 1', timestamp: Date.now() - 2000 }
            ],
            created: Date.now() - 3000,
            updated: Date.now() - 2000
        };

        const conv2 = {
            id: 'conv2',
            title: 'Second Conv',
            messages: [
                { role: 'user', content: 'Message 2', timestamp: Date.now() - 1000 },
                { role: 'assistant', content: 'Response 2', timestamp: Date.now() }
            ],
            created: Date.now() - 1000,
            updated: Date.now()
        };

        workspaceManagerStub.readFile
            .onFirstCall().resolves(JSON.stringify(conv1))
            .onSecondCall().resolves(JSON.stringify(conv2));

        const mergedId = await conversationManager.mergeConversations(['conv1', 'conv2'], 'Merged Conv');
        const merged = await conversationManager.loadConversation(mergedId);
        
        assert.strictEqual(merged.messages.length, 4);
        assert.strictEqual(merged.messages[0].content, 'Message 1');
        assert.strictEqual(merged.messages[3].content, 'Response 2');
    });
});