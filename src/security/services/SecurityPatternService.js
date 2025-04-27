"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityPatternService = void 0;
var vscode = require("vscode");
var SecurityPatternService = /** @class */ (function () {
    function SecurityPatternService() {
        this.patterns = [];
        this.loadDefaultPatterns();
    }
    SecurityPatternService.prototype.getPatterns = function () {
        return this.patterns;
    };
    SecurityPatternService.prototype.addPattern = function (pattern) {
        this.patterns.push(pattern);
    };
    SecurityPatternService.prototype.loadDefaultPatterns = function () {
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
    };
    return SecurityPatternService;
}());
exports.SecurityPatternService = SecurityPatternService;
