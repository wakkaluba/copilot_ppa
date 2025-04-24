import * as vscode from 'vscode';
import * as ts from 'typescript';
import { ILanguageAnalyzer } from './ILanguageAnalyzer';
import { UnusedElement } from '../types/UnusedElement';

export class TypeScriptAnalyzer implements ILanguageAnalyzer {
    public async findUnusedCode(document: vscode.TextDocument, selection?: vscode.Selection): Promise<vscode.Diagnostic[]> {
        const sourceFile = ts.createSourceFile(
            document.uri.fsPath,
            document.getText(),
            ts.ScriptTarget.Latest,
            true
        );

        const startPos = selection?.start || new vscode.Position(0, 0);
        const endPos = selection?.end || new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);

        const unusedElements = this.analyzeSourceFile(sourceFile, startPos, endPos);
        return this.convertToDiagnostics(unusedElements);
    }

    private analyzeSourceFile(sourceFile: ts.SourceFile, startPos: vscode.Position, endPos: vscode.Position): UnusedElement[] {
        const unusedElements: UnusedElement[] = [];
        const declaredVariables = new Map<string, ts.Node>();
        const usedVariables = new Set<string>();

        const collectDeclarations = (node: ts.Node) => {
            if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
                declaredVariables.set(node.name.text, node);
            } else if (ts.isFunctionDeclaration(node) && node.name) {
                declaredVariables.set(node.name.text, node);
            } else if (ts.isClassDeclaration(node) && node.name) {
                declaredVariables.set(node.name.text, node);
            } else if (ts.isInterfaceDeclaration(node) && node.name) {
                declaredVariables.set(node.name.text, node);
            }
            ts.forEachChild(node, collectDeclarations);
        };

        const collectUsages = (node: ts.Node) => {
            if (ts.isIdentifier(node)) {
                usedVariables.add(node.text);
            }
            ts.forEachChild(node, collectUsages);
        };

        collectDeclarations(sourceFile);
        collectUsages(sourceFile);

        declaredVariables.forEach((node, name) => {
            if (name === 'React' || usedVariables.has(name)) {return;}

            const start = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
            const end = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());
            
            const elementPos = new vscode.Range(
                new vscode.Position(start.line, start.character),
                new vscode.Position(end.line, end.character)
            );

            if (!this.isWithinRange(elementPos, new vscode.Range(startPos, endPos))) {return;}

            unusedElements.push({
                name,
                type: this.getElementType(node),
                range: elementPos
            });
        });

        return unusedElements;
    }

    private getElementType(node: ts.Node): string {
        if (ts.isFunctionDeclaration(node)) {return 'function';}
        if (ts.isClassDeclaration(node)) {return 'class';}
        if (ts.isInterfaceDeclaration(node)) {return 'interface';}
        if (ts.isImportDeclaration(node)) {return 'import';}
        if (ts.isVariableDeclaration(node)) {return 'variable';}
        return 'declaration';
    }

    private isWithinRange(elementRange: vscode.Range, selectionRange: vscode.Range): boolean {
        return elementRange.intersection(selectionRange) !== undefined;
    }

    private convertToDiagnostics(elements: UnusedElement[]): vscode.Diagnostic[] {
        return elements.map(element => {
            const diagnostic = new vscode.Diagnostic(
                element.range,
                `Unused ${element.type}: ${element.name}`,
                vscode.DiagnosticSeverity.Information
            );
            diagnostic.source = 'Local LLM Agent';
            diagnostic.code = 'unused-code';
            diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];
            return diagnostic;
        });
    }

    public dispose(): void {
        // No resources to clean up
    }
}