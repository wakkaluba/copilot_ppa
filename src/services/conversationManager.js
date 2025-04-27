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
exports.ConversationManager = void 0;
var WorkspaceManager_1 = require("./WorkspaceManager");
var ConversationManager = /** @class */ (function () {
    function ConversationManager() {
        this.currentConversation = null;
        this.historyPath = 'conversations';
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
    }
    ConversationManager.getInstance = function () {
        if (!this.instance) {
            this.instance = new ConversationManager();
        }
        return this.instance;
    };
    ConversationManager.prototype.startNewConversation = function (title) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.saveCurrentConversation()];
                    case 1:
                        _a.sent();
                        this.currentConversation = {
                            id: this.generateId(),
                            title: title,
                            messages: [],
                            created: Date.now(),
                            updated: Date.now()
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    ConversationManager.prototype.addMessage = function (role, content) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.currentConversation) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.startNewConversation('New Conversation')];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        message = {
                            role: role,
                            content: content,
                            timestamp: new Date()
                        };
                        this.currentConversation.messages.push(message);
                        this.currentConversation.updated = Date.now();
                        return [4 /*yield*/, this.autoSave()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConversationManager.prototype.loadConversation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath, content, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        filePath = "".concat(this.historyPath, "/").concat(id, ".json");
                        return [4 /*yield*/, this.workspaceManager.readFile(filePath)];
                    case 1:
                        content = _b.sent();
                        this.currentConversation = JSON.parse(content);
                        return [2 /*return*/, true];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConversationManager.prototype.listConversations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, conversations, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.workspaceManager.listFiles(this.historyPath)];
                    case 1:
                        files = _b.sent();
                        return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                                var content, conv;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.workspaceManager.readFile(file)];
                                        case 1:
                                            content = _a.sent();
                                            conv = JSON.parse(content);
                                            return [2 /*return*/, {
                                                    id: conv.id,
                                                    title: conv.title,
                                                    updated: conv.updated
                                                }];
                                    }
                                });
                            }); }))];
                    case 2:
                        conversations = _b.sent();
                        return [2 /*return*/, conversations.sort(function (a, b) { return b.updated - a.updated; })];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ConversationManager.prototype.getCurrentContext = function (maxMessages) {
        if (maxMessages === void 0) { maxMessages = 10; }
        if (!this.currentConversation) {
            return [];
        }
        return this.currentConversation.messages.slice(-maxMessages);
    };
    ConversationManager.prototype.autoSave = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentConversation) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.saveCurrentConversation()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ConversationManager.prototype.saveCurrentConversation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentConversation) {
                            return [2 /*return*/];
                        }
                        filePath = "".concat(this.historyPath, "/").concat(this.currentConversation.id, ".json");
                        return [4 /*yield*/, this.workspaceManager.createDirectory(this.historyPath)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.workspaceManager.writeFile(filePath, JSON.stringify(this.currentConversation, null, 2))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConversationManager.prototype.generateId = function () {
        return "conv_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2));
    };
    return ConversationManager;
}());
exports.ConversationManager = ConversationManager;
