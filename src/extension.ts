import * as vscode from 'vscode';
import { SidebarPanel } from './webviews/sidebarPanel';
import { ChatViewProvider } from './webview/chatView';
import { AgentSidebarProvider } from './sidebar/agentSidebarProvider';
import { ConnectionStatusService } from './status/connectionStatusService';
import { LLMStatusBar } from './statusBar';
import { AgentCodeActionProvider } from './providers/AgentCodeActionProvider';
import { LLMHostManager } from './services/LLMHostManager';
import { LLMAutoConnector } from './services/LLMAutoConnector';

// Interface for LLM providers
interface LLMProvider {
  name: string;
  sendPrompt(prompt: string): Promise<string>;
  isConnected(): Promise<boolean>;
}

// Ollama LLM Provider implementation
class OllamaProvider implements LLMProvider {
  private apiEndpoint: string;
  private model: string;

  constructor(apiEndpoint: string, model: string) {
    this.apiEndpoint = apiEndpoint;
    this.model = model;
  }

  get name(): string {
    return `Ollama (${this.model})`;
  }

  async sendPrompt(prompt: string): Promise<string> {
    // Implement Ollama API call here
    try {
      // Placeholder implementation
      return `Response from Ollama (${this.model}) to: ${prompt}`;
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      throw new Error('Failed to communicate with Ollama API');
    }
  }

  async isConnected(): Promise<boolean> {
    // Implement connection check
    try {
      // Placeholder implementation
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Extension activation
export async function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "Local LLM Agent" is now active!');

  const statusBar = new LLMStatusBar();
  context.subscriptions.push(statusBar);
  
  // Update status when LLM connection changes
  statusBar.show();
  statusBar.updateStatus(false);
  
  // Add to your existing LLM connection logic:
  // statusBar.updateStatus(true, "ModelName"); // When connected
  // statusBar.updateStatus(false); // When disconnected

  // Register the command to open the sidebar panel
  let disposable = vscode.commands.registerCommand('localLLMAgent.openSidebar', () => {
    SidebarPanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(disposable);

  // Register a command to show a message box
  context.subscriptions.push(
    vscode.commands.registerCommand('localLLMAgent.showWelcomeMessage', () => {
      vscode.window.showInformationMessage('Welcome to the Local LLM Agent!');
    })
  );

  // Create and register the connection status service
  const connectionStatusService = new ConnectionStatusService();
  context.subscriptions.push(connectionStatusService);

  // Create and register the LLM provider manager with connection status service
  const llmProviderManager = new LLMProviderManager(connectionStatusService);
  context.subscriptions.push(llmProviderManager);
  
  // Create and register the sidebar provider
  const sidebarProvider = new AgentSidebarProvider(
      context.extensionUri,
      llmProviderManager,
      connectionStatusService
  );
  context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
          AgentSidebarProvider.viewType,
          sidebarProvider
      )
  );
  
  // Register commands
  context.subscriptions.push(
      vscode.commands.registerCommand('localLlmAgent.openSidebar', () => {
          vscode.commands.executeCommand('workbench.view.extension.localLlmAgentSidebar');
      }),
      vscode.commands.registerCommand('localLlmAgent.connect', async () => {
          try {
              await llmProviderManager.connect();
              statusBar.updateStatus(true, "ModelName"); // When connected
          } catch (error) {
              // Error already handled in manager
          }
      }),
      vscode.commands.registerCommand('localLlmAgent.disconnect', async () => {
          try {
              await llmProviderManager.disconnect();
              statusBar.updateStatus(false); // When disconnected
          } catch (error) {
              // Error already handled in manager
          }
      })
  );
  
  // Create and register the chat view provider
  const chatViewProvider = new ChatViewProvider(
      context.extensionUri,
      llmProviderManager,
      connectionStatusService
  );
  context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
          ChatViewProvider.viewType,
          chatViewProvider
      )
  );

  // Register code action provider
  context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
          { scheme: 'file' },
          new AgentCodeActionProvider(),
          {
              providedCodeActionKinds: AgentCodeActionProvider.providedCodeActionKinds
          }
      )
  );
  
  // Register commands
  context.subscriptions.push(
      vscode.commands.registerCommand('vscode-llm-agent.askAboutCode', (document: vscode.TextDocument, range: vscode.Range) => {
          // Implementation will be added in the agent functionality phase
      }),
      vscode.commands.registerCommand('vscode-llm-agent.explainCode', (document: vscode.TextDocument, range: vscode.Range) => {
          // Implementation will be added in the agent functionality phase
      }),
      vscode.commands.registerCommand('vscode-llm-agent.suggestRefactoring', (document: vscode.TextDocument, range: vscode.Range) => {
          // Implementation will be added in the agent functionality phase
      })
  );

  const hostManager = LLMHostManager.getInstance();
  await hostManager.startHost();
  
  const autoConnector = LLMAutoConnector.getInstance();
    
  // Try to connect and handle the result
  const connected = await autoConnector.tryConnect();
  if (!connected) {
      vscode.window.showWarningMessage('Failed to establish LLM connection. Some features may be unavailable.');
  }
  
  context.subscriptions.push({
      dispose: async () => {
          await autoConnector.disconnect();
          hostManager.stopHost();
      }
  });
}

// Extension deactivation
export function deactivate() {}
