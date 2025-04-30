"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var ConversationSync_1 = require("../../services/ConversationSync");
var WorkspaceManager_1 = require("../../services/WorkspaceManager");
suite('ConversationSync Tests', function () {
    var conversationSync;
    var workspaceManagerStub;
    var sandbox;
    setup(function () {
        sandbox = sinon.createSandbox();
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        conversationSync = new ConversationSync_1.ConversationSync();
    });
    teardown(function () {
        sandbox.restore();
    });
    test('should handle interrupted conversation recovery', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var partialConversation, recoveryPoint, recovered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        partialConversation = {
                            id: 'interrupted-convo',
                            messages: [
                                { role: 'user', content: 'Start task' },
                                { role: 'assistant', content: 'Working on it...' }
                            ],
                            status: 'interrupted'
                        };
                        return [4 /*yield*/, conversationSync.createRecoveryPoint(partialConversation)];
                    case 1:
                        recoveryPoint = _a.sent();
                        assert.ok(recoveryPoint.timestamp);
                        assert.strictEqual(recoveryPoint.conversationState, 'interrupted');
                        return [4 /*yield*/, conversationSync.recoverConversation(recoveryPoint)];
                    case 2:
                        recovered = _a.sent();
                        assert.strictEqual(recovered.messages.length, 2);
                        assert.strictEqual(recovered.status, 'recovered');
                        return [2 /*return*/];
                }
            });
        });
    });
    test('should maintain conversation state consistency', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var stateA, stateB, finalState, stateVersion;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stateA = { count: 1, data: 'test' };
                        stateB = { count: 2, data: 'updated' };
                        return [4 /*yield*/, conversationSync.saveState('convo-1', stateA)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, conversationSync.saveState('convo-1', stateB)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, conversationSync.getState('convo-1')];
                    case 3:
                        finalState = _a.sent();
                        assert.deepStrictEqual(finalState, stateB);
                        return [4 /*yield*/, conversationSync.getStateVersion('convo-1')];
                    case 4:
                        stateVersion = _a.sent();
                        assert.strictEqual(stateVersion, 2);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('should handle concurrent conversation updates', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var baseState, update1, update2, finalState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseState = { value: 0 };
                        update1 = conversationSync.updateState('convo-2', function (state) { return ({ value: state.value + 1 }); });
                        update2 = conversationSync.updateState('convo-2', function (state) { return ({ value: state.value + 2 }); });
                        return [4 /*yield*/, Promise.all([update1, update2])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, conversationSync.getState('convo-2')];
                    case 2:
                        finalState = _a.sent();
                        assert.strictEqual(finalState.value, 3);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('should detect and resolve conflicts', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var original, update1, update2, conflict, resolved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        original = { data: 'original' };
                        update1 = { data: 'update1' };
                        update2 = { data: 'update2' };
                        return [4 /*yield*/, conversationSync.detectConflict('convo-3', original, [update1, update2])];
                    case 1:
                        conflict = _a.sent();
                        assert.ok(conflict.hasConflict);
                        return [4 /*yield*/, conversationSync.resolveConflict(conflict)];
                    case 2:
                        resolved = _a.sent();
                        assert.ok(resolved.data);
                        assert.ok(resolved.resolutionStrategy);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('should maintain conversation checkpoints', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var checkpoint1, restored;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkpoint1 = {
                            id: 'checkpoint-1',
                            state: { progress: 50 },
                            timestamp: new Date()
                        };
                        return [4 /*yield*/, conversationSync.createCheckpoint('convo-4', checkpoint1)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, conversationSync.restoreFromCheckpoint('convo-4', 'checkpoint-1')];
                    case 2:
                        restored = _a.sent();
                        assert.deepStrictEqual(restored.state, checkpoint1.state);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('should handle state rollback', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var states, _i, states_1, state, rolledBack;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        states = [
                            { version: 1, data: 'initial' },
                            { version: 2, data: 'updated' },
                            { version: 3, data: 'corrupted' }
                        ];
                        _i = 0, states_1 = states;
                        _a.label = 1;
                    case 1:
                        if (!(_i < states_1.length))
                            return [3 /*break*/, 4];
                        state = states_1[_i];
                        return [4 /*yield*/, conversationSync.saveState('convo-5', state)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, conversationSync.rollbackTo('convo-5', 2)];
                    case 5:
                        rolledBack = _a.sent();
                        assert.strictEqual(rolledBack.version, 2);
                        assert.strictEqual(rolledBack.data, 'updated');
                        return [2 /*return*/];
                }
            });
        });
    });
    test('should sync conversation across sessions', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var sessionA, synced;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionA = {
                            id: 'session-A',
                            conversation: { messages: [{ role: 'user', content: 'Test' }] }
                        };
                        return [4 /*yield*/, conversationSync.syncSession(sessionA)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, conversationSync.getSyncedSession('session-A')];
                    case 2:
                        synced = _a.sent();
                        assert.deepStrictEqual(synced.conversation, sessionA.conversation);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('should handle partial state updates', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var initialState, updatedState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initialState = {
                            messages: [],
                            metadata: { lastUpdate: Date.now() },
                            settings: { theme: 'dark' }
                        };
                        return [4 /*yield*/, conversationSync.saveState('convo-6', initialState)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, conversationSync.updatePartialState('convo-6', {
                                'settings.theme': 'light'
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, conversationSync.getState('convo-6')];
                    case 3:
                        updatedState = _a.sent();
                        assert.strictEqual(updatedState.settings.theme, 'light');
                        assert.ok(updatedState.metadata.lastUpdate);
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=ConversationSync.test.js.map