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
var conversationManager_1 = require("../../services/conversationManager");
var WorkspaceManager_1 = require("../../services/WorkspaceManager");
describe('ConversationManager', function () {
    var conversationManager;
    var sandbox;
    var workspaceManagerStub;
    var originalGetInstance;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        // Store original getInstance
        originalGetInstance = WorkspaceManager_1.WorkspaceManager.getInstance;
        // Create stub for WorkspaceManager
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        // Replace the getInstance method to return our stub
        WorkspaceManager_1.WorkspaceManager.getInstance = sandbox.stub().returns(workspaceManagerStub);
        // Reset ConversationManager singleton instance
        conversationManager_1.ConversationManager.instance = undefined;
        conversationManager = conversationManager_1.ConversationManager.getInstance();
    });
    afterEach(function () {
        sandbox.restore();
        WorkspaceManager_1.WorkspaceManager.getInstance = originalGetInstance;
    });
    it('should start a new conversation', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var messages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, conversationManager.startNewConversation('Test Conversation')];
                    case 1:
                        _a.sent();
                        messages = conversationManager.getCurrentContext();
                        assert.deepStrictEqual(messages, []);
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should add a message to the current conversation', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var messages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, conversationManager.startNewConversation('Test Conversation')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, conversationManager.addMessage('user', 'Hello, world!')];
                    case 2:
                        _a.sent();
                        messages = conversationManager.getCurrentContext();
                        assert.strictEqual(messages.length, 1);
                        assert.strictEqual(messages[0].content, 'Hello, world!');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should return an empty array if no conversation is started', function () {
        var messages = conversationManager.getCurrentContext();
        assert.deepStrictEqual(messages, []);
    });
    it('should load a conversation', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var conversationData, success, messages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversationData = {
                            id: 'test-conversation',
                            title: 'Test Conversation',
                            messages: [
                                {
                                    role: 'user',
                                    content: 'Hello, world!',
                                    timestamp: new Date()
                                }
                            ],
                            created: Date.now(),
                            updated: Date.now()
                        };
                        workspaceManagerStub.readFile.resolves(JSON.stringify(conversationData));
                        return [4 /*yield*/, conversationManager.loadConversation('test-conversation')];
                    case 1:
                        success = _a.sent();
                        assert.strictEqual(success, true);
                        messages = conversationManager.getCurrentContext();
                        assert.strictEqual(messages.length, 1);
                        assert.strictEqual(messages[0].content, 'Hello, world!');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should list conversations', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var conversation1, conversation2, conversations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversation1 = {
                            id: 'conv1',
                            title: 'Conversation 1',
                            messages: [],
                            created: Date.now() - 1000,
                            updated: Date.now() - 1000
                        };
                        conversation2 = {
                            id: 'conv2',
                            title: 'Conversation 2',
                            messages: [],
                            created: Date.now(),
                            updated: Date.now()
                        };
                        workspaceManagerStub.listFiles.resolves(['conversations/conv1.json', 'conversations/conv2.json']);
                        workspaceManagerStub.readFile
                            .onFirstCall().resolves(JSON.stringify(conversation1))
                            .onSecondCall().resolves(JSON.stringify(conversation2));
                        return [4 /*yield*/, conversationManager.listConversations()];
                    case 1:
                        conversations = _a.sent();
                        assert.strictEqual(conversations.length, 2);
                        // Should be sorted by updated time, most recent first
                        assert.strictEqual(conversations[0].id, 'conv2');
                        assert.strictEqual(conversations[1].id, 'conv1');
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should auto-save when adding messages', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, conversationManager.startNewConversation('Test Conversation')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, conversationManager.addMessage('user', 'Hello, world!')];
                    case 2:
                        _a.sent();
                        assert.strictEqual(workspaceManagerStub.createDirectory.callCount, 2); // Initial call and auto-save call
                        assert.strictEqual(workspaceManagerStub.writeFile.callCount, 2); // Initial call and auto-save call
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=ConversationManager.test.js.map