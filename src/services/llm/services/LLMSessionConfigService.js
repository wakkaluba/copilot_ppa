"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.LLMSessionConfigService = void 0;
var vscode = require("vscode");
var events_1 = require("events");
var DEFAULT_CONFIG = {
    timeout: 30000,
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    presencePenalty: 0,
    frequencyPenalty: 0,
    stream: true,
    cache: true,
    retryCount: 3,
    contextWindowSize: 4096
};
/**
 * Service for managing LLM session configurations
 */
var LLMSessionConfigService = /** @class */ (function (_super) {
    __extends(LLMSessionConfigService, _super);
    function LLMSessionConfigService() {
        var _this = _super.call(this) || this;
        _this.currentConfig = _this.loadConfig();
        return _this;
    }
    /**
     * Reload configuration from workspace settings
     */
    LLMSessionConfigService.prototype.reloadConfig = function () {
        var newConfig = this.loadConfig();
        var oldConfig = this.currentConfig;
        this.currentConfig = newConfig;
        this.emit('configChanged', {
            oldConfig: oldConfig,
            newConfig: newConfig,
            changes: this.getConfigChanges(oldConfig, newConfig)
        });
    };
    /**
     * Get the current session configuration
     */
    LLMSessionConfigService.prototype.getCurrentConfig = function () {
        return __assign({}, this.currentConfig);
    };
    /**
     * Merge provided config with current config
     */
    LLMSessionConfigService.prototype.mergeConfig = function (config) {
        return __assign(__assign({}, this.currentConfig), config);
    };
    /**
     * Update specific configuration values
     */
    LLMSessionConfigService.prototype.updateConfig = function (updates) {
        return __awaiter(this, void 0, void 0, function () {
            var config, _i, _a, _b, key, value;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        config = vscode.workspace.getConfiguration('copilot-ppa.llm');
                        _i = 0, _a = Object.entries(updates);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        _b = _a[_i], key = _b[0], value = _b[1];
                        return [4 /*yield*/, config.update(key, value, vscode.ConfigurationTarget.Global)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.reloadConfig();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reset configuration to defaults
     */
    LLMSessionConfigService.prototype.resetConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateConfig(DEFAULT_CONFIG)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate a session configuration
     */
    LLMSessionConfigService.prototype.validateConfig = function (config) {
        var errors = [];
        if (config.timeout !== undefined && config.timeout < 0) {
            errors.push('Timeout must be non-negative');
        }
        if (config.maxTokens !== undefined && config.maxTokens < 1) {
            errors.push('Max tokens must be positive');
        }
        if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
            errors.push('Temperature must be between 0 and 2');
        }
        if (config.topP !== undefined && (config.topP < 0 || config.topP > 1)) {
            errors.push('Top P must be between 0 and 1');
        }
        if (config.presencePenalty !== undefined && (config.presencePenalty < -2 || config.presencePenalty > 2)) {
            errors.push('Presence penalty must be between -2 and 2');
        }
        if (config.frequencyPenalty !== undefined && (config.frequencyPenalty < -2 || config.frequencyPenalty > 2)) {
            errors.push('Frequency penalty must be between -2 and 2');
        }
        if (config.retryCount !== undefined && config.retryCount < 0) {
            errors.push('Retry count must be non-negative');
        }
        if (config.contextWindowSize !== undefined && config.contextWindowSize < 1) {
            errors.push('Context window size must be positive');
        }
        return errors;
    };
    LLMSessionConfigService.prototype.loadConfig = function () {
        var config = vscode.workspace.getConfiguration('copilot-ppa.llm');
        return {
            timeout: config.get('timeout', DEFAULT_CONFIG.timeout),
            maxTokens: config.get('maxTokens', DEFAULT_CONFIG.maxTokens),
            temperature: config.get('temperature', DEFAULT_CONFIG.temperature),
            topP: config.get('topP', DEFAULT_CONFIG.topP),
            presencePenalty: config.get('presencePenalty', DEFAULT_CONFIG.presencePenalty),
            frequencyPenalty: config.get('frequencyPenalty', DEFAULT_CONFIG.frequencyPenalty),
            stream: config.get('stream', DEFAULT_CONFIG.stream),
            cache: config.get('cache', DEFAULT_CONFIG.cache),
            retryCount: config.get('retryCount', DEFAULT_CONFIG.retryCount),
            contextWindowSize: config.get('contextWindowSize', DEFAULT_CONFIG.contextWindowSize)
        };
    };
    LLMSessionConfigService.prototype.getConfigChanges = function (oldConfig, newConfig) {
        var changes = {};
        for (var _i = 0, _a = Object.keys(oldConfig); _i < _a.length; _i++) {
            var key = _a[_i];
            if (oldConfig[key] !== newConfig[key]) {
                changes[key] = newConfig[key];
            }
        }
        return changes;
    };
    return LLMSessionConfigService;
}(events_1.EventEmitter));
exports.LLMSessionConfigService = LLMSessionConfigService;
