"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.ConversationHistory = void 0;
var events_1 = require("events");
var ConversationHistory = /** @class */ (function (_super) {
    __extends(ConversationHistory, _super);
    function ConversationHistory(context) {
        var _this = _super.call(this) || this;
        _this.conversations = new Map();
        _this.context = context;
        _this.loadFromStorage();
        return _this;
    }
    ConversationHistory.prototype.loadFromStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storedConversations;
            var _this = this;
            return __generator(this, function (_a) {
                storedConversations = this.context.globalState.get('conversationHistory', []);
                storedConversations.forEach(function (conversation) {
                    _this.conversations.set(conversation.id, conversation);
                });
                return [2 /*return*/];
            });
        });
    };
    ConversationHistory.prototype.saveToStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var conversationsArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversationsArray = Array.from(this.conversations.values());
                        return [4 /*yield*/, this.context.globalState.update('conversationHistory', conversationsArray)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConversationHistory.prototype.createConversation = function (title) {
        return __awaiter(this, void 0, void 0, function () {
            var id, conversation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = "conversation-".concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 9));
                        conversation = {
                            id: id,
                            title: title,
                            messages: [],
                            created: Date.now(),
                            updated: Date.now()
                        };
                        this.conversations.set(id, conversation);
                        return [4 /*yield*/, this.saveToStorage()];
                    case 1:
                        _a.sent();
                        this.emit('conversationCreated', conversation);
                        return [2 /*return*/, conversation];
                }
            });
        });
    };
    ConversationHistory.prototype.getConversation = function (id) {
        return this.conversations.get(id);
    };
    ConversationHistory.prototype.getAllConversations = function () {
        return Array.from(this.conversations.values());
    };
    ConversationHistory.prototype.addMessage = function (conversationId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversation = this.conversations.get(conversationId);
                        if (!conversation) {
                            throw new Error("Conversation with ID ".concat(conversationId, " not found"));
                        }
                        conversation.messages.push(message);
                        conversation.updated = Date.now();
                        return [4 /*yield*/, this.saveToStorage()];
                    case 1:
                        _a.sent();
                        this.emit('messageAdded', conversationId, message);
                        return [2 /*return*/];
                }
            });
        });
    };
    ConversationHistory.prototype.updateConversationTitle = function (conversationId, title) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversation = this.conversations.get(conversationId);
                        if (!conversation) {
                            throw new Error("Conversation with ID ".concat(conversationId, " not found"));
                        }
                        conversation.title = title;
                        conversation.updated = Date.now();
                        return [4 /*yield*/, this.saveToStorage()];
                    case 1:
                        _a.sent();
                        this.emit('conversationUpdated', conversation);
                        return [2 /*return*/];
                }
            });
        });
    };
    ConversationHistory.prototype.deleteConversation = function (conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.conversations.has(conversationId)) {
                            throw new Error("Conversation with ID ".concat(conversationId, " not found"));
                        }
                        this.conversations.delete(conversationId);
                        return [4 /*yield*/, this.saveToStorage()];
                    case 1:
                        _a.sent();
                        this.emit('conversationDeleted', conversationId);
                        return [2 /*return*/];
                }
            });
        });
    };
    ConversationHistory.prototype.clearAllConversations = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.conversations.clear();
                        return [4 /*yield*/, this.saveToStorage()];
                    case 1:
                        _a.sent();
                        this.emit('historyCleared');
                        return [2 /*return*/];
                }
            });
        });
    };
    ConversationHistory.prototype.searchConversations = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerQuery;
            return __generator(this, function (_a) {
                lowerQuery = query.toLowerCase();
                return [2 /*return*/, Array.from(this.conversations.values()).filter(function (conversation) {
                        // Search in title
                        if (conversation.title.toLowerCase().includes(lowerQuery)) {
                            return true;
                        }
                        // Search in messages
                        return conversation.messages.some(function (message) {
                            return message.content.toLowerCase().includes(lowerQuery);
                        });
                    })];
            });
        });
    };
    ConversationHistory.prototype.exportConversation = function (conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation;
            return __generator(this, function (_a) {
                conversation = this.conversations.get(conversationId);
                if (!conversation) {
                    throw new Error("Conversation with ID ".concat(conversationId, " not found"));
                }
                return [2 /*return*/, JSON.stringify(conversation, null, 2)];
            });
        });
    };
    ConversationHistory.prototype.importConversation = function (jsonData) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, newId, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        conversation = JSON.parse(jsonData);
                        // Validate required fields
                        if (!conversation.id || !conversation.title) {
                            throw new Error('Invalid conversation data: missing required fields');
                        }
                        newId = "imported-".concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 9));
                        conversation.id = newId;
                        // Set timestamps if missing
                        if (!conversation.created) {
                            conversation.created = Date.now();
                        }
                        if (!conversation.updated) {
                            conversation.updated = Date.now();
                        }
                        // Ensure messages array exists
                        if (!Array.isArray(conversation.messages)) {
                            conversation.messages = [];
                        }
                        this.conversations.set(newId, conversation);
                        return [4 /*yield*/, this.saveToStorage()];
                    case 1:
                        _a.sent();
                        this.emit('conversationImported', conversation);
                        return [2 /*return*/, conversation];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error("Failed to import conversation: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConversationHistory.prototype.dispose = function () {
        this.removeAllListeners();
    };
    return ConversationHistory;
}(events_1.EventEmitter));
exports.ConversationHistory = ConversationHistory;
