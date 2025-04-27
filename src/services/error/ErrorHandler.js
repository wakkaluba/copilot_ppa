"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
var vscode = require("vscode");
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
        this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
    }
    ErrorHandler.prototype.handle = function (message, error) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        this.outputChannel.appendLine("".concat(message, ": ").concat(errorMessage));
        this.outputChannel.appendLine("Stack: ".concat(error instanceof Error ? error.stack : 'No stack trace available'));
        vscode.window.showErrorMessage("".concat(message, ": ").concat(errorMessage));
    };
    ErrorHandler.prototype.dispose = function () {
        this.outputChannel.dispose();
    };
    return ErrorHandler;
}());
exports.ErrorHandler = ErrorHandler;
