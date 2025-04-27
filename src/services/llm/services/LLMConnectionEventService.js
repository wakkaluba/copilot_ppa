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
exports.LLMConnectionEventService = void 0;
var events_1 = require("events");
var types_1 = require("../types");
/**
 * Service for managing LLM connection events and state transitions
 */
var LLMConnectionEventService = /** @class */ (function (_super) {
    __extends(LLMConnectionEventService, _super);
    function LLMConnectionEventService(metricsService, config) {
        if (config === void 0) { config = defaultTransitionConfig; }
        var _this = _super.call(this) || this;
        _this.metricsService = metricsService;
        _this.config = config;
        _this.currentState = 'disconnected';
        _this.previousState = 'disconnected';
        _this.stateTimestamp = Date.now();
        _this.defaultTransitionConfig = {
            allowedTransitions: new Map([
                ['disconnected', new Set(['connecting', 'error'])],
                ['connecting', new Set(['connected', 'error', 'reconnecting'])],
                ['connected', new Set(['disconnected', 'error'])],
                ['error', new Set(['reconnecting', 'disconnected'])],
                ['reconnecting', new Set(['connected', 'error', 'disconnected'])]
            ]),
            transitionTimeouts: new Map([
                ['connecting', 30000], // 30 seconds timeout for connecting
                ['reconnecting', 60000], // 60 seconds timeout for reconnecting
            ])
        };
        return _this;
    }
    LLMConnectionEventService.prototype.getCurrentState = function () {
        return this.currentState;
    };
    LLMConnectionEventService.prototype.transitionTo = function (newState, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var eventData, timeout;
            return __generator(this, function (_a) {
                if (!this.isValidTransition(newState)) {
                    console.warn("Invalid state transition from ".concat(this.currentState, " to ").concat(newState));
                    return [2 /*return*/, false];
                }
                this.clearStateTimeout();
                this.previousState = this.currentState;
                this.currentState = newState;
                this.stateTimestamp = Date.now();
                if (metadata === null || metadata === void 0 ? void 0 : metadata.error) {
                    this.lastError = metadata.error;
                }
                if (metadata === null || metadata === void 0 ? void 0 : metadata.modelInfo) {
                    this.modelInfo = metadata.modelInfo;
                }
                eventData = this.createEventData();
                this.emit(types_1.ConnectionEvent.StateChanged, eventData);
                this.emit(newState, eventData);
                timeout = this.config.transitionTimeouts.get(newState);
                if (timeout) {
                    this.setStateTimeout(timeout);
                }
                return [2 /*return*/, true];
            });
        });
    };
    LLMConnectionEventService.prototype.isValidTransition = function (newState) {
        var allowedStates = this.config.allowedTransitions.get(this.currentState);
        return (allowedStates === null || allowedStates === void 0 ? void 0 : allowedStates.has(newState)) || false;
    };
    LLMConnectionEventService.prototype.setStateTimeout = function (timeout) {
        var _this = this;
        this.clearStateTimeout();
        this.stateTimeout = setTimeout(function () {
            _this.handleStateTimeout();
        }, timeout);
    };
    LLMConnectionEventService.prototype.clearStateTimeout = function () {
        if (this.stateTimeout) {
            clearTimeout(this.stateTimeout);
            this.stateTimeout = undefined;
        }
    };
    LLMConnectionEventService.prototype.handleStateTimeout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.currentState === 'connecting' || this.currentState === 'reconnecting')) return [3 /*break*/, 2];
                        error = new Error("".concat(this.currentState, " timed out after ").concat(this.config.transitionTimeouts.get(this.currentState), "ms"));
                        return [4 /*yield*/, this.transitionTo('error', { error: error })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    LLMConnectionEventService.prototype.createEventData = function () {
        return {
            previousState: this.previousState,
            currentState: this.currentState,
            timestamp: this.stateTimestamp,
            duration: Date.now() - this.stateTimestamp,
            error: this.lastError,
            modelInfo: this.modelInfo
        };
    };
    LLMConnectionEventService.prototype.reset = function () {
        this.clearStateTimeout();
        this.currentState = 'disconnected';
        this.previousState = 'disconnected';
        this.stateTimestamp = Date.now();
        this.lastError = undefined;
        this.modelInfo = undefined;
        this.emit(types_1.ConnectionEvent.StateChanged, this.createEventData());
    };
    LLMConnectionEventService.prototype.dispose = function () {
        this.clearStateTimeout();
        this.removeAllListeners();
    };
    return LLMConnectionEventService;
}(events_1.EventEmitter));
exports.LLMConnectionEventService = LLMConnectionEventService;
