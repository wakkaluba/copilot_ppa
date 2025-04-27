"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusService = exports.ConnectionStatus = void 0;
var vscode = require("vscode");
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["Disconnected"] = "disconnected";
    ConnectionStatus["Connecting"] = "connecting";
    ConnectionStatus["Connected"] = "connected";
    ConnectionStatus["Error"] = "error";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
/**
 * Service to track and notify about LLM connection status
 */
var StatusService = /** @class */ (function () {
    function StatusService() {
        this._statusEventEmitter = new vscode.EventEmitter();
        this._currentStatus = { status: ConnectionStatus.Disconnected };
    }
    StatusService.getInstance = function () {
        if (!StatusService.instance) {
            StatusService.instance = new StatusService();
        }
        return StatusService.instance;
    };
    Object.defineProperty(StatusService.prototype, "onStatusChange", {
        get: function () {
            return this._statusEventEmitter.event;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StatusService.prototype, "currentStatus", {
        get: function () {
            return this._currentStatus;
        },
        enumerable: false,
        configurable: true
    });
    StatusService.prototype.updateStatus = function (status) {
        this._currentStatus = status;
        this._statusEventEmitter.fire(status);
    };
    StatusService.prototype.setConnecting = function (providerName) {
        this.updateStatus({
            status: ConnectionStatus.Connecting,
            message: "Connecting to ".concat(providerName, "..."),
            providerName: providerName
        });
    };
    StatusService.prototype.setConnected = function (providerName, modelName) {
        this.updateStatus({
            status: ConnectionStatus.Connected,
            message: "Connected to ".concat(modelName, " via ").concat(providerName),
            providerName: providerName,
            modelName: modelName
        });
    };
    StatusService.prototype.setDisconnected = function () {
        this.updateStatus({
            status: ConnectionStatus.Disconnected,
            message: 'Disconnected from LLM'
        });
    };
    StatusService.prototype.setError = function (errorMessage, providerName) {
        this.updateStatus({
            status: ConnectionStatus.Error,
            message: "Error: ".concat(errorMessage),
            providerName: providerName
        });
    };
    return StatusService;
}());
exports.StatusService = StatusService;
