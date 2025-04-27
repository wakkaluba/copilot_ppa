"use strict";
/**
 * Types and interfaces for LLM connection management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONNECTION_OPTIONS = exports.HostState = exports.ConnectionState = void 0;
/**
 * Connection states for LLM services
 */
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["CONNECTED"] = "connected";
    ConnectionState["CONNECTING"] = "connecting";
    ConnectionState["DISCONNECTED"] = "disconnected";
    ConnectionState["RECONNECTING"] = "reconnecting";
    ConnectionState["ERROR"] = "error";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
/**
 * Represents the state of the LLM host
 */
var HostState;
(function (HostState) {
    HostState["STOPPED"] = "stopped";
    HostState["STARTING"] = "starting";
    HostState["RUNNING"] = "running";
    HostState["ERROR"] = "error";
})(HostState = exports.HostState || (exports.HostState = {}));
/**
 * Default connection options
 */
exports.DEFAULT_CONNECTION_OPTIONS = {
    maxRetries: 3,
    initialRetryDelay: 1000,
    maxRetryDelay: 30000,
    retryBackoffFactor: 2,
    connectionTimeout: 10000,
    reconnectOnError: true,
    healthCheckInterval: 30000
};
//# sourceMappingURL=llm.js.map