"use strict";
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
exports.ModelStateService = void 0;
var events_1 = require("events");
var logger_1 = require("../../utils/logger");
var ModelStateService = /** @class */ (function () {
    function ModelStateService(storageOptions) {
        if (storageOptions === void 0) { storageOptions = {
            persistenceInterval: 5000,
            maxHistoryItems: 100
        }; }
        this.storageOptions = storageOptions;
        this._stateEmitter = new events_1.EventEmitter();
        this._states = new Map();
        this._persistenceInterval = null;
        this._logger = logger_1.Logger.for('ModelStateService');
        this.startPersistence();
    }
    ModelStateService.prototype.getState = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this._states.get(modelId)];
                }
                catch (error) {
                    this._logger.error('Failed to get model state', { modelId: modelId, error: error });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelStateService.prototype.setState = function (modelId, state) {
        return __awaiter(this, void 0, void 0, function () {
            var currentState, newState, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        currentState = this._states.get(modelId) || {};
                        newState = __assign(__assign({}, currentState), state);
                        this._states.set(modelId, newState);
                        this._stateEmitter.emit('stateChanged', {
                            modelId: modelId,
                            oldState: currentState,
                            newState: newState
                        });
                        return [4 /*yield*/, this.synchronizeState(modelId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this._logger.error('Failed to set model state', { modelId: modelId, error: error_1 });
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelStateService.prototype.onStateChanged = function (listener) {
        var _this = this;
        this._stateEmitter.on('stateChanged', listener);
        return {
            dispose: function () { return _this._stateEmitter.removeListener('stateChanged', listener); }
        };
    };
    ModelStateService.prototype.synchronizeState = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var state, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        state = this._states.get(modelId);
                        if (!state) {
                            return [2 /*return*/];
                        }
                        // Trigger state persistence
                        return [4 /*yield*/, this.persistState(modelId, state)];
                    case 1:
                        // Trigger state persistence
                        _a.sent();
                        // Notify any other services that need to sync
                        this._stateEmitter.emit('stateSync', { modelId: modelId, state: state });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this._logger.error('State synchronization failed', { modelId: modelId, error: error_2 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelStateService.prototype.startPersistence = function () {
        var _this = this;
        if (this._persistenceInterval) {
            return;
        }
        this._persistenceInterval = setInterval(function () { return _this.persistAllStates(); }, this.storageOptions.persistenceInterval);
    };
    ModelStateService.prototype.persistAllStates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var persistPromises, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        persistPromises = Array.from(this._states.entries())
                            .map(function (_a) {
                            var modelId = _a[0], state = _a[1];
                            return _this.persistState(modelId, state);
                        });
                        return [4 /*yield*/, Promise.all(persistPromises)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this._logger.error('Failed to persist states', { error: error_3 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelStateService.prototype.persistState = function (modelId, state) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Implement actual persistence logic here
                    // This could write to disk, database, etc.
                }
                catch (error) {
                    this._logger.error('Failed to persist state', { modelId: modelId, error: error });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelStateService.prototype.dispose = function () {
        if (this._persistenceInterval) {
            clearInterval(this._persistenceInterval);
            this._persistenceInterval = null;
        }
        this._stateEmitter.removeAllListeners();
        this._states.clear();
    };
    return ModelStateService;
}());
exports.ModelStateService = ModelStateService;
