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
exports.OllamaConnectionManager = void 0;
var BaseConnectionManager_1 = require("./BaseConnectionManager");
var types_1 = require("./types");
/**
 * Specialized connection manager for Ollama LLM service
 */
var OllamaConnectionManager = /** @class */ (function (_super) {
    __extends(OllamaConnectionManager, _super);
    function OllamaConnectionManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.endpoint = '';
        _this.currentModel = '';
        return _this;
    }
    OllamaConnectionManager.prototype.establishConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var health, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.endpoint) {
                            throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.InvalidEndpoint, 'Ollama endpoint not configured');
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.performHealthCheck()];
                    case 2:
                        health = _b.sent();
                        if (health.status === 'error') {
                            throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.ConnectionFailed, health.message || 'Failed to connect to Ollama');
                        }
                        this.currentStatus = {
                            isConnected: true,
                            isAvailable: true,
                            error: '',
                            metadata: {
                                modelInfo: (_a = health.models) === null || _a === void 0 ? void 0 : _a[0]
                            }
                        };
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.ConnectionFailed, "Failed to connect to Ollama: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OllamaConnectionManager.prototype.terminateConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.currentStatus = {
                    isConnected: false,
                    isAvailable: false,
                    error: ''
                };
                return [2 /*return*/];
            });
        });
    };
    OllamaConnectionManager.prototype.performHealthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("".concat(this.endpoint, "/api/models"), {
                                method: 'GET',
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            return [2 /*return*/, {
                                    status: 'error',
                                    message: "Failed to fetch models: ".concat(response.statusText)
                                }];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (!Array.isArray(data.models)) {
                            return [2 /*return*/, {
                                    status: 'error',
                                    message: 'Invalid response format from Ollama API'
                                }];
                        }
                        return [2 /*return*/, {
                                status: 'ok',
                                models: data.models.map(function (model) { return ({
                                    id: model.name,
                                    name: model.name,
                                    provider: 'ollama',
                                    capabilities: ['text-generation'],
                                    parameters: __assign(__assign({}, model.details), { modified_at: model.modified_at, size: model.size })
                                }); })
                            }];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                status: 'error',
                                message: "Health check failed: ".concat(error_2 instanceof Error ? error_2.message : String(error_2))
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OllamaConnectionManager.prototype.configure = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.endpoint = options.endpoint;
                        this.currentModel = options.model || '';
                        if (options.healthCheckInterval) {
                            this.stopHealthChecks();
                            this.startHealthChecks();
                        }
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OllamaConnectionManager.prototype.getCurrentModel = function () {
        return this.currentModel;
    };
    OllamaConnectionManager.prototype.setModel = function (modelName) {
        return __awaiter(this, void 0, void 0, function () {
            var health, modelExists;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.performHealthCheck()];
                    case 1:
                        health = _c.sent();
                        modelExists = (_a = health.models) === null || _a === void 0 ? void 0 : _a.some(function (model) { return model.name === modelName; });
                        if (!modelExists) {
                            throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.ModelNotFound, "Model '".concat(modelName, "' not found in Ollama instance"));
                        }
                        this.currentModel = modelName;
                        this.currentStatus.metadata = __assign(__assign({}, this.currentStatus.metadata), { modelInfo: (_b = health.models) === null || _b === void 0 ? void 0 : _b.find(function (model) { return model.name === modelName; }) });
                        this.emit('modelChanged', this.currentStatus);
                        return [2 /*return*/];
                }
            });
        });
    };
    return OllamaConnectionManager;
}(BaseConnectionManager_1.BaseConnectionManager));
exports.OllamaConnectionManager = OllamaConnectionManager;
