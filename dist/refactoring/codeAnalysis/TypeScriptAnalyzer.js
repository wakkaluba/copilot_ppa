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
exports.TypeScriptAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const ts = __importStar(require("typescript"));
class TypeScriptAnalyzer {
    async findUnusedCode(document, selection) {
        const sourceFile = ts.createSourceFile(document.uri.fsPath, document.getText(), ts.ScriptTarget.Latest, true);
        const startPos = selection?.start || new vscode.Position(0, 0);
        const endPos = selection?.end || new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
        const unusedElements = this.analyzeSourceFile(sourceFile, startPos, endPos);
        return this.convertToDiagnostics(unusedElements);
    }
    analyzeSourceFile(sourceFile, startPos, endPos) {
        const unusedElements = [];
        const declaredVariables = new Map();
        const usedVariables = new Set();
        const collectDeclarations = (node) => {
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
        const collectUsages = (node) => {
            if (ts.isIdentifier(node)) {
                usedVariables.add(node.text);
            }
            ts.forEachChild(node, collectUsages);
        };
        collectDeclarations(sourceFile);
        collectUsages(sourceFile);
        declaredVariables.forEach((node, name) => {
            if (name === 'React' || usedVariables.has(name)) {
                return;
            }
            const start = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
            const end = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());
            const elementPos = new vscode.Range(new vscode.Position(start.line, start.character), new vscode.Position(end.line, end.character));
            if (!this.isWithinRange(elementPos, new vscode.Range(startPos, endPos))) {
                return;
            }
            unusedElements.push({
                name,
                type: this.getElementType(node),
                range: elementPos
            });
        });
        return unusedElements;
    }
    getElementType(node) {
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
    }
    isWithinRange(elementRange, selectionRange) {
        return elementRange.intersection(selectionRange) !== undefined;
    }
    convertToDiagnostics(elements) {
        return elements.map(element => {
            const diagnostic = new vscode.Diagnostic(element.range, `Unused ${element.type}: ${element.name}`, vscode.DiagnosticSeverity.Information);
            diagnostic.source = 'Local LLM Agent';
            diagnostic.code = 'unused-code';
            diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];
            return diagnostic;
        });
    }
    dispose() {
        // No resources to clean up
    }
}
exports.TypeScriptAnalyzer = TypeScriptAnalyzer;
//# sourceMappingURL=TypeScriptAnalyzer.js.map