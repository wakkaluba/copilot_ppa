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
exports.ModelDeploymentValidator = void 0;
var inversify_1 = require("inversify");
var events_1 = require("events");
var logger_1 = require("../../utils/logger");
var ModelHealthMonitor_1 = require("./ModelHealthMonitor");
var ModelMetricsService_1 = require("./ModelMetricsService");
var ModelDeploymentValidator = /** @class */ (function (_super) {
    __extends(ModelDeploymentValidator, _super);
    function ModelDeploymentValidator(logger, healthMonitor, metricsService) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.healthMonitor = healthMonitor;
        _this.metricsService = metricsService;
        return _this;
    }
    ModelDeploymentValidator.prototype.validateDeployment = function (modelId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var healthStatus, metrics, modelMetrics, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.healthMonitor.getSystemHealth()];
                    case 1:
                        healthStatus = _a.sent();
                        return [4 /*yield*/, this.metricsService.getLatestMetrics()];
                    case 2:
                        metrics = _a.sent();
                        modelMetrics = metrics.get(modelId);
                        result = {
                            isValid: true,
                            issues: [],
                            warnings: [],
                            recommendations: []
                        };
                        // Validate health score
                        if (healthStatus.healthScore < config.minHealthScore) {
                            result.issues.push("Health score ".concat(healthStatus.healthScore, " below minimum ").concat(config.minHealthScore));
                            result.isValid = false;
                        }
                        // Validate error rate
                        if ((modelMetrics === null || modelMetrics === void 0 ? void 0 : modelMetrics.errorRate) > config.maxErrorRate) {
                            result.issues.push("Error rate ".concat(modelMetrics.errorRate, " exceeds maximum ").concat(config.maxErrorRate));
                            result.isValid = false;
                        }
                        // Validate availability
                        if ((modelMetrics === null || modelMetrics === void 0 ? void 0 : modelMetrics.availability) < config.minAvailability) {
                            result.issues.push("Availability ".concat(modelMetrics.availability, " below minimum ").concat(config.minAvailability));
                            result.isValid = false;
                        }
                        // Resource utilization warnings
                        this.validateResourceUtilization(modelMetrics === null || modelMetrics === void 0 ? void 0 : modelMetrics.resourceUtilization, config.resourceThresholds, result);
                        this.emit('validationComplete', { modelId: modelId, result: result });
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _a.sent();
                        this.handleError('Deployment validation failed', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelDeploymentValidator.prototype.validateResourceUtilization = function (current, thresholds, result) {
        if (!current)
            return;
        if (current.cpu > thresholds.cpu) {
            result.warnings.push("High CPU utilization: ".concat(current.cpu, "%"));
            result.recommendations.push('Consider scaling CPU resources');
        }
        if (current.memory > thresholds.memory) {
            result.warnings.push("High memory utilization: ".concat(current.memory, "%"));
            result.recommendations.push('Consider scaling memory resources');
        }
        if (current.gpu && thresholds.gpu && current.gpu > thresholds.gpu) {
            result.warnings.push("High GPU utilization: ".concat(current.gpu, "%"));
            result.recommendations.push('Consider scaling GPU resources');
        }
    };
    ModelDeploymentValidator.prototype.handleError = function (message, error) {
        this.logger.error(message, { error: error });
        this.emit('error', { message: message, error: error });
    };
    var _a, _b;
    ModelDeploymentValidator = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelHealthMonitor_1.ModelHealthMonitor)),
        __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ModelHealthMonitor_1.ModelHealthMonitor !== "undefined" && ModelHealthMonitor_1.ModelHealthMonitor) === "function" ? _b : Object, ModelMetricsService_1.ModelMetricsService])
    ], ModelDeploymentValidator);
    return ModelDeploymentValidator;
}(events_1.EventEmitter));
exports.ModelDeploymentValidator = ModelDeploymentValidator;
