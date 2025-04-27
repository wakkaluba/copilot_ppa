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
exports.CodeExecutorService = void 0;
const vscode = __importStar(require("vscode"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
class CodeExecutorService {
    /**
     * Executes selected code in the active editor
     */
    async executeSelectedCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('No code selected');
            return;
        }
        const selectedText = editor.document.getText(selection);
        const language = editor.document.languageId;
        try {
            await this.executeInTerminal(selectedText, language);
            vscode.window.showInformationMessage('Code executed successfully');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to execute code: ${error}`);
        }
    }
    /**
     * Executes code in the appropriate terminal based on language
     */
    async executeInTerminal(code, language) {
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Code Execution');
        terminal.show();
        let command = '';
        let tempFile = '';
        switch (language) {
            case 'javascript':
            case 'typescript':
                tempFile = await this.createTempFile(code, '.js');
                command = `node "${tempFile}"`;
                break;
            case 'python':
                tempFile = await this.createTempFile(code, '.py');
                command = `python "${tempFile}"`;
                break;
            case 'shellscript':
            case 'bash':
                tempFile = await this.createTempFile(code, '.sh');
                command = `bash "${tempFile}"`;
                break;
            case 'powershell':
                tempFile = await this.createTempFile(code, '.ps1');
                command = `powershell -File "${tempFile}"`;
                break;
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
        terminal.sendText(command);
    }
    /**
     * Creates a temporary file with the given code
     */
    async createTempFile(content, extension) {
        const fs = vscode.workspace.fs;
        const tempDir = os.tmpdir();
        const fileName = `vscode-exec-${Date.now()}${extension}`;
        const filePath = path.join(tempDir, fileName);
        const uri = vscode.Uri.file(filePath);
        const uint8Array = new TextEncoder().encode(content);
        await fs.writeFile(uri, uint8Array);
        return filePath;
    }
}
exports.CodeExecutorService = CodeExecutorService;
//# sourceMappingURL=codeExecutor.js.map