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
exports.CodeSecurityScanner = void 0;
const vscode = __importStar(require("vscode"));
class CodeSecurityScanner {
    supportedLanguages = ['javascript', 'typescript', 'python', 'java'];
    async scanWorkspace(progressCallback) {
        const issues = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        let scannedFiles = 0;
        if (!workspaceFolders) {
            return { issues, scannedFiles: 0, timestamp: new Date() };
        }
        for (const folder of workspaceFolders) {
            for (const lang of this.supportedLanguages) {
                const pattern = this.getLanguagePattern(lang);
                const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
                for (const file of files) {
                    progressCallback?.(`Scanning ${file.fsPath}...`);
                    const document = await vscode.workspace.openTextDocument(file);
                    const fileIssues = await this.scanFile(document.uri);
                    issues.push(...fileIssues);
                    scannedFiles++;
                }
            }
        }
        return {
            issues,
            scannedFiles,
            timestamp: new Date()
        };
    }
    async scanFile(uri) {
        const document = await vscode.workspace.openTextDocument(uri);
        const issues = [];
        const text = document.getText();
        switch (document.languageId) {
            case 'javascript':
            case 'typescript':
                await this.scanJavaScriptFile(text, document, issues);
                break;
            case 'python':
                await this.scanPythonFile(text, document, issues);
                break;
            case 'java':
                await this.scanJavaFile(text, document, issues);
                break;
        }
        return issues;
    }
    getLanguagePattern(language) {
        switch (language) {
            case 'javascript':
                return '**/*.{js,jsx}';
            case 'typescript':
                return '**/*.{ts,tsx}';
            case 'python':
                return '**/*.py';
            case 'java':
                return '**/*.java';
            default:
                return '';
        }
    }
    async scanJavaScriptFile(text, document, issues) {
        // Check for common JavaScript security issues
        this.checkUnsafeEval(text, document, issues);
        this.checkXSSVulnerabilities(text, document, issues);
        this.checkUnsafeJsonParse(text, document, issues);
        this.checkUnsafeRegex(text, document, issues);
        this.checkHardcodedSecrets(text, document, issues);
        await this.checkSecurityMiddleware(text, document, issues);
    }
    async scanPythonFile(text, document, issues) {
        // Check for common Python security issues
        this.checkShellInjection(text, document, issues);
        this.checkSQLInjection(text, document, issues);
        this.checkUnsafeDeserialization(text, document, issues);
        this.checkUnsafeYAMLLoad(text, document, issues);
        this.checkHardcodedSecrets(text, document, issues);
        await this.checkSecurityMiddleware(text, document, issues);
    }
    async scanJavaFile(text, document, issues) {
        // Check for common Java security issues
        this.checkXXEVulnerability(text, document, issues);
        this.checkUnsafeDeserialization(text, document, issues);
        this.checkSQLInjection(text, document, issues);
        this.checkUnsafeReflection(text, document, issues);
        this.checkHardcodedSecrets(text, document, issues);
        await this.checkSecurityMiddleware(text, document, issues);
    }
    checkUnsafeEval(text, document, issues) {
        const evalRegex = /eval\s*\(/g;
        let match;
        while ((match = evalRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            issues.push({
                id: 'SEC001',
                name: 'Unsafe eval() Usage',
                description: 'Using eval() can lead to code injection vulnerabilities',
                severity: 'high',
                location: {
                    file: document.uri.fsPath,
                    line: position.line,
                    column: position.character
                },
                recommendation: 'Consider using safer alternatives like JSON.parse() for data parsing'
            });
        }
    }
    checkXSSVulnerabilities(text, document, issues) {
        const dangerousPatterns = [
            /innerHTML\s*=/g,
            /outerHTML\s*=/g,
            /document\.write\s*\(/g
        ];
        for (const pattern of dangerousPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                issues.push({
                    id: 'SEC002',
                    name: 'Potential XSS Vulnerability',
                    description: 'Direct DOM manipulation can lead to XSS vulnerabilities',
                    severity: 'high',
                    location: {
                        file: document.uri.fsPath,
                        line: position.line,
                        column: position.character
                    },
                    recommendation: 'Use safe DOM APIs or sanitize input before rendering'
                });
            }
        }
    }
    checkSQLInjection(text, document, issues) {
        const sqlPatterns = [
            /executeQuery\s*\(\s*["'].*\$\{.*\}/g, // Template literals in queries
            /executeQuery\s*\(\s*["'].*\+/g, // String concatenation in queries
            /\.query\s*\(\s*["'].*\+/g, // Node.js style queries
            /cursor\.execute\s*\(\s*["'].*%/g // Python style queries
        ];
        for (const pattern of sqlPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                issues.push({
                    id: 'SEC003',
                    name: 'Potential SQL Injection',
                    description: 'Dynamic SQL queries can lead to SQL injection vulnerabilities',
                    severity: 'critical',
                    location: {
                        file: document.uri.fsPath,
                        line: position.line,
                        column: position.character
                    },
                    recommendation: 'Use parameterized queries or an ORM'
                });
            }
        }
    }
    checkHardcodedSecrets(text, document, issues) {
        const secretPatterns = [
            {
                pattern: /(?:password|secret|key|token|auth).*['"]\w{16,}/gi,
                name: 'Hardcoded Secret'
            },
            {
                pattern: /(?:aws|firebase|stripe)\s*.\s*['"][A-Za-z0-9_\-]{20,}/gi,
                name: 'Hardcoded API Key'
            }
        ];
        for (const { pattern, name } of secretPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                issues.push({
                    id: 'SEC004',
                    name,
                    description: 'Hardcoded secrets can lead to security breaches',
                    severity: 'critical',
                    location: {
                        file: document.uri.fsPath,
                        line: position.line,
                        column: position.character
                    },
                    recommendation: 'Use environment variables or a secure secrets manager'
                });
            }
        }
    }
    async checkSecurityMiddleware(text, document, issues) {
        // Check for missing security middleware in web frameworks
        if (text.includes('express')) {
            if (!text.includes('helmet') && !text.includes('security-middleware')) {
                issues.push({
                    id: 'SEC005',
                    name: 'Missing Security Middleware',
                    description: 'Web application lacks essential security middleware',
                    severity: 'high',
                    location: {
                        file: document.uri.fsPath,
                        line: 0,
                        column: 0
                    },
                    recommendation: 'Add security middleware like Helmet.js for Express applications'
                });
            }
        }
    }
    checkUnsafeDeserialization(text, document, issues) {
        const patterns = [
            /JSON\.parse\s*\(\s*.*\)/g,
            /pickle\.loads\s*\(\s*.*\)/g,
            /ObjectInputStream\s*\(\s*.*\)/g
        ];
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                issues.push({
                    id: 'SEC006',
                    name: 'Unsafe Deserialization',
                    description: 'Deserializing untrusted data can lead to remote code execution',
                    severity: 'high',
                    location: {
                        file: document.uri.fsPath,
                        line: position.line,
                        column: position.character
                    },
                    recommendation: 'Validate and sanitize data before deserialization'
                });
            }
        }
    }
}
exports.CodeSecurityScanner = CodeSecurityScanner;
//# sourceMappingURL=CodeSecurityScanner.js.map