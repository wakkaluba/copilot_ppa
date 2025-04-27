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
exports.ConversationSearchCommand = void 0;
var vscode = require("vscode");
var conversationManager_1 = require("../services/conversationManager");
var conversationSearchService_1 = require("../services/conversationSearchService");
var ConversationSearchCommand = /** @class */ (function () {
    function ConversationSearchCommand(context) {
        this.conversationManager = conversationManager_1.ConversationManager.getInstance(context);
        this.searchService = conversationSearchService_1.ConversationSearchService.getInstance(this.conversationManager);
    }
    ConversationSearchCommand.prototype.register = function () {
        var _this = this;
        return vscode.commands.registerCommand(ConversationSearchCommand.commandId, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeSearch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ConversationSearchCommand.prototype.executeSearch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, searchOptions, results, selectedResult, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.showInputBox({
                            placeHolder: 'Search in conversations...',
                            prompt: 'Enter search term',
                            ignoreFocusOut: true
                        })];
                    case 1:
                        query = _a.sent();
                        if (!query) {
                            return [2 /*return*/]; // User cancelled
                        }
                        return [4 /*yield*/, this.getSearchOptions(query)];
                    case 2:
                        searchOptions = _a.sent();
                        if (!searchOptions) {
                            return [2 /*return*/]; // User cancelled
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.searchService.search(searchOptions)];
                    case 4:
                        results = _a.sent();
                        if (results.length === 0) {
                            vscode.window.showInformationMessage('No matching conversations found.');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.showSearchResults(results)];
                    case 5:
                        selectedResult = _a.sent();
                        if (selectedResult) {
                            // Open the selected conversation
                            vscode.commands.executeCommand('copilotPPA.openConversation', selectedResult.conversation.id);
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Search failed: ".concat(error_1.message));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ConversationSearchCommand.prototype.getSearchOptions = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var options, selected, advancedOptions, selectedOptions, searchOptions, fromDateStr, toDateStr, fromDate, toDate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = [
                            { label: 'Basic Search', description: 'Search with default options' },
                            { label: 'Advanced Search', description: 'Configure search options' }
                        ];
                        return [4 /*yield*/, vscode.window.showQuickPick(options, {
                                placeHolder: 'Search options',
                                ignoreFocusOut: true
                            })];
                    case 1:
                        selected = _a.sent();
                        if (!selected) {
                            return [2 /*return*/, undefined]; // User cancelled
                        }
                        if (selected.label === 'Basic Search') {
                            return [2 /*return*/, { query: query }];
                        }
                        advancedOptions = [
                            { label: 'Search in titles', picked: true },
                            { label: 'Search in content', picked: true },
                            { label: 'Case sensitive', picked: false },
                            { label: 'Use regular expression', picked: false },
                            { label: 'Only user messages', picked: false },
                            { label: 'Only assistant messages', picked: false }
                        ];
                        return [4 /*yield*/, vscode.window.showQuickPick(advancedOptions, {
                                placeHolder: 'Select search options',
                                canPickMany: true,
                                ignoreFocusOut: true
                            })];
                    case 2:
                        selectedOptions = _a.sent();
                        if (!selectedOptions) {
                            return [2 /*return*/, undefined]; // User cancelled
                        }
                        searchOptions = {
                            query: query,
                            searchInTitles: selectedOptions.some(function (opt) { return opt.label === 'Search in titles'; }),
                            searchInContent: selectedOptions.some(function (opt) { return opt.label === 'Search in content'; }),
                            caseSensitive: selectedOptions.some(function (opt) { return opt.label === 'Case sensitive'; }),
                            useRegex: selectedOptions.some(function (opt) { return opt.label === 'Use regular expression'; }),
                            onlyUserMessages: selectedOptions.some(function (opt) { return opt.label === 'Only user messages'; }),
                            onlyAssistantMessages: selectedOptions.some(function (opt) { return opt.label === 'Only assistant messages'; })
                        };
                        if (!selectedOptions.some(function (opt) { return opt.label === 'Limit by date'; })) return [3 /*break*/, 5];
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: 'From date (YYYY-MM-DD), leave empty for no lower limit',
                                placeHolder: 'YYYY-MM-DD'
                            })];
                    case 3:
                        fromDateStr = _a.sent();
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: 'To date (YYYY-MM-DD), leave empty for no upper limit',
                                placeHolder: 'YYYY-MM-DD'
                            })];
                    case 4:
                        toDateStr = _a.sent();
                        if (fromDateStr) {
                            fromDate = new Date(fromDateStr);
                            if (!isNaN(fromDate.getTime())) {
                                searchOptions.dateFrom = fromDate.getTime();
                            }
                        }
                        if (toDateStr) {
                            toDate = new Date(toDateStr);
                            if (!isNaN(toDate.getTime())) {
                                searchOptions.dateTo = toDate.getTime() + 86400000; // Include the end date (add one day)
                            }
                        }
                        _a.label = 5;
                    case 5: return [2 /*return*/, searchOptions];
                }
            });
        });
    };
    ConversationSearchCommand.prototype.showSearchResults = function (results) {
        return __awaiter(this, void 0, void 0, function () {
            var items, selected;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        items = results.map(function (result) {
                            var conversation = result.conversation;
                            // Format the match information
                            var matchInfo = '';
                            if (result.titleMatch) {
                                matchInfo += 'Title match';
                            }
                            if (result.matches.length > 0) {
                                if (matchInfo) {
                                    matchInfo += ', ';
                                }
                                matchInfo += "".concat(result.matches.length, " message match(es)");
                            }
                            return {
                                label: conversation.title,
                                description: matchInfo,
                                detail: "Last updated: ".concat(new Date(conversation.updatedAt).toLocaleString(), " \u00B7 ").concat(conversation.messages.length, " messages"),
                                result: result
                            };
                        });
                        return [4 /*yield*/, vscode.window.showQuickPick(items, {
                                placeHolder: 'Select a conversation to open',
                                matchOnDescription: true,
                                matchOnDetail: true
                            })];
                    case 1:
                        selected = _a.sent();
                        return [2 /*return*/, selected === null || selected === void 0 ? void 0 : selected.result];
                }
            });
        });
    };
    ConversationSearchCommand.commandId = 'copilotPPA.searchConversations';
    return ConversationSearchCommand;
}());
exports.ConversationSearchCommand = ConversationSearchCommand;
