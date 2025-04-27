"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var ConversationState_1 = require("../../services/ConversationState");
var WorkspaceManager_1 = require("../../services/WorkspaceManager");
suite('ConversationState Tests', function () {
    var conversationState;
    var workspaceManagerStub;
    var sandbox;
    setup(function () {
        sandbox = sinon.createSandbox();
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        conversationState = new ConversationState_1.ConversationState();
    });
    teardown(function () {
        sandbox.restore();
    });
    test('should track active context correctly', function () {
        var context = {
            languageId: 'typescript',
            filePath: '/path/to/file.ts',
            selection: { start: 0, end: 10 }
        };
        conversationState.setActiveContext(context);
        var retrievedContext = conversationState.getActiveContext();
        assert.deepStrictEqual(retrievedContext, context);
    });
    test('should manage conversation focus state', function () {
        var initialState = conversationState.getConversationFocus();
        assert.strictEqual(initialState, 'general');
        conversationState.setConversationFocus('code-review');
        assert.strictEqual(conversationState.getConversationFocus(), 'code-review');
        conversationState.setConversationFocus('debugging');
        assert.strictEqual(conversationState.getConversationFocus(), 'debugging');
    });
    test('should track file context history', function () {
        var fileContexts = [
            { path: '/file1.ts', languageId: 'typescript' },
            { path: '/file2.ts', languageId: 'typescript' },
            { path: '/file3.js', languageId: 'javascript' }
        ];
        fileContexts.forEach(function (context) { return conversationState.addFileContext(context); });
        var history = conversationState.getFileContextHistory();
        assert.strictEqual(history.length, 3);
        assert.deepStrictEqual(history[0], fileContexts[0]);
    });
    test('should manage contextual variables', function () {
        conversationState.setContextVariable('currentBranch', 'feature/test');
        conversationState.setContextVariable('lastCommand', 'git status');
        assert.strictEqual(conversationState.getContextVariable('currentBranch'), 'feature/test');
        assert.strictEqual(conversationState.getContextVariable('lastCommand'), 'git status');
        var allVars = conversationState.getAllContextVariables();
        assert.strictEqual(Object.keys(allVars).length, 2);
    });
    test('should handle state persistence', function () { return __awaiter(void 0, void 0, void 0, function () {
        var state, loadedState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = {
                        focus: 'code-review',
                        context: { languageId: 'typescript' },
                        variables: { branch: 'main' }
                    };
                    workspaceManagerStub.writeFile.resolves();
                    return [4 /*yield*/, conversationState.saveState(state)];
                case 1:
                    _a.sent();
                    workspaceManagerStub.readFile.resolves(JSON.stringify(state));
                    return [4 /*yield*/, conversationState.loadState()];
                case 2:
                    loadedState = _a.sent();
                    assert.deepStrictEqual(loadedState, state);
                    return [2 /*return*/];
            }
        });
    }); });
    test('should manage conversation topics', function () {
        conversationState.addConversationTopic('typescript');
        conversationState.addConversationTopic('testing');
        var topics = conversationState.getConversationTopics();
        assert.strictEqual(topics.length, 2);
        assert.ok(topics.includes('typescript'));
        assert.ok(topics.includes('testing'));
    });
    test('should track contextual dependencies', function () {
        var deps = {
            typescript: '^4.0.0',
            jest: '^27.0.0'
        };
        conversationState.setContextualDependencies(deps);
        var retrievedDeps = conversationState.getContextualDependencies();
        assert.deepStrictEqual(retrievedDeps, deps);
    });
    test('should handle context transitions', function () {
        var transitions = conversationState.getContextTransitions();
        assert.strictEqual(transitions.length, 0);
        conversationState.addContextTransition('general', 'code-review');
        conversationState.addContextTransition('code-review', 'debugging');
        var updatedTransitions = conversationState.getContextTransitions();
        assert.strictEqual(updatedTransitions.length, 2);
        assert.deepStrictEqual(updatedTransitions[0], { from: 'general', to: 'code-review' });
    });
    test('should manage context snapshots', function () {
        var snapshot = {
            timestamp: new Date(),
            focus: 'debugging',
            context: { languageId: 'typescript' }
        };
        conversationState.saveContextSnapshot(snapshot);
        var retrievedSnapshot = conversationState.getContextSnapshot();
        assert.deepStrictEqual(retrievedSnapshot, snapshot);
    });
    test('should track conversation progress', function () {
        conversationState.setConversationProgress(0.5);
        assert.strictEqual(conversationState.getConversationProgress(), 0.5);
        conversationState.setConversationProgress(1.0);
        assert.strictEqual(conversationState.getConversationProgress(), 1.0);
    });
});
