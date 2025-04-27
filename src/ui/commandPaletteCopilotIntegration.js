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
exports.registerCopilotIntegrationCommands = registerCopilotIntegrationCommands;
var vscode = require("vscode");
var copilotIntegrationWebview_1 = require("../copilot/copilotIntegrationWebview");
var CopilotCommandRegistrationService_1 = require("./services/CopilotCommandRegistrationService");
var CopilotStatusBarService_1 = require("./services/CopilotStatusBarService");
var CopilotCodeProcessingService_1 = require("./services/CopilotCodeProcessingService");
function registerCopilotIntegrationCommands(context, copilotProvider, copilotService) {
    var commandRegistrationService = new CopilotCommandRegistrationService_1.CopilotCommandRegistrationService(context, copilotService);
    var statusBarService = new CopilotStatusBarService_1.CopilotStatusBarService(context);
    var codeProcessingService = new CopilotCodeProcessingService_1.CopilotCodeProcessingService(copilotProvider);
    registerCommands(context, commandRegistrationService, statusBarService, codeProcessingService, copilotService);
    setupStatusBarUpdates(context, statusBarService);
}
function registerCommands(context, commandService, statusBarService, codeProcessingService, copilotService) {
    var _this = this;
    // Register webview command
    commandService.registerWebviewCommand(function () {
        var webview = new copilotIntegrationWebview_1.CopilotIntegrationWebview(context, copilotService);
        webview.show();
    });
    // Register provider toggle command
    commandService.registerProviderToggleCommand(function () { return __awaiter(_this, void 0, void 0, function () {
        var newProvider;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, statusBarService.toggleProvider()];
                case 1:
                    newProvider = _a.sent();
                    vscode.window.showInformationMessage("Switched to ".concat(newProvider === 'copilot' ? 'GitHub Copilot' : 'Local LLM', " as the provider."));
                    return [2 /*return*/];
            }
        });
    }); });
    // Register availability check command
    commandService.registerAvailabilityCheckCommand(function () {
        var isAvailable = copilotService.isAvailable();
        showAvailabilityMessage(isAvailable);
        return isAvailable;
    });
    // Register code selection command
    commandService.registerCodeSelectionCommand(function (editor) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, handleCodeSelection(editor, codeProcessingService)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
}
function setupStatusBarUpdates(context, statusBarService) {
    // Update status bar when settings change
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(function (e) {
        if (e.affectsConfiguration('copilot-ppa.selectedProvider')) {
            statusBarService.updateStatusBar();
        }
    }));
    // Initial status bar update
    statusBarService.updateStatusBar();
}
function handleCodeSelection(editor, codeProcessingService) {
    return __awaiter(this, void 0, void 0, function () {
        var selection, text, userPrompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    selection = editor.selection;
                    if (selection.isEmpty) {
                        vscode.window.showErrorMessage('No text selected to send to Copilot.');
                        return [2 /*return*/];
                    }
                    text = editor.document.getText(selection);
                    return [4 /*yield*/, promptForUserInput()];
                case 1:
                    userPrompt = _a.sent();
                    if (!userPrompt) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, processCodeWithProgress(text, userPrompt, codeProcessingService)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function promptForUserInput() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, vscode.window.showInputBox({
                    prompt: 'What would you like Copilot to do with this code?',
                    placeHolder: 'E.g., Explain this code, Refactor this code, Optimize this code'
                })];
        });
    });
}
function processCodeWithProgress(text, userPrompt, codeProcessingService) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: 'Processing with Copilot...',
                        cancellable: false
                    }, function () { return __awaiter(_this, void 0, void 0, function () {
                        var response, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, codeProcessingService.processCode(text, userPrompt)];
                                case 1:
                                    response = _a.sent();
                                    if (!response) return [3 /*break*/, 3];
                                    return [4 /*yield*/, showResponseInEditor(response)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [3 /*break*/, 5];
                                case 4:
                                    error_1 = _a.sent();
                                    vscode.window.showErrorMessage("Error processing with Copilot: ".concat(error_1));
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function showResponseInEditor(response) {
    return __awaiter(this, void 0, void 0, function () {
        var document;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.workspace.openTextDocument({
                        content: "# Copilot Response\n\n".concat(response.completion),
                        language: 'markdown'
                    })];
                case 1:
                    document = _a.sent();
                    return [4 /*yield*/, vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Beside })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function showAvailabilityMessage(isAvailable) {
    if (isAvailable) {
        vscode.window.showInformationMessage('GitHub Copilot is available and connected.');
    }
    else {
        vscode.window.showErrorMessage('GitHub Copilot is not available. Please make sure the extension is installed and authenticated.');
    }
}
