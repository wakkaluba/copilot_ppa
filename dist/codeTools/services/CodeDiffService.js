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
exports.CodeDiffService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
/**
 * Service to display code differences
 */
class CodeDiffService {
    /**
     * Show diff between original and modified code
     * @param uri Original file URI
     * @param originalContent Original content
     * @param modifiedContent Modified content
     * @param title Diff title
     */
    async showDiff(uri, originalContent, modifiedContent, title) {
        const filename = path.basename(uri.fsPath);
        const originalUri = uri.with({ scheme: 'original', path: `${uri.path}.original` });
        const modifiedUri = uri.with({ scheme: 'modified', path: `${uri.path}.modified` });
        const originalDoc = await vscode.workspace.openTextDocument(originalUri);
        const modifiedDoc = await vscode.workspace.openTextDocument(modifiedUri);
        const edit1 = new vscode.WorkspaceEdit();
        const edit2 = new vscode.WorkspaceEdit();
        edit1.replace(originalUri, new vscode.Range(0, 0, originalDoc.lineCount, 0), originalContent);
        edit2.replace(modifiedUri, new vscode.Range(0, 0, modifiedDoc.lineCount, 0), modifiedContent);
        await vscode.workspace.applyEdit(edit1);
        await vscode.workspace.applyEdit(edit2);
        await vscode.commands.executeCommand('vscode.diff', originalUri, modifiedUri, `${filename} - ${title}`);
    }
}
exports.CodeDiffService = CodeDiffService;
//# sourceMappingURL=CodeDiffService.js.map