"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var vscode = require("vscode");
var Logger = /** @class */ (function () {
    function Logger(scope) {
        this.scope = scope;
        this.outputChannel = vscode.window.createOutputChannel("Copilot PPA - ".concat(scope));
    }
    Logger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.log.apply(this, __spreadArray(['INFO', message], args, false));
    };
    Logger.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.log.apply(this, __spreadArray(['ERROR', message], args, false));
        var error = args[0];
        if (error instanceof Error) {
            vscode.window.showErrorMessage("".concat(message, ": ").concat(error.message));
        }
    };
    Logger.prototype.log = function (level, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var timestamp = new Date().toISOString();
        var logMessage = "[".concat(timestamp, "] [").concat(level, "] ").concat(message);
        if (args.length > 0) {
            logMessage += '\n' + args
                .map(function (arg) { return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg; })
                .join('\n');
        }
        this.outputChannel.appendLine(logMessage);
    };
    Logger.prototype.dispose = function () {
        this.outputChannel.dispose();
    };
    return Logger;
}());
exports.Logger = Logger;
