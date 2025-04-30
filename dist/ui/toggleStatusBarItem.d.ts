import * as vscode from 'vscode';
import { KeybindingCategory } from '../services/ui/keybindingManager';
export interface IToggleState {
    id: string;
    label: string;
    description: string;
    state: boolean;
    category: KeybindingCategory;
}
/**
 * Status bar item to display and control command toggles
 */
export declare class ToggleStatusBarItem implements vscode.Disposable {
    private statusBarItem;
    private toggleManager;
    private quickAccessMenu;
    private disposables;
    constructor(context: vscode.ExtensionContext);
    /**
     * Update the status bar item based on current toggle states
     */
    private updateStatusBar;
    /**
     * Get category for a toggle based on its ID
     */
    private getToggleCategory;
    /**
     * Group toggles by their category
     */
    private groupByCategory;
    /**
     * Format tooltip with category grouping
     */
    private formatTooltip;
    /**
     * Show the command toggles menu
     */
    showMenu(): void;
    /**
     * Dispose of status bar item and other resources
     */
    dispose(): void;
}
