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
exports.CommandRegistrationService = void 0;
exports.initializeCommandRegistrationService = initializeCommandRegistrationService;
exports.getCommandRegistrationService = getCommandRegistrationService;
var vscode = require("vscode");
var keybindingManager_1 = require("./keybindingManager");
/**
 * Service to register commands and keybindings with VS Code
 */
var CommandRegistrationService = /** @class */ (function () {
    function CommandRegistrationService(context) {
        this.context = context;
        this.registeredCommands = new Set();
    }
    /**
     * Register all keybindings with VS Code
     */
    CommandRegistrationService.prototype.registerAllKeybindings = function () {
        var _this = this;
        var keybindingManager = (0, keybindingManager_1.getKeybindingManager)();
        var keybindings = keybindingManager.getKeybindings();
        for (var _i = 0, keybindings_1 = keybindings; _i < keybindings_1.length; _i++) {
            var keybinding = keybindings_1[_i];
            this.registerCommand(keybinding.command, keybinding.id);
        }
        // Register an event listener for keybinding changes
        this.context.subscriptions.push(vscode.commands.registerCommand('copilotPPA.keybindingsChanged', function () {
            _this.updateKeybindingContexts();
        }));
    };
    /**
     * Register a single command
     */
    CommandRegistrationService.prototype.registerCommand = function (commandId, keybindingId) {
        // Skip if already registered or not a custom command
        if (this.registeredCommands.has(commandId) || !commandId.startsWith('copilotPPA.')) {
            return;
        }
        // Set the context for when clauses
        var keybindingManager = (0, keybindingManager_1.getKeybindingManager)();
        var keybinding = keybindingManager.getKeybinding(keybindingId);
        if (keybinding) {
            vscode.commands.executeCommand('setContext', "copilotPPA.keybinding.".concat(keybindingId), keybinding.key);
            if (keybinding.when) {
                vscode.commands.executeCommand('setContext', "".concat(keybindingId, ".when"), keybinding.when);
            }
        }
        this.registeredCommands.add(commandId);
    };
    /**
     * Update all keybinding contexts
     */
    CommandRegistrationService.prototype.updateKeybindingContexts = function () {
        var keybindingManager = (0, keybindingManager_1.getKeybindingManager)();
        var keybindings = keybindingManager.getKeybindings();
        for (var _i = 0, keybindings_2 = keybindings; _i < keybindings_2.length; _i++) {
            var keybinding = keybindings_2[_i];
            if (keybinding.command.startsWith('copilotPPA.')) {
                vscode.commands.executeCommand('setContext', "copilotPPA.keybinding.".concat(keybinding.id), keybinding.key);
                if (keybinding.when) {
                    vscode.commands.executeCommand('setContext', "".concat(keybinding.id, ".when"), keybinding.when);
                }
            }
        }
    };
    /**
     * Register keyboard shortcut commands
     */
    CommandRegistrationService.prototype.registerShortcutCommands = function () {
        var _this = this;
        // Register command to open keyboard shortcuts panel
        this.context.subscriptions.push(vscode.commands.registerCommand('copilotPPA.openKeyboardShortcuts', function () {
            vscode.commands.executeCommand('copilotPPA.openUISettingsPanel', 'keybindings');
        }));
        // Chat commands
        this.context.subscriptions.push(
        // Send message command
        vscode.commands.registerCommand('copilotPPA.sendMessage', function () { return __awaiter(_this, void 0, void 0, function () {
            var editor, text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!(editor && editor.document.uri.scheme === 'chat')) return [3 /*break*/, 2];
                        text = editor.document.getText();
                        if (!text.trim()) return [3 /*break*/, 2];
                        return [4 /*yield*/, vscode.commands.executeCommand('chat.sendMessage', { text: text })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); }), 
        // New line in chat command
        vscode.commands.registerCommand('copilotPPA.newLine', function () {
            var editor = vscode.window.activeTextEditor;
            if (editor && editor.document.uri.scheme === 'chat') {
                editor.edit(function (editBuilder) {
                    editBuilder.insert(editor.selection.active, '\n');
                });
            }
        }), 
        // Clear chat command
        vscode.commands.registerCommand('copilotPPA.clearChat', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.commands.executeCommand('chat.clearHistory')];
                    case 1:
                        _a.sent();
                        vscode.window.showInformationMessage('Chat history cleared');
                        return [2 /*return*/];
                }
            });
        }); }));
        // Code commands
        this.context.subscriptions.push(
        // Explain code command
        vscode.commands.registerCommand('copilotPPA.explainCode', function () { return __awaiter(_this, void 0, void 0, function () {
            var editor, selectedText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!(editor && !editor.selection.isEmpty)) return [3 /*break*/, 2];
                        selectedText = editor.document.getText(editor.selection);
                        return [4 /*yield*/, vscode.commands.executeCommand('chat.explain', { code: selectedText })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        vscode.window.showWarningMessage('Please select some code to explain.');
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); }), 
        // Refactor code command
        vscode.commands.registerCommand('copilotPPA.refactorCode', function () { return __awaiter(_this, void 0, void 0, function () {
            var editor, selectedText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!(editor && !editor.selection.isEmpty)) return [3 /*break*/, 2];
                        selectedText = editor.document.getText(editor.selection);
                        return [4 /*yield*/, vscode.commands.executeCommand('chat.refactor', { code: selectedText })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        vscode.window.showWarningMessage('Please select some code to refactor.');
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); }), 
        // Document code command
        vscode.commands.registerCommand('copilotPPA.documentCode', function () { return __awaiter(_this, void 0, void 0, function () {
            var editor, selectedText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!(editor && !editor.selection.isEmpty)) return [3 /*break*/, 2];
                        selectedText = editor.document.getText(editor.selection);
                        return [4 /*yield*/, vscode.commands.executeCommand('chat.document', { code: selectedText })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        vscode.window.showWarningMessage('Please select some code to document.');
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); }));
        // Navigation commands
        this.context.subscriptions.push(
        // Focus chat command
        vscode.commands.registerCommand('copilotPPA.focusChat', function () {
            vscode.commands.executeCommand('workbench.action.focusPanel', 'chat');
        }), 
        // Toggle sidebar command
        vscode.commands.registerCommand('copilotPPA.toggleSidebar', function () {
            vscode.commands.executeCommand('workbench.view.extension.copilotPPA');
        }));
    };
    return CommandRegistrationService;
}());
exports.CommandRegistrationService = CommandRegistrationService;
// Singleton instance
var commandRegistrationService;
/**
 * Initialize the command registration service
 */
function initializeCommandRegistrationService(context) {
    commandRegistrationService = new CommandRegistrationService(context);
    return commandRegistrationService;
}
/**
 * Get the command registration service instance
 */
function getCommandRegistrationService() {
    if (!commandRegistrationService) {
        throw new Error('Command Registration Service not initialized');
    }
    return commandRegistrationService;
}
