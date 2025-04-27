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
exports.CodeSecurityScanner = void 0;
var vscode = require("vscode");
var CodeSecurityScanner = /** @class */ (function () {
    function CodeSecurityScanner() {
        this.supportedLanguages = ['javascript', 'typescript', 'python', 'java'];
    }
    CodeSecurityScanner.prototype.scanWorkspace = function (progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, workspaceFolders, scannedFiles, _i, workspaceFolders_1, folder, _a, _b, lang, pattern, files, _c, files_1, file, document_1, fileIssues;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        issues = [];
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        scannedFiles = 0;
                        if (!workspaceFolders) {
                            return [2 /*return*/, { issues: issues, scannedFiles: 0, timestamp: new Date() }];
                        }
                        _i = 0, workspaceFolders_1 = workspaceFolders;
                        _d.label = 1;
                    case 1:
                        if (!(_i < workspaceFolders_1.length)) return [3 /*break*/, 10];
                        folder = workspaceFolders_1[_i];
                        _a = 0, _b = this.supportedLanguages;
                        _d.label = 2;
                    case 2:
                        if (!(_a < _b.length)) return [3 /*break*/, 9];
                        lang = _b[_a];
                        pattern = this.getLanguagePattern(lang);
                        return [4 /*yield*/, vscode.workspace.findFiles(pattern, '**/node_modules/**')];
                    case 3:
                        files = _d.sent();
                        _c = 0, files_1 = files;
                        _d.label = 4;
                    case 4:
                        if (!(_c < files_1.length)) return [3 /*break*/, 8];
                        file = files_1[_c];
                        progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback("Scanning ".concat(file.fsPath, "..."));
                        return [4 /*yield*/, vscode.workspace.openTextDocument(file)];
                    case 5:
                        document_1 = _d.sent();
                        return [4 /*yield*/, this.scanFile(document_1.uri)];
                    case 6:
                        fileIssues = _d.sent();
                        issues.push.apply(issues, fileIssues);
                        scannedFiles++;
                        _d.label = 7;
                    case 7:
                        _c++;
                        return [3 /*break*/, 4];
                    case 8:
                        _a++;
                        return [3 /*break*/, 2];
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/, {
                            issues: issues,
                            scannedFiles: scannedFiles,
                            timestamp: new Date()
                        }];
                }
            });
        });
    };
    CodeSecurityScanner.prototype.scanFile = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, issues, text, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.openTextDocument(uri)];
                    case 1:
                        document = _b.sent();
                        issues = [];
                        text = document.getText();
                        _a = document.languageId;
                        switch (_a) {
                            case 'javascript': return [3 /*break*/, 2];
                            case 'typescript': return [3 /*break*/, 2];
                            case 'python': return [3 /*break*/, 4];
                            case 'java': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, this.scanJavaScriptFile(text, document, issues)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 4: return [4 /*yield*/, this.scanPythonFile(text, document, issues)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.scanJavaFile(text, document, issues)];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, issues];
                }
            });
        });
    };
    CodeSecurityScanner.prototype.getLanguagePattern = function (language) {
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
    };
    CodeSecurityScanner.prototype.scanJavaScriptFile = function (text, document, issues) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check for common JavaScript security issues
                        this.checkUnsafeEval(text, document, issues);
                        this.checkXSSVulnerabilities(text, document, issues);
                        this.checkUnsafeJsonParse(text, document, issues);
                        this.checkUnsafeRegex(text, document, issues);
                        this.checkHardcodedSecrets(text, document, issues);
                        return [4 /*yield*/, this.checkSecurityMiddleware(text, document, issues)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CodeSecurityScanner.prototype.scanPythonFile = function (text, document, issues) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check for common Python security issues
                        this.checkShellInjection(text, document, issues);
                        this.checkSQLInjection(text, document, issues);
                        this.checkUnsafeDeserialization(text, document, issues);
                        this.checkUnsafeYAMLLoad(text, document, issues);
                        this.checkHardcodedSecrets(text, document, issues);
                        return [4 /*yield*/, this.checkSecurityMiddleware(text, document, issues)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CodeSecurityScanner.prototype.scanJavaFile = function (text, document, issues) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check for common Java security issues
                        this.checkXXEVulnerability(text, document, issues);
                        this.checkUnsafeDeserialization(text, document, issues);
                        this.checkSQLInjection(text, document, issues);
                        this.checkUnsafeReflection(text, document, issues);
                        this.checkHardcodedSecrets(text, document, issues);
                        return [4 /*yield*/, this.checkSecurityMiddleware(text, document, issues)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CodeSecurityScanner.prototype.checkUnsafeEval = function (text, document, issues) {
        var evalRegex = /eval\s*\(/g;
        var match;
        while ((match = evalRegex.exec(text)) !== null) {
            var position = document.positionAt(match.index);
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
    };
    CodeSecurityScanner.prototype.checkXSSVulnerabilities = function (text, document, issues) {
        var dangerousPatterns = [
            /innerHTML\s*=/g,
            /outerHTML\s*=/g,
            /document\.write\s*\(/g
        ];
        for (var _i = 0, dangerousPatterns_1 = dangerousPatterns; _i < dangerousPatterns_1.length; _i++) {
            var pattern = dangerousPatterns_1[_i];
            var match = void 0;
            while ((match = pattern.exec(text)) !== null) {
                var position = document.positionAt(match.index);
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
    };
    CodeSecurityScanner.prototype.checkSQLInjection = function (text, document, issues) {
        var sqlPatterns = [
            /executeQuery\s*\(\s*["'].*\$\{.*\}/g, // Template literals in queries
            /executeQuery\s*\(\s*["'].*\+/g, // String concatenation in queries
            /\.query\s*\(\s*["'].*\+/g, // Node.js style queries
            /cursor\.execute\s*\(\s*["'].*%/g // Python style queries
        ];
        for (var _i = 0, sqlPatterns_1 = sqlPatterns; _i < sqlPatterns_1.length; _i++) {
            var pattern = sqlPatterns_1[_i];
            var match = void 0;
            while ((match = pattern.exec(text)) !== null) {
                var position = document.positionAt(match.index);
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
    };
    CodeSecurityScanner.prototype.checkHardcodedSecrets = function (text, document, issues) {
        var secretPatterns = [
            {
                pattern: /(?:password|secret|key|token|auth).*['"]\w{16,}/gi,
                name: 'Hardcoded Secret'
            },
            {
                pattern: /(?:aws|firebase|stripe)\s*.\s*['"][A-Za-z0-9_\-]{20,}/gi,
                name: 'Hardcoded API Key'
            }
        ];
        for (var _i = 0, secretPatterns_1 = secretPatterns; _i < secretPatterns_1.length; _i++) {
            var _a = secretPatterns_1[_i], pattern = _a.pattern, name_1 = _a.name;
            var match = void 0;
            while ((match = pattern.exec(text)) !== null) {
                var position = document.positionAt(match.index);
                issues.push({
                    id: 'SEC004',
                    name: name_1,
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
    };
    CodeSecurityScanner.prototype.checkSecurityMiddleware = function (text, document, issues) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
                return [2 /*return*/];
            });
        });
    };
    CodeSecurityScanner.prototype.checkUnsafeDeserialization = function (text, document, issues) {
        var patterns = [
            /JSON\.parse\s*\(\s*.*\)/g,
            /pickle\.loads\s*\(\s*.*\)/g,
            /ObjectInputStream\s*\(\s*.*\)/g
        ];
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var pattern = patterns_1[_i];
            var match = void 0;
            while ((match = pattern.exec(text)) !== null) {
                var position = document.positionAt(match.index);
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
    };
    return CodeSecurityScanner;
}());
exports.CodeSecurityScanner = CodeSecurityScanner;
