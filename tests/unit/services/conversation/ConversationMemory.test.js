"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var ConversationMemory_1 = require("../../../../src/services/conversation/ConversationMemory");
describe('ConversationMemory', function () {
    var mockContext;
    var conversationMemory;
    var storedMessages;
    beforeEach(function () {
        storedMessages = [];
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            globalState: {
                get: jest.fn().mockImplementation(function () { return storedMessages; }),
                update: jest.fn().mockImplementation(function (key, value) {
                    storedMessages = value;
                    return Promise.resolve();
                }),
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
            },
        };
        conversationMemory = new ConversationMemory_1.ConversationMemory(mockContext);
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    describe('initialization', function () {
        it('should initialize with empty state when no stored data', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockContext.globalState.get.mockReturnValue(null);
                        return [4 /*yield*/, conversationMemory.initialize()];
                    case 1:
                        _a.sent();
                        expect(conversationMemory.getAllMessages()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should load stored messages on initialization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var testMessages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testMessages = [
                            {
                                id: '1',
                                role: 'user',
                                content: 'Test message 1',
                                timestamp: new Date()
                            }
                        ];
                        mockContext.globalState.get.mockReturnValue(testMessages);
                        return [4 /*yield*/, conversationMemory.initialize()];
                    case 1:
                        _a.sent();
                        expect(conversationMemory.getAllMessages()).toEqual(testMessages);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle initialization errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockContext.globalState.get.mockImplementation(function () {
                            throw new Error('Storage error');
                        });
                        return [4 /*yield*/, expect(conversationMemory.initialize()).rejects.toThrow('Failed to initialize conversation memory: Storage error')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('message management', function () {
        var testMessage = {
            id: '1',
            role: 'user',
            content: 'Test message',
            timestamp: new Date()
        };
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, conversationMemory.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should add message to memory', function () {
            conversationMemory.addMessage(testMessage);
            var messages = conversationMemory.getAllMessages();
            expect(messages).toContain(testMessage);
        });
        it('should maintain message order', function () {
            var message1 = __assign(__assign({}, testMessage), { id: '1', content: 'First' });
            var message2 = __assign(__assign({}, testMessage), { id: '2', content: 'Second' });
            conversationMemory.addMessage(message1);
            conversationMemory.addMessage(message2);
            var messages = conversationMemory.getAllMessages();
            expect(messages[0]).toEqual(message1);
            expect(messages[1]).toEqual(message2);
        });
        it('should limit history size', function () {
            // Add more messages than the maximum size
            for (var i = 0; i < 205; i++) {
                conversationMemory.addMessage(__assign(__assign({}, testMessage), { id: String(i), content: "Message ".concat(i) }));
            }
            var messages = conversationMemory.getAllMessages();
            expect(messages).toHaveLength(200); // Max size is 200
            expect(messages[messages.length - 1].content).toBe('Message 204');
        });
    });
    describe('message retrieval', function () {
        var testMessages = Array.from({ length: 5 }, function (_, i) { return ({
            id: String(i),
            role: 'user',
            content: "Message ".concat(i),
            timestamp: new Date() + i
        }); });
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, conversationMemory.initialize()];
                    case 1:
                        _a.sent();
                        testMessages.forEach(function (msg) { return conversationMemory.addMessage(msg); });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should get recent messages with limit', function () {
            var recentMessages = conversationMemory.getRecentMessages(3);
            expect(recentMessages).toHaveLength(3);
            expect(recentMessages[2].content).toBe('Message 4');
        });
        it('should search messages by content', function () {
            var searchResults = conversationMemory.searchMessages('Message 2');
            expect(searchResults).toHaveLength(1);
            expect(searchResults[0].content).toBe('Message 2');
        });
        it('should get messages by date range', function () {
            var midTime = testMessages[2].timestamp;
            var messages = conversationMemory.getMessagesByDateRange(midTime - 1, midTime + 1);
            expect(messages).toHaveLength(1);
            expect(messages[0].content).toBe('Message 2');
        });
    });
    describe('history clearing', function () {
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, conversationMemory.initialize()];
                    case 1:
                        _a.sent();
                        conversationMemory.addMessage({
                            id: '1',
                            role: 'user',
                            content: 'Test message',
                            timestamp: new Date()
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should clear conversation history', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, conversationMemory.clearHistory()];
                    case 1:
                        _a.sent();
                        expect(conversationMemory.getAllMessages()).toHaveLength(0);
                        expect(mockContext.globalState.update).toHaveBeenCalledWith('conversationMemory', []);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle errors during clearing', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockContext.globalState.update.mockRejectedValue(new Error('Clear error'));
                        return [4 /*yield*/, expect(conversationMemory.clearHistory()).rejects.toThrow('Failed to clear conversation history: Clear error')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
