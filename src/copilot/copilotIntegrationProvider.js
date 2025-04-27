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
exports.CopilotIntegrationProvider = void 0;
var vscode = require("vscode");
var copilotIntegrationService_1 = require("./copilotIntegrationService");
var multilingualPromptManager_1 = require("../llm/multilingualPromptManager");
/**
 * Provider for Copilot integration functionality
 */
var CopilotIntegrationProvider = /** @class */ (function () {
    /**
     * Creates a new instance of the CopilotIntegrationProvider
     * @param context The extension context
     */
    function CopilotIntegrationProvider(context) {
        this.context = context;
        this.disposables = [];
        this.copilotService = new copilotIntegrationService_1.CopilotIntegrationService(context);
        this.promptManager = new multilingualPromptManager_1.MultilingualPromptManager();
        this.registerCommands();
    }
    /**
     * Registers commands for Copilot integration
     */
    CopilotIntegrationProvider.prototype.registerCommands = function () {
        var _this = this;
        // Register commands for Copilot integration
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.forwardToCopilot', function (text) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.forwardToCopilot(text)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }), vscode.commands.registerCommand('copilot-ppa.sendToCopilotChat', function (text) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendToCopilotChat(text)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }), vscode.commands.registerCommand('copilot-ppa.getCompletionFromCopilot', function (prompt) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCompletionFromCopilot(prompt)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }));
    };
    /**
     * Forwards text to Copilot for processing
     * @param text The text to forward to Copilot
     */
    CopilotIntegrationProvider.prototype.forwardToCopilot = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var enhancedPrompt, request, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        enhancedPrompt = this.promptManager.enhancePromptWithLanguage(text);
                        request = {
                            prompt: enhancedPrompt,
                            options: {
                                temperature: 0.7,
                                maxTokens: 800
                            }
                        };
                        return [4 /*yield*/, this.copilotService.sendPrompt(request)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Error forwarding to Copilot: ".concat(error_1));
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sends text to the Copilot chat interface
     * @param text The text to send to Copilot chat
     */
    CopilotIntegrationProvider.prototype.sendToCopilotChat = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var enhancedPrompt, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        enhancedPrompt = this.promptManager.enhancePromptWithLanguage(text);
                        return [4 /*yield*/, this.copilotService.sendToCopilotChat(enhancedPrompt)];
                    case 1:
                        _a.sent();
                        vscode.window.showInformationMessage('Message sent to Copilot Chat');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Error sending to Copilot Chat: ".concat(error_2));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets a completion from Copilot for the given prompt
     * @param prompt The prompt to send to Copilot
     */
    CopilotIntegrationProvider.prototype.getCompletionFromCopilot = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var enhancedPrompt, request, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        enhancedPrompt = this.promptManager.enhancePromptWithLanguage(prompt);
                        request = {
                            prompt: enhancedPrompt,
                            options: {
                                temperature: 0.2, // Lower temperature for more deterministic completions
                                maxTokens: 500
                            }
                        };
                        return [4 /*yield*/, this.copilotService.sendPrompt(request)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, (response === null || response === void 0 ? void 0 : response.completion) || null];
                    case 2:
                        error_3 = _a.sent();
                        vscode.window.showErrorMessage("Error getting completion from Copilot: ".concat(error_3));
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Registers a callback for Copilot chat responses
     * @param callback The callback function to call when a response is received
     */
    CopilotIntegrationProvider.prototype.registerChatResponseCallback = function (callback) {
        return this.copilotService.registerChatResponseCallback(callback);
    };
    /**
     * Disposes of resources
     */
    CopilotIntegrationProvider.prototype.dispose = function () {
        for (var _i = 0, _a = this.disposables; _i < _a.length; _i++) {
            var disposable = _a[_i];
            disposable.dispose();
        }
    };
    return CopilotIntegrationProvider;
}());
exports.CopilotIntegrationProvider = CopilotIntegrationProvider;
