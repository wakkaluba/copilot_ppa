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
exports.LLMProviderManager = void 0;
var connectionStatusService_1 = require("../status/connectionStatusService");
var MultilingualManager_1 = require("./i18n/MultilingualManager");
var LLMProviderManager = /** @class */ (function () {
    function LLMProviderManager(connectionStatusService) {
        this._providers = new Map();
        this._activeProvider = null;
        this.connectionStatusService = connectionStatusService;
        this.multilingualManager = new MultilingualManager_1.MultilingualManager();
    }
    LLMProviderManager.prototype.registerProvider = function (id, provider) {
        this._providers.set(id, provider);
    };
    LLMProviderManager.prototype.setActiveProvider = function (id) {
        var provider = this._providers.get(id);
        if (provider) {
            this._activeProvider = provider;
            return true;
        }
        return false;
    };
    LLMProviderManager.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._activeProvider) {
                            throw new Error('No LLM provider is active');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._activeProvider.connect()];
                    case 2:
                        _a.sent();
                        this.connectionStatusService.setState(connectionStatusService_1.ConnectionState.Connected, {
                            modelName: this._activeProvider.getActiveModel(),
                            providerName: this._activeProvider.getName()
                        });
                        this.connectionStatusService.showNotification('Connected to LLM provider');
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        this.connectionStatusService.setState(connectionStatusService_1.ConnectionState.Error, { error: error_1 instanceof Error ? error_1.message : String(error_1) });
                        this.connectionStatusService.showNotification("Failed to connect to LLM: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)), 'error');
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LLMProviderManager.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._activeProvider) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._activeProvider.disconnect()];
                    case 2:
                        _a.sent();
                        this.connectionStatusService.setState(connectionStatusService_1.ConnectionState.Disconnected);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.connectionStatusService.setState(connectionStatusService_1.ConnectionState.Error);
                        this.connectionStatusService.showNotification("Failed to disconnect from LLM: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)), 'error');
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LLMProviderManager.prototype.setActiveModel = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this._activeProvider) {
                    throw new Error('No LLM provider is active');
                }
                this._activeProvider.setActiveModel(modelId);
                this.connectionStatusService.setState(connectionStatusService_1.ConnectionState.Connected, {
                    modelName: modelId,
                    providerName: this._activeProvider.getName()
                });
                return [2 /*return*/];
            });
        });
    };
    LLMProviderManager.prototype.sendPromptWithLanguage = function (prompt, options, targetLanguage) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, language, enhancedPrompt, response, correctionPrompt, correctedResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = this.getActiveProvider();
                        if (!provider) {
                            throw new Error('No LLM provider is currently connected');
                        }
                        language = targetLanguage || 'en';
                        enhancedPrompt = this.multilingualManager.enhancePromptWithLanguage(prompt, language);
                        return [4 /*yield*/, provider.generateCompletion(provider.getActiveModel(), enhancedPrompt, undefined, options)];
                    case 1:
                        response = _a.sent();
                        if (!!this.multilingualManager.isResponseInExpectedLanguage(response.content, language)) return [3 /*break*/, 3];
                        correctionPrompt = this.multilingualManager.buildLanguageCorrectionPrompt(prompt, response.content, language);
                        return [4 /*yield*/, provider.generateCompletion(provider.getActiveModel(), correctionPrompt, undefined, options)];
                    case 2:
                        correctedResponse = _a.sent();
                        return [2 /*return*/, correctedResponse.content];
                    case 3: return [2 /*return*/, response.content];
                }
            });
        });
    };
    LLMProviderManager.prototype.sendStreamingPrompt = function (prompt, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = this.getActiveProvider();
                        if (!provider) {
                            throw new Error('No LLM provider is currently connected');
                        }
                        return [4 /*yield*/, provider.streamCompletion(provider.getActiveModel(), prompt, undefined, undefined, function (event) { return callback(event.content); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LLMProviderManager.prototype.getActiveProvider = function () {
        return this._activeProvider;
    };
    LLMProviderManager.prototype.getActiveModelName = function () {
        var _a;
        return ((_a = this._activeProvider) === null || _a === void 0 ? void 0 : _a.getActiveModel()) || null;
    };
    LLMProviderManager.prototype.setOfflineMode = function (enabled) {
        var provider = this._activeProvider;
        if (provider === null || provider === void 0 ? void 0 : provider.setOfflineMode) {
            provider.setOfflineMode(enabled);
        }
    };
    LLMProviderManager.prototype.sendPrompt = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = this.getActiveProvider();
                        if (!provider) {
                            throw new Error('No LLM provider is currently connected');
                        }
                        return [4 /*yield*/, provider.generateCompletion(provider.getActiveModel(), prompt, undefined, undefined)];
                    case 1:
                        response = _a.sent();
                        if (!provider.cacheResponse) return [3 /*break*/, 3];
                        return [4 /*yield*/, provider.cacheResponse(prompt, response)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, response.content];
                }
            });
        });
    };
    LLMProviderManager.prototype.dispose = function () {
        // Clean up any resources
    };
    return LLMProviderManager;
}());
exports.LLMProviderManager = LLMProviderManager;
