import * as vscode from 'vscode';
import { ITheme, ThemeColors } from '../interfaces';
/**
 * Handles VS Code theme integration and color detection
 */
export declare class ThemeService implements vscode.Disposable {
    private disposables;
    constructor();
    /**
     * Get colors from the current VS Code theme
     */
    getCurrentVSCodeColors(): ThemeColors;
    /**
     * Create a theme based on the current VS Code theme
     */
    createVSCodeMatchingTheme(): ITheme;
    dispose(): void;
}
