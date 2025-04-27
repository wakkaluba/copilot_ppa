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
exports.ConversationSearchService = void 0;
var vscode = require("vscode");
var ConversationSearchService = /** @class */ (function () {
    function ConversationSearchService(conversationManager) {
        this.lastResults = [];
        this._onSearchResultsChanged = new vscode.EventEmitter();
        this.onSearchResultsChanged = this._onSearchResultsChanged.event;
        this.conversationManager = conversationManager;
    }
    ConversationSearchService.getInstance = function (conversationManager) {
        if (!ConversationSearchService.instance) {
            ConversationSearchService.instance = new ConversationSearchService(conversationManager);
        }
        return ConversationSearchService.instance;
    };
    ConversationSearchService.prototype.search = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var allConversations, results, _i, allConversations_1, conversation, messageMatches, score;
            return __generator(this, function (_a) {
                allConversations = this.conversationManager.getConversations();
                results = [];
                for (_i = 0, allConversations_1 = allConversations; _i < allConversations_1.length; _i++) {
                    conversation = allConversations_1[_i];
                    messageMatches = this.findMatchingMessages(conversation, options.query);
                    if (messageMatches.length > 0) {
                        score = this.calculateRelevanceScore(messageMatches, options.query);
                        results.push({
                            conversation: conversation,
                            messageMatches: messageMatches,
                            score: score
                        });
                    }
                }
                // Sort by score descending
                results.sort(function (a, b) { return b.score - a.score; });
                this.lastResults = results;
                this._onSearchResultsChanged.fire(results);
                return [2 /*return*/, results];
            });
        });
    };
    ConversationSearchService.prototype.filter = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var allConversations;
            return __generator(this, function (_a) {
                allConversations = this.conversationManager.getConversations();
                return [2 /*return*/, allConversations.filter(function (conversation) {
                        // Apply date filters
                        if (filters.dateFrom && conversation.created < filters.dateFrom) {
                            return false;
                        }
                        if (filters.dateTo && conversation.created > filters.dateTo) {
                            return false;
                        }
                        // Apply message type filters
                        if (filters.onlyUserMessages || filters.onlyAssistantMessages) {
                            var hasMatchingMessage = conversation.messages.some(function (message) {
                                if (filters.onlyUserMessages && message.role === 'user') {
                                    return true;
                                }
                                if (filters.onlyAssistantMessages && message.role === 'assistant') {
                                    return true;
                                }
                                return false;
                            });
                            if (!hasMatchingMessage) {
                                return false;
                            }
                        }
                        return true;
                    })];
            });
        });
    };
    ConversationSearchService.prototype.findMatchingMessages = function (conversation, query) {
        var matches = [];
        var queryLower = query.toLowerCase();
        conversation.messages.forEach(function (message, index) {
            var contentLower = message.content.toLowerCase();
            var position = contentLower.indexOf(queryLower);
            if (position !== -1) {
                matches.push({
                    messageIndex: index,
                    content: message.content,
                    highlights: [{
                            start: position,
                            end: position + query.length
                        }]
                });
            }
        });
        return matches;
    };
    ConversationSearchService.prototype.calculateRelevanceScore = function (matches, query) {
        var score = 0;
        for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
            var match = matches_1[_i];
            // More recent messages get higher scores
            var recencyBonus = 1 + (match.messageIndex * 0.1);
            // More matches in the same message increase the score
            var matchCount = match.highlights.length;
            // Exact matches get higher scores
            var exactMatchBonus = match.content.toLowerCase().includes(query.toLowerCase()) ? 1.5 : 1;
            score += recencyBonus * matchCount * exactMatchBonus;
        }
        return score;
    };
    ConversationSearchService.prototype.getLastResults = function () {
        return this.lastResults;
    };
    ConversationSearchService.prototype.dispose = function () {
        this._onSearchResultsChanged.dispose();
    };
    return ConversationSearchService;
}());
exports.ConversationSearchService = ConversationSearchService;
