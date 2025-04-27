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
exports.ConfigurationCommandService = void 0;
var vscode = require("vscode");
var ConfigurationCommandService = /** @class */ (function () {
    function ConfigurationCommandService(modelService, configManager, errorHandler) {
        this.modelService = modelService;
        this.configManager = configManager;
        this.errorHandler = errorHandler;
    }
    ConfigurationCommandService.prototype.configureModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, providers, selectedProvider, endpoint, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        config = this.configManager.getConfig();
                        providers = ['ollama', 'lmstudio', 'huggingface', 'custom'];
                        return [4 /*yield*/, vscode.window.showQuickPick(providers, {
                                placeHolder: 'Select LLM provider',
                                title: 'Configure LLM Model'
                            })];
                    case 1:
                        selectedProvider = _a.sent();
                        if (!selectedProvider) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.configManager.updateConfig('llm.provider', selectedProvider)];
                    case 2:
                        _a.sent();
                        if (!(selectedProvider === 'custom')) return [3 /*break*/, 5];
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: 'Enter custom LLM endpoint URL',
                                value: config.llm.endpoint,
                                validateInput: this.validateEndpointUrl
                            })];
                    case 3:
                        endpoint = _a.sent();
                        if (!endpoint) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.configManager.updateConfig('llm.endpoint', endpoint)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, vscode.window.showInformationMessage("Model provider updated to ".concat(selectedProvider))];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_1 = _a.sent();
                        this.errorHandler.handle('Failed to configure model', error_1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    ConfigurationCommandService.prototype.clearConversation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.modelService.dispose()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, vscode.window.showInformationMessage('Conversation history cleared')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.errorHandler.handle('Failed to clear conversation', error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ConfigurationCommandService.prototype.validateEndpointUrl = function (url) {
        try {
            new URL(url);
            return undefined;
        }
        catch (_a) {
            return 'Please enter a valid URL';
        }
    };
    return ConfigurationCommandService;
}());
exports.ConfigurationCommandService = ConfigurationCommandService;
