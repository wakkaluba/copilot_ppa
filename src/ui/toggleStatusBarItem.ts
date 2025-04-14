import * as vscode from 'vscode';
import { CommandToggleManager } from './commandToggleManager';
import { QuickAccessMenu } from './quickAccessMenu';

/**
 * Status bar item to display and control command toggles
 */
export class ToggleStatusBarItem {
    private statusBarItem: vscode.StatusBarItem;
    private context: vscode.ExtensionContext;
    private toggleManager: CommandToggleManager;
    private quickAccessMenu: QuickAccessMenu;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.toggleManager = CommandToggleManager.getInstance(context);
        this.quickAccessMenu = new QuickAccessMenu(context);
        
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'copilot-ppa.showCommandToggles';
        
        // Listen for toggle changes to update status bar
        this.toggleManager.onToggleChange(() => {
            this.updateStatusBar();
        });
        
        // Initialize status bar
        this.updateStatusBar();
        this.statusBarItem.show();
        
        // Register with the context for cleanup
        context.subscriptions.push(this.statusBarItem);
    }
    
    /**
     * Update the status bar item based on current toggle states
     */
    private updateStatusBar(): void {
        const toggles = this.toggleManager.getAllToggles();
        const activeToggles = toggles.filter(t => t.state);
        
        if (activeToggles.length === 0) {
            this.statusBarItem.text = '$(circle-outline) AI Commands';
            this.statusBarItem.tooltip = 'No command toggles active. Click to configure.';
        } else if (activeToggles.length === 1) {
            this.statusBarItem.text = `$(circle-filled) ${activeToggles[0].label}`;
            this.statusBarItem.tooltip = `1 command toggle active: ${activeToggles[0].label}`;
        } else {
            this.statusBarItem.text = `$(circle-filled) ${activeToggles.length} Toggles`;
            this.statusBarItem.tooltip = `${activeToggles.length} command toggles active:\n${activeToggles.map(t => t.label).join(', ')}`;
        }
    }
    
    /**
     * Show the command toggles menu
     */
    public showMenu(): void {
        this.quickAccessMenu.show();
    }
}
