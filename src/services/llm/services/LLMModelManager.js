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
exports.LLMModelManager = void 0;
var events_1 = require("events");
var inversify_1 = require("inversify");
var types_1 = require("../types");
// Update the code to use provider instead of providerId
var mapProviderField = function (info) { return (__assign(__assign({}, info), { providerId: info.provider // Map provider to providerId for backward compatibility
 })); };
/**
 * Manages LLM model lifecycle, discovery, and runtime management
 */
var LLMModelManager = /** @class */ (function (_super) {
    __extends(LLMModelManager, _super);
    function LLMModelManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modelRegistry = new Map();
        _this.environmentConfigs = new Map();
        return _this;
    }
    /**
     * Register a model deployment
     */
    LLMModelManager.prototype.registerDeployment = function (deployment) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        entry = {
                            deployment: deployment,
                            status: 'registered',
                            metrics: this.initializeMetrics(),
                            lastUpdated: Date.now()
                        };
                        this.modelRegistry.set(deployment.id, entry);
                        return [4 /*yield*/, this.persistRegistry()];
                    case 1:
                        _a.sent();
                        this.emit(types_1.ModelEvents.DeploymentRegistered, {
                            deploymentId: deployment.id,
                            timestamp: entry.lastUpdated
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError('Failed to register deployment', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Configure environment for deployment
     */
    LLMModelManager.prototype.configureEnvironment = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.validateEnvironmentConfig(config);
                        this.environmentConfigs.set(config.id, config);
                        return [4 /*yield*/, this.persistEnvironments()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.handleError('Failed to configure environment', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize metrics collection
     */
    LLMModelManager.prototype.initializeMetrics = function () {
        return {
            requestCount: 0,
            errorCount: 0,
            averageLatency: 0,
            lastActive: Date.now(),
            resourceUsage: {
                cpu: 0,
                memory: 0,
                gpu: 0
            }
        };
    };
    /**
     * Persist registry state
     */
    LLMModelManager.prototype.persistRegistry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var registryData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        registryData = Array.from(this.modelRegistry.entries());
                        return [4 /*yield*/, fs.promises.writeFile(this.getRegistryPath(), JSON.stringify(registryData, null, 2))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.handleError('Failed to persist registry', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cleanup and dispose resources
     */
    LLMModelManager.prototype.dispose = function () {
        var _this = this;
        try {
            // Persist final state
            this.persistRegistry().catch(function (error) {
                return _this.logger.error('Failed to persist registry during disposal', error);
            });
            // Clean up resources
            this.modelRegistry.clear();
            this.environmentConfigs.clear();
            // Dispose event emitter
            this.removeAllListeners();
        }
        catch (error) {
            this.handleError('Error during disposal', error);
        }
    };
    LLMModelManager = __decorate([
        (0, inversify_1.injectable)()
    ], LLMModelManager);
    return LLMModelManager;
}(events_1.EventEmitter));
exports.LLMModelManager = LLMModelManager;
