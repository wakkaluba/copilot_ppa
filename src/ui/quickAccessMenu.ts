import * as vscode from 'vscode';
import { CommandToggleManager } from './commandToggleManager';
import { WebviewService } from '../services/ui/WebviewService';
import { ToggleService } from '../services/ui/ToggleService';

/**
 * Provides a burger menu with quick access to command toggles
 */
export class QuickAccessMenu {
    private panel: vscode.WebviewPanel | undefined;
    private readonly webviewService: WebviewService;
    private readonly toggleService: ToggleService;
    
    constructor(context: vscode.ExtensionContext) {
        this.webviewService = new WebviewService(context);
        this.toggleService = new ToggleService(context);
        
        this.toggleService.onToggleChange(() => {
            if (this.panel) {
                this.updatePanel();
            }
        });
    }
    
    /**
     * Show the quick access menu
     */
    public show(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        
        // Create a new panel
        this.panel = this.webviewService.createWebviewPanel(
            'quickAccessMenu',
            'Command Toggles',
            { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }
        );
        
        // Set initial content
        this.updatePanel();
        
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            this.handleWebviewMessage.bind(this),
            undefined,
            this.webviewService.getDisposables()
        );
        
        // Clean up resources when the panel is closed
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        }, null, this.webviewService.getDisposables());
    }
    
    /**
     * Update the panel content
     */
    private updatePanel(): void {
        if (!this.panel) {
            return;
        }
        
        this.panel.webview.html = this.webviewService.getToggleMenuContent(
            this.toggleService.getAllToggles()
        );
    }
    
    /**
     * Handle messages from the webview
     */
    private async handleWebviewMessage(message: any): Promise<void> {
        switch (message.command) {
            case 'toggleSwitch':
                await this.toggleService.toggleState(message.id);
                break;
                
            case 'resetAll':
                await this.toggleService.resetToggles();
                break;
                
            case 'close':
                if (this.panel) {
                    this.panel.dispose();
                }
                break;
        }
    }
}
