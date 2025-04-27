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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelStateManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var logging_1 = require("../../common/logging");
var IPersistenceService_1 = require("../interfaces/IPersistenceService");
var ModelStateManager = /** @class */ (function (_super) {
    __extends(ModelStateManager, _super);
    function ModelStateManager(logger, persistence) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.persistence = persistence;
        _this.stateMap = new Map();
        _this.stateHistory = new Map();
        _this.maxHistorySize = 1000;
        _this.storageKey = 'model-states';
        _this.outputChannel = vscode.window.createOutputChannel('Model State');
        _this.loadPersistedStates();
        return _this;
    }
    ModelStateManager.prototype.updateState = function (modelId, state) {
        return __awaiter(this, void 0, void 0, function () {
            var oldState, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        oldState = this.stateMap.get(modelId);
                        this.stateMap.set(modelId, state);
                        this.trackStateTransition(modelId, oldState, state);
                        this.emitStateChange(modelId, state);
                        this.logStateChange(modelId, oldState, state);
                        return [4 /*yield*/, this.persistStates()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError('Failed to update state', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelStateManager.prototype.getState = function (modelId) {
        return this.stateMap.get(modelId);
    };
    ModelStateManager.prototype.getStateHistory = function (modelId) {
        return __spreadArray([], (this.stateHistory.get(modelId) || []), true);
    };
    ModelStateManager.prototype.getStateSnapshot = function (modelId) {
        var state = this.getState(modelId);
        if (!state) {
            return undefined;
        }
        return {
            modelId: modelId,
            state: state,
            timestamp: new Date(),
            transitions: this.getStateHistory(modelId)
        };
    };
    ModelStateManager.prototype.emitStateChange = function (modelId, state) {
        this.emit('stateChanged', { modelId: modelId, state: state });
    };
    ModelStateManager.prototype.persistStates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stateData, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        stateData = Array.from(this.stateMap.entries()).map(function (_a) {
                            var id = _a[0], state = _a[1];
                            return ({
                                modelId: id,
                                state: state,
                                history: _this.getStateHistory(id)
                            });
                        });
                        return [4 /*yield*/, this.persistence.saveData(this.storageKey, stateData)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.handleError('Failed to persist states', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelStateManager.prototype.loadPersistedStates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stateData, _i, stateData_1, data, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.persistence.loadData(this.storageKey)];
                    case 1:
                        stateData = (_a.sent()) || [];
                        for (_i = 0, stateData_1 = stateData; _i < stateData_1.length; _i++) {
                            data = stateData_1[_i];
                            if (data.modelId && data.state) {
                                this.stateMap.set(data.modelId, data.state);
                                if (data.history) {
                                    this.stateHistory.set(data.modelId, data.history);
                                }
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.handleError('Failed to load persisted states', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelStateManager.prototype.trackStateTransition = function (modelId, oldState, newState) {
        var history = this.stateHistory.get(modelId) || [];
        var transition = {
            from: oldState || 'initial',
            to: newState,
            timestamp: new Date()
        };
        history.push(transition);
        if (history.length > this.maxHistorySize) {
            history.shift(); // Remove oldest entry
        }
        this.stateHistory.set(modelId, history);
    };
    ModelStateManager.prototype.logStateChange = function (modelId, oldState, newState) {
        this.outputChannel.appendLine('\nModel State Change:');
        this.outputChannel.appendLine("Model: ".concat(modelId));
        this.outputChannel.appendLine("Previous State: ".concat(oldState || 'initial'));
        this.outputChannel.appendLine("New State: ".concat(newState));
        this.outputChannel.appendLine("Timestamp: ".concat(new Date().toISOString()));
    };
    ModelStateManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelStateManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelStateManager.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.stateMap.clear();
        this.stateHistory.clear();
    };
    var _a, _b;
    ModelStateManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
        __param(1, (0, inversify_1.inject)(IPersistenceService_1.IPersistenceService)),
        __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof IPersistenceService_1.IPersistenceService !== "undefined" && IPersistenceService_1.IPersistenceService) === "function" ? _b : Object])
    ], ModelStateManager);
    return ModelStateManager;
}(events_1.EventEmitter));
exports.ModelStateManager = ModelStateManager;
