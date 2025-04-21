import * as vscode from 'vscode';
import { CommandToggleManager } from './commandToggleManager';
import { QuickAccessMenu } from './quickAccessMenu';
import { KeybindingCategory } from '../services/ui/keybindingManager';

interface ToggleState {
    id: string;
    label: string;
    description: string;
    state: boolean;
    category: KeybindingCategory;
}

/**
 * Status bar item to display and control command toggles
 */
export class ToggleStatusBarItem implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;
    private toggleManager: CommandToggleManager;
    private quickAccessMenu: QuickAccessMenu;
    private disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.toggleManager = CommandToggleManager.getInstance(context);
        this.quickAccessMenu = new QuickAccessMenu(context);
        
        // Create status bar item with high priority to appear near command toggles
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            1000 // High priority to appear near command toggles
        );
        this.statusBarItem.command = 'copilot-ppa.showCommandToggles';
        
        // Listen for toggle changes to update status bar
        this.disposables.push(
            this.toggleManager.onToggleChange(() => {
                this.updateStatusBar();
            })
        );
        
        // Listen for theme changes to update colors
        this.disposables.push(
            vscode.window.onDidChangeActiveColorTheme(() => {
                this.updateStatusBar();
            })
        );
        
        // Initialize status bar
        this.updateStatusBar();
        this.statusBarItem.show();
        
        // Register status bar item for cleanup
        this.disposables.push(this.statusBarItem);
        
        // Register all disposables with the extension context
        context.subscriptions.push(...this.disposables);
    }
    
    /**
     * Update the status bar item based on current toggle states
     */
    private updateStatusBar(): void {
        const toggles = this.toggleManager.getAllToggles().map(t => ({
            ...t,
            category: this.getToggleCategory(t.id)
        }));
        const activeToggles = toggles.filter(t => t.state);
        
        if (activeToggles.length === 0) {
            this.statusBarItem.text = '$(circle-large-outline) Commands';
            this.statusBarItem.tooltip = 'No command toggles active\nClick to configure command toggles';
            this.statusBarItem.backgroundColor = undefined;
        } else if (activeToggles.length === 1) {
            // We know there's exactly one toggle, so this assertion is safe
            const toggle = activeToggles[0]!;
            this.statusBarItem.text = `$(circle-large-filled) ${toggle.label}`;
            this.statusBarItem.tooltip = `Active toggle: ${toggle.label}\n${toggle.description}\nCategory: ${toggle.category}\n\nClick to configure command toggles`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        } else {
            const byCategory = this.groupByCategory(activeToggles);
            this.statusBarItem.text = `$(circle-large-filled) ${activeToggles.length} Toggles`;
            this.statusBarItem.tooltip = this.formatTooltip(byCategory);
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        }
    }

    /**
     * Get category for a toggle based on its ID
     */
    private getToggleCategory(id: string): KeybindingCategory {
        // Map toggle IDs to categories
        switch (id) {
            case 'workspace':
            case 'codebase':
                return KeybindingCategory.Navigation;
            case 'verbose':
            case 'debug':
                return KeybindingCategory.Other;
            case 'explain':
            case 'refactor':
            case 'document':
                return KeybindingCategory.Code;
            default:
                return KeybindingCategory.Other;
        }
    }

    /**
     * Group toggles by their category
     */
    private groupByCategory(toggles: ToggleState[]): Map<KeybindingCategory, ToggleState[]> {
        const grouped = new Map<KeybindingCategory, ToggleState[]>();
        for (const toggle of toggles) {
            const list = grouped.get(toggle.category) || [];
            list.push(toggle);
            grouped.set(toggle.category, list);
        }
        return grouped;
    }

    /**
     * Format tooltip with category grouping
     */
    private formatTooltip(byCategory: Map<KeybindingCategory, ToggleState[]>): string {
        const lines = [`${[...byCategory.values()].flat().length} command toggles active:`];
        
        for (const [category, toggles] of byCategory.entries()) {
            lines.push(`\n${category}:`);
            for (const toggle of toggles) {
                lines.push(`  • ${toggle.label}`);
            }
        }
        
        lines.push('\nClick to configure command toggles');
        return lines.join('\n');
    }

    /**
     * Show the command toggles menu
     */
    public showMenu(): void {
        this.quickAccessMenu.show();
    }

    /**
     * Dispose of status bar item and other resources
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}
