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
exports.ModelRegistryService = void 0;
var events_1 = require("events");
var logger_1 = require("../../utils/logger");
var ModelRegistryService = /** @class */ (function () {
    function ModelRegistryService() {
        this._registryEmitter = new events_1.EventEmitter();
        this._registry = new Map();
        this._dependencies = new Map();
        this._logger = logger_1.Logger.for('ModelRegistryService');
    }
    ModelRegistryService.prototype.registerModel = function (modelId, info) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (this._registry.has(modelId)) {
                        throw new Error("Model ".concat(modelId, " is already registered"));
                    }
                    this._registry.set(modelId, info);
                    this._dependencies.set(modelId, new Set());
                    this._registryEmitter.emit('modelRegistered', {
                        modelId: modelId,
                        info: info,
                        timestamp: new Date()
                    });
                }
                catch (error) {
                    this._logger.error('Failed to register model', { modelId: modelId, error: error });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelRegistryService.prototype.addDependency = function (modelId, dependency) {
        return __awaiter(this, void 0, void 0, function () {
            var dependencies;
            return __generator(this, function (_a) {
                try {
                    dependencies = this._dependencies.get(modelId);
                    if (!dependencies) {
                        throw new Error("Model ".concat(modelId, " not found"));
                    }
                    dependencies.add(dependency);
                    this._registryEmitter.emit('dependencyAdded', {
                        modelId: modelId,
                        dependency: dependency,
                        timestamp: new Date()
                    });
                }
                catch (error) {
                    this._logger.error('Failed to add dependency', { modelId: modelId, error: error });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelRegistryService.prototype.validateDependencies = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var dependencies, validations, results, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        dependencies = this._dependencies.get(modelId);
                        if (!dependencies) {
                            throw new Error("Model ".concat(modelId, " not found"));
                        }
                        validations = Array.from(dependencies).map(function (dep) { return _this.validateDependency(dep); });
                        return [4 /*yield*/, Promise.all(validations)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.every(function (result) { return result; })];
                    case 2:
                        error_1 = _a.sent();
                        this._logger.error('Failed to validate dependencies', { modelId: modelId, error: error_1 });
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelRegistryService.prototype.validateDependency = function (dependency) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Add actual dependency validation logic here
                // This is a placeholder implementation
                return [2 /*return*/, true];
            });
        });
    };
    ModelRegistryService.prototype.getModel = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._registry.get(modelId)];
            });
        });
    };
    ModelRegistryService.prototype.getDependencies = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var dependencies;
            return __generator(this, function (_a) {
                dependencies = this._dependencies.get(modelId);
                return [2 /*return*/, dependencies ? Array.from(dependencies) : []];
            });
        });
    };
    ModelRegistryService.prototype.onModelRegistered = function (listener) {
        var _this = this;
        this._registryEmitter.on('modelRegistered', listener);
        return {
            dispose: function () { return _this._registryEmitter.removeListener('modelRegistered', listener); }
        };
    };
    ModelRegistryService.prototype.dispose = function () {
        this._registryEmitter.removeAllListeners();
        this._registry.clear();
        this._dependencies.clear();
    };
    return ModelRegistryService;
}());
exports.ModelRegistryService = ModelRegistryService;
