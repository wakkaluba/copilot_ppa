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
exports.TypeScriptAnalyzer = void 0;
var vscode = require("vscode");
var ts = require("typescript");
var TypeScriptAnalyzer = /** @class */ (function () {
    function TypeScriptAnalyzer() {
    }
    TypeScriptAnalyzer.prototype.findUnusedCode = function (document, selection) {
        return __awaiter(this, void 0, void 0, function () {
            var sourceFile, startPos, endPos, unusedElements;
            return __generator(this, function (_a) {
                sourceFile = ts.createSourceFile(document.uri.fsPath, document.getText(), ts.ScriptTarget.Latest, true);
                startPos = (selection === null || selection === void 0 ? void 0 : selection.start) || new vscode.Position(0, 0);
                endPos = (selection === null || selection === void 0 ? void 0 : selection.end) || new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
                unusedElements = this.analyzeSourceFile(sourceFile, startPos, endPos);
                return [2 /*return*/, this.convertToDiagnostics(unusedElements)];
            });
        });
    };
    TypeScriptAnalyzer.prototype.analyzeSourceFile = function (sourceFile, startPos, endPos) {
        var _this = this;
        var unusedElements = [];
        var declaredVariables = new Map();
        var usedVariables = new Set();
        var collectDeclarations = function (node) {
            if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
                declaredVariables.set(node.name.text, node);
            }
            else if (ts.isFunctionDeclaration(node) && node.name) {
                declaredVariables.set(node.name.text, node);
            }
            else if (ts.isClassDeclaration(node) && node.name) {
                declaredVariables.set(node.name.text, node);
            }
            else if (ts.isInterfaceDeclaration(node) && node.name) {
                declaredVariables.set(node.name.text, node);
            }
            ts.forEachChild(node, collectDeclarations);
        };
        var collectUsages = function (node) {
            if (ts.isIdentifier(node)) {
                usedVariables.add(node.text);
            }
            ts.forEachChild(node, collectUsages);
        };
        collectDeclarations(sourceFile);
        collectUsages(sourceFile);
        declaredVariables.forEach(function (node, name) {
            if (name === 'React' || usedVariables.has(name)) {
                return;
            }
            var start = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
            var end = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());
            var elementPos = new vscode.Range(new vscode.Position(start.line, start.character), new vscode.Position(end.line, end.character));
            if (!_this.isWithinRange(elementPos, new vscode.Range(startPos, endPos))) {
                return;
            }
            unusedElements.push({
                name: name,
                type: _this.getElementType(node),
                range: elementPos
            });
        });
        return unusedElements;
    };
    TypeScriptAnalyzer.prototype.getElementType = function (node) {
        if (ts.isFunctionDeclaration(node)) {
            return 'function';
        }
        if (ts.isClassDeclaration(node)) {
            return 'class';
        }
        if (ts.isInterfaceDeclaration(node)) {
            return 'interface';
        }
        if (ts.isImportDeclaration(node)) {
            return 'import';
        }
        if (ts.isVariableDeclaration(node)) {
            return 'variable';
        }
        return 'declaration';
    };
    TypeScriptAnalyzer.prototype.isWithinRange = function (elementRange, selectionRange) {
        return elementRange.intersection(selectionRange) !== undefined;
    };
    TypeScriptAnalyzer.prototype.convertToDiagnostics = function (elements) {
        return elements.map(function (element) {
            var diagnostic = new vscode.Diagnostic(element.range, "Unused ".concat(element.type, ": ").concat(element.name), vscode.DiagnosticSeverity.Information);
            diagnostic.source = 'Local LLM Agent';
            diagnostic.code = 'unused-code';
            diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];
            return diagnostic;
        });
    };
    TypeScriptAnalyzer.prototype.dispose = function () {
        // No resources to clean up
    };
    return TypeScriptAnalyzer;
}());
exports.TypeScriptAnalyzer = TypeScriptAnalyzer;
