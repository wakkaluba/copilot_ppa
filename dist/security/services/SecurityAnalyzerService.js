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
exports.SecurityAnalyzerService = void 0;
const vscode = __importStar(require("vscode"));
class SecurityAnalyzerService {
    patternService;
    constructor(patternService) {
        this.patternService = patternService;
    }
    async scanDocument(document) {
        const patterns = this.patternService.getPatterns();
        const issues = [];
        const diagnostics = [];
        const text = document.getText();
        const languageId = document.languageId;
        for (const pattern of patterns) {
            if (!pattern.languages.includes(languageId)) {
                continue;
            }
            const regex = pattern.pattern;
            regex.lastIndex = 0;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);
                const diagnostic = new vscode.Diagnostic(range, `${pattern.name}: ${pattern.description}`, pattern.severity);
                diagnostic.code = pattern.id;
                diagnostic.source = 'VSCode Local LLM Agent - Security Scanner';
                diagnostics.push(diagnostic);
                issues.push({
                    id: pattern.id,
                    name: pattern.name,
                    description: pattern.description,
                    file: document.uri.fsPath,
                    line: startPos.line + 1,
                    column: startPos.character + 1,
                    code: match[0],
                    severity: this.severityToString(pattern.severity),
                    fix: pattern.fix
                });
            }
        }
        return { diagnostics, issues };
    }
    async scanWorkspace(progressCallback) {
        const issues = [];
        let scannedFiles = 0;
        try {
            const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,java,cs,go,php}', '**/node_modules/**');
            for (const file of files) {
                if (progressCallback) {
                    progressCallback(`Scanning ${vscode.workspace.asRelativePath(file)}`);
                }
                const document = await vscode.workspace.openTextDocument(file);
                const result = await this.scanDocument(document);
                issues.push(...result.issues);
                scannedFiles++;
            }
        }
        catch (error) {
            console.error('Error scanning workspace:', error);
        }
        return { issues, scannedFiles };
    }
    severityToString(severity) {
        switch (severity) {
            case vscode.DiagnosticSeverity.Error:
                return 'Error';
            case vscode.DiagnosticSeverity.Warning:
                return 'Warning';
            case vscode.DiagnosticSeverity.Information:
                return 'Information';
            case vscode.DiagnosticSeverity.Hint:
                return 'Hint';
            default:
                return 'Unknown';
        }
    }
}
exports.SecurityAnalyzerService = SecurityAnalyzerService;
//# sourceMappingURL=SecurityAnalyzerService.js.map