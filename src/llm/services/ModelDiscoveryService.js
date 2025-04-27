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
exports.ModelDiscoveryService = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../types");
var ModelValidationService_1 = require("./ModelValidationService");
var ModelDiscoveryService = /** @class */ (function (_super) {
    __extends(ModelDiscoveryService, _super);
    function ModelDiscoveryService(logger, validationService) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.validationService = validationService;
        _this.modelRegistry = new Map();
        _this.providers = [];
        _this.discoveryInProgress = false;
        _this.outputChannel = vscode.window.createOutputChannel('Model Discovery');
        return _this;
    }
    ModelDiscoveryService.prototype.registerProvider = function (provider) {
        this.providers.push(provider);
        this.logger.debug("[ModelDiscoveryService] Registered provider: ".concat(provider.name));
    };
    ModelDiscoveryService.prototype.startDiscovery = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, models, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.discoveryInProgress) {
                            this.logger.debug('[ModelDiscoveryService] Discovery already in progress');
                            return [2 /*return*/];
                        }
                        this.discoveryInProgress = true;
                        this.emit('discoveryStarted');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        startTime = Date.now();
                        return [4 /*yield*/, this.discoverModels()];
                    case 2:
                        models = _a.sent();
                        this.logger.info("[ModelDiscoveryService] Discovery completed in ".concat(Date.now() - startTime, "ms"));
                        this.emit('discoveryCompleted', models);
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        this.handleError(new Error("Discovery failed: ".concat(error_1 instanceof Error ? error_1.message : String(error_1))));
                        return [3 /*break*/, 5];
                    case 4:
                        this.discoveryInProgress = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModelDiscoveryService.prototype.discoverModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var discoveredModels, _i, _a, provider, models, _b, models_1, model, validation, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        discoveredModels = [];
                        _i = 0, _a = this.providers;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        provider = _a[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, provider.getAvailableModels()];
                    case 3:
                        models = _c.sent();
                        _b = 0, models_1 = models;
                        _c.label = 4;
                    case 4:
                        if (!(_b < models_1.length)) return [3 /*break*/, 7];
                        model = models_1[_b];
                        if (!!this.modelRegistry.has(model.id)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.validationService.validateModel(model)];
                    case 5:
                        validation = _c.sent();
                        if (validation.isValid) {
                            this.modelRegistry.set(model.id, model);
                            discoveredModels.push(model);
                            this.emit(types_1.ModelEvent.ModelRegistered, model);
                            this.logModelDiscovered(model, validation);
                        }
                        else {
                            this.logModelSkipped(model, validation);
                        }
                        _c.label = 6;
                    case 6:
                        _b++;
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_2 = _c.sent();
                        this.logger.error("[ModelDiscoveryService] Provider ".concat(provider.name, " discovery failed:"), error_2);
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/, discoveredModels];
                }
            });
        });
    };
    ModelDiscoveryService.prototype.getDiscoveredModels = function () {
        return Array.from(this.modelRegistry.values());
    };
    ModelDiscoveryService.prototype.getModel = function (modelId) {
        return this.modelRegistry.get(modelId);
    };
    ModelDiscoveryService.prototype.clearRegistry = function () {
        this.modelRegistry.clear();
        this.emit('registryCleared');
    };
    ModelDiscoveryService.prototype.logModelDiscovered = function (model, validation) {
        this.outputChannel.appendLine("\nDiscovered model: ".concat(model.id));
        this.outputChannel.appendLine("Provider: ".concat(model.provider));
        this.outputChannel.appendLine("Parameters: ".concat(JSON.stringify(model.parameters)));
        this.outputChannel.appendLine("Validation: Passed");
    };
    ModelDiscoveryService.prototype.logModelSkipped = function (model, validation) {
        this.outputChannel.appendLine("\nSkipped incompatible model: ".concat(model.id));
        this.outputChannel.appendLine("Provider: ".concat(model.provider));
        this.outputChannel.appendLine("Issues: ".concat(validation.issues.join(', ')));
    };
    ModelDiscoveryService.prototype.handleError = function (error) {
        this.logger.error('[ModelDiscoveryService]', error);
        this.emit('error', error);
    };
    ModelDiscoveryService.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.modelRegistry.clear();
        this.removeAllListeners();
    };
    var _a;
    ModelDiscoveryService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelValidationService_1.ModelValidationService)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelValidationService_1.ModelValidationService])
    ], ModelDiscoveryService);
    return ModelDiscoveryService;
}(events_1.EventEmitter));
exports.ModelDiscoveryService = ModelDiscoveryService;
