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
exports.SecurityAnalyzerService = void 0;
var vscode = require("vscode");
var SecurityAnalyzerService = /** @class */ (function () {
    function SecurityAnalyzerService(patternService) {
        this.patternService = patternService;
    }
    SecurityAnalyzerService.prototype.scanDocument = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var patterns, issues, diagnostics, text, languageId, _i, patterns_1, pattern, regex, match, startPos, endPos, range, diagnostic;
            return __generator(this, function (_a) {
                patterns = this.patternService.getPatterns();
                issues = [];
                diagnostics = [];
                text = document.getText();
                languageId = document.languageId;
                for (_i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
                    pattern = patterns_1[_i];
                    if (!pattern.languages.includes(languageId)) {
                        continue;
                    }
                    regex = pattern.pattern;
                    regex.lastIndex = 0;
                    match = void 0;
                    while ((match = regex.exec(text)) !== null) {
                        startPos = document.positionAt(match.index);
                        endPos = document.positionAt(match.index + match[0].length);
                        range = new vscode.Range(startPos, endPos);
                        diagnostic = new vscode.Diagnostic(range, "".concat(pattern.name, ": ").concat(pattern.description), pattern.severity);
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
                return [2 /*return*/, { diagnostics: diagnostics, issues: issues }];
            });
        });
    };
    SecurityAnalyzerService.prototype.scanWorkspace = function (progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var issues, scannedFiles, files, _i, files_1, file, document_1, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        issues = [];
                        scannedFiles = 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,java,cs,go,php}', '**/node_modules/**')];
                    case 2:
                        files = _a.sent();
                        _i = 0, files_1 = files;
                        _a.label = 3;
                    case 3:
                        if (!(_i < files_1.length)) return [3 /*break*/, 7];
                        file = files_1[_i];
                        if (progressCallback) {
                            progressCallback("Scanning ".concat(vscode.workspace.asRelativePath(file)));
                        }
                        return [4 /*yield*/, vscode.workspace.openTextDocument(file)];
                    case 4:
                        document_1 = _a.sent();
                        return [4 /*yield*/, this.scanDocument(document_1)];
                    case 5:
                        result = _a.sent();
                        issues.push.apply(issues, result.issues);
                        scannedFiles++;
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_1 = _a.sent();
                        console.error('Error scanning workspace:', error_1);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/, { issues: issues, scannedFiles: scannedFiles }];
                }
            });
        });
    };
    SecurityAnalyzerService.prototype.severityToString = function (severity) {
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
    };
    return SecurityAnalyzerService;
}());
exports.SecurityAnalyzerService = SecurityAnalyzerService;
