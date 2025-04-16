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
exports.UnusedCodeDetector = void 0;
const vscode = __importStar(require("vscode"));
const ts = __importStar(require("typescript"));
const path = __importStar(require("path"));
class UnusedCodeDetector {
    constructor(context) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('unusedCode');
        context.subscriptions.push(this.diagnosticCollection);
    }
    /**
     * Analyzes the current file or selection to detect unused code
     * @param editor The active text editor
     * @returns Array of detected unused code elements
     */
    async detectUnusedCode(editor) {
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return [];
        }
        const filePath = editor.document.uri.fsPath;
        const fileExtension = path.extname(filePath);
        const diagnostics = [];
        // Filter for TypeScript and JavaScript files
        if (!['.ts', '.tsx', '.js', '.jsx'].includes(fileExtension)) {
            vscode.window.showInformationMessage('Unused code detection is currently only supported for TypeScript and JavaScript files');
            return [];
        }
        try {
            // Parse the document using TypeScript compiler API
            const sourceFile = ts.createSourceFile(filePath, editor.document.getText(), ts.ScriptTarget.Latest, true);
            // Get selected text or whole document
            const selectedRange = editor.selection;
            const startPosition = selectedRange.isEmpty ?
                new vscode.Position(0, 0) :
                selectedRange.start;
            const endPosition = selectedRange.isEmpty ?
                new vscode.Position(editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).text.length) :
                selectedRange.end;
            // Analyze the file for unused variables, functions, and imports
            const unusedElements = this.analyzeSourceFile(sourceFile, editor.document, startPosition, endPosition);
            // Create diagnostics for each unused element
            for (const element of unusedElements) {
                const range = new vscode.Range(element.startLine, element.startChar, element.endLine, element.endChar);
                const diagnostic = new vscode.Diagnostic(range, `Unused ${element.type}: ${element.name}`, vscode.DiagnosticSeverity.Information);
                diagnostic.source = 'Local LLM Agent';
                diagnostic.code = 'unused-code';
                diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];
                diagnostics.push(diagnostic);
            }
            // Update the diagnostic collection
            this.diagnosticCollection.set(editor.document.uri, diagnostics);
            return diagnostics;
        }
        catch (error) {
            console.error('Error during unused code detection:', error);
            vscode.window.showErrorMessage(`Error analyzing file: ${error}`);
            return [];
        }
    }
    /**
     * Analyze the source file to find unused elements
     */
    analyzeSourceFile(sourceFile, document, startPosition, endPosition) {
        const unusedElements = [];
        const declaredVariables = new Map();
        const usedVariables = new Set();
        // First pass: collect all declarations
        function collectDeclarations(node) {
            // Variable declarations
            if (ts.isVariableDeclaration(node) && node.name) {
                if (ts.isIdentifier(node.name)) {
                    declaredVariables.set(node.name.text, node);
                }
            }
            // Function declarations
            if (ts.isFunctionDeclaration(node) && node.name) {
                declaredVariables.set(node.name.text, node);
            }
            // Class declarations
            if (ts.isClassDeclaration(node) && node.name) {
                declaredVariables.set(node.name.text, node);
            }
            // Interface declarations
            if (ts.isInterfaceDeclaration(node) && node.name) {
                declaredVariables.set(node.name.text, node);
            }
            // Import declarations
            if (ts.isImportDeclaration(node)) {
                if (node.importClause) {
                    if (node.importClause.name) {
                        declaredVariables.set(node.importClause.name.text, node);
                    }
                    if (node.importClause.namedBindings) {
                        if (ts.isNamedImports(node.importClause.namedBindings)) {
                            node.importClause.namedBindings.elements.forEach(element => {
                                declaredVariables.set(element.name.text, element);
                            });
                        }
                    }
                }
            }
            ts.forEachChild(node, collectDeclarations);
        }
        // Second pass: collect variable usage
        function collectUsages(node) {
            if (ts.isIdentifier(node)) {
                usedVariables.add(node.text);
            }
            ts.forEachChild(node, collectUsages);
        }
        // Run both passes
        collectDeclarations(sourceFile);
        collectUsages(sourceFile);
        // Find unused variables and convert to diagnostic format
        declaredVariables.forEach((node, name) => {
            // Skip exports and special names (like React in JSX files)
            if (name === 'React' || name === 'React.Component') {
                return;
            }
            // Check if the variable is used
            const isUsed = usedVariables.has(name);
            // Special case: variable declarations might be used in their own declaration
            if (ts.isVariableDeclaration(node) && node.initializer) {
                // Consider it used if it has an initializer that might reference itself
                if (isVariableUsedInItsOwnInitializer(node, name)) {
                    return;
                }
            }
            // If not used elsewhere besides its declaration, it's unused
            if (!isUsed || (isUsed && isOnlyUsedInDeclaration(node, name))) {
                // Get position in document
                const start = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
                const end = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());
                // Create position in VSCode format
                const startLinePos = new vscode.Position(start.line, start.character);
                const endLinePos = new vscode.Position(end.line, end.character);
                // Check if the unused element is within the selected range
                if (isWithinRange(startLinePos, endLinePos, startPosition, endPosition)) {
                    // Determine the type of the unused element
                    let elementType = 'variable';
                    if (ts.isFunctionDeclaration(node)) {
                        elementType = 'function';
                    }
                    else if (ts.isClassDeclaration(node)) {
                        elementType = 'class';
                    }
                    else if (ts.isInterfaceDeclaration(node)) {
                        elementType = 'interface';
                    }
                    else if (ts.isImportSpecifier(node)) {
                        elementType = 'import';
                    }
                    else if (ts.isImportDeclaration(node)) {
                        elementType = 'import declaration';
                    }
                    unusedElements.push({
                        name: name,
                        type: elementType,
                        startLine: start.line,
                        startChar: start.character,
                        endLine: end.line,
                        endChar: end.character,
                        node: node
                    });
                }
            }
        });
        return unusedElements;
    }
    /**
     * Remove all unused code from the current document
     * @param editor The active text editor
     * @param diagnostics Array of diagnostics for unused code
     */
    async removeUnusedCode(editor, diagnostics) {
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        // If diagnostics aren't provided, detect them
        if (!diagnostics || diagnostics.length === 0) {
            diagnostics = await this.detectUnusedCode(editor);
        }
        if (diagnostics.length === 0) {
            vscode.window.showInformationMessage('No unused code detected in the current selection or file');
            return;
        }
        // Sort diagnostics in reverse order to avoid position shifting
        const sortedDiagnostics = [...diagnostics].sort((a, b) => {
            if (b.range.start.line !== a.range.start.line) {
                return b.range.start.line - a.range.start.line;
            }
            return b.range.start.character - a.range.start.character;
        });
        // Create a preview of changes
        const previewDocument = await this.createRemovalPreview(editor.document, sortedDiagnostics);
        // Show preview and confirmation dialog
        const showDiff = 'Show Changes';
        const applyChanges = 'Apply Changes';
        const cancelOperation = 'Cancel';
        const choice = await vscode.window.showInformationMessage(`Found ${diagnostics.length} unused code elements. What would you like to do?`, showDiff, applyChanges, cancelOperation);
        if (choice === showDiff) {
            // Open a diff view to show changes
            const originalUri = editor.document.uri;
            const previewUri = originalUri.with({ scheme: 'untitled' });
            // Create a new document with the preview content
            const previewDoc = await vscode.workspace.openTextDocument({
                content: previewDocument,
                language: editor.document.languageId
            });
            // Show diff editor
            await vscode.commands.executeCommand('vscode.diff', originalUri, previewUri, 'Unused Code Removal Preview', { preview: true });
            // Ask again after showing diff
            const applyAfterDiff = await vscode.window.showInformationMessage('Would you like to apply these changes?', 'Apply Changes', 'Cancel');
            if (applyAfterDiff !== 'Apply Changes') {
                return;
            }
        }
        else if (choice !== applyChanges) {
            // User cancelled
            return;
        }
        // Apply changes
        await editor.edit(editBuilder => {
            for (const diagnostic of sortedDiagnostics) {
                editBuilder.delete(diagnostic.range);
            }
        });
        vscode.window.showInformationMessage(`Removed ${diagnostics.length} unused code elements`);
        // Clear diagnostics after applying changes
        this.diagnosticCollection.delete(editor.document.uri);
    }
    /**
     * Creates a preview of the document with unused code removed
     */
    async createRemovalPreview(document, diagnostics) {
        let documentText = document.getText();
        // Apply deletions in reverse order to avoid position shifting
        for (const diagnostic of diagnostics) {
            const startOffset = document.offsetAt(diagnostic.range.start);
            const endOffset = document.offsetAt(diagnostic.range.end);
            // Delete the unused code
            documentText = documentText.substring(0, startOffset) +
                documentText.substring(endOffset);
        }
        return documentText;
    }
}
exports.UnusedCodeDetector = UnusedCodeDetector;
/**
 * Checks if a position is within a specified range
 */
function isWithinRange(startPos, endPos, rangeStart, rangeEnd) {
    return ((startPos.isAfterOrEqual(rangeStart) && startPos.isBeforeOrEqual(rangeEnd)) ||
        (endPos.isAfterOrEqual(rangeStart) && endPos.isBeforeOrEqual(rangeEnd)));
}
/**
 * Checks if a variable is used in its own initializer
 */
function isVariableUsedInItsOwnInitializer(node, name) {
    if (!node.initializer) {
        return false;
    }
    let isUsed = false;
    function checkIdentifier(n) {
        if (ts.isIdentifier(n) && n.text === name) {
            isUsed = true;
            return;
        }
        if (!isUsed) {
            ts.forEachChild(n, checkIdentifier);
        }
    }
    checkIdentifier(node.initializer);
    return isUsed;
}
/**
 * Checks if a variable is only used in its own declaration
 */
function isOnlyUsedInDeclaration(node, name) {
    let usageCount = 0;
    // Find parent scope
    let scopeNode = node;
    while (scopeNode.parent &&
        !ts.isSourceFile(scopeNode.parent) &&
        !ts.isFunctionDeclaration(scopeNode.parent) &&
        !ts.isMethodDeclaration(scopeNode.parent)) {
        scopeNode = scopeNode.parent;
    }
    // Count usages in scope
    function countUsages(n) {
        if (ts.isIdentifier(n) && n.text === name) {
            usageCount++;
        }
        ts.forEachChild(n, countUsages);
    }
    countUsages(scopeNode);
    // The variable should be used at least once in its declaration
    return usageCount <= 1;
}
//# sourceMappingURL=unusedCodeDetector.js.map