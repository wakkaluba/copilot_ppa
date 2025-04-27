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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityFixService = void 0;
var vscode = require("vscode");
var path = require("path");
var fs = require("fs/promises");
/**
 * Service for applying automated fixes to security issues
 */
var SecurityFixService = /** @class */ (function () {
    function SecurityFixService() {
        this.disposables = [];
    }
    /**
     * Apply an automated fix for a security issue
     */
    SecurityFixService.prototype.applyFix = function (issue) {
        return __awaiter(this, void 0, void 0, function () {
            var document, edit, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Ensure issue has required properties
                        if (!issue.filePath) {
                            throw new Error('Issue is missing filePath property');
                        }
                        return [4 /*yield*/, vscode.workspace.openTextDocument(issue.filePath)];
                    case 1:
                        document = _b.sent();
                        edit = new vscode.WorkspaceEdit();
                        _a = issue.id;
                        switch (_a) {
                            case 'SEC001': return [3 /*break*/, 2];
                            case 'SEC002': return [3 /*break*/, 4];
                            case 'SEC003': return [3 /*break*/, 6];
                            case 'SEC004': return [3 /*break*/, 8];
                            case 'SEC005': return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 12];
                    case 2: // SQL Injection
                    return [4 /*yield*/, this.fixSqlInjection(document, issue, edit)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 4: // XSS
                    return [4 /*yield*/, this.fixXss(document, issue, edit)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 6: // Path Traversal
                    return [4 /*yield*/, this.fixPathTraversal(document, issue, edit)];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 8: // Hardcoded Credentials
                    return [4 /*yield*/, this.fixHardcodedCredentials(document, issue, edit)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 10: // Weak Crypto
                    return [4 /*yield*/, this.fixWeakCrypto(document, issue, edit)];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 12: throw new Error("No automated fix available for issue type: ".concat(issue.id));
                    case 13: 
                    // Apply the edit
                    return [4 /*yield*/, vscode.workspace.applyEdit(edit)];
                    case 14:
                        // Apply the edit
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SecurityFixService.prototype.fixSqlInjection = function (document, issue, edit) {
        return __awaiter(this, void 0, void 0, function () {
            var line, text, queryMatch, query, params, newQuery, newText;
            return __generator(this, function (_a) {
                if (!issue.lineNumber) {
                    throw new Error('Issue is missing lineNumber property');
                }
                line = document.lineAt(issue.lineNumber - 1);
                text = line.text;
                // Replace string concatenation with parameterized query
                if (text.includes('${')) {
                    queryMatch = text.match(/["'`](.*?)["'`]/);
                    if (queryMatch && queryMatch[1] !== undefined) {
                        query = queryMatch[1];
                        params = __spreadArray([], query.matchAll(/\$\{(.*?)\}/g), true).map(function (m) { return m[1]; });
                        newQuery = query.replace(/\$\{.*?\}/g, '?');
                        newText = text.replace(/["'`].*?["'`]/, "'".concat(newQuery, "', [").concat(params.join(', '), "]"));
                        edit.replace(document.uri, line.range, newText);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    SecurityFixService.prototype.fixXss = function (document, issue, edit) {
        return __awaiter(this, void 0, void 0, function () {
            var line, text, newText, match, content, newText;
            return __generator(this, function (_a) {
                if (!issue.lineNumber) {
                    throw new Error('Issue is missing lineNumber property');
                }
                line = document.lineAt(issue.lineNumber - 1);
                text = line.text;
                // Replace innerHTML with textContent
                if (text.includes('innerHTML')) {
                    newText = text.replace('innerHTML', 'textContent');
                    edit.replace(document.uri, line.range, newText);
                }
                // Replace document.write with safer alternatives
                else if (text.includes('document.write')) {
                    match = text.match(/document\.write\((.*)\)/);
                    if (match && match[1] !== undefined) {
                        content = match[1];
                        newText = text.replace(/document\.write\((.*)\)/, "document.body.appendChild(document.createTextNode(".concat(content, "))"));
                        edit.replace(document.uri, line.range, newText);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    SecurityFixService.prototype.fixPathTraversal = function (document, issue, edit) {
        return __awaiter(this, void 0, void 0, function () {
            var line, text, newText, match, newText;
            return __generator(this, function (_a) {
                if (!issue.lineNumber) {
                    throw new Error('Issue is missing lineNumber property');
                }
                line = document.lineAt(issue.lineNumber - 1);
                text = line.text;
                // Add path.normalize()
                if (text.includes('path.join')) {
                    newText = text.replace(/(path\.join\(.*?\))/, 'path.normalize($1)');
                    edit.replace(document.uri, line.range, newText);
                }
                else {
                    match = text.match(/(["'`].*?["'`])\s*\+/);
                    if (match && match[0] !== undefined && match[1] !== undefined) {
                        newText = text.replace(match[0], "path.normalize(".concat(match[1], " +"));
                        edit.replace(document.uri, line.range, newText + ')');
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    SecurityFixService.prototype.fixHardcodedCredentials = function (document, issue, edit) {
        return __awaiter(this, void 0, void 0, function () {
            var line, text, match, name_1, value, envVar, newText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!issue.lineNumber) {
                            throw new Error('Issue is missing lineNumber property');
                        }
                        line = document.lineAt(issue.lineNumber - 1);
                        text = line.text;
                        match = text.match(/(password|secret|token|key|api[_-]?key|access[_-]?token)\s*[:=]\s*["'`]([^"'`]+)["'`]/i);
                        if (!(match && match[1] !== undefined && match[2] !== undefined)) return [3 /*break*/, 2];
                        name_1 = match[1];
                        value = match[2];
                        envVar = name_1.toUpperCase().replace(/[^A-Z0-9]/g, '_');
                        // Add to .env if it doesn't exist
                        return [4 /*yield*/, this.addToEnvFile(envVar, value)];
                    case 1:
                        // Add to .env if it doesn't exist
                        _a.sent();
                        newText = text.replace(/["'`]([^"'`]+)["'`]/, "process.env.".concat(envVar));
                        edit.replace(document.uri, line.range, newText);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    SecurityFixService.prototype.fixWeakCrypto = function (document, issue, edit) {
        return __awaiter(this, void 0, void 0, function () {
            var line, text, newText, newText;
            return __generator(this, function (_a) {
                if (!issue.lineNumber) {
                    throw new Error('Issue is missing lineNumber property');
                }
                line = document.lineAt(issue.lineNumber - 1);
                text = line.text;
                // Replace weak hashing algorithms with stronger ones
                if (text.includes('md5')) {
                    newText = text.replace(/["'`]md5["'`]/, '"sha256"');
                    edit.replace(document.uri, line.range, newText);
                }
                else if (text.includes('sha1')) {
                    newText = text.replace(/["'`]sha1["'`]/, '"sha256"');
                    edit.replace(document.uri, line.range, newText);
                }
                return [2 /*return*/];
            });
        });
    };
    SecurityFixService.prototype.addToEnvFile = function (name, value) {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolder, envFilePath, envContent, error_1, regex;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
                        if (!workspaceFolder) {
                            return [2 /*return*/];
                        }
                        envFilePath = path.join(workspaceFolder.uri.fsPath, '.env');
                        envContent = '';
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.readFile(envFilePath, 'utf-8')];
                    case 2:
                        envContent = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        regex = new RegExp("^".concat(name, "=.*"), 'm');
                        if (!!regex.test(envContent)) return [3 /*break*/, 6];
                        // Add new variable
                        envContent += "\n".concat(name, "=").concat(value);
                        return [4 /*yield*/, fs.writeFile(envFilePath, envContent.trim(), 'utf-8')];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply fix by issue ID and file path
     */
    SecurityFixService.prototype.applyFixById = function (issueId, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var document_1, edit, range, text, replacement, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, vscode.workspace.openTextDocument(filePath)];
                    case 1:
                        document_1 = _a.sent();
                        // Don't store the editor to avoid unused variable
                        return [4 /*yield*/, vscode.window.showTextDocument(document_1)];
                    case 2:
                        // Don't store the editor to avoid unused variable
                        _a.sent();
                        edit = new vscode.WorkspaceEdit();
                        range = this.findIssueRange(document_1, issueId);
                        if (!range) {
                            return [2 /*return*/];
                        }
                        text = document_1.getText(range);
                        replacement = this.generateFix(issueId, text);
                        if (!replacement) return [3 /*break*/, 5];
                        edit.replace(document_1.uri, range, replacement);
                        return [4 /*yield*/, vscode.workspace.applyEdit(edit)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, document_1.save()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        console.error('Error applying security fix:', error_2);
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SecurityFixService.prototype.findIssueRange = function (document, issueId) {
        // Simple implementation to find potential issue lines
        for (var i = 0; i < document.lineCount; i++) {
            var line = document.lineAt(i);
            var text = line.text;
            switch (issueId) {
                case 'SEC001': // SQL Injection
                    if (text.includes('${') && (text.includes('sql') || text.includes('query'))) {
                        return line.range;
                    }
                    break;
                case 'SEC002': // XSS
                    if (text.includes('innerHTML') || text.includes('document.write')) {
                        return line.range;
                    }
                    break;
                case 'SEC003': // Path Traversal
                    if ((text.includes('path.join') || text.includes('fs.')) &&
                        (text.includes('+') || text.includes('${'))) {
                        return line.range;
                    }
                    break;
                case 'SEC004': // Hardcoded Credentials
                    if ((text.includes('password') || text.includes('token') ||
                        text.includes('key') || text.includes('secret')) &&
                        (text.includes('"') || text.includes("'") || text.includes('`'))) {
                        return line.range;
                    }
                    break;
                case 'SEC005': // Weak Crypto
                    if (text.includes('md5') || text.includes('sha1')) {
                        return line.range;
                    }
                    break;
            }
        }
        return undefined;
    };
    SecurityFixService.prototype.generateFix = function (issueId, originalCode) {
        switch (issueId) {
            case 'SEC001': // SQL Injection
                return originalCode.replace(/\$\{.*?\}/g, '?');
            case 'SEC002': // XSS
                return originalCode.replace(/innerHTML/g, 'textContent')
                    .replace(/document\.write\((.*)\)/, 'document.body.appendChild(document.createTextNode($1))');
            case 'SEC003': // Path Traversal
                if (originalCode.includes('path.join')) {
                    return originalCode.replace(/(path\.join\(.*?\))/, 'path.normalize($1)');
                }
                else {
                    return "path.normalize(".concat(originalCode, ")");
                }
            case 'SEC004': // Hardcoded Credentials
                var match = originalCode.match(/(password|secret|token|key|api[_-]?key|access[_-]?token)\s*[:=]\s*["'`]([^"'`]+)["'`]/i);
                if (match && match[1] !== undefined) {
                    var name_2 = match[1];
                    var envVar = name_2.toUpperCase().replace(/[^A-Z0-9]/g, '_');
                    return originalCode.replace(/["'`]([^"'`]+)["'`]/, "process.env.".concat(envVar));
                }
                return undefined;
            case 'SEC005': // Weak Cryptography
                return originalCode.replace(/md5/g, 'sha256').replace(/sha1/g, 'sha256');
            default:
                return undefined;
        }
    };
    SecurityFixService.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
    };
    return SecurityFixService;
}());
exports.SecurityFixService = SecurityFixService;
