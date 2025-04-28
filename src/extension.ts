import * as vscode from 'vscode';
import { ServiceRegistry, initializeServices, Services } from './services/ServiceRegistry';
import { registerCommands } from './commands';
import { setupWebviews } from './webview';
import { setupStatusBar } from './statusBar';

export async function activate(context: vscode.ExtensionContext) {
    // Initialize service registry
    await initializeServices(context);
    const registry = ServiceRegistry.getInstance();

    // Setup core extension components
    registerCommands(context, registry);
    setupWebviews(context, registry);
    setupStatusBar(context, registry);

    // Get LLM services
    const connectionManager = registry.get(Services.LLMConnectionManager);
    const hostManager = registry.get(Services.LLMHostManager);
    const sessionManager = registry.get(Services.LLMSessionManager);

    // Auto-connect if configured
    const config = vscode.workspace.getConfiguration('copilot-ppa');
    if (config.get<boolean>('autoConnect', false)) {
        connectionManager.connectToLLM().catch(error => {
            console.error('Auto-connect failed:', error);
        });
    }

    return {
        serviceRegistry: registry
    };
}

export function deactivate() {
    const registry = ServiceRegistry.getInstance();
    registry.dispose();
}
