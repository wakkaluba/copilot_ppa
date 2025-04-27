"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionErrorCode = void 0;
/**
 * Error codes for LLM connection errors
 */
var ConnectionErrorCode;
(function (ConnectionErrorCode) {
    ConnectionErrorCode["TIMEOUT"] = "TIMEOUT";
    ConnectionErrorCode["PROVIDER_UNAVAILABLE"] = "PROVIDER_UNAVAILABLE";
    ConnectionErrorCode["AUTHENTICATION_FAILED"] = "AUTHENTICATION_FAILED";
    ConnectionErrorCode["MODEL_NOT_FOUND"] = "MODEL_NOT_FOUND";
    ConnectionErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ConnectionErrorCode["PROVIDER_ERROR"] = "PROVIDER_ERROR";
    ConnectionErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ConnectionErrorCode["INVALID_RESPONSE"] = "INVALID_RESPONSE";
    ConnectionErrorCode["HOST_ERROR"] = "HOST_ERROR";
    ConnectionErrorCode["NO_ACTIVE_PROVIDER"] = "NO_ACTIVE_PROVIDER";
    ConnectionErrorCode["CONNECTION_FAILED"] = "CONNECTION_FAILED";
    ConnectionErrorCode["INVALID_ENDPOINT"] = "INVALID_ENDPOINT";
    ConnectionErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
})(ConnectionErrorCode = exports.ConnectionErrorCode || (exports.ConnectionErrorCode = {}));
//# sourceMappingURL=interfaces.js.map