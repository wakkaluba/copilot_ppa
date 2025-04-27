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
exports.ModelDeploymentManagerService = void 0;
var inversify_1 = require("inversify");
var logger_1 = require("../../utils/logger");
var events_1 = require("events");
var ModelVersioningService_1 = require("./ModelVersioningService");
var ModelDeploymentService_1 = require("./ModelDeploymentService");
var ModelDeploymentManagerService = /** @class */ (function (_super) {
    __extends(ModelDeploymentManagerService, _super);
    function ModelDeploymentManagerService(logger, versioningService, deploymentService) {
        if (deploymentService === void 0) { deploymentService = {}; }
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.versioningService = versioningService;
        _this.deploymentService = deploymentService;
        _this.deployments = new Map();
        _this.deploymentCounter = 0;
        _this.logger.info('ModelDeploymentManagerService initialized');
        return _this;
    }
    /**
     * Create a new model deployment
     * @param options Deployment options
     * @returns The deployment ID
     */
    ModelDeploymentManagerService.prototype.createDeployment = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var config, metadata, deploymentId, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.logger.info("Creating deployment for model ".concat(options.modelId), options);
                        // Verify model version exists
                        return [4 /*yield*/, this.versioningService.verifyVersion(options.modelId, options.version)];
                    case 1:
                        // Verify model version exists
                        _a.sent();
                        config = options.config || {
                            replicas: 1,
                            resources: {
                                cpu: '1',
                                memory: '2Gi'
                            }
                        };
                        metadata = options.metadata || {};
                        return [4 /*yield*/, this.deploymentService.createDeployment({
                                modelId: options.modelId,
                                version: options.version,
                                environmentId: options.environmentId,
                                config: config,
                                metadata: metadata
                            })];
                    case 2:
                        deploymentId = _a.sent();
                        this.logger.info("Created deployment ".concat(deploymentId, " for model ").concat(options.modelId));
                        // Store deployment reference
                        this.deployments.set(deploymentId, {
                            id: deploymentId,
                            modelId: options.modelId,
                            version: options.version,
                            environmentId: options.environmentId,
                            createdAt: Date.now()
                        });
                        this.emit('deployment.created', {
                            deploymentId: deploymentId,
                            modelId: options.modelId,
                            environment: options.environmentId
                        });
                        return [2 /*return*/, deploymentId];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error("Error creating deployment for model ".concat(options.modelId), error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a deployment by ID
     * @param deploymentId Deployment ID
     * @returns The deployment details
     */
    ModelDeploymentManagerService.prototype.getDeployment = function (deploymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var deployment, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.deploymentService.getDeployment(deploymentId)];
                    case 1:
                        deployment = _a.sent();
                        if (!deployment) {
                            throw new Error("Deployment ".concat(deploymentId, " not found"));
                        }
                        return [2 /*return*/, deployment];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error("Error getting deployment ".concat(deploymentId), error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update an existing deployment
     * @param deploymentId Deployment ID
     * @param metadata Metadata to update
     */
    ModelDeploymentManagerService.prototype.updateDeployment = function (deploymentId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.deploymentService.updateDeployment(deploymentId, { metadata: metadata })];
                    case 1:
                        _a.sent();
                        this.logger.info("Updated deployment ".concat(deploymentId));
                        this.emit('deployment.updated', {
                            deploymentId: deploymentId,
                            metadata: metadata
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error("Error updating deployment ".concat(deploymentId), error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a deployment
     * @param deploymentId Deployment ID
     */
    ModelDeploymentManagerService.prototype.deleteDeployment = function (deploymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.deploymentService.deleteDeployment(deploymentId)];
                    case 1:
                        _a.sent();
                        this.deployments.delete(deploymentId);
                        this.logger.info("Deleted deployment ".concat(deploymentId));
                        this.emit('deployment.deleted', { deploymentId: deploymentId });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        this.logger.error("Error deleting deployment ".concat(deploymentId), error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * List all deployments (optionally filtered by model ID)
     * @param modelId Optional model ID filter
     * @returns Array of deployments
     */
    ModelDeploymentManagerService.prototype.listDeployments = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var deployments, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.deploymentService.listDeployments(modelId)];
                    case 1:
                        deployments = _a.sent();
                        return [2 /*return*/, deployments];
                    case 2:
                        error_5 = _a.sent();
                        this.logger.error("Error listing deployments".concat(modelId ? " for model ".concat(modelId) : ''), error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the status of a deployment
     * @param deploymentId Deployment ID
     */
    ModelDeploymentManagerService.prototype.getDeploymentStatus = function (deploymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var deployment, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getDeployment(deploymentId)];
                    case 1:
                        deployment = _a.sent();
                        return [2 /*return*/, deployment.status];
                    case 2:
                        error_6 = _a.sent();
                        this.logger.error("Error getting status for deployment ".concat(deploymentId), error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Restart a deployment
     * @param deploymentId Deployment ID
     */
    ModelDeploymentManagerService.prototype.restartDeployment = function (deploymentId) {
        return __awaiter(this, void 0, void 0, function () {
            var deployment, error_7;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getDeployment(deploymentId)];
                    case 1:
                        deployment = _a.sent();
                        // Simulate restart
                        return [4 /*yield*/, this.deploymentService.updateDeployment(deploymentId, {
                                status: 'restarting'
                            })];
                    case 2:
                        // Simulate restart
                        _a.sent();
                        // Simulate restart completion after delay
                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            var error_8;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.deploymentService.updateDeployment(deploymentId, {
                                                status: 'running',
                                                updatedAt: Date.now()
                                            })];
                                    case 1:
                                        _a.sent();
                                        this.emit('deployment.restarted', { deploymentId: deploymentId });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_8 = _a.sent();
                                        this.logger.error("Error finishing restart for deployment ".concat(deploymentId), error_8);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, 2000);
                        this.logger.info("Restarted deployment ".concat(deploymentId));
                        this.emit('deployment.restarting', { deploymentId: deploymentId });
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        this.logger.error("Error restarting deployment ".concat(deploymentId), error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Scale a deployment
     * @param deploymentId Deployment ID
     * @param replicas New replica count
     */
    ModelDeploymentManagerService.prototype.scaleDeployment = function (deploymentId, replicas) {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.deploymentService.updateDeployment(deploymentId, {
                                config: { replicas: replicas }
                            })];
                    case 1:
                        _a.sent();
                        this.logger.info("Scaled deployment ".concat(deploymentId, " to ").concat(replicas, " replicas"));
                        this.emit('deployment.scaled', { deploymentId: deploymentId, replicas: replicas });
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        this.logger.error("Error scaling deployment ".concat(deploymentId), error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update the resources for a deployment
     * @param deploymentId Deployment ID
     * @param resources New resource configuration
     */
    ModelDeploymentManagerService.prototype.updateResources = function (deploymentId, resources) {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.deploymentService.updateDeployment(deploymentId, {
                                config: { resources: resources }
                            })];
                    case 1:
                        _a.sent();
                        this.logger.info("Updated resources for deployment ".concat(deploymentId), resources);
                        this.emit('deployment.resourcesUpdated', { deploymentId: deploymentId, resources: resources });
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        this.logger.error("Error updating resources for deployment ".concat(deploymentId), error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dispose of resources
     */
    ModelDeploymentManagerService.prototype.dispose = function () {
        this.removeAllListeners();
        this.deployments.clear();
        this.logger.info('ModelDeploymentManagerService disposed');
    };
    var _a;
    ModelDeploymentManagerService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelVersioningService_1.ModelVersioningService)),
        __param(2, (0, inversify_1.inject)(ModelDeploymentService_1.ModelDeploymentService)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelVersioningService_1.ModelVersioningService,
            ModelDeploymentService_1.ModelDeploymentService])
    ], ModelDeploymentManagerService);
    return ModelDeploymentManagerService;
}(events_1.EventEmitter));
exports.ModelDeploymentManagerService = ModelDeploymentManagerService;
