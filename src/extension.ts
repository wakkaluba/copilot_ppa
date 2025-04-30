import * as vscode from 'vscode';
import { Agent } from './agents/Agent';
import { registerCommands } from './commands';
import { AgentResponseEnhancer } from './services/AgentResponseEnhancer';
import { ConversationHistory } from './services/ConversationHistory';
import { initializeServices, ServiceRegistry, Services } from './services/ServiceRegistry';
import { UserConfirmationService } from './services/UserConfirmationService';
import { setupStatusBar } from './statusBar';
import { setupWebviews } from './webview';

export async function activate(context: vscode.ExtensionContext) {
    // Initialize user confirmation service
    UserConfirmationService.initialize(context);

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

    const conversationHistory = new ConversationHistory(context);
    const responseEnhancer = new AgentResponseEnhancer(conversationHistory);
    context.subscriptions.push(responseEnhancer);

    const agent = new Agent(context, {
        // ...existing code...
        responseEnhancer,
        // ...existing code...
    });
    // ...existing code...

    return {
        serviceRegistry: registry
    };
}

export function deactivate() {
    const registry = ServiceRegistry.getInstance();
    registry.dispose();
}
