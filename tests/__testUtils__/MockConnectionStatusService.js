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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockConnectionStatusService = void 0;
var vscode = require("vscode");
var connectionStatusService_1 = require("../../src/status/connectionStatusService");
var events_1 = require("events");
/**
 * Mock ConnectionStatusService for testing
 */
var MockConnectionStatusService = /** @class */ (function (_super) {
    __extends(MockConnectionStatusService, _super);
    function MockConnectionStatusService() {
        var _this = _super.call(this) || this;
        _this._state = connectionStatusService_1.ConnectionState.Disconnected;
        _this._activeModelName = '';
        _this._providerName = '';
        /**
         * Event emitted when the connection state changes
         */
        _this.onDidChangeState = _this.event;
        _this._statusBarItem = {
            id: 'mock-status-bar',
            name: 'Mock Status Bar',
            tooltip: '',
            text: '',
            command: undefined,
            color: undefined,
            backgroundColor: undefined,
            alignment: vscode.StatusBarAlignment.Left,
            priority: 0,
            accessibilityInformation: { label: 'Mock Status', role: 'Status' },
            show: function () { },
            hide: function () { },
            dispose: function () { }
        };
        return _this;
    }
    Object.defineProperty(MockConnectionStatusService.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MockConnectionStatusService.prototype, "activeModelName", {
        get: function () {
            return this._activeModelName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MockConnectionStatusService.prototype, "providerName", {
        get: function () {
            return this._providerName;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the connection state
     * @param state New state
     * @param info Additional info about the state change
     */
    MockConnectionStatusService.prototype.setState = function (state, info) {
        this._state = state;
        if (info) {
            if (info.modelName) {
                this._activeModelName = info.modelName;
            }
            if (info.providerName) {
                this._providerName = info.providerName;
            }
        }
        this.emit('stateChanged', state, info);
    };
    /**
     * Shows a notification to the user
     * @param message Message to show
     * @param type Notification type (info, warning, error)
     */
    MockConnectionStatusService.prototype.showNotification = function (message, type) {
        if (type === void 0) { type = 'info'; }
        // No-op in mock implementation
    };
    Object.defineProperty(MockConnectionStatusService.prototype, "event", {
        /**
         * Creates an event listener
         */
        get: function () {
            var _this = this;
            return function (listener) {
                _this.on('stateChanged', listener);
                // Return a disposable to remove the listener
                return {
                    dispose: function () {
                        _this.off('stateChanged', listener);
                    }
                };
            };
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Disposes of resources
     */
    MockConnectionStatusService.prototype.dispose = function () {
        this.removeAllListeners();
        this._statusBarItem.dispose();
    };
    return MockConnectionStatusService;
}(events_1.EventEmitter));
exports.MockConnectionStatusService = MockConnectionStatusService;
