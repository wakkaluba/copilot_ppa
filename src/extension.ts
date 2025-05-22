import * as vscode from 'vscode';
import { Agent } from './agents/Agent';
import { registerCommands } from './commands';
import { AgentResponseEnhancer } from './services/AgentResponseEnhancer';
import { ConversationHistory } from './services/ConversationHistory';
import { initializeServices, ServiceRegistry } from './services/ServiceRegistry';
import { setupStatusBar } from './statusBar';
import { setupWebviews } from './webview';

export async function activate(
  context: vscode.ExtensionContext,
): Promise<{ serviceRegistry: ServiceRegistry }> {
  // Initialize service registry
  await initializeServices(context);
  const registry = ServiceRegistry.getInstance();

  // Setup core extension components
  registerCommands(); // No arguments, per stub
  setupWebviews(context, registry);
  setupStatusBar(context, registry);

  // ConversationHistory and AgentResponseEnhancer have no constructor args in stub
  new ConversationHistory();
  new AgentResponseEnhancer();
  new Agent();

  return {
    serviceRegistry: registry,
  };
}

export function deactivate(): void {
  // No registry.dispose() method, so just get instance
  ServiceRegistry.getInstance();
}
