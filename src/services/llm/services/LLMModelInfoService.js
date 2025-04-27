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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.LLMModelInfoService = void 0;
var inversify_1 = require("inversify");
var ILogger_1 = require("../../../logging/ILogger");
var events_1 = require("events");
var types_1 = require("../types");
var LLMCacheManager_1 = require("../LLMCacheManager");
var LLMModelValidator_1 = require("./LLMModelValidator");
var LLMModelInfoService = /** @class */ (function (_super) {
    __extends(LLMModelInfoService, _super);
    function LLMModelInfoService(logger, cacheManager, validator) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.modelCache = new Map();
        _this.cacheManager = cacheManager;
        _this.validator = validator;
        _this.setupEventListeners();
        return _this;
    }
    LLMModelInfoService.prototype.setupEventListeners = function () {
        this.cacheManager.on('modelInfoCached', this.handleCacheUpdate.bind(this));
        this.validator.on('validationComplete', this.handleValidationComplete.bind(this));
    };
    LLMModelInfoService.prototype.getModelInfo = function (modelId_1) {
        return __awaiter(this, arguments, void 0, function (modelId, force) {
            var cached, info, error_1;
            if (force === void 0) { force = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // Check memory cache first
                        if (!force && this.modelCache.has(modelId)) {
                            return [2 /*return*/, __assign({}, this.modelCache.get(modelId))];
                        }
                        return [4 /*yield*/, this.cacheManager.getModelInfo(modelId)];
                    case 1:
                        cached = _a.sent();
                        if (!force && cached) {
                            this.modelCache.set(modelId, cached);
                            return [2 /*return*/, __assign({}, cached)];
                        }
                        return [4 /*yield*/, this.loadModelInfo(modelId)];
                    case 2:
                        info = _a.sent();
                        return [4 /*yield*/, this.validateAndCache(info)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, __assign({}, info)];
                    case 4:
                        error_1 = _a.sent();
                        this.handleError(new Error("Failed to get model info for ".concat(modelId, ": ").concat(error_1 instanceof Error ? error_1.message : String(error_1))));
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    LLMModelInfoService.prototype.loadModelInfo = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // This would integrate with the model provider to get fresh info
                    throw new Error('Method not implemented');
                }
                catch (error) {
                    this.handleError(new Error("Failed to load model info for ".concat(modelId, ": ").concat(error instanceof Error ? error.message : String(error))));
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    LLMModelInfoService.prototype.updateModelInfo = function (modelId, info) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getModelInfo(modelId)];
                    case 1:
                        existing = _a.sent();
                        updated = __assign(__assign({}, existing), info);
                        return [4 /*yield*/, this.validateAndCache(updated)];
                    case 2:
                        _a.sent();
                        this.emit(types_1.ModelEvent.ModelUpdated, modelId);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.handleError(new Error("Failed to update model info for ".concat(modelId, ": ").concat(error_2 instanceof Error ? error_2.message : String(error_2))));
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LLMModelInfoService.prototype.validateAndCache = function (info) {
        return __awaiter(this, void 0, void 0, function () {
            var validationResult, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validator.validateModel(info)];
                    case 1:
                        validationResult = _a.sent();
                        if (!validationResult.isValid) {
                            throw new Error("Invalid model info: ".concat(validationResult.issues.join(', ')));
                        }
                        this.modelCache.set(info.id, info);
                        return [4 /*yield*/, this.cacheManager.cacheModelInfo(info.id, info)];
                    case 2:
                        _a.sent();
                        this.emit(types_1.ModelEvent.ModelInfoUpdated, {
                            modelId: info.id,
                            info: info
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        this.handleError(new Error("Validation failed for model ".concat(info.id, ": ").concat(error_3 instanceof Error ? error_3.message : String(error_3))));
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LLMModelInfoService.prototype.getAvailableModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.modelCache.values()).map(function (info) { return (__assign({}, info)); })];
            });
        });
    };
    LLMModelInfoService.prototype.clearCache = function (modelId) {
        if (modelId) {
            this.modelCache.delete(modelId);
            this.cacheManager.clearModelInfo(modelId);
        }
        else {
            this.modelCache.clear();
            this.cacheManager.clearAllModelInfo();
        }
        this.emit('cacheCleared', modelId);
    };
    LLMModelInfoService.prototype.handleCacheUpdate = function (event) {
        this.modelCache.set(event.modelId, event.info);
        this.emit(types_1.ModelEvent.ModelInfoUpdated, event);
    };
    LLMModelInfoService.prototype.handleValidationComplete = function (event) {
        this.emit(types_1.ModelEvent.ValidationComplete, event);
    };
    LLMModelInfoService.prototype.handleError = function (error) {
        this.logger.error('[LLMModelInfoService]', error);
        this.emit('error', error);
    };
    LLMModelInfoService.prototype.dispose = function () {
        this.modelCache.clear();
        this.removeAllListeners();
    };
    var _a;
    LLMModelInfoService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(LLMCacheManager_1.LLMCacheManager)),
        __param(2, (0, inversify_1.inject)(LLMModelValidator_1.LLMModelValidator)),
        __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, LLMCacheManager_1.LLMCacheManager,
            LLMModelValidator_1.LLMModelValidator])
    ], LLMModelInfoService);
    return LLMModelInfoService;
}(events_1.EventEmitter));
exports.LLMModelInfoService = LLMModelInfoService;
