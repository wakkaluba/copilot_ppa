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
exports.LLMProviderRegistry = void 0;
var events_1 = require("events");
var types_1 = require("../types");
var LLMProviderRegistry = /** @class */ (function (_super) {
    __extends(LLMProviderRegistry, _super);
    function LLMProviderRegistry() {
        var _this = _super.call(this) || this;
        _this.providers = new Map();
        _this.priorityQueue = [];
        return _this;
    }
    LLMProviderRegistry.getInstance = function () {
        if (!LLMProviderRegistry.instance) {
            LLMProviderRegistry.instance = new LLMProviderRegistry();
        }
        return LLMProviderRegistry.instance;
    };
    LLMProviderRegistry.prototype.registerProvider = function (provider, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.providers.has(provider.id)) {
                    throw new types_1.ProviderError('Provider already registered', provider.id);
                }
                // Register the provider
                this.providers.set(provider.id, {
                    provider: provider,
                    config: config,
                    state: types_1.ProviderState.Registered,
                    registeredAt: Date.now()
                });
                // Add to priority queue
                this.priorityQueue.push(provider.id);
                this.sortPriorityQueue();
                this.emit(types_1.ProviderEvent.Registered, {
                    providerId: provider.id,
                    timestamp: new Date()
                });
                return [2 /*return*/];
            });
        });
    };
    LLMProviderRegistry.prototype.unregisterProvider = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var registration;
            return __generator(this, function (_a) {
                registration = this.providers.get(providerId);
                if (!registration) {
                    throw new types_1.ProviderError('Provider not found', providerId);
                }
                // Remove from collections
                this.providers.delete(providerId);
                this.priorityQueue = this.priorityQueue.filter(function (id) { return id !== providerId; });
                this.emit(types_1.ProviderEvent.Unregistered, {
                    providerId: providerId,
                    timestamp: new Date()
                });
                return [2 /*return*/];
            });
        });
    };
    LLMProviderRegistry.prototype.getProvider = function (providerId) {
        var _a;
        return (_a = this.providers.get(providerId)) === null || _a === void 0 ? void 0 : _a.provider;
    };
    LLMProviderRegistry.prototype.getProviderConfig = function (providerId) {
        var _a;
        return (_a = this.providers.get(providerId)) === null || _a === void 0 ? void 0 : _a.config;
    };
    LLMProviderRegistry.prototype.getAllProviders = function () {
        return Array.from(this.providers.entries()).map(function (_a) {
            var id = _a[0], reg = _a[1];
            return ({
                id: id,
                provider: reg.provider
            });
        });
    };
    LLMProviderRegistry.prototype.getNextAvailableProvider = function () {
        for (var _i = 0, _a = this.priorityQueue; _i < _a.length; _i++) {
            var providerId = _a[_i];
            var registration = this.providers.get(providerId);
            if ((registration === null || registration === void 0 ? void 0 : registration.state) === types_1.ProviderState.Active) {
                return registration.provider;
            }
        }
        return undefined;
    };
    LLMProviderRegistry.prototype.updateProviderState = function (providerId, state) {
        var registration = this.providers.get(providerId);
        if (!registration) {
            throw new types_1.ProviderError('Provider not found', providerId);
        }
        registration.state = state;
        this.emit(types_1.ProviderEvent.StateChanged, {
            providerId: providerId,
            state: state,
            timestamp: new Date()
        });
    };
    LLMProviderRegistry.prototype.sortPriorityQueue = function () {
        var _this = this;
        // Sort by registration time for now, could be enhanced with more sophisticated priority logic
        this.priorityQueue.sort(function (a, b) {
            var regA = _this.providers.get(a);
            var regB = _this.providers.get(b);
            if (!regA || !regB) {
                return 0;
            }
            return regA.registeredAt - regB.registeredAt;
        });
    };
    LLMProviderRegistry.prototype.dispose = function () {
        this.providers.clear();
        this.priorityQueue = [];
        this.removeAllListeners();
    };
    return LLMProviderRegistry;
}(events_1.EventEmitter));
exports.LLMProviderRegistry = LLMProviderRegistry;
