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

var vscode = require('vscode');
var BaseLanguageAnalyzer_1 = require('./BaseLanguageAnalyzer');

/**
 * Language analyzer for Java files
 */
var JavaAnalyzer = /** @class */ (function (_super) {
    function JavaAnalyzer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }

    /**
     * Finds unused code in a Java document
     */
    JavaAnalyzer.prototype.findUnusedCode = function (document, selection) {
        return __awaiter(this, void 0, void 0, function () {
            var text, diagnostics;
            return __generator(this, function (_a) {
                text = document.getText();
                diagnostics = [];

                // Find unused imports
                this.findUnusedImports(text, diagnostics);

                // Find unused private methods
                this.findUnusedPrivateMethods(text, diagnostics);

                // Find unused private fields
                this.findUnusedPrivateFields(text, diagnostics);

                // Find unused local variables
                this.findUnusedLocalVariables(text, diagnostics);

                return [2 /*return*/, diagnostics];
            });
        });
    };

    /**
     * Finds unused imports in Java code
     */
    JavaAnalyzer.prototype.findUnusedImports = function (text, diagnostics) {
        var importRegex = /import\s+(static\s+)?([^;]+);/g;
        var match;

        while ((match = importRegex.exec(text)) !== null) {
            var importStatement = match[0];
            var importName = match[2];
            var importedClass = importName.split('.').pop();

            // Check if the imported class is used in the code
            // This is a simplified check, a real implementation would be more sophisticated
            const importLinePos = this.getPositionFromOffset(text, match.index);
            const importEndPos = this.getPositionFromOffset(text, match.index + importStatement.length);

            // Simple detection - if the class name doesn't appear elsewhere in the file
            // (excluding the import statement itself), it's probably unused
            const restOfFileStart = match.index + importStatement.length;
            const restOfFile = text.substring(restOfFileStart);

            // Make sure we're checking for the class name as a word boundary
            const classRegex = new RegExp(`\\b${this.escapeRegExp(importedClass)}\\b`);

            if (!classRegex.test(restOfFile)) {
                diagnostics.push({
                    code: 'unused-import',
                    message: `Unused import: ${importName}`,
                    range: new vscode.Range(importLinePos, importEndPos),
                    severity: vscode.DiagnosticSeverity.Warning,
                    source: 'java-analyzer'
                });
            }
        }
    };

    /**
     * Finds unused private methods in Java code
     */
    JavaAnalyzer.prototype.findUnusedPrivateMethods = function (text, diagnostics) {
        var methodRegex = /private\s+(?:(?:static|final|synchronized)\s+)*(?:<[^>]+>\s+)?(?:[a-zA-Z0-9_<>[\]]+)\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*(?:throws\s+[^{]+)?\s*\{/g;
        var match;

        while ((match = methodRegex.exec(text)) !== null) {
            var methodDeclaration = match[0];
            var methodName = match[1];

            // Skip if method is a common pattern like constructor, toString, equals, hashCode
            if (['toString', 'equals', 'hashCode', 'finalize'].includes(methodName)) {
                continue;
            }

            // Check if method name is used elsewhere in the file
            const methodLinePos = this.getPositionFromOffset(text, match.index);
            const methodNamePos = text.indexOf(methodName, match.index);
            const methodNameEndOffset = methodNamePos + methodName.length;
            const methodNameEndPos = this.getPositionFromOffset(text, methodNameEndOffset);

            // Get the text before and after the method declaration to check for references
            const beforeMethod = text.substring(0, match.index);
            const afterMethodStart = text.substring(methodNameEndOffset);

            // We need to count occurrences outside of the method declaration
            const methodRegexPattern = new RegExp(`\\b${this.escapeRegExp(methodName)}\\s*\\(`, 'g');
            let beforeCount = 0;
            let afterCount = 0;

            let matchBefore;
            while ((matchBefore = methodRegexPattern.exec(beforeMethod)) !== null) {
                beforeCount++;
            }

            let matchAfter;
            while ((matchAfter = methodRegexPattern.exec(afterMethodStart)) !== null) {
                afterCount++;
            }

            // If the method is not called anywhere else in the file, mark it as potentially unused
            if (beforeCount === 0 && afterCount === 0) {
                diagnostics.push({
                    code: 'unused-private-method',
                    message: `Unused private method: ${methodName}`,
                    range: new vscode.Range(methodLinePos, methodNameEndPos),
                    severity: vscode.DiagnosticSeverity.Warning,
                    source: 'java-analyzer'
                });
            }
        }
    };

    /**
     * Finds unused private fields in Java code
     */
    JavaAnalyzer.prototype.findUnusedPrivateFields = function (text, diagnostics) {
        var fieldRegex = /private\s+(?:(?:static|final|volatile|transient)\s+)*([a-zA-Z0-9_<>[\]]+)\s+([a-zA-Z0-9_]+)\s*(?:=|;)/g;
        var match;

        while ((match = fieldRegex.exec(text)) !== null) {
            var fieldType = match[1];
            var fieldName = match[2];

            // Skip constants (typically all uppercase)
            if (fieldName === fieldName.toUpperCase()) {
                continue;
            }

            const fieldPos = this.getPositionFromOffset(text, match.index);
            const fieldNamePos = text.indexOf(fieldName, match.index);
            const fieldNameEndOffset = fieldNamePos + fieldName.length;
            const fieldNameEndPos = this.getPositionFromOffset(text, fieldNameEndOffset);

            // Check if field is used elsewhere in the file
            const fieldRegexPattern = new RegExp(`\\b(this\\.)?${this.escapeRegExp(fieldName)}\\b(?![\\s]*\\()`, 'g');
            let count = 0;
            let matchField;

            // Reset regex to start from the beginning
            fieldRegexPattern.lastIndex = 0;

            while ((matchField = fieldRegexPattern.exec(text)) !== null) {
                // Don't count the field declaration itself
                if (Math.abs(matchField.index - fieldNamePos) > fieldName.length) {
                    count++;
                }
            }

            // If used only once (the declaration), mark as unused
            if (count <= 1) {
                diagnostics.push({
                    code: 'unused-private-field',
                    message: `Unused private field: ${fieldName}`,
                    range: new vscode.Range(fieldPos, fieldNameEndPos),
                    severity: vscode.DiagnosticSeverity.Warning,
                    source: 'java-analyzer'
                });
            }
        }
    };

    /**
     * Finds unused local variables in Java code
     */
    JavaAnalyzer.prototype.findUnusedLocalVariables = function (text, diagnostics) {
        var methodBlocks = this.extractMethodBlocks(text);

        for (const methodBlock of methodBlocks) {
            const localVarRegex = /(?:final\s+)?([a-zA-Z0-9_<>[\]]+)\s+([a-zA-Z0-9_]+)\s*(?:=|;)/g;
            let match;

            while ((match = localVarRegex.exec(methodBlock.content)) !== null) {
                const varType = match[1];
                const varName = match[2];

                // Skip primitive types as parameters
                if (match.index < 20 && methodBlock.content.substr(0, match.index).includes('(')) {
                    continue;
                }

                // Skip common types that might be misidentified
                if (['public', 'private', 'protected', 'class', 'void', 'return'].includes(varType)) {
                    continue;
                }

                // Calculate real position in the document
                const varPos = this.getPositionFromOffset(text, methodBlock.start + match.index);
                const varNamePos = methodBlock.content.indexOf(varName, match.index);
                const varNameEndPos = this.getPositionFromOffset(text, methodBlock.start + varNamePos + varName.length);

                // Check if variable is used elsewhere in the method
                const varRegexPattern = new RegExp(`\\b${this.escapeRegExp(varName)}\\b`, 'g');
                let count = 0;
                let matchVar;

                // Reset regex
                varRegexPattern.lastIndex = 0;

                while ((matchVar = varRegexPattern.exec(methodBlock.content)) !== null) {
                    // Don't count the variable declaration itself
                    if (Math.abs(matchVar.index - varNamePos) > varName.length) {
                        count++;
                    }
                }

                // If used only once (the declaration), mark as unused
                if (count === 0) {
                    diagnostics.push({
                        code: 'unused-local-variable',
                        message: `Unused local variable: ${varName}`,
                        range: new vscode.Range(varPos, varNameEndPos),
                        severity: vscode.DiagnosticSeverity.Warning,
                        source: 'java-analyzer'
                    });
                }
            }
        }
    };

    /**
     * Extract method blocks from Java code
     */
    JavaAnalyzer.prototype.extractMethodBlocks = function (text) {
        const blocks = [];
        let bracketCount = 0;
        let methodStart = -1;

        // Find method declarations and their blocks
        const methodRegex = /(?:public|protected|private|static)\s+(?:(?:final|synchronized|abstract)\s+)*(?:<[^>]+>\s+)?(?:[a-zA-Z0-9_<>[\]]+)\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*(?:throws\s+[^{]+)?\s*\{/g;

        let match;
        while ((match = methodRegex.exec(text)) !== null) {
            const startPos = match.index;
            const methodName = match[1];

            // Find the method block by tracking brackets
            bracketCount = 1; // Start with the opening bracket of the method
            methodStart = startPos + match[0].length;

            for (let i = methodStart; i < text.length; i++) {
                if (text[i] === '{') {
                    bracketCount++;
                } else if (text[i] === '}') {
                    bracketCount--;

                    if (bracketCount === 0) {
                        // We've found the end of the method
                        blocks.push({
                            name: methodName,
                            start: startPos,
                            content: text.substring(startPos, i + 1),
                            end: i
                        });
                        break;
                    }
                }
            }
        }

        return blocks;
    };

    /**
     * Convert offset to VSCode position
     */
    JavaAnalyzer.prototype.getPositionFromOffset = function(text, offset) {
        const lines = text.substr(0, offset).split('\n');
        return new vscode.Position(
            lines.length - 1,
            lines[lines.length - 1].length
        );
    };

    /**
     * Escape special characters for RegExp
     */
    JavaAnalyzer.prototype.escapeRegExp = function(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    return JavaAnalyzer;
}(BaseLanguageAnalyzer_1.BaseLanguageAnalyzer));

exports.JavaAnalyzer = JavaAnalyzer;
