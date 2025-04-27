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
exports.LLMConnectionManager = exports.ConnectionStatus = void 0;
var events_1 = require("events");
var LLMProviderValidator_1 = require("./validators/LLMProviderValidator");
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["Disconnected"] = "disconnected";
    ConnectionStatus["Connecting"] = "connecting";
    ConnectionStatus["Connected"] = "connected";
    ConnectionStatus["Error"] = "error";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
var LLMConnectionManager = /** @class */ (function (_super) {
    __extends(LLMConnectionManager, _super);
    function LLMConnectionManager() {
        var _this = _super.call(this) || this;
        _this.provider = null;
        _this.status = ConnectionStatus.Disconnected;
        _this.connectionTimeout = 30000; // 30 seconds default timeout
        _this.connectionAttempts = 0;
        _this.maxConnectionAttempts = 3;
        _this.validator = new LLMProviderValidator_1.LLMProviderValidator();
        return _this;
    }
    /**
     * Set the LLM provider to use
     * @param provider The LLM provider implementation
     * @returns True if the provider was set successfully
     */
    LLMConnectionManager.prototype.setProvider = function (provider) {
        if (!provider) {
            throw new Error('Provider cannot be null or undefined');
        }
        // Validate the provider
        var validationResult = this.validator.validate(provider);
        if (!validationResult.isValid) {
            var errors = validationResult.errors.join(', ');
            throw new Error("Invalid LLM provider: ".concat(errors));
        }
        this.provider = provider;
        this.emit('providerChanged', {
            provider: provider.getName(),
            status: this.status,
            timestamp: new Date()
        });
        return true;
    };
    /**
     * Get the current LLM provider
     * @returns The current LLM provider or null if not set
     */
    LLMConnectionManager.prototype.getProvider = function () {
        return this.provider;
    };
    /**
     * Connect to the LLM provider
     * @returns True if connected successfully
     */
    LLMConnectionManager.prototype.connectToLLM = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isAvailable, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.provider) {
                            throw new Error('No provider set - call setProvider first');
                        }
                        // Prevent connection if already connecting or connected
                        if (this.status === ConnectionStatus.Connecting || this.status === ConnectionStatus.Connected) {
                            return [2 /*return*/, this.status === ConnectionStatus.Connected];
                        }
                        this.setStatus(ConnectionStatus.Connecting);
                        this.connectionAttempts += 1;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.withTimeout(this.provider.isAvailable(), this.connectionTimeout, 'Connection timeout')];
                    case 2:
                        isAvailable = _a.sent();
                        if (!isAvailable) {
                            throw new Error('Provider is not available');
                        }
                        this.setStatus(ConnectionStatus.Connected);
                        this.connectionAttempts = 0;
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        this.setStatus(ConnectionStatus.Error, new Error("Failed to connect: ".concat(errorMessage)));
                        // If we haven't exceeded max attempts, try again
                        if (this.connectionAttempts < this.maxConnectionAttempts) {
                            console.log("Connection attempt ".concat(this.connectionAttempts, " failed, retrying..."));
                            return [2 /*return*/, this.connectToLLM()];
                        }
                        this.connectionAttempts = 0;
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Disconnect from the LLM provider
     */
    LLMConnectionManager.prototype.disconnectFromLLM = function () {
        this.setStatus(ConnectionStatus.Disconnected);
    };
    /**
     * Get the current connection status
     * @returns The current connection status
     */
    LLMConnectionManager.prototype.getConnectionStatus = function () {
        return this.status;
    };
    /**
     * Get the capabilities of the current provider
     * @returns The provider capabilities or null if no provider is set
     */
    LLMConnectionManager.prototype.getCapabilities = function () {
        if (!this.provider) {
            return null;
        }
        return this.provider.getCapabilities();
    };
    /**
     * Set the connection timeout
     * @param timeoutMs Timeout in milliseconds
     */
    LLMConnectionManager.prototype.setConnectionTimeout = function (timeoutMs) {
        if (timeoutMs < 1000) {
            throw new Error('Timeout must be at least 1000ms (1 second)');
        }
        this.connectionTimeout = timeoutMs;
    };
    /**
     * Set the maximum number of connection attempts
     * @param attempts Maximum number of attempts
     */
    LLMConnectionManager.prototype.setMaxConnectionAttempts = function (attempts) {
        if (attempts < 1) {
            throw new Error('Max connection attempts must be at least 1');
        }
        this.maxConnectionAttempts = attempts;
    };
    LLMConnectionManager.prototype.setStatus = function (status, error) {
        var _a;
        this.status = status;
        var event = {
            provider: (_a = this.provider) === null || _a === void 0 ? void 0 : _a.getName(),
            status: status,
            timestamp: new Date()
        };
        if (error) {
            event.error = error;
        }
        this.emit('statusChanged', event);
    };
    LLMConnectionManager.prototype.withTimeout = function (promise, timeoutMs, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.race([
                        promise,
                        new Promise(function (_, reject) {
                            setTimeout(function () {
                                reject(new Error(message));
                            }, timeoutMs);
                        })
                    ])];
            });
        });
    };
    LLMConnectionManager.prototype.dispose = function () {
        this.removeAllListeners();
    };
    return LLMConnectionManager;
}(events_1.EventEmitter));
exports.LLMConnectionManager = LLMConnectionManager;
