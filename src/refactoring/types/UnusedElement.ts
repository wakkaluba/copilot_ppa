import * as vscode from 'vscode';

export interface UnusedElement {
    name: string;
    type: string;
    range: vscode.Range;
}