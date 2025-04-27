"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandPrefixer = void 0;
const vscode = __importStar(require("vscode"));
const commandToggleManager_1 = require("./commandToggleManager");
/**
 * Adds command prefixes to messages based on toggle states
 */
class CommandPrefixer {
    constructor(context) {
        this.toggleManager = commandToggleManager_1.CommandToggleManager.getInstance(context);
    }
    /**
     * Add active command prefixes to a message
     */
    prefixMessage(message) {
        const prefix = this.toggleManager.getActiveTogglesPrefix();
        return prefix + message;
    }
    /**
     * Register command decorators for a text editor
     */
    registerCommandDecorators(editor) {
        const disposables = [];
        const decorationType = vscode.window.createTextEditorDecorationType({
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
        const updateDecorations = () => {
            const text = editor.document.getText();
            const commandPatterns = [
                /@workspace\b/g,
                /\/codebase\b/g,
                /!verbose\b/g,
                /#repo\b/g,
                /&debug\b/g
            ];
            const decorations = [];
            commandPatterns.forEach(pattern => {
                let match;
                while ((match = pattern.exec(text))) {
                    const startPos = editor.document.positionAt(match.index);
                    const endPos = editor.document.positionAt(match.index + match[0].length);
                    decorations.push({
                        range: new vscode.Range(startPos, endPos),
                        hoverMessage: 'Command prefix'
                    });
                }
            });
            editor.setDecorations(decorationType, decorations);
        };
        // Update decorations on change
        const changeDisposable = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document === editor.document) {
                updateDecorations();
            }
        });
        disposables.push(changeDisposable);
        disposables.push({
            dispose: () => {
                editor.setDecorations(decorationType, []);
                decorationType.dispose();
            }
        });
        // Initial update
        updateDecorations();
        return disposables;
    }
}
exports.CommandPrefixer = CommandPrefixer;
//# sourceMappingURL=commandPrefixer.js.map