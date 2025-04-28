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
exports.createMockConversationHistory = createMockConversationHistory;
exports.createMockExtensionContext = createMockExtensionContext;
exports.createMockConversation = createMockConversation;
exports.createMockMessage = createMockMessage;
const vscode = __importStar(require("vscode"));
const sinon = __importStar(require("sinon"));
const ConversationHistory_1 = require("../../services/ConversationHistory");
/**
 * Creates a mock ConversationHistory instance that can be used in tests
 */
function createMockConversationHistory() {
    const mockHistory = sinon.createStubInstance(ConversationHistory_1.ConversationHistory);
    // Add additional methods that aren't automatically detected
    mockHistory.on = sinon.stub().returns(mockHistory);
    mockHistory.emit = sinon.stub().returns(true);
    // Implement some standard behaviors
    mockHistory.getConversation = sinon.stub().callsFake((id) => {
        return {
            id,
            title: `Mock Conversation ${id}`,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
    });
    mockHistory.getAllConversations = sinon.stub().returns([]);
    mockHistory.createConversation = sinon.stub().callsFake(async (title) => {
        return {
            id: `mock-${Date.now()}`,
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
    });
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
        asAbsolutePath: sinon.stub().callsFake((p) => `/test/extension/path/${p}`),
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
function createMockConversation(id = 'test-conversation', title = 'Test Conversation') {
    return {
        id,
        title,
        messages: [],
        created: Date.now(),
        updated: Date.now()
    };
}
/**
 * Creates a mock chat message that can be used in tests
 */
function createMockMessage(role = 'user', content = 'Test message') {
    return {
        role,
        content,
        timestamp: new Date()
    };
}
//# sourceMappingURL=mockHelpers.js.map