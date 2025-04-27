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
exports.ConversationExportCommand = void 0;
var vscode = require("vscode");
var conversationManager_1 = require("../services/conversationManager");
var ConversationExportService_1 = require("../services/conversation/ConversationExportService");
var FileDialogService_1 = require("../services/dialog/FileDialogService");
var ConversationSelectionService_1 = require("../services/conversation/ConversationSelectionService");
var ConversationExportCommand = /** @class */ (function () {
    function ConversationExportCommand(context) {
        var conversationManager = conversationManager_1.ConversationManager.getInstance(context);
        this.exportService = new ConversationExportService_1.ConversationExportService(conversationManager);
        this.fileDialogService = new FileDialogService_1.FileDialogService();
        this.selectionService = new ConversationSelectionService_1.ConversationSelectionService(conversationManager);
    }
    ConversationExportCommand.prototype.register = function () {
        var _this = this;
        return [
            vscode.commands.registerCommand(ConversationExportCommand.commandId, function (conversationId) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.exportConversation(conversationId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }),
            vscode.commands.registerCommand(ConversationExportCommand.exportAllCommandId, function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.exportAllConversations()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); })
        ];
    };
    ConversationExportCommand.prototype.exportConversation = function (conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var filepath, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!!conversationId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.selectionService.selectConversation('Select a conversation to export')];
                    case 1:
                        conversationId = _a.sent();
                        if (!conversationId) {
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.fileDialogService.getSaveFilePath('conversation.json', ['json'])];
                    case 3:
                        filepath = _a.sent();
                        if (!filepath) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.exportService.exportConversation(conversationId, filepath)];
                    case 4:
                        _a.sent();
                        vscode.window.showInformationMessage("Conversation exported successfully");
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Export failed: ".concat(error_1.message));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ConversationExportCommand.prototype.exportAllConversations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filepath, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.fileDialogService.getSaveFilePath('all_conversations.json', ['json'])];
                    case 1:
                        filepath = _a.sent();
                        if (!filepath) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.exportService.exportAllConversations(filepath)];
                    case 2:
                        _a.sent();
                        vscode.window.showInformationMessage("All conversations exported successfully");
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Export failed: ".concat(error_2.message));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ConversationExportCommand.commandId = 'copilotPPA.exportConversation';
    ConversationExportCommand.exportAllCommandId = 'copilotPPA.exportAllConversations';
    return ConversationExportCommand;
}());
exports.ConversationExportCommand = ConversationExportCommand;
