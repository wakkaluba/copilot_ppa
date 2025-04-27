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
exports.createMockConversationHistory = createMockConversationHistory;
exports.createMockExtensionContext = createMockExtensionContext;
exports.createMockConversation = createMockConversation;
exports.createMockMessage = createMockMessage;
var vscode = require("vscode");
var sinon = require("sinon");
var ConversationHistory_1 = require("../../services/ConversationHistory");
/**
 * Creates a mock ConversationHistory instance that can be used in tests
 */
function createMockConversationHistory() {
    var _this = this;
    var mockHistory = sinon.createStubInstance(ConversationHistory_1.ConversationHistory);
    // Add additional methods that aren't automatically detected
    mockHistory.on = sinon.stub().returns(mockHistory);
    mockHistory.emit = sinon.stub().returns(true);
    // Implement some standard behaviors
    mockHistory.getConversation = sinon.stub().callsFake(function (id) {
        return {
            id: id,
            title: "Mock Conversation ".concat(id),
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
    });
    mockHistory.getAllConversations = sinon.stub().returns([]);
    mockHistory.createConversation = sinon.stub().callsFake(function (title) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    id: "mock-".concat(Date.now()),
                    title: title,
                    messages: [],
                    created: Date.now(),
                    updated: Date.now()
                }];
        });
    }); });
    mockHistory.addMessage = sinon.stub().resolves();
    mockHistory.deleteConversation = sinon.stub().resolves();
    mockHistory.searchConversations = sinon.stub().resolves([]);
    mockHistory.exportConversation = sinon.stub().resolves("{}");
    mockHistory.importConversation = sinon.stub().resolves({
        id: "imported-conversation",
        title: "Imported Conversation",
        messages: [],
        created: Date.now(),
        updated: Date.now()
    });
    return mockHistory;
}
/**
 * Creates a mock ExtensionContext that can be used in tests
 */
function createMockExtensionContext() {
    return {
        subscriptions: [],
        workspaceState: {
            get: sinon.stub().returns(undefined),
            update: sinon.stub().resolves(),
            keys: sinon.stub().returns([])
        },
        globalState: {
            get: sinon.stub().returns(undefined),
            update: sinon.stub().resolves(),
            setKeysForSync: sinon.stub(),
            keys: sinon.stub().returns([])
        },
        extensionPath: '/test/extension/path',
        extensionUri: {
            fsPath: '/test/extension/path',
            scheme: 'file'
        },
        asAbsolutePath: sinon.stub().callsFake(function (p) { return "/test/extension/path/".concat(p); }),
        storagePath: '/test/storage/path',
        storageUri: {
            fsPath: '/test/storage/path',
            scheme: 'file'
        },
        globalStoragePath: '/test/global-storage/path',
        globalStorageUri: {
            fsPath: '/test/global-storage/path',
            scheme: 'file'
        },
        logPath: '/test/log/path',
        logUri: {
            fsPath: '/test/log/path',
            scheme: 'file'
        },
        extensionMode: vscode.ExtensionMode.Test,
        secrets: {
            get: sinon.stub().resolves(undefined),
            store: sinon.stub().resolves(),
            delete: sinon.stub().resolves()
        }
    };
}
/**
 * Creates a mock conversation that can be used in tests
 */
function createMockConversation(id, title) {
    if (id === void 0) { id = 'test-conversation'; }
    if (title === void 0) { title = 'Test Conversation'; }
    return {
        id: id,
        title: title,
        messages: [],
        created: Date.now(),
        updated: Date.now()
    };
}
/**
 * Creates a mock chat message that can be used in tests
 */
function createMockMessage(role, content) {
    if (role === void 0) { role = 'user'; }
    if (content === void 0) { content = 'Test message'; }
    return {
        role: role,
        content: content,
        timestamp: new Date()
    };
}
