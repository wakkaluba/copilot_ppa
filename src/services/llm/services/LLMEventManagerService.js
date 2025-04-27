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
exports.LLMEventManagerService = void 0;
var events_1 = require("events");
var LLMEventManagerService = /** @class */ (function (_super) {
    __extends(LLMEventManagerService, _super);
    function LLMEventManagerService() {
        var _this = _super.call(this) || this;
        _this.currentState = new Map();
        _this.stateHistory = new Map();
        _this.maxHistoryLength = 100;
        return _this;
    }
    LLMEventManagerService.prototype.emitEvent = function (providerId, event) {
        var timestamp = Date.now();
        this.emit(event.type, __assign(__assign({}, event), { providerId: providerId, timestamp: timestamp }));
        if (this.isStateChangeEvent(event)) {
            this.handleStateChange(providerId, event, timestamp);
        }
    };
    LLMEventManagerService.prototype.isStateChangeEvent = function (event) {
        return 'newState' in event;
    };
    LLMEventManagerService.prototype.handleStateChange = function (providerId, event, timestamp) {
        var oldState = this.currentState.get(providerId);
        this.currentState.set(providerId, event.newState);
        var transition = {
            oldState: oldState,
            newState: event.newState,
            reason: event.reason,
            timestamp: timestamp
        };
        this.addToHistory(providerId, transition);
        this.emit('stateChange', __assign({ providerId: providerId }, transition));
    };
    LLMEventManagerService.prototype.addToHistory = function (providerId, transition) {
        if (!this.stateHistory.has(providerId)) {
            this.stateHistory.set(providerId, []);
        }
        var history = this.stateHistory.get(providerId);
        history.push(transition);
        // Maintain max history length
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }
    };
    LLMEventManagerService.prototype.getCurrentState = function (providerId) {
        return this.currentState.get(providerId);
    };
    LLMEventManagerService.prototype.getStateHistory = function (providerId) {
        return __spreadArray([], (this.stateHistory.get(providerId) || []), true);
    };
    LLMEventManagerService.prototype.clearHistory = function (providerId) {
        this.stateHistory.set(providerId, []);
    };
    LLMEventManagerService.prototype.dispose = function () {
        this.removeAllListeners();
        this.currentState.clear();
        this.stateHistory.clear();
    };
    return LLMEventManagerService;
}(events_1.EventEmitter));
exports.LLMEventManagerService = LLMEventManagerService;
