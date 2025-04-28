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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceFileMonitorService = void 0;
const vscode = __importStar(require("vscode"));
class PerformanceFileMonitorService {
    constructor() {
        this.disposables = [];
        this.documentCallbacks = new Set();
        this.editorCallbacks = new Set();
        this.throttleMap = new Map();
        this.disposables.push(vscode.workspace.onDidSaveTextDocument(doc => this.notifyDocumentSaved(doc)), vscode.window.onDidChangeActiveTextEditor(editor => this.notifyEditorChanged(editor)));
    }
    async findAnalyzableFiles() {
        if (!vscode.workspace.workspaceFolders) {
            return [];
        }
        const files = await vscode.workspace.findFiles('**/*.{js,jsx,ts,tsx,vue,java,py,cs,go}', '**/node_modules/**');
        return files;
    }
    onDocumentSaved(callback) {
        this.documentCallbacks.add(callback);
    }
    onActiveEditorChanged(callback) {
        this.editorCallbacks.add(callback);
    }
    throttleDocumentChange(document, callback) {
        const key = document.uri.toString();
        const existingTimeout = this.throttleMap.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        this.throttleMap.set(key, setTimeout(async () => {
            try {
                await callback();
            }
            catch (error) {
                console.error('Error in throttled document change handler:', error);
            }
            finally {
                this.throttleMap.delete(key);
            }
        }, 500));
    }
    notifyDocumentSaved(document) {
        this.documentCallbacks.forEach(callback => {
            try {
                callback(document);
            }
            catch (error) {
                console.error('Error in document saved callback:', error);
            }
        });
    }
    notifyEditorChanged(editor) {
        this.editorCallbacks.forEach(callback => {
            try {
                callback(editor);
            }
            catch (error) {
                console.error('Error in editor changed callback:', error);
            }
        });
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.throttleMap.forEach(timeout => clearTimeout(timeout));
        this.throttleMap.clear();
        this.documentCallbacks.clear();
        this.editorCallbacks.clear();
    }
}
exports.PerformanceFileMonitorService = PerformanceFileMonitorService;
//# sourceMappingURL=PerformanceFileMonitorService.js.map