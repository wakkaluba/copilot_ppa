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
const ConversationState_1 = require("../../services/ConversationState");
const WorkspaceManager_1 = require("../../services/WorkspaceManager");
suite('ConversationState Tests', () => {
    let conversationState;
    let workspaceManagerStub;
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        conversationState = new ConversationState_1.ConversationState();
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
            timestamp: Date.now(),
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
//# sourceMappingURL=ConversationState.test.js.map