import * as assert from 'assert';
import * as sinon from 'sinon';
import { ConversationState } from '../../services/ConversationState';
import { WorkspaceManager } from '../../services/WorkspaceManager';

suite('ConversationState Tests', () => {
    let conversationState: ConversationState;
    let workspaceManagerStub: sinon.SinonStubbedInstance<WorkspaceManager>;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager);
        sandbox.stub(WorkspaceManager, 'getInstance').returns(workspaceManagerStub as unknown as WorkspaceManager);
        conversationState = new ConversationState();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should track active context correctly', () => {
        const context = {
            languageId: 'typescript',
            filePath: '/path/to/file.ts',
            selection: { start: 0, end: 10 }
        };

        conversationState.setActiveContext(context);
        const retrievedContext = conversationState.getActiveContext();
        
        assert.deepStrictEqual(retrievedContext, context);
    });

    test('should manage conversation focus state', () => {
        const initialState = conversationState.getConversationFocus();
        assert.strictEqual(initialState, 'general');

        conversationState.setConversationFocus('code-review');
        assert.strictEqual(conversationState.getConversationFocus(), 'code-review');

        conversationState.setConversationFocus('debugging');
        assert.strictEqual(conversationState.getConversationFocus(), 'debugging');
    });

    test('should track file context history', () => {
        const fileContexts = [
            { path: '/file1.ts', languageId: 'typescript' },
            { path: '/file2.ts', languageId: 'typescript' },
            { path: '/file3.js', languageId: 'javascript' }
        ];

        fileContexts.forEach(context => conversationState.addFileContext(context));
        
        const history = conversationState.getFileContextHistory();
        assert.strictEqual(history.length, 3);
        assert.deepStrictEqual(history[0], fileContexts[0]);
    });

    test('should manage contextual variables', () => {
        conversationState.setContextVariable('currentBranch', 'feature/test');
        conversationState.setContextVariable('lastCommand', 'git status');

        assert.strictEqual(conversationState.getContextVariable('currentBranch'), 'feature/test');
        assert.strictEqual(conversationState.getContextVariable('lastCommand'), 'git status');

        const allVars = conversationState.getAllContextVariables();
        assert.strictEqual(Object.keys(allVars).length, 2);
    });

    test('should handle state persistence', async () => {
        const state = {
            focus: 'code-review',
            context: { languageId: 'typescript' },
            variables: { branch: 'main' }
        };

        workspaceManagerStub.writeFile.resolves();
        await conversationState.saveState(state);
        
        workspaceManagerStub.readFile.resolves(JSON.stringify(state));
        const loadedState = await conversationState.loadState();
        
        assert.deepStrictEqual(loadedState, state);
    });

    test('should manage conversation topics', () => {
        conversationState.addConversationTopic('typescript');
        conversationState.addConversationTopic('testing');
        
        const topics = conversationState.getConversationTopics();
        assert.strictEqual(topics.length, 2);
        assert.ok(topics.includes('typescript'));
        assert.ok(topics.includes('testing'));
    });

    test('should track contextual dependencies', () => {
        const deps = {
            typescript: '^4.0.0',
            jest: '^27.0.0'
        };

        conversationState.setContextualDependencies(deps);
        const retrievedDeps = conversationState.getContextualDependencies();
        
        assert.deepStrictEqual(retrievedDeps, deps);
    });

    test('should handle context transitions', () => {
        const transitions = conversationState.getContextTransitions();
        assert.strictEqual(transitions.length, 0);

        conversationState.addContextTransition('general', 'code-review');
        conversationState.addContextTransition('code-review', 'debugging');

        const updatedTransitions = conversationState.getContextTransitions();
        assert.strictEqual(updatedTransitions.length, 2);
        assert.deepStrictEqual(updatedTransitions[0], { from: 'general', to: 'code-review' });
    });

    test('should manage context snapshots', () => {
        const snapshot = {
            timestamp: new Date(),
            focus: 'debugging',
            context: { languageId: 'typescript' }
        };

        conversationState.saveContextSnapshot(snapshot);
        const retrievedSnapshot = conversationState.getContextSnapshot();
        
        assert.deepStrictEqual(retrievedSnapshot, snapshot);
    });

    test('should track conversation progress', () => {
        conversationState.setConversationProgress(0.5);
        assert.strictEqual(conversationState.getConversationProgress(), 0.5);

        conversationState.setConversationProgress(1.0);
        assert.strictEqual(conversationState.getConversationProgress(), 1.0);
    });
});