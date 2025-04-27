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
exports.StructureReorganizer = void 0;
var vscode = require("vscode");
var path = require("path");
/**
 * Service responsible for analyzing and reorganizing code structure
 */
var StructureReorganizer = /** @class */ (function () {
    function StructureReorganizer() {
    }
    /**
     * Analyzes the structure of a file and suggests improvements
     * @param filePath Path to the file to analyze
     * @returns Analysis result with suggestions
     */
    StructureReorganizer.prototype.analyzeFileStructure = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var document, text, fileExtension;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.openTextDocument(filePath)];
                    case 1:
                        document = _a.sent();
                        text = document.getText();
                        fileExtension = path.extname(filePath).toLowerCase();
                        if (['.js', '.jsx', '.ts', '.tsx'].includes(fileExtension)) {
                            return [2 /*return*/, this.analyzeJavaScriptStructure(text, fileExtension.includes('ts'))];
                        }
                        else if (['.py'].includes(fileExtension)) {
                            return [2 /*return*/, this.analyzePythonStructure(text)];
                        }
                        else if (['.java', '.kt'].includes(fileExtension)) {
                            return [2 /*return*/, this.analyzeJavaStructure(text)];
                        }
                        else {
                            return [2 /*return*/, {
                                    suggestions: [],
                                    summary: "Unsupported file type for structure analysis"
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Proposes reorganization for the given code
     * @param filePath Path to the file to reorganize
     * @returns The reorganized code structure
     */
    StructureReorganizer.prototype.proposeReorganization = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var analysisResult, document, originalText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analyzeFileStructure(filePath)];
                    case 1:
                        analysisResult = _a.sent();
                        return [4 /*yield*/, vscode.workspace.openTextDocument(filePath)];
                    case 2:
                        document = _a.sent();
                        originalText = document.getText();
                        // For now, just return the analysis without actual reorganization
                        // In a complete implementation, we would apply transformations based on the analysis
                        return [2 /*return*/, {
                                originalCode: originalText,
                                reorganizedCode: originalText, // Placeholder - would be transformed code
                                changes: analysisResult.suggestions,
                                summary: analysisResult.summary
                            }];
                }
            });
        });
    };
    /**
     * Apply the proposed reorganization to the file
     * @param filePath Path to the file
     * @param proposal Reorganization proposal to apply
     */
    StructureReorganizer.prototype.applyReorganization = function (filePath, proposal) {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceEdit, uri, document, fullRange;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workspaceEdit = new vscode.WorkspaceEdit();
                        uri = vscode.Uri.file(filePath);
                        return [4 /*yield*/, vscode.workspace.openTextDocument(uri)];
                    case 1:
                        document = _a.sent();
                        fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
                        workspaceEdit.replace(uri, fullRange, proposal.reorganizedCode);
                        // Apply the edits
                        return [4 /*yield*/, vscode.workspace.applyEdit(workspaceEdit)];
                    case 2:
                        // Apply the edits
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Private analysis methods for different language types
    StructureReorganizer.prototype.analyzeJavaScriptStructure = function (code, isTypeScript) {
        // This is a placeholder for actual analysis logic
        var suggestions = [];
        // Example analysis logic:
        // 1. Check for large files that should be split
        if (code.length > 1000) {
            suggestions.push({
                type: 'split_file',
                description: 'File is quite large and might benefit from being split into multiple modules',
                severity: 'suggestion'
            });
        }
        // 2. Check for deeply nested code
        var maxIndentLevel = this.detectMaxIndentation(code);
        if (maxIndentLevel > 4) {
            suggestions.push({
                type: 'reduce_nesting',
                description: "Code has deep nesting (".concat(maxIndentLevel, " levels). Consider refactoring to reduce complexity"),
                severity: 'recommendation'
            });
        }
        // 3. Check for large functions
        var largeFunctions = this.detectLargeFunctions(code);
        for (var _i = 0, largeFunctions_1 = largeFunctions; _i < largeFunctions_1.length; _i++) {
            var func = largeFunctions_1[_i];
            suggestions.push({
                type: 'split_function',
                description: "Function '".concat(func.name, "' is ").concat(func.lines, " lines long. Consider breaking it down into smaller functions"),
                severity: 'recommendation',
                location: func.location
            });
        }
        return {
            suggestions: suggestions,
            summary: "Found ".concat(suggestions.length, " structure improvement suggestions")
        };
    };
    StructureReorganizer.prototype.analyzePythonStructure = function (code) {
        // Placeholder for Python-specific structure analysis
        return {
            suggestions: [],
            summary: "Python structure analysis not yet implemented"
        };
    };
    StructureReorganizer.prototype.analyzeJavaStructure = function (code) {
        // Placeholder for Java-specific structure analysis
        return {
            suggestions: [],
            summary: "Java structure analysis not yet implemented"
        };
    };
    // Utility functions
    StructureReorganizer.prototype.detectMaxIndentation = function (code) {
        var lines = code.split('\n');
        var maxIndent = 0;
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var trimStart = line.length - line.trimStart().length;
            var indentLevel = Math.floor(trimStart / 2); // Assuming 2 spaces per indent level
            maxIndent = Math.max(maxIndent, indentLevel);
        }
        return maxIndent;
    };
    StructureReorganizer.prototype.detectLargeFunctions = function (code) {
        // Very basic function detection - would need proper parsing in a real implementation
        var result = [];
        var functionRegex = /function\s+(\w+)\s*\([^)]*\)/g;
        var match;
        while ((match = functionRegex.exec(code)) !== null) {
            var startPos = match.index;
            var funcName = match[1];
            // Very naive approach to find function end - would need proper parsing
            var braceCount = 0;
            var endPos = startPos;
            for (var i = startPos; i < code.length; i++) {
                if (code[i] === '{') {
                    braceCount++;
                }
                if (code[i] === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        endPos = i;
                        break;
                    }
                }
            }
            var funcCode = code.substring(startPos, endPos + 1);
            var lineCount = funcCode.split('\n').length;
            if (lineCount > 30) { // Consider functions over 30 lines as "large"
                result.push({
                    name: funcName,
                    lines: lineCount,
                    location: { start: startPos, end: endPos }
                });
            }
        }
        return result;
    };
    return StructureReorganizer;
}());
exports.StructureReorganizer = StructureReorganizer;
