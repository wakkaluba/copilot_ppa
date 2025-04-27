"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalManager = void 0;
var vscode = require("vscode");
var types_1 = require("./types");
var ShellService_1 = require("./services/ShellService");
var CommandExecutorService_1 = require("./services/CommandExecutorService");
var TerminalLifecycleService_1 = require("./services/TerminalLifecycleService");
var TerminalManager = /** @class */ (function () {
    function TerminalManager() {
        var _this = this;
        this.shellService = new ShellService_1.ShellService();
        this.commandExecutor = new CommandExecutorService_1.CommandExecutorService();
        this.lifecycleService = new TerminalLifecycleService_1.TerminalLifecycleService();
        vscode.window.onDidCloseTerminal(function (terminal) {
            _this.lifecycleService.handleTerminalClose(terminal);
        });
    }
    TerminalManager.prototype.createTerminal = function (name, shellType) {
        var _a;
        var options = {
            name: name,
            shellPath: this.shellService.getShellPath(shellType),
            shellArgs: this.shellService.getShellArgs(shellType),
            cwd: (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath
        };
        return this.lifecycleService.createTerminal(name, options);
    };
    TerminalManager.prototype.showTerminal = function (name, shellType) {
        var _this = this;
        this.lifecycleService.showTerminal(name, function () { return _this.createTerminal(name, shellType); });
    };
    TerminalManager.prototype.executeCommand = function (command, terminalName) {
        return __awaiter(this, void 0, void 0, function () {
            var terminal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        terminal = this.lifecycleService.getTerminal(terminalName);
                        return [4 /*yield*/, this.commandExecutor.executeInTerminal(terminal, command)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TerminalManager.prototype.executeCommandWithOutput = function (command_1) {
        return __awaiter(this, arguments, void 0, function (command, shellType) {
            if (shellType === void 0) { shellType = types_1.TerminalShellType.VSCodeDefault; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.commandExecutor.executeWithOutput(command, shellType)];
            });
        });
    };
    TerminalManager.prototype.getActiveTerminals = function () {
        return this.lifecycleService.getActiveTerminals();
    };
    TerminalManager.prototype.closeTerminal = function (name) {
        this.lifecycleService.closeTerminal(name);
    };
    TerminalManager.prototype.closeAllTerminals = function () {
        this.lifecycleService.closeAllTerminals();
    };
    return TerminalManager;
}());
exports.TerminalManager = TerminalManager;
