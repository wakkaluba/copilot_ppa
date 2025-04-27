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
exports.SnippetManager = void 0;
var vscode = require("vscode");
var SnippetManager = /** @class */ (function () {
    function SnippetManager(context) {
        this.snippets = new Map();
        this._onSnippetAdded = new vscode.EventEmitter();
        this._onSnippetUpdated = new vscode.EventEmitter();
        this._onSnippetDeleted = new vscode.EventEmitter();
        this.onSnippetAdded = this._onSnippetAdded.event;
        this.onSnippetUpdated = this._onSnippetUpdated.event;
        this.onSnippetDeleted = this._onSnippetDeleted.event;
        this.storage = context.globalState;
        this.loadSnippets();
    }
    SnippetManager.getInstance = function (context) {
        if (!SnippetManager.instance && context) {
            SnippetManager.instance = new SnippetManager(context);
        }
        return SnippetManager.instance;
    };
    /**
     * Create a new snippet from selected messages
     */
    SnippetManager.prototype.createSnippet = function (title_1, messages_1) {
        return __awaiter(this, arguments, void 0, function (title, messages, tags, sourceConversationId) {
            var content, snippet;
            if (tags === void 0) { tags = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        content = this.formatMessagesAsContent(messages);
                        snippet = {
                            id: this.generateId(),
                            title: title,
                            content: content,
                            messages: messages,
                            tags: tags,
                            sourceConversationId: sourceConversationId,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        };
                        this.snippets.set(snippet.id, snippet);
                        return [4 /*yield*/, this.saveSnippets()];
                    case 1:
                        _a.sent();
                        this._onSnippetAdded.fire(snippet);
                        return [2 /*return*/, snippet];
                }
            });
        });
    };
    /**
     * Create a new snippet from raw content
     */
    SnippetManager.prototype.createSnippetFromContent = function (title_1, content_1) {
        return __awaiter(this, arguments, void 0, function (title, content, tags) {
            var message, snippet;
            if (tags === void 0) { tags = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = {
                            id: this.generateMessageId(),
                            role: 'assistant',
                            content: content,
                            timestamp: new Date()
                        };
                        snippet = {
                            id: this.generateId(),
                            title: title,
                            content: content,
                            messages: [message],
                            tags: tags,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        };
                        this.snippets.set(snippet.id, snippet);
                        return [4 /*yield*/, this.saveSnippets()];
                    case 1:
                        _a.sent();
                        this._onSnippetAdded.fire(snippet);
                        return [2 /*return*/, snippet];
                }
            });
        });
    };
    /**
     * Get a snippet by ID
     */
    SnippetManager.prototype.getSnippet = function (snippetId) {
        return this.snippets.get(snippetId);
    };
    /**
     * Get all snippets
     */
    SnippetManager.prototype.getAllSnippets = function () {
        return Array.from(this.snippets.values());
    };
    /**
     * Update an existing snippet
     */
    SnippetManager.prototype.updateSnippet = function (snippetId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var snippet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        snippet = this.snippets.get(snippetId);
                        if (!snippet) {
                            return [2 /*return*/, undefined];
                        }
                        // Apply updates
                        Object.assign(snippet, __assign(__assign({}, updates), { updatedAt: Date.now() }));
                        // If messages were updated, regenerate content
                        if (updates.messages) {
                            snippet.content = this.formatMessagesAsContent(snippet.messages);
                        }
                        return [4 /*yield*/, this.saveSnippets()];
                    case 1:
                        _a.sent();
                        this._onSnippetUpdated.fire(snippet);
                        return [2 /*return*/, snippet];
                }
            });
        });
    };
    /**
     * Delete a snippet
     */
    SnippetManager.prototype.deleteSnippet = function (snippetId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.snippets.has(snippetId)) {
                            return [2 /*return*/, false];
                        }
                        this.snippets.delete(snippetId);
                        return [4 /*yield*/, this.saveSnippets()];
                    case 1:
                        _a.sent();
                        this._onSnippetDeleted.fire(snippetId);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Search snippets by title, content, or tags
     */
    SnippetManager.prototype.searchSnippets = function (query, searchInTags) {
        if (searchInTags === void 0) { searchInTags = true; }
        if (!query.trim()) {
            return this.getAllSnippets();
        }
        var lowerQuery = query.toLowerCase();
        return Array.from(this.snippets.values()).filter(function (snippet) {
            return snippet.title.toLowerCase().includes(lowerQuery) ||
                snippet.content.toLowerCase().includes(lowerQuery) ||
                (searchInTags && snippet.tags.some(function (tag) { return tag.toLowerCase().includes(lowerQuery); }));
        });
    };
    /**
     * Find snippets by tag
     */
    SnippetManager.prototype.findSnippetsByTag = function (tag) {
        var lowerTag = tag.toLowerCase();
        return Array.from(this.snippets.values()).filter(function (snippet) {
            return snippet.tags.some(function (t) { return t.toLowerCase() === lowerTag; });
        });
    };
    /**
     * Get all unique tags used across snippets
     */
    SnippetManager.prototype.getAllTags = function () {
        var tags = new Set();
        for (var _i = 0, _a = this.snippets.values(); _i < _a.length; _i++) {
            var snippet = _a[_i];
            snippet.tags.forEach(function (tag) { return tags.add(tag); });
        }
        return Array.from(tags);
    };
    /**
     * Format messages as readable content
     */
    SnippetManager.prototype.formatMessagesAsContent = function (messages) {
        return messages.map(function (msg) {
            var roleLabel = msg.role === 'user' ? 'User' :
                msg.role === 'assistant' ? 'Assistant' : 'System';
            return "".concat(roleLabel, ": ").concat(msg.content);
        }).join('\n\n');
    };
    /**
     * Generate a unique ID for a snippet
     */
    SnippetManager.prototype.generateId = function () {
        return "snippet_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
    };
    /**
     * Generate a unique ID for a message
     */
    SnippetManager.prototype.generateMessageId = function () {
        return "msg_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9));
    };
    /**
     * Save snippets to storage
     */
    SnippetManager.prototype.saveSnippets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var snippetsArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        snippetsArray = Array.from(this.snippets.values());
                        return [4 /*yield*/, this.storage.update('snippets', snippetsArray)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load snippets from storage
     */
    SnippetManager.prototype.loadSnippets = function () {
        var snippetsArray = this.storage.get('snippets') || [];
        for (var _i = 0, snippetsArray_1 = snippetsArray; _i < snippetsArray_1.length; _i++) {
            var snippet = snippetsArray_1[_i];
            this.snippets.set(snippet.id, snippet);
        }
    };
    return SnippetManager;
}());
exports.SnippetManager = SnippetManager;
