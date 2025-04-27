"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandPrefixer = void 0;
var vscode = require("vscode");
var commandToggleManager_1 = require("./commandToggleManager");
/**
 * Adds command prefixes to messages based on toggle states
 */
var CommandPrefixer = /** @class */ (function () {
    function CommandPrefixer(context) {
        this.toggleManager = commandToggleManager_1.CommandToggleManager.getInstance(context);
    }
    /**
     * Add active command prefixes to a message
     */
    CommandPrefixer.prototype.prefixMessage = function (message) {
        var prefix = this.toggleManager.getActiveTogglesPrefix();
        return prefix + message;
    };
    /**
     * Register command decorators for a text editor
     */
    CommandPrefixer.prototype.registerCommandDecorators = function (editor) {
        var disposables = [];
        var decorationType = vscode.window.createTextEditorDecorationType({
            light: {
                backgroundColor: 'rgba(0, 122, 204, 0.1)',
                borderRadius: '3px',
                fontWeight: 'bold',
                color: '#0078d4'
            },
            dark: {
                backgroundColor: 'rgba(14, 99, 156, 0.2)',
                borderRadius: '3px',
                fontWeight: 'bold',
                color: '#3794ff'
            }
        });
        // Update decorations initially and on document changes
        var updateDecorations = function () {
            var text = editor.document.getText();
            var commandPatterns = [
                /@workspace\b/g,
                /\/codebase\b/g,
                /!verbose\b/g,
                /#repo\b/g,
                /&debug\b/g
            ];
            var decorations = [];
            commandPatterns.forEach(function (pattern) {
                var match;
                while ((match = pattern.exec(text))) {
                    var startPos = editor.document.positionAt(match.index);
                    var endPos = editor.document.positionAt(match.index + match[0].length);
                    decorations.push({
                        range: new vscode.Range(startPos, endPos),
                        hoverMessage: 'Command prefix'
                    });
                }
            });
            editor.setDecorations(decorationType, decorations);
        };
        // Update decorations on change
        var changeDisposable = vscode.workspace.onDidChangeTextDocument(function (e) {
            if (e.document === editor.document) {
                updateDecorations();
            }
        });
        disposables.push(changeDisposable);
        disposables.push({
            dispose: function () {
                editor.setDecorations(decorationType, []);
                decorationType.dispose();
            }
        });
        // Initial update
        updateDecorations();
        return disposables;
    };
    return CommandPrefixer;
}());
exports.CommandPrefixer = CommandPrefixer;
