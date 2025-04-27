"use strict";
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
exports.RepositoryPanelStateService = void 0;
var events_1 = require("events");
var RepositoryPanelStateService = /** @class */ (function () {
    function RepositoryPanelStateService() {
        this.state = {
            isAccessEnabled: false,
            errorMessage: undefined
        };
        this.eventEmitter = new events_1.EventEmitter();
    }
    RepositoryPanelStateService.prototype.getAccessState = function () {
        return this.state.isAccessEnabled;
    };
    RepositoryPanelStateService.prototype.setAccessEnabled = function (enabled) {
        this.state.isAccessEnabled = enabled;
        this.eventEmitter.emit('stateChanged', this.state);
    };
    RepositoryPanelStateService.prototype.setLastProvider = function (provider) {
        this.state.lastProvider = provider;
        this.eventEmitter.emit('stateChanged', this.state);
    };
    RepositoryPanelStateService.prototype.setLastCreatedRepo = function (repoUrl) {
        this.state.lastCreatedRepo = repoUrl;
        this.eventEmitter.emit('stateChanged', this.state);
    };
    RepositoryPanelStateService.prototype.setErrorMessage = function (message) {
        this.state.errorMessage = message;
        this.eventEmitter.emit('stateChanged', this.state);
    };
    RepositoryPanelStateService.prototype.getState = function () {
        return __assign({}, this.state);
    };
    RepositoryPanelStateService.prototype.onStateChanged = function (listener) {
        this.eventEmitter.on('stateChanged', listener);
    };
    RepositoryPanelStateService.prototype.clearState = function () {
        this.state = {
            isAccessEnabled: false,
            errorMessage: undefined
        };
        this.eventEmitter.emit('stateChanged', this.state);
    };
    return RepositoryPanelStateService;
}());
exports.RepositoryPanelStateService = RepositoryPanelStateService;
