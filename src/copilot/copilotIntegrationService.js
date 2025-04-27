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
exports.CopilotIntegrationService = void 0;
var vscode = require("vscode");
/**
 * Service for integrating with GitHub Copilot
 */
var CopilotIntegrationService = /** @class */ (function () {
    /**
     * Creates a new instance of the CopilotIntegrationService
     * @param context The extension context
     */
    function CopilotIntegrationService(context) {
        this.isInitialized = false;
        this.extensionContext = context;
        this.initialize();
    }
    /**
     * Initializes the service and connects to the Copilot extension
     */
    CopilotIntegrationService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Find the GitHub Copilot extension
                        this.copilotExtension = vscode.extensions.getExtension('GitHub.copilot');
                        if (!this.copilotExtension) {
                            vscode.window.showWarningMessage('GitHub Copilot extension is not installed or not enabled.');
                            return [2 /*return*/];
                        }
                        if (!!this.copilotExtension.isActive) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.copilotExtension.activate()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.isInitialized = true;
                        vscode.window.showInformationMessage('Successfully connected to GitHub Copilot.');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to initialize Copilot integration:', error_1);
                        vscode.window.showErrorMessage("Failed to initialize Copilot integration: ".concat(error_1));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks if the Copilot integration is available
     */
    CopilotIntegrationService.prototype.isAvailable = function () {
        var _a;
        return this.isInitialized && !!((_a = this.copilotExtension) === null || _a === void 0 ? void 0 : _a.isActive);
    };
    /**
     * Sends a prompt to Copilot and returns the response
     * @param request The request to send to Copilot
     */
    CopilotIntegrationService.prototype.sendPrompt = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var copilotApi, response, error_2;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!!this.isAvailable()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _f.sent();
                        if (!this.isAvailable()) {
                            throw new Error('GitHub Copilot is not available');
                        }
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 4, , 5]);
                        copilotApi = (_a = this.copilotExtension) === null || _a === void 0 ? void 0 : _a.exports;
                        return [4 /*yield*/, copilotApi.provideSuggestion({
                                prompt: request.prompt,
                                context: request.context || '',
                                options: {
                                    temperature: ((_b = request.options) === null || _b === void 0 ? void 0 : _b.temperature) || 0.7,
                                    maxTokens: ((_c = request.options) === null || _c === void 0 ? void 0 : _c.maxTokens) || 800,
                                    stopSequences: ((_d = request.options) === null || _d === void 0 ? void 0 : _d.stopSequences) || [],
                                    model: ((_e = request.options) === null || _e === void 0 ? void 0 : _e.model) || 'default'
                                }
                            })];
                    case 3:
                        response = _f.sent();
                        return [2 /*return*/, {
                                completion: response.suggestion || '',
                                model: response.model,
                                finishReason: response.finishReason
                            }];
                    case 4:
                        error_2 = _f.sent();
                        console.error('Error sending prompt to Copilot:', error_2);
                        throw new Error("Failed to get response from Copilot: ".concat(error_2));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Forwards a chat message to the Copilot chat interface
     * @param message The message to send
     */
    CopilotIntegrationService.prototype.sendToCopilotChat = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isAvailable()) {
                            throw new Error('GitHub Copilot is not available');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // This is conceptual - the actual API call will depend on Copilot's public API
                        return [4 /*yield*/, vscode.commands.executeCommand('github.copilot.chat.sendToCopilotChat', message)];
                    case 2:
                        // This is conceptual - the actual API call will depend on Copilot's public API
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error sending message to Copilot Chat:', error_3);
                        throw new Error("Failed to send message to Copilot Chat: ".concat(error_3));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Registers a callback for Copilot chat responses
     * @param callback The callback function to call when a response is received
     */
    CopilotIntegrationService.prototype.registerChatResponseCallback = function (callback) {
        // This is conceptual - the actual event subscription will depend on Copilot's public API
        var disposable = vscode.workspace.onDidChangeConfiguration(function (event) {
            if (event.affectsConfiguration('github.copilot.chat.lastResponse')) {
                var response = vscode.workspace.getConfiguration('github.copilot.chat').get('lastResponse');
                if (response) {
                    callback(response);
                }
            }
        });
        this.extensionContext.subscriptions.push(disposable);
        return disposable;
    };
    return CopilotIntegrationService;
}());
exports.CopilotIntegrationService = CopilotIntegrationService;
