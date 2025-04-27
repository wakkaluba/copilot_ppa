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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRegistry = void 0;
var events_1 = require("events");
var interfaces_1 = require("./interfaces");
var errors_1 = require("./errors");
/**
 * Manages LLM provider registration and discovery
 */
var ProviderRegistry = /** @class */ (function (_super) {
    __extends(ProviderRegistry, _super);
    function ProviderRegistry() {
        var _this = _super.call(this) || this;
        _this.providers = new Map();
        _this.priorityQueue = [];
        return _this;
    }
    ProviderRegistry.getInstance = function () {
        if (!this.instance) {
            this.instance = new ProviderRegistry();
        }
        return this.instance;
    };
    /**
     * Register a new provider
     */
    ProviderRegistry.prototype.registerProvider = function (providerId, options) {
        if (this.providers.has(providerId)) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', "Provider ".concat(providerId, " is already registered"));
        }
        var providerInfo = {
            id: providerId,
            name: options.name,
            version: options.version,
            capabilities: options.capabilities,
            status: interfaces_1.ProviderStatus.UNKNOWN,
            priority: options.priority || 0,
            metadata: options.metadata || {}
        };
        this.providers.set(providerId, providerInfo);
        this.updatePriorityQueue();
        this.emit('providerRegistered', { providerId: providerId, info: __assign({}, providerInfo) });
    };
    /**
     * Update provider status
     */
    ProviderRegistry.prototype.updateProviderStatus = function (providerId, status) {
        var provider = this.providers.get(providerId);
        if (!provider) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', "Provider ".concat(providerId, " is not registered"));
        }
        provider.status = status;
        this.emit('providerStatusUpdated', {
            providerId: providerId,
            status: status,
            info: __assign({}, provider)
        });
    };
    /**
     * Get provider information
     */
    ProviderRegistry.prototype.getProviderInfo = function (providerId) {
        var provider = this.providers.get(providerId);
        return provider ? __assign({}, provider) : undefined;
    };
    /**
     * Get all registered providers
     */
    ProviderRegistry.prototype.getAllProviders = function () {
        return Array.from(this.providers.values()).map(function (p) { return (__assign({}, p)); });
    };
    /**
     * Get providers with specific capabilities
     */
    ProviderRegistry.prototype.getProvidersWithCapability = function (capability) {
        return Array.from(this.providers.values())
            .filter(function (p) { return p.capabilities[capability]; })
            .map(function (p) { return (__assign({}, p)); });
    };
    /**
     * Get next available provider by priority
     */
    ProviderRegistry.prototype.getNextAvailableProvider = function () {
        for (var _i = 0, _a = this.priorityQueue; _i < _a.length; _i++) {
            var providerId = _a[_i];
            var provider = this.providers.get(providerId);
            if (provider && provider.status === interfaces_1.ProviderStatus.HEALTHY) {
                return __assign({}, provider);
            }
        }
        return undefined;
    };
    /**
     * Update provider priority
     */
    ProviderRegistry.prototype.updateProviderPriority = function (providerId, priority) {
        var provider = this.providers.get(providerId);
        if (!provider) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', "Provider ".concat(providerId, " is not registered"));
        }
        provider.priority = priority;
        this.updatePriorityQueue();
        this.emit('providerPriorityUpdated', {
            providerId: providerId,
            priority: priority,
            info: __assign({}, provider)
        });
    };
    /**
     * Update provider metadata
     */
    ProviderRegistry.prototype.updateProviderMetadata = function (providerId, metadata) {
        var provider = this.providers.get(providerId);
        if (!provider) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', "Provider ".concat(providerId, " is not registered"));
        }
        provider.metadata = __assign(__assign({}, provider.metadata), metadata);
        this.emit('providerMetadataUpdated', {
            providerId: providerId,
            metadata: __assign({}, provider.metadata),
            info: __assign({}, provider)
        });
    };
    /**
     * Update provider capabilities
     */
    ProviderRegistry.prototype.updateProviderCapabilities = function (providerId, capabilities) {
        var provider = this.providers.get(providerId);
        if (!provider) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', "Provider ".concat(providerId, " is not registered"));
        }
        provider.capabilities = __assign(__assign({}, provider.capabilities), capabilities);
        this.emit('providerCapabilitiesUpdated', {
            providerId: providerId,
            capabilities: __assign({}, provider.capabilities),
            info: __assign({}, provider)
        });
    };
    /**
     * Unregister a provider
     */
    ProviderRegistry.prototype.unregisterProvider = function (providerId) {
        if (!this.providers.has(providerId)) {
            throw new errors_1.LLMConnectionError('PROVIDER_ERROR', "Provider ".concat(providerId, " is not registered"));
        }
        var provider = this.providers.get(providerId);
        this.providers.delete(providerId);
        this.updatePriorityQueue();
        this.emit('providerUnregistered', {
            providerId: providerId,
            info: __assign({}, provider)
        });
    };
    ProviderRegistry.prototype.updatePriorityQueue = function () {
        var _this = this;
        this.priorityQueue = Array.from(this.providers.keys())
            .sort(function (a, b) {
            var providerA = _this.providers.get(a);
            var providerB = _this.providers.get(b);
            return providerB.priority - providerA.priority;
        });
    };
    ProviderRegistry.prototype.dispose = function () {
        this.providers.clear();
        this.priorityQueue = [];
        this.removeAllListeners();
    };
    return ProviderRegistry;
}(events_1.EventEmitter));
exports.ProviderRegistry = ProviderRegistry;
