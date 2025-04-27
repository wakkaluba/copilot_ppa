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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureReorganizer = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
/**
 * Service responsible for analyzing and reorganizing code structure
 */
class StructureReorganizer {
    /**
     * Analyzes the structure of a file and suggests improvements
     * @param filePath Path to the file to analyze
     * @returns Analysis result with suggestions
     */
    async analyzeFileStructure(filePath) {
        const document = await vscode.workspace.openTextDocument(filePath);
        const text = document.getText();
        // Determine file type and apply appropriate analysis
        const fileExtension = path.extname(filePath).toLowerCase();
        if (['.js', '.jsx', '.ts', '.tsx'].includes(fileExtension)) {
            return this.analyzeJavaScriptStructure(text, fileExtension.includes('ts'));
        }
        else if (['.py'].includes(fileExtension)) {
            return this.analyzePythonStructure(text);
        }
        else if (['.java', '.kt'].includes(fileExtension)) {
            return this.analyzeJavaStructure(text);
        }
        else {
            return {
                suggestions: [],
                summary: "Unsupported file type for structure analysis"
            };
        }
    }
    /**
     * Proposes reorganization for the given code
     * @param filePath Path to the file to reorganize
     * @returns The reorganized code structure
     */
    async proposeReorganization(filePath) {
        const analysisResult = await this.analyzeFileStructure(filePath);
        const document = await vscode.workspace.openTextDocument(filePath);
        const originalText = document.getText();
        // For now, just return the analysis without actual reorganization
        // In a complete implementation, we would apply transformations based on the analysis
        return {
            originalCode: originalText,
            reorganizedCode: originalText,
            changes: analysisResult.suggestions,
            summary: analysisResult.summary
        };
    }
    /**
     * Apply the proposed reorganization to the file
     * @param filePath Path to the file
     * @param proposal Reorganization proposal to apply
     */
    async applyReorganization(filePath, proposal) {
        // Create a WorkspaceEdit to make the changes
        const workspaceEdit = new vscode.WorkspaceEdit();
        const uri = vscode.Uri.file(filePath);
        // Replace the entire file content
        const document = await vscode.workspace.openTextDocument(uri);
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
        workspaceEdit.replace(uri, fullRange, proposal.reorganizedCode);
        // Apply the edits
        await vscode.workspace.applyEdit(workspaceEdit);
    }
    // Private analysis methods for different language types
    analyzeJavaScriptStructure(code, isTypeScript) {
        // This is a placeholder for actual analysis logic
        const suggestions = [];
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
        const maxIndentLevel = this.detectMaxIndentation(code);
        if (maxIndentLevel > 4) {
            suggestions.push({
                type: 'reduce_nesting',
                description: `Code has deep nesting (${maxIndentLevel} levels). Consider refactoring to reduce complexity`,
                severity: 'recommendation'
            });
        }
        // 3. Check for large functions
        const largeFunctions = this.detectLargeFunctions(code);
        for (const func of largeFunctions) {
            suggestions.push({
                type: 'split_function',
                description: `Function '${func.name}' is ${func.lines} lines long. Consider breaking it down into smaller functions`,
                severity: 'recommendation',
                location: func.location
            });
        }
        return {
            suggestions,
            summary: `Found ${suggestions.length} structure improvement suggestions`
        };
    }
    analyzePythonStructure(code) {
        // Placeholder for Python-specific structure analysis
        return {
            suggestions: [],
            summary: "Python structure analysis not yet implemented"
        };
    }
    analyzeJavaStructure(code) {
        // Placeholder for Java-specific structure analysis
        return {
            suggestions: [],
            summary: "Java structure analysis not yet implemented"
        };
    }
    // Utility functions
    detectMaxIndentation(code) {
        const lines = code.split('\n');
        let maxIndent = 0;
        for (const line of lines) {
            const trimStart = line.length - line.trimStart().length;
            const indentLevel = Math.floor(trimStart / 2); // Assuming 2 spaces per indent level
            maxIndent = Math.max(maxIndent, indentLevel);
        }
        return maxIndent;
    }
    detectLargeFunctions(code) {
        // Very basic function detection - would need proper parsing in a real implementation
        const result = [];
        const functionRegex = /function\s+(\w+)\s*\([^)]*\)/g;
        let match;
        while ((match = functionRegex.exec(code)) !== null) {
            const startPos = match.index;
            const funcName = match[1];
            // Very naive approach to find function end - would need proper parsing
            let braceCount = 0;
            let endPos = startPos;
            for (let i = startPos; i < code.length; i++) {
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
            const funcCode = code.substring(startPos, endPos + 1);
            const lineCount = funcCode.split('\n').length;
            if (lineCount > 30) { // Consider functions over 30 lines as "large"
                result.push({
                    name: funcName,
                    lines: lineCount,
                    location: { start: startPos, end: endPos }
                });
            }
        }
        return result;
    }
}
exports.StructureReorganizer = StructureReorganizer;
//# sourceMappingURL=structureReorganizer.js.map