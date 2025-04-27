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
exports.ModelDeploymentService = void 0;
var inversify_1 = require("inversify");
var logger_1 = require("../../utils/logger");
var events_1 = require("events");
/**
 * Service for model deployment operations
 */
var ModelDeploymentService = /** @class */ (function (_super) {
    __extends(ModelDeploymentService, _super);
    function ModelDeploymentService(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.deployments = new Map();
        _this.deploymentCounter = 0;
        _this.logger.info('ModelDeploymentService initialized');
        return _this;
    }
    /**
     * Create a new deployment
     */
    ModelDeploymentService.prototype.createDeployment = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var deploymentId_1, deployment;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    this.deploymentCounter++;
                    deploymentId_1 = "deploy-".concat(this.deploymentCounter, "-").concat(Date.now());
                    deployment = {
                        id: deploymentId_1,
                        modelId: options.modelId,
                        version: options.version,
                        environmentId: options.environmentId,
                        config: options.config,
                        metadata: options.metadata || {},
                        status: 'deploying',
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    this.deployments.set(deploymentId_1, deployment);
                    this.logger.info("Created deployment ".concat(deploymentId_1, " for model ").concat(options.modelId));
                    this.emit('deployment.created', { deployment: deployment });
                    // Simulate deployment completion after delay
                    setTimeout(function () {
                        _this.completeDeployment(deploymentId_1);
                    }, 1000);
                    return [2 /*return*/, deploymentId_1];
                }
                catch (error) {
                    this.logger.error('Error creating deployment', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Mark a deployment as complete/running
     */
    ModelDeploymentService.prototype.completeDeployment = function (deploymentId) {
        try {
            var deployment = this.deployments.get(deploymentId);
            if (!deployment) {
                return;
            }
            deployment.status = 'running';
            deployment.updatedAt = Date.now();
            this.deployments.set(deploymentId, deployment);
            this.emit('deployment.ready', { deploymentId: deploymentId, modelId: deployment.modelId });
            this.logger.info("Deployment ".concat(deploymentId, " is now running"));
        }
        catch (error) {
            this.logger.error("Error completing deployment ".concat(deploymentId), error);
        }
    };
    /**
     * Get a deployment by ID
     */
    ModelDeploymentService.prototype.getDeployment = function (deploymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var deployment;
            return __generator(this, function (_a) {
                deployment = this.deployments.get(deploymentId);
                if (!deployment) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, __assign({}, deployment)];
            });
        });
    };
    /**
     * List all deployments, optionally filtered by model ID
     */
    ModelDeploymentService.prototype.listDeployments = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var allDeployments;
            return __generator(this, function (_a) {
                allDeployments = Array.from(this.deployments.values());
                if (!modelId) {
                    return [2 /*return*/, allDeployments];
                }
                return [2 /*return*/, allDeployments.filter(function (d) { return d.modelId === modelId; })];
            });
        });
    };
    /**
     * Update a deployment
     */
    ModelDeploymentService.prototype.updateDeployment = function (deploymentId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var deployment;
            var _a, _b;
            return __generator(this, function (_c) {
                try {
                    deployment = this.deployments.get(deploymentId);
                    if (!deployment) {
                        throw new Error("Deployment ".concat(deploymentId, " not found"));
                    }
                    // Apply updates
                    if (updates.config) {
                        deployment.config = __assign(__assign(__assign({}, deployment.config), updates.config), { resources: __assign(__assign({}, (((_a = deployment.config) === null || _a === void 0 ? void 0 : _a.resources) || {})), (((_b = updates.config) === null || _b === void 0 ? void 0 : _b.resources) || {})) });
                    }
                    if (updates.metadata) {
                        deployment.metadata = __assign(__assign({}, deployment.metadata), updates.metadata);
                    }
                    if (updates.status) {
                        deployment.status = updates.status;
                    }
                    deployment.updatedAt = Date.now();
                    this.deployments.set(deploymentId, deployment);
                    this.logger.info("Updated deployment ".concat(deploymentId));
                    this.emit('deployment.updated', { deploymentId: deploymentId, updates: updates });
                }
                catch (error) {
                    this.logger.error("Error updating deployment ".concat(deploymentId), error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Delete a deployment
     */
    ModelDeploymentService.prototype.deleteDeployment = function (deploymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var deployment;
            return __generator(this, function (_a) {
                try {
                    if (!this.deployments.has(deploymentId)) {
                        throw new Error("Deployment ".concat(deploymentId, " not found"));
                    }
                    deployment = this.deployments.get(deploymentId);
                    this.deployments.delete(deploymentId);
                    this.logger.info("Deleted deployment ".concat(deploymentId));
                    this.emit('deployment.deleted', { deploymentId: deploymentId, modelId: deployment.modelId });
                }
                catch (error) {
                    this.logger.error("Error deleting deployment ".concat(deploymentId), error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Dispose of resources
     */
    ModelDeploymentService.prototype.dispose = function () {
        this.removeAllListeners();
        this.deployments.clear();
        this.logger.info('ModelDeploymentService disposed');
    };
    ModelDeploymentService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)('ILogger')),
        __metadata("design:paramtypes", [Object])
    ], ModelDeploymentService);
    return ModelDeploymentService;
}(events_1.EventEmitter));
exports.ModelDeploymentService = ModelDeploymentService;
