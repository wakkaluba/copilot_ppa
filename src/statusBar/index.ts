import * as vscode from 'vscode';
import { ServiceRegistry, Services } from '../services/ServiceRegistry';
import { ConnectionStatusBar } from './connectionStatus';
import { ProviderStatusBar } from './providerStatus';

export function setupStatusBar(context: vscode.ExtensionContext, registry: ServiceRegistry): void {
  // Get required services
  const connectionStatus = registry.get(Services.ConnectionStatus);
  const providerManager = registry.get(Services.LLMProviderManager);
  const themeManager = registry.get(Services.ThemeManager);
  const displaySettings = registry.get(Services.DisplaySettings);

  // Create and register status bar items
  const connectionStatusBar = new ConnectionStatusBar(
    connectionStatus,
    themeManager,
    displaySettings,
  );

  const providerStatusBar = new ProviderStatusBar(providerManager, themeManager, displaySettings);

  context.subscriptions.push(connectionStatusBar, providerStatusBar);
}
