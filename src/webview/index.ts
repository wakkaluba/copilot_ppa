import * as vscode from 'vscode';
import { ChatViewProvider } from './chatView';
import { ServiceRegistry, Services } from '../services/ServiceRegistry';

export function setupWebviews(context: vscode.ExtensionContext, registry: ServiceRegistry): void {
  // Get required services
  const llmProviderManager = registry.get(Services.LLMProviderManager);
  const sessionManager = registry.get(Services.LLMSessionManager);
  const contextManager = registry.get(Services.ContextManager);
  const connectionStatus = registry.get(Services.ConnectionStatus);

  // Register chat view provider
  const chatViewProvider = new ChatViewProvider(
    context.extensionUri,
    llmProviderManager,
    sessionManager,
    contextManager,
    connectionStatus,
  );

  const chatView = vscode.window.registerWebviewViewProvider(
    ChatViewProvider.viewType,
    chatViewProvider,
  );

  context.subscriptions.push(chatView);
}
