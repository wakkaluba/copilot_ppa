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
exports.ConversationImportCommand = void 0;
var vscode = require("vscode");
var conversationManager_1 = require("../services/conversationManager");
var ConversationImportCommand = /** @class */ (function () {
    function ConversationImportCommand(context) {
        this.conversationManager = conversationManager_1.ConversationManager.getInstance(context);
    }
    ConversationImportCommand.prototype.register = function () {
        var _this = this;
        return vscode.commands.registerCommand(ConversationImportCommand.commandId, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.importConversation()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ConversationImportCommand.prototype.importConversation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filepath, replaceExisting, importedConversations, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getOpenFilePath()];
                    case 1:
                        filepath = _a.sent();
                        if (!filepath) {
                            return [2 /*return*/]; // User cancelled
                        }
                        return [4 /*yield*/, this.shouldReplaceExisting()];
                    case 2:
                        replaceExisting = _a.sent();
                        return [4 /*yield*/, this.conversationManager.importConversations(filepath, replaceExisting)];
                    case 3:
                        importedConversations = _a.sent();
                        if (importedConversations.length > 0) {
                            vscode.window.showInformationMessage("Successfully imported ".concat(importedConversations.length, " conversation(s)"));
                        }
                        else {
                            vscode.window.showWarningMessage('No conversations were imported');
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Import failed: ".concat(error_1.message));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ConversationImportCommand.prototype.getOpenFilePath = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options, fileUri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            canSelectFiles: true,
                            canSelectFolders: false,
                            canSelectMany: false,
                            filters: {
                                'JSON Files': ['json'],
                                'All Files': ['*']
                            },
                            openLabel: 'Import'
                        };
                        return [4 /*yield*/, vscode.window.showOpenDialog(options)];
                    case 1:
                        fileUri = _a.sent();
                        if (fileUri && fileUri.length > 0) {
                            return [2 /*return*/, fileUri[0].fsPath];
                        }
                        return [2 /*return*/, undefined];
                }
            });
        });
    };
    ConversationImportCommand.prototype.shouldReplaceExisting = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options, selection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = [
                            { label: 'Yes', description: 'Replace existing conversations with the same ID' },
                            { label: 'No', description: 'Generate new IDs for imported conversations with duplicate IDs' }
                        ];
                        return [4 /*yield*/, vscode.window.showQuickPick(options, {
                                placeHolder: 'Replace existing conversations?'
                            })];
                    case 1:
                        selection = _a.sent();
                        return [2 /*return*/, (selection === null || selection === void 0 ? void 0 : selection.label) === 'Yes'];
                }
            });
        });
    };
    ConversationImportCommand.commandId = 'copilotPPA.importConversation';
    return ConversationImportCommand;
}());
exports.ConversationImportCommand = ConversationImportCommand;
