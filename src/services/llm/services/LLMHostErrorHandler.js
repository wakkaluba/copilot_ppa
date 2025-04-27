"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMHostErrorHandler = void 0;
var vscode = require("vscode");
var LLMHostErrorHandler = /** @class */ (function () {
    function LLMHostErrorHandler(outputChannel) {
        this.outputChannel = outputChannel;
    }
    LLMHostErrorHandler.prototype.handleProcessError = function (error, info) {
        this.logError('Process Error', error, info);
        this.showErrorNotification("LLM Host Process Error: ".concat(error.message));
    };
    LLMHostErrorHandler.prototype.handleStartError = function (error) {
        this.logError('Start Error', error);
        this.showErrorNotification("Failed to start LLM Host: ".concat(error.message));
    };
    LLMHostErrorHandler.prototype.handleStopError = function (error) {
        this.logError('Stop Error', error);
        this.showErrorNotification("Failed to stop LLM Host: ".concat(error.message));
    };
    LLMHostErrorHandler.prototype.handleRestartError = function (error) {
        this.logError('Restart Error', error);
        this.showErrorNotification("Failed to restart LLM Host: ".concat(error.message));
    };
    LLMHostErrorHandler.prototype.handleHealthWarning = function (message, metrics) {
        this.outputChannel.appendLine("[WARNING] Health: ".concat(message));
        this.outputChannel.appendLine("Metrics: ".concat(JSON.stringify(metrics, null, 2)));
    };
    LLMHostErrorHandler.prototype.handleHealthCritical = function (error, metrics) {
        this.logError('Critical Health Error', error, metrics);
        this.showErrorNotification("LLM Host Health Critical: ".concat(error.message));
    };
    LLMHostErrorHandler.prototype.logError = function (type, error, context) {
        this.outputChannel.appendLine("[ERROR] ".concat(type, ":"));
        this.outputChannel.appendLine(error.stack || error.message);
        if (context) {
            this.outputChannel.appendLine("Context: ".concat(JSON.stringify(context, null, 2)));
        }
    };
    LLMHostErrorHandler.prototype.showErrorNotification = function (message) {
        vscode.window.showErrorMessage(message);
    };
    return LLMHostErrorHandler;
}());
exports.LLMHostErrorHandler = LLMHostErrorHandler;
