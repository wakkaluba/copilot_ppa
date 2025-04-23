"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatError = exports.ChatEvent = exports.ChatState = exports.ChatRole = exports.ProviderError = exports.ProviderEvent = exports.ProviderConnectionState = exports.ProviderState = exports.ProviderStatus = exports.LLMConnectionError = exports.LLMConnectionErrorCode = exports.ConnectionEvent = void 0;
const errors_1 = require("./errors");
/**
 * LLM connection events
 */
var ConnectionEvent;
(function (ConnectionEvent) {
    ConnectionEvent["Connected"] = "connected";
    ConnectionEvent["Disconnected"] = "disconnected";
    ConnectionEvent["Reconnecting"] = "reconnecting";
    ConnectionEvent["Error"] = "error";
    ConnectionEvent["StateChanged"] = "stateChanged";
    ConnectionEvent["ModelChanged"] = "modelChanged";
    ConnectionEvent["HealthCheckFailed"] = "healthCheckFailed";
})(ConnectionEvent || (exports.ConnectionEvent = ConnectionEvent = {}));
/**
 * Error codes specific to LLM connections
 */
var LLMConnectionErrorCode;
(function (LLMConnectionErrorCode) {
    LLMConnectionErrorCode["ConnectionFailed"] = "CONNECTION_FAILED";
    LLMConnectionErrorCode["InvalidEndpoint"] = "INVALID_ENDPOINT";
    LLMConnectionErrorCode["ModelNotFound"] = "MODEL_NOT_FOUND";
    LLMConnectionErrorCode["HealthCheckFailed"] = "HEALTH_CHECK_FAILED";
    LLMConnectionErrorCode["AuthenticationFailed"] = "AUTHENTICATION_FAILED";
    LLMConnectionErrorCode["Timeout"] = "TIMEOUT";
    LLMConnectionErrorCode["ProviderNotFound"] = "PROVIDER_NOT_FOUND";
    LLMConnectionErrorCode["InvalidConfiguration"] = "INVALID_CONFIGURATION";
    LLMConnectionErrorCode["NetworkError"] = "NETWORK_ERROR";
})(LLMConnectionErrorCode || (exports.LLMConnectionErrorCode = LLMConnectionErrorCode = {}));
/**
 * Custom error class for LLM connection errors
 */
class LLMConnectionError extends errors_1.Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'LLMConnectionError';
    }
}
exports.LLMConnectionError = LLMConnectionError;
/**
 * Provider status
 */
var ProviderStatus;
(function (ProviderStatus) {
    ProviderStatus["HEALTHY"] = "HEALTHY";
    ProviderStatus["UNHEALTHY"] = "UNHEALTHY";
    ProviderStatus["UNKNOWN"] = "UNKNOWN";
})(exports.ProviderStatus || (exports.ProviderStatus = {}));
var ProviderState;
(function (ProviderState) {
    ProviderState["Unknown"] = "unknown";
    ProviderState["Registered"] = "registered";
    ProviderState["Initializing"] = "initializing";
    ProviderState["Active"] = "active";
    ProviderState["Error"] = "error";
    ProviderState["Deactivating"] = "deactivating";
    ProviderState["Inactive"] = "inactive";
    ProviderState["Unregistered"] = "unregistered";
})(ProviderState || (exports.ProviderState = ProviderState = {}));
var ProviderConnectionState;
(function (ProviderConnectionState) {
    ProviderConnectionState["Available"] = "available";
    ProviderConnectionState["Active"] = "active";
    ProviderConnectionState["Error"] = "error";
})(ProviderConnectionState || (exports.ProviderConnectionState = ProviderConnectionState = {}));
var ProviderEvent;
(function (ProviderEvent) {
    ProviderEvent["Registered"] = "provider:registered";
    ProviderEvent["Initialized"] = "provider:initialized";
    ProviderEvent["StateChanged"] = "provider:stateChanged";
    ProviderEvent["ConnectionStateChanged"] = "provider:connectionStateChanged";
    ProviderEvent["HealthStatusUpdated"] = "provider:healthStatusUpdated";
    ProviderEvent["MetricsUpdated"] = "provider:metricsUpdated";
    ProviderEvent["Deactivated"] = "provider:deactivated";
    ProviderEvent["Unregistered"] = "provider:unregistered";
})(ProviderEvent || (exports.ProviderEvent = ProviderEvent = {}));
class ProviderError extends errors_1.Error {
    providerId;
    cause;
    constructor(message, providerId, cause) {
        super(message);
        this.providerId = providerId;
        this.cause = cause;
        this.name = 'ProviderError';
    }
}
exports.ProviderError = ProviderError;
var ChatRole;
(function (ChatRole) {
    ChatRole["User"] = "user";
    ChatRole["Assistant"] = "assistant";
    ChatRole["System"] = "system";
})(ChatRole || (exports.ChatRole = ChatRole = {}));
var ChatState;
(function (ChatState) {
    ChatState["Active"] = "active";
    ChatState["Ended"] = "ended";
    ChatState["Error"] = "error";
})(ChatState || (exports.ChatState = ChatState = {}));
var ChatEvent;
(function (ChatEvent) {
    ChatEvent["MessageSent"] = "messageSent";
    ChatEvent["MessageHandled"] = "messageHandled";
    ChatEvent["SessionCreated"] = "sessionCreated";
    ChatEvent["SessionEnded"] = "sessionEnded";
    ChatEvent["SessionResumed"] = "sessionResumed";
    ChatEvent["HistoryLoaded"] = "historyLoaded";
    ChatEvent["HistorySaved"] = "historySaved";
    ChatEvent["HistoryCleared"] = "historyCleared";
    ChatEvent["Error"] = "error";
})(ChatEvent || (exports.ChatEvent = ChatEvent = {}));
class ChatError extends errors_1.Error {
    sessionId;
    cause;
    constructor(message, sessionId, cause) {
        super(message);
        this.sessionId = sessionId;
        this.cause = cause;
        this.name = 'ChatError';
    }
}
exports.ChatError = ChatError;
//# sourceMappingURL=types.js.map