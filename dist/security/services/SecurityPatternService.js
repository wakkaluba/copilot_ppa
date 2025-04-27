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
exports.SecurityPatternService = void 0;
const vscode = __importStar(require("vscode"));
class SecurityPatternService {
    constructor() {
        this.patterns = [];
        this.loadDefaultPatterns();
    }
    getPatterns() {
        return this.patterns;
    }
    addPattern(pattern) {
        this.patterns.push(pattern);
    }
    loadDefaultPatterns() {
        this.patterns = [
            {
                id: 'SEC001',
                name: 'SQL Injection Risk',
                description: 'Potential SQL injection vulnerability detected',
                pattern: /(\bexec\s*\(\s*["'`].*?\$\{.*?\}.*?["'`]\s*\)|\bquery\s*\(\s*["'`].*?\$\{.*?\}.*?["'`]\s*\))/g,
                severity: vscode.DiagnosticSeverity.Error,
                languages: ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
                fix: 'Use parameterized queries or an ORM instead of string concatenation'
            },
            {
                id: 'SEC002',
                name: 'Cross-site Scripting (XSS) Risk',
                description: 'Potential XSS vulnerability',
                pattern: /(document\.write\s*\(\s*.*?\)|(innerHTML|outerHTML)\s*=\s*)/g,
                severity: vscode.DiagnosticSeverity.Warning,
                languages: ['javascript', 'typescript', 'html', 'javascriptreact', 'typescriptreact'],
                fix: 'Use textContent instead of innerHTML or use a framework with auto-escaping'
            },
            // ...more patterns...
        ];
    }
}
exports.SecurityPatternService = SecurityPatternService;
//# sourceMappingURL=SecurityPatternService.js.map