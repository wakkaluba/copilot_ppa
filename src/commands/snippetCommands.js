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
exports.SnippetCommands = void 0;
var vscode = require("vscode");
var snippetManager_1 = require("../services/snippetManager");
var conversationManager_1 = require("../services/conversationManager");
var SnippetCreationService_1 = require("../services/snippets/SnippetCreationService");
var SnippetSelectionService_1 = require("../services/snippets/SnippetSelectionService");
var SnippetInsertionService_1 = require("../services/snippets/SnippetInsertionService");
var SnippetCommands = /** @class */ (function () {
    function SnippetCommands(context) {
        var snippetManager = snippetManager_1.SnippetManager.getInstance(context);
        var conversationManager = conversationManager_1.ConversationManager.getInstance(context);
        this.creationService = new SnippetCreationService_1.SnippetCreationService(snippetManager, conversationManager);
        this.selectionService = new SnippetSelectionService_1.SnippetSelectionService(snippetManager, conversationManager);
        this.insertionService = new SnippetInsertionService_1.SnippetInsertionService();
    }
    SnippetCommands.prototype.register = function () {
        var _this = this;
        return [
            vscode.commands.registerCommand(SnippetCommands.createSnippetCommandId, function (conversationId, messageIndices) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.createSnippet(conversationId, messageIndices)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }),
            vscode.commands.registerCommand(SnippetCommands.insertSnippetCommandId, function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.insertSnippet()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }),
            vscode.commands.registerCommand(SnippetCommands.manageSnippetsCommandId, function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.manageSnippets()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); })
        ];
    };
    SnippetCommands.prototype.createSnippet = function (conversationId, messageIndices) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.creationService.createSnippet(conversationId, messageIndices)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to create snippet: ".concat(error_1.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SnippetCommands.prototype.insertSnippet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var snippet, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.selectionService.selectSnippet()];
                    case 1:
                        snippet = _a.sent();
                        if (!snippet) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.insertionService.insertSnippet(snippet)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Failed to insert snippet: ".concat(error_2.message));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SnippetCommands.prototype.manageSnippets = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.commands.executeCommand('copilotPPA.openSnippetsPanel')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SnippetCommands.createSnippetCommandId = 'copilotPPA.createSnippet';
    SnippetCommands.insertSnippetCommandId = 'copilotPPA.insertSnippet';
    SnippetCommands.manageSnippetsCommandId = 'copilotPPA.manageSnippets';
    return SnippetCommands;
}());
exports.SnippetCommands = SnippetCommands;
