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
exports.ModelService = exports.ModelRecommendation = exports.HardwareSpecs = void 0;
var inversify_1 = require("inversify");
var ILogger_1 = require("../logging/ILogger");
var vscode_1 = require("vscode");
var types_1 = require("./types");
Object.defineProperty(exports, "HardwareSpecs", { enumerable: true, get: function () { return types_1.HardwareSpecs; } });
Object.defineProperty(exports, "ModelRecommendation", { enumerable: true, get: function () { return types_1.ModelRecommendation; } });
var ModelDiscoveryService_1 = require("./services/ModelDiscoveryService");
var ModelMetricsService_1 = require("./services/ModelMetricsService");
var ModelValidationService_1 = require("./services/ModelValidationService");
var TelemetryService_1 = require("../services/TelemetryService");
var ModelService = /** @class */ (function (_super) {
    __extends(ModelService, _super);
    function ModelService(logger, discoveryService, metricsService, validationService, telemetryService) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.discoveryService = discoveryService;
        _this.metricsService = metricsService;
        _this.validationService = validationService;
        _this.telemetryService = telemetryService;
        _this.models = new Map();
        _this.setupEventListeners();
        return _this;
    }
    ModelService_1 = ModelService;
    ModelService.getInstance = function (logger, discoveryService, metricsService, validationService, telemetryService) {
        if (!ModelService_1.instance) {
            ModelService_1.instance = new ModelService_1(logger, discoveryService, metricsService, validationService, telemetryService);
        }
        return ModelService_1.instance;
    };
    ModelService.prototype.setupEventListeners = function () {
        this.discoveryService.on('modelFound', this.handleModelFound.bind(this));
        this.metricsService.on('metricsUpdated', this.handleMetricsUpdated.bind(this));
        this.validationService.on('validationComplete', this.handleValidationComplete.bind(this));
    };
    ModelService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.discoveryService.startDiscovery()];
                    case 1:
                        _a.sent();
                        this.telemetryService.sendEvent('modelService.initialized');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError(new Error("Failed to initialize model service: ".concat(error_1 instanceof Error ? error_1.message : String(error_1))));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelService.prototype.getModelInfo = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var model;
            return __generator(this, function (_a) {
                model = this.models.get(modelId);
                if (!model) {
                    throw new Error("Model ".concat(modelId, " not found"));
                }
                return [2 /*return*/, __assign({}, model)];
            });
        });
    };
    ModelService.prototype.validateModel = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var model, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getModelInfo(modelId)];
                    case 1:
                        model = _a.sent();
                        return [4 /*yield*/, this.validationService.validateModel(model)];
                    case 2:
                        result = _a.sent();
                        this.telemetryService.sendEvent('modelService.validation', {
                            modelId: modelId,
                            isValid: result.isValid,
                            issueCount: result.issues.length
                        });
                        return [2 /*return*/, result];
                    case 3:
                        error_2 = _a.sent();
                        this.handleError(new Error("Failed to validate model ".concat(modelId, ": ").concat(error_2 instanceof Error ? error_2.message : String(error_2))));
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelService.prototype.getModelMetrics = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.metricsService.getMetrics(modelId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        this.handleError(new Error("Failed to get metrics for model ".concat(modelId, ": ").concat(error_3 instanceof Error ? error_3.message : String(error_3))));
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelService.prototype.setActiveModel = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var model, validationResult, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getModelInfo(modelId)];
                    case 1:
                        model = _a.sent();
                        return [4 /*yield*/, this.validateModel(modelId)];
                    case 2:
                        validationResult = _a.sent();
                        if (!validationResult.isValid) {
                            throw new Error("Model ".concat(modelId, " validation failed: ").concat(validationResult.issues.join(', ')));
                        }
                        this.activeModelId = modelId;
                        this.emit(types_1.ModelEvent.ActiveModelChanged, modelId);
                        this.telemetryService.sendEvent('modelService.activeModelChanged', {
                            modelId: modelId,
                            provider: model.provider
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        this.handleError(new Error("Failed to set active model ".concat(modelId, ": ").concat(error_4 instanceof Error ? error_4.message : String(error_4))));
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelService.prototype.getActiveModelId = function () {
        return this.activeModelId;
    };
    ModelService.prototype.updateModelConfig = function (modelId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var model, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getModelInfo(modelId)];
                    case 1:
                        model = _a.sent();
                        Object.assign(model.config, config);
                        this.models.set(modelId, model);
                        this.emit(types_1.ModelEvent.ModelUpdated, modelId);
                        this.telemetryService.sendEvent('modelService.configUpdated', {
                            modelId: modelId,
                            configKeys: Object.keys(config)
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        this.handleError(new Error("Failed to update config for model ".concat(modelId, ": ").concat(error_5 instanceof Error ? error_5.message : String(error_5))));
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelService.prototype.getAvailableModels = function () {
        return Array.from(this.models.values()).map(function (model) { return (__assign({}, model)); });
    };
    ModelService.prototype.handleModelFound = function (modelInfo) {
        this.models.set(modelInfo.id, modelInfo);
        this.emit(types_1.ModelEvent.ModelRegistered, modelInfo.id);
    };
    ModelService.prototype.handleMetricsUpdated = function (modelId, metrics) {
        this.emit(types_1.ModelEvent.MetricsUpdated, { modelId: modelId, metrics: metrics });
    };
    ModelService.prototype.handleValidationComplete = function (modelId, result) {
        this.emit(types_1.ModelEvent.ValidationUpdated, { modelId: modelId, result: result });
    };
    ModelService.prototype.handleError = function (error) {
        this.logger.error('[ModelService]', error);
        this.emit('error', error);
        this.telemetryService.sendEvent('modelService.error', {
            error: error.message
        });
    };
    ModelService.prototype.dispose = function () {
        this.discoveryService.dispose();
        this.metricsService.dispose();
        this.validationService.dispose();
        this.removeAllListeners();
    };
    var ModelService_1;
    var _a, _b;
    ModelService = ModelService_1 = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelDiscoveryService_1.ModelDiscoveryService)),
        __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
        __param(3, (0, inversify_1.inject)(ModelValidationService_1.ModelValidationService)),
        __param(4, (0, inversify_1.inject)(TelemetryService_1.TelemetryService)),
        __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, ModelDiscoveryService_1.ModelDiscoveryService,
            ModelMetricsService_1.ModelMetricsService,
            ModelValidationService_1.ModelValidationService, typeof (_b = typeof TelemetryService_1.TelemetryService !== "undefined" && TelemetryService_1.TelemetryService) === "function" ? _b : Object])
    ], ModelService);
    return ModelService;
}(vscode_1.EventEmitter));
exports.ModelService = ModelService;
