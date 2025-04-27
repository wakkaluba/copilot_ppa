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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMHostManager = exports.HostStatus = void 0;
var events_1 = require("events");
var HostStatus;
(function (HostStatus) {
    HostStatus["Unknown"] = "unknown";
    HostStatus["Available"] = "available";
    HostStatus["Unavailable"] = "unavailable";
    HostStatus["Error"] = "error";
})(HostStatus || (exports.HostStatus = HostStatus = {}));
var LLMHostManager = /** @class */ (function (_super) {
    __extends(LLMHostManager, _super);
    function LLMHostManager() {
        var _this = _super.call(this) || this;
        _this.hosts = new Map();
        _this.checkIntervals = new Map();
        _this.defaultCheckInterval = 60000; // 1 minute
        return _this;
    }
    /**
     * Add a new LLM host
     * @param id Unique identifier for the host
     * @param name Display name for the host
     * @param url Base URL for the host's API
     * @returns The created host object
     */
    LLMHostManager.prototype.addHost = function (id, name, url) {
        if (this.hosts.has(id)) {
            throw new Error("Host with ID ".concat(id, " already exists"));
        }
        var host = {
            id: id,
            name: name,
            url: url,
            isAvailable: false,
            lastCheck: 0,
            status: HostStatus.Unknown,
            supportsStreaming: false
        };
        this.hosts.set(id, host);
        this.emit('hostAdded', host);
        return host;
    };
    /**
     * Add a host from provider configuration
     * @param config Provider configuration
     * @returns The created host object
     */
    LLMHostManager.prototype.addHostFromConfig = function (config) {
        return this.addHost(config.id, config.name, config.apiEndpoint);
    };
    /**
     * Get a host by ID
     * @param id Host ID
     * @returns The host object or undefined if not found
     */
    LLMHostManager.prototype.getHost = function (id) {
        return this.hosts.get(id);
    };
    /**
     * Get all registered hosts
     * @returns Array of all hosts
     */
    LLMHostManager.prototype.getAllHosts = function () {
        return Array.from(this.hosts.values());
    };
    /**
     * Remove a host
     * @param id Host ID to remove
     * @returns True if the host was removed
     */
    LLMHostManager.prototype.removeHost = function (id) {
        if (!this.hosts.has(id)) {
            return false;
        }
        // Stop any active check interval
        this.stopHostCheck(id);
        var host = this.hosts.get(id);
        this.hosts.delete(id);
        this.emit('hostRemoved', host);
        return true;
    };
    /**
     * Check if a host is available
     * @param id Host ID to check
     * @returns Promise resolving to the check result
     */
    LLMHostManager.prototype.checkHost = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var host, startTime, result, isAvailable, endTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        host = this.hosts.get(id);
                        if (!host) {
                            throw new Error("Host with ID ".concat(id, " not found"));
                        }
                        startTime = Date.now();
                        result = {
                            isAvailable: false
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.simulateHostCheck(host.url)];
                    case 2:
                        isAvailable = _a.sent();
                        endTime = Date.now();
                        result = {
                            isAvailable: isAvailable,
                            latency: endTime - startTime,
                            apiVersion: "1.0", // This would come from the actual API response
                            supportsStreaming: true // This would be determined from the API response
                        };
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        result.isAvailable = false;
                        result.error = error_1 instanceof Error ? error_1.message : String(error_1);
                        return [3 /*break*/, 4];
                    case 4:
                        // Update the host status
                        this.updateHostStatus(id, result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Start periodic checking of a host
     * @param id Host ID to check
     * @param intervalMs Interval in milliseconds between checks
     */
    LLMHostManager.prototype.startHostCheck = function (id, intervalMs) {
        var _this = this;
        if (intervalMs === void 0) { intervalMs = this.defaultCheckInterval; }
        if (!this.hosts.has(id)) {
            throw new Error("Host with ID ".concat(id, " not found"));
        }
        // Clear any existing interval
        this.stopHostCheck(id);
        // Set up a new check interval
        var timer = setInterval(function () {
            _this.checkHost(id).catch(function (error) {
                console.error("Error checking host ".concat(id, ":"), error);
            });
        }, intervalMs);
        this.checkIntervals.set(id, timer);
        // Run an immediate check
        this.checkHost(id).catch(function (error) {
            console.error("Error checking host ".concat(id, ":"), error);
        });
    };
    /**
     * Stop periodic checking of a host
     * @param id Host ID to stop checking
     */
    LLMHostManager.prototype.stopHostCheck = function (id) {
        var interval = this.checkIntervals.get(id);
        if (interval) {
            clearInterval(interval);
            this.checkIntervals.delete(id);
        }
    };
    /**
     * Update a host's configuration
     * @param id Host ID to update
     * @param updates Partial host updates
     * @returns The updated host
     */
    LLMHostManager.prototype.updateHost = function (id, updates) {
        var host = this.hosts.get(id);
        if (!host) {
            throw new Error("Host with ID ".concat(id, " not found"));
        }
        // Don't allow changing the ID
        var _ = updates.id, validUpdates = __rest(updates, ["id"]);
        var updatedHost = __assign(__assign({}, host), validUpdates);
        this.hosts.set(id, updatedHost);
        this.emit('hostUpdated', updatedHost);
        return updatedHost;
    };
    /**
     * Get all available hosts
     * @returns Array of available hosts
     */
    LLMHostManager.prototype.getAvailableHosts = function () {
        return Array.from(this.hosts.values()).filter(function (host) { return host.isAvailable; });
    };
    /**
     * Set the default check interval for all hosts
     * @param intervalMs Interval in milliseconds
     */
    LLMHostManager.prototype.setDefaultCheckInterval = function (intervalMs) {
        if (intervalMs < 5000) {
            throw new Error('Check interval must be at least 5000ms (5 seconds)');
        }
        this.defaultCheckInterval = intervalMs;
    };
    /**
     * Start checking all hosts
     */
    LLMHostManager.prototype.startCheckingAllHosts = function () {
        for (var _i = 0, _a = this.hosts.keys(); _i < _a.length; _i++) {
            var host = _a[_i];
            this.startHostCheck(host);
        }
    };
    /**
     * Stop checking all hosts
     */
    LLMHostManager.prototype.stopCheckingAllHosts = function () {
        for (var _i = 0, _a = this.checkIntervals.values(); _i < _a.length; _i++) {
            var interval = _a[_i];
            clearInterval(interval);
        }
        this.checkIntervals.clear();
    };
    LLMHostManager.prototype.simulateHostCheck = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, this would make an actual HTTP request to check the host
                // For testing purposes, we'll simulate a success with occasional failures
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            // 90% success rate
                            var isAvailable = Math.random() < 0.9;
                            resolve(isAvailable);
                        }, Math.random() * 100 + 50); // Random delay between 50-150ms
                    })];
            });
        });
    };
    LLMHostManager.prototype.updateHostStatus = function (id, result) {
        var host = this.hosts.get(id);
        if (!host) {
            return;
        }
        var previousStatus = host.status;
        var previousAvailability = host.isAvailable;
        // Update the host with check results
        host.isAvailable = result.isAvailable;
        host.lastCheck = Date.now();
        if (result.latency !== undefined) {
            host.latency = result.latency;
        }
        if (result.apiVersion !== undefined) {
            host.apiVersion = result.apiVersion;
        }
        if (result.supportsStreaming !== undefined) {
            host.supportsStreaming = result.supportsStreaming;
        }
        if (result.isAvailable) {
            host.status = HostStatus.Available;
            host.error = undefined;
        }
        else {
            host.status = result.error ? HostStatus.Error : HostStatus.Unavailable;
            host.error = result.error;
        }
        // Emit status change events if needed
        if (previousStatus !== host.status) {
            this.emit('hostStatusChanged', host);
        }
        if (previousAvailability !== host.isAvailable) {
            this.emit(host.isAvailable ? 'hostBecameAvailable' : 'hostBecameUnavailable', host);
        }
    };
    LLMHostManager.prototype.dispose = function () {
        this.stopCheckingAllHosts();
        this.removeAllListeners();
    };
    return LLMHostManager;
}(events_1.EventEmitter));
exports.LLMHostManager = LLMHostManager;
