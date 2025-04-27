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
exports.SecurityScanner = void 0;
var vscode = require("vscode");
var path = require("path");
var child_process_1 = require("child_process");
var util_1 = require("util");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var SecurityScanner = /** @class */ (function () {
    function SecurityScanner(context) {
        this._context = context;
        this._diagnosticCollection = vscode.languages.createDiagnosticCollection('security-issues');
        context.subscriptions.push(this._diagnosticCollection);
    }
    /**
     * Scans workspace dependencies for known vulnerabilities
     */
    SecurityScanner.prototype.scanDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var issues, workspaceFolders, _i, workspaceFolders_1, folder, packageJsonPath, stdout, auditResult, _a, _b, _c, pkgName, vuln, _d, _e, info, error_1;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        issues = [];
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders) {
                            return [2 /*return*/, issues];
                        }
                        _i = 0, workspaceFolders_1 = workspaceFolders;
                        _g.label = 1;
                    case 1:
                        if (!(_i < workspaceFolders_1.length)) return [3 /*break*/, 6];
                        folder = workspaceFolders_1[_i];
                        packageJsonPath = path.join(folder.uri.fsPath, 'package.json');
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, execAsync('npm audit --json', {
                                cwd: folder.uri.fsPath
                            })];
                    case 3:
                        stdout = (_g.sent()).stdout;
                        auditResult = JSON.parse(stdout);
                        // Process npm audit results
                        if (auditResult.vulnerabilities) {
                            for (_a = 0, _b = Object.entries(auditResult.vulnerabilities); _a < _b.length; _a++) {
                                _c = _b[_a], pkgName = _c[0], vuln = _c[1];
                                for (_d = 0, _e = vuln.via || []; _d < _e.length; _d++) {
                                    info = _e[_d];
                                    if (typeof info === 'object') {
                                        issues.push({
                                            file: packageJsonPath,
                                            line: 1, // Default to line 1 since we don't know exact line
                                            column: 1,
                                            severity: this.mapSeverity(info.severity || 'low'),
                                            description: "Vulnerability in dependency ".concat(pkgName, ": ").concat(info.title || info.name),
                                            recommendation: "Update to version ".concat(((_f = vuln.fixAvailable) === null || _f === void 0 ? void 0 : _f.version) || 'latest', " or newer")
                                        });
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _g.sent();
                        console.error('Failed to run npm audit:', error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, issues];
                }
            });
        });
    };
    /**
     * Scans current file for potential security issues in code
     */
    SecurityScanner.prototype.scanFileForIssues = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, text, filePath, fileExtension;
            return __generator(this, function (_a) {
                issues = [];
                text = document.getText();
                filePath = document.uri.fsPath;
                fileExtension = path.extname(filePath).toLowerCase();
                // Check for common security issues based on file type
                if (['.js', '.ts', '.jsx', '.tsx'].includes(fileExtension)) {
                    this.checkJavaScriptSecurity(text, document, issues);
                }
                else if (['.py'].includes(fileExtension)) {
                    this.checkPythonSecurity(text, document, issues);
                }
                else if (['.java'].includes(fileExtension)) {
                    this.checkJavaSecurity(text, document, issues);
                }
                // Update diagnostics
                this.updateDiagnostics(document, issues);
                return [2 /*return*/, issues];
            });
        });
    };
    /**
     * Provides proactive security recommendations
     */
    SecurityScanner.prototype.getSecurityRecommendations = function (document) {
        var recommendations = [
            'Keep all dependencies up to date',
            'Implement proper input validation',
            'Use parameterized queries instead of string concatenation for database queries',
            'Implement proper authentication and authorization mechanisms',
            'Avoid storing sensitive information in code or configuration files'
        ];
        return recommendations;
    };
    SecurityScanner.prototype.checkJavaScriptSecurity = function (text, document, issues) {
        // Check for eval usage
        this.findPatternInDocument(document, /eval\s*\(/g, {
            severity: 'high',
            description: 'Potentially unsafe use of eval()',
            recommendation: 'Avoid using eval() as it can lead to code injection vulnerabilities'
        }, issues);
        // Check for innerHTML
        this.findPatternInDocument(document, /\.innerHTML\s*=/g, {
            severity: 'medium',
            description: 'Use of innerHTML could lead to XSS vulnerabilities',
            recommendation: 'Consider using textContent, innerText, or DOM methods instead'
        }, issues);
        // Check for setTimeout with string argument
        this.findPatternInDocument(document, /setTimeout\s*\(\s*["']/g, {
            severity: 'medium',
            description: 'setTimeout with string argument can act like eval()',
            recommendation: 'Use a function reference instead of a string'
        }, issues);
    };
    SecurityScanner.prototype.checkPythonSecurity = function (text, document, issues) {
        // Check for exec usage
        this.findPatternInDocument(document, /exec\s*\(/g, {
            severity: 'high',
            description: 'Potentially unsafe use of exec()',
            recommendation: 'Avoid using exec() as it can lead to code injection vulnerabilities'
        }, issues);
        // Check for shell=True in subprocess
        this.findPatternInDocument(document, /subprocess\..*\(.*shell\s*=\s*True/g, {
            severity: 'high',
            description: 'Use of shell=True in subprocess can lead to command injection',
            recommendation: 'Avoid shell=True when possible'
        }, issues);
    };
    SecurityScanner.prototype.checkJavaSecurity = function (text, document, issues) {
        // Check for SQL injection vulnerabilities
        this.findPatternInDocument(document, /Statement.*\.execute.*\+/g, {
            severity: 'critical',
            description: 'Potential SQL injection vulnerability',
            recommendation: 'Use PreparedStatement with parameterized queries'
        }, issues);
        // Check for XSS vulnerabilities
        this.findPatternInDocument(document, /response\.getWriter\(\)\.print\(.*request\.getParameter/g, {
            severity: 'high',
            description: 'Potential XSS vulnerability',
            recommendation: 'Always validate and sanitize user input'
        }, issues);
    };
    SecurityScanner.prototype.findPatternInDocument = function (document, pattern, issueTemplate, issues) {
        var text = document.getText();
        var match;
        while ((match = pattern.exec(text)) !== null) {
            var position = document.positionAt(match.index);
            issues.push({
                file: document.uri.fsPath,
                line: position.line + 1,
                column: position.character + 1,
                severity: issueTemplate.severity,
                description: issueTemplate.description,
                recommendation: issueTemplate.recommendation
            });
        }
    };
    SecurityScanner.prototype.updateDiagnostics = function (document, issues) {
        var _this = this;
        var diagnostics = issues.map(function (issue) {
            var range = new vscode.Range(issue.line - 1, issue.column - 1, issue.line - 1, issue.column + 20);
            var diagnostic = new vscode.Diagnostic(range, "".concat(issue.description, "\n").concat(issue.recommendation), _this.mapSeverityToDiagnosticSeverity(issue.severity));
            diagnostic.source = 'Security Scanner';
            return diagnostic;
        });
        this._diagnosticCollection.set(document.uri, diagnostics);
    };
    SecurityScanner.prototype.mapSeverity = function (severity) {
        switch (severity.toLowerCase()) {
            case 'critical': return 'critical';
            case 'high': return 'high';
            case 'moderate':
            case 'medium': return 'medium';
            default: return 'low';
        }
    };
    SecurityScanner.prototype.mapSeverityToDiagnosticSeverity = function (severity) {
        switch (severity) {
            case 'critical': return vscode.DiagnosticSeverity.Error;
            case 'high': return vscode.DiagnosticSeverity.Error;
            case 'medium': return vscode.DiagnosticSeverity.Warning;
            case 'low': return vscode.DiagnosticSeverity.Information;
        }
    };
    return SecurityScanner;
}());
exports.SecurityScanner = SecurityScanner;
