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
exports.ConnectionStatusService = exports.ConnectionState = void 0;
var vscode = require("vscode");
var LLMConnectionManager_1 = require("../services/llm/LLMConnectionManager");
var events_1 = require("events");
var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["Disconnected"] = 0] = "Disconnected";
    ConnectionState[ConnectionState["Connecting"] = 1] = "Connecting";
    ConnectionState[ConnectionState["Connected"] = 2] = "Connected";
    ConnectionState[ConnectionState["Error"] = 3] = "Error";
})(ConnectionState || (exports.ConnectionState = ConnectionState = {}));
var ConnectionStatusService = /** @class */ (function (_super) {
    __extends(ConnectionStatusService, _super);
    function ConnectionStatusService(hostManager, connectionManager) {
        var _this = _super.call(this) || this;
        _this.disposables = [];
        _this._state = ConnectionState.Disconnected;
        _this._activeModelName = '';
        _this._providerName = '';
        _this._stateChangeEmitter = new vscode.EventEmitter();
        _this.hostManager = hostManager;
        _this.connectionManager = connectionManager;
        _this.currentStatus = {
            status: LLMConnectionManager_1.ConnectionStatus.Disconnected,
            lastUpdate: Date.now()
        };
        _this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        _this.statusBarItem.command = 'copilot-ppa.toggleLLMConnection';
        _this.updateStatusBar();
        _this.statusBarItem.show();
        _this.registerEventListeners();
        return _this;
    }
    Object.defineProperty(ConnectionStatusService.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConnectionStatusService.prototype, "activeModelName", {
        get: function () {
            return this._activeModelName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConnectionStatusService.prototype, "providerName", {
        get: function () {
            return this._providerName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConnectionStatusService.prototype, "onDidChangeState", {
        get: function () {
            return this._stateChangeEmitter.event;
        },
        enumerable: false,
        configurable: true
    });
    ConnectionStatusService.prototype.setState = function (state) {
        this._state = state;
        this._stateChangeEmitter.fire(state);
        this.updateStatusBar();
    };
    ConnectionStatusService.prototype.showNotification = function (message, type) {
        if (type === void 0) { type = 'info'; }
        switch (type) {
            case 'warning':
                vscode.window.showWarningMessage(message);
                break;
            case 'error':
                vscode.window.showErrorMessage(message);
                break;
            default:
                vscode.window.showInformationMessage(message);
        }
    };
    ConnectionStatusService.prototype.registerEventListeners = function () {
        var _this = this;
        // Listen for connection status changes
        this.connectionManager.on('statusChanged', function (_event) {
            _this.updateConnectionStatus();
        });
        // Listen for host status changes
        this.hostManager.on('hostStatusChanged', function (host) {
            _this.updateHostStatus(host.id);
        });
        // Listen for host availability changes
        this.hostManager.on('hostBecameAvailable', function (host) {
            _this.updateHostStatus(host.id);
        });
        this.hostManager.on('hostBecameUnavailable', function (host) {
            _this.updateHostStatus(host.id);
        });
    };
    /**
     * Update the connection status information
     */
    ConnectionStatusService.prototype.updateConnectionStatus = function () {
        var connectionStatus = this.connectionManager.getConnectionStatus();
        var provider = this.connectionManager.getProvider();
        this.currentStatus = __assign(__assign({}, this.currentStatus), { status: connectionStatus, provider: provider === null || provider === void 0 ? void 0 : provider.getName(), lastUpdate: Date.now() });
        this.updateStatusBar();
    };
    /**
     * Update host status information
     * @param hostId ID of the host to update
     */
    ConnectionStatusService.prototype.updateHostStatus = function (hostId) {
        var host = this.hostManager.getHost(hostId);
        if (!host) {
            return;
        }
        this.currentStatus = __assign(__assign({}, this.currentStatus), { hostStatus: host.status, host: host.name, lastUpdate: Date.now() });
        this.updateStatusBar();
    };
    /**
     * Get the current connection status
     * @returns Current status information
     */
    ConnectionStatusService.prototype.getStatus = function () {
        return __assign({}, this.currentStatus);
    };
    /**
     * Update the status bar display based on current status
     */
    ConnectionStatusService.prototype.updateStatusBar = function () {
        var _a = this.currentStatus, status = _a.status, provider = _a.provider, host = _a.host;
        var text = '';
        var tooltip = '';
        var color;
        switch (status) {
            case LLMConnectionManager_1.ConnectionStatus.Connected:
                text = "$(check) LLM: ".concat(provider || 'Connected');
                tooltip = "Connected to ".concat(provider).concat(host ? " on ".concat(host) : '');
                break;
            case LLMConnectionManager_1.ConnectionStatus.Connecting:
                text = "$(sync~spin) LLM: Connecting...";
                tooltip = "Connecting to LLM provider".concat(provider ? " (".concat(provider, ")") : '');
                break;
            case LLMConnectionManager_1.ConnectionStatus.Error:
                text = "$(error) LLM: Error";
                tooltip = "Error connecting to LLM provider".concat(provider ? " (".concat(provider, ")") : '');
                color = new vscode.ThemeColor('statusBarItem.errorBackground');
                break;
            case LLMConnectionManager_1.ConnectionStatus.Disconnected:
            default:
                text = "$(plug) LLM: Disconnected";
                tooltip = 'Click to connect to an LLM provider';
                break;
        }
        this.statusBarItem.text = text;
        this.statusBarItem.tooltip = tooltip;
        if (color) {
            this.statusBarItem.backgroundColor = color;
        }
        else {
            this.statusBarItem.backgroundColor = undefined;
        }
    };
    ConnectionStatusService.prototype.dispose = function () {
        this.statusBarItem.dispose();
        this._stateChangeEmitter.dispose();
        this.disposables.forEach(function (d) { return d.dispose(); });
    };
    return ConnectionStatusService;
}(events_1.EventEmitter));
exports.ConnectionStatusService = ConnectionStatusService;
