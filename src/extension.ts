import * as vscode from 'vscode';
import { SidebarPanel } from './webviews/sidebarPanel';
import { ChatViewProvider } from './webview/chatView';
import { AgentSidebarProvider } from './sidebar/agentSidebarProvider';
import { ConnectionStatusService } from './status/connectionStatusService';
import { LLMStatusBar } from './statusBar';
import { AgentCodeActionProvider } from './providers/AgentCodeActionProvider';
import { LLMHostManager } from './services/LLMHostManager';
import { LLMAutoConnector } from './services/LLMAutoConnector';
import { RepositoryManager } from './services/repositoryManager';
import { repositoryManager } from './services/repositoryManagement';
import { RepositoryPanel } from './ui/repositoryPanel';
import { initializePromptTemplateManager, getPromptTemplateManager } from './services/promptTemplates/manager';
import { PromptTemplatePanel } from './ui/promptTemplatePanel';
import { initializeVectorDatabaseManager, getVectorDatabaseManager } from './services/vectordb/manager';
import { initializeCodeSearchService, getCodeSearchService } from './services/vectordb/codeSearch';
import { VectorDatabasePanel } from './ui/vectorDatabasePanel';
import { initializeKeybindingManager, getKeybindingManager } from './services/ui/keybindingManager';
import { initializeCommandRegistrationService, getCommandRegistrationService } from './services/ui/commandRegistration';
import { KeyboardShortcutsViewProvider } from './ui/keyboardShortcutsView';
import { DisplaySettingsCommand } from './commands/displaySettingsCommand';
import { ConversationExportCommand } from './commands/conversationExportCommand';
import { ConversationImportCommand } from './commands/conversationImportCommand';
import { ConversationSearchCommand } from './commands/conversationSearchCommand';
import { ConversationSearchViewModel } from './viewModels/conversationSearchViewModel';
import { SnippetCommands } from './commands/snippetCommands';
import { SnippetsPanelProvider } from './webview/snippetsPanelProvider';
import { ThemeSettingsCommand } from './commands/themeSettingsCommand';
import { ThemeManager } from './services/themeManager';

// Import the test explorer view
import { registerTestExplorerView, TestExplorerProvider } from './views/testExplorerView';
// Import the test runner commands
import { registerTestRunnerCommands } from './commands/testRunnerCommands';

// Import the coverage decoration provider
import { CoverageDecorationProvider } from './services/testRunner/coverageDecorationProvider';

import { registerTestReportingCommands } from './testRunner';

import { TerminalModule } from './terminal';

import { ComplexityAnalysisCommand } from './tools/complexityAnalysisCommand';
// Import dependency analyzer
import { DependencyAnalysisCommand } from './tools/dependencyAnalysisCommand';
import { DependencyGraphViewProvider } from './webview/dependencyGraphView';

// Import structure reorganization command
import { StructureReorganizationCommand } from './commands/structureReorganizationCommand';

// Import the JSDoc/TSDoc integration
import { JSDocTSDocIntegration } from './documentationGenerators/jsdocTsDocIntegration';

// Import code simplifier
import { CodeSimplifier } from './refactoring';

// Import refactoring commands
import { registerRefactoringCommands } from './refactoring';

// Import BuildToolsManager
import { BuildToolsManager } from './buildTools/buildToolsManager';

// Import code formatting manager
import { CodeFormattingManager } from './features/codeFormatting';

// Import the new command registration function
import { registerCodeFormatCommands } from './commands/codeFormatCommands';

import { CodeEditorManager } from './codeEditor/codeEditorManager';

// Add the import at the top
import { SecurityManager } from './security/securityManager';

// Add the import at the top
import { PerformanceManager } from './performance/performanceManager';

// Import the new code optimization modules
import { PerformanceAnalyzer } from './features/codeOptimization/performanceAnalyzer';
import { BottleneckDetector } from './features/codeOptimization/bottleneckDetector';

// Import the new memory optimization module
import { MemoryOptimizer } from './features/codeOptimization/memoryOptimizer';

// Import the runtime analyzer commands
import { registerRuntimeAnalyzerCommands } from './commands/runtime-analyzer-commands';

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
import { initializeLocalization, localize, SupportedLanguage } from './i18n';
import { LanguageSwitcher } from './ui/languageSwitcher';

export async function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "Local LLM Agent" is now active!');

  // Initialize localization
  const localizationService = initializeLocalization(context);
  
  // Create language switcher in the status bar
  const languageSwitcher = new LanguageSwitcher(context);
  
  // Register language commands
  context.subscriptions.push(
      vscode.commands.registerCommand('localLlmAgent.setLanguage', (language: SupportedLanguage) => {
          localizationService.setLanguage(language);
      })
  );

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

  context.subscriptions.push(
    vscode.commands.registerCommand('copilot-ppa.toggleWorkspaceAccess', () => {
        WorkspaceAccessManager.getInstance().toggleAccess();
    })
  );

  // Register repository manager commands
  context.subscriptions.push(
    vscode.commands.registerCommand('copilot-ppa.toggleRepositoryAccess', () => {
        RepositoryManager.getInstance().toggleAccess();
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('copilot-ppa.createNewRepository', () => {
        RepositoryManager.getInstance().createNewRepository();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('copilotPPA.toggleRepositoryAccess', () => {
        repositoryManager.setEnabled(!repositoryManager.isEnabled);
        vscode.window.showInformationMessage(
            `Repository access ${repositoryManager.isEnabled ? 'enabled' : 'disabled'}`
        );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('copilotPPA.openRepositoryPanel', () => {
        RepositoryPanel.createOrShow(context.extensionUri);
    })
  );

  // Initialize repository manager
  context.subscriptions.push(RepositoryManager.getInstance());

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

  // Initialize the prompt template manager
  initializePromptTemplateManager(context);
  
  // Register commands
  context.subscriptions.push(
      vscode.commands.registerCommand('copilotPPA.openPromptTemplatePanel', () => {
          PromptTemplatePanel.createOrShow(context.extensionUri);
      })
  );
  
  context.subscriptions.push(
      vscode.commands.registerCommand('copilotPPA.applyPromptTemplate', async () => {
          const manager = getPromptTemplateManager();
          const templates = manager.getAllTemplates();
          
          if (templates.length === 0) {
              vscode.window.showInformationMessage('No prompt templates available. Create some first.');
              PromptTemplatePanel.createOrShow(context.extensionUri);
              return;
          }
          
          const items = templates.map(t => ({
              label: t.name,
              description: t.category,
              detail: t.description,
              template: t
          }));
          
          const selected = await vscode.window.showQuickPick(items, {
              placeHolder: 'Select a template to apply'
          });
          
          if (selected) {
              await manager.applyTemplate(selected.template.id);
          }
      })
  );

  // Initialize vector database services
  initializeVectorDatabaseManager(context);
  initializeCodeSearchService(context);
  
  // Register commands
  context.subscriptions.push(
      vscode.commands.registerCommand('copilotPPA.openVectorDatabasePanel', () => {
          VectorDatabasePanel.createOrShow(context.extensionUri);
      })
  );
  
  context.subscriptions.push(
      vscode.commands.registerCommand('copilotPPA.searchCode', async () => {
          const manager = getVectorDatabaseManager();
          if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
              const result = await vscode.window.showInformationMessage(
                  'Vector database is not enabled or initialized. Would you like to set it up now?',
                  'Yes', 'No'
              );
              
              if (result === 'Yes') {
                  vscode.commands.executeCommand('copilotPPA.openVectorDatabasePanel');
              }
              return;
          }
          
          const searchService = getCodeSearchService();
          
          // Get search query from user
          const query = await vscode.window.showInputBox({
              prompt: 'Enter search query',
              placeHolder: 'Describe what you are looking for in the codebase'
          });
          
          if (!query) {
              return;
          }
          
          // Show progress while searching
          const results = await vscode.window.withProgress(
              {
                  location: vscode.ProgressLocation.Notification,
                  title: 'Searching code semantically',
                  cancellable: false
              },
              async () => {
                  return await searchService.semanticSearch(query);
              }
          );
          
          // Display results
          if (results.length === 0) {
              vscode.window.showInformationMessage('No results found for your query.');
              return;
          }
          
          // Show results in quick pick
          const items = results.map(result => ({
              label: path.basename(result.document.metadata.path || 'Unknown'),
              description: `Score: ${result.score.toFixed(2)}`,
              detail: result.document.metadata.path,
              result
          }));
          
          const selected = await vscode.window.showQuickPick(items, {
              placeHolder: 'Search results'
          });
          
          if (selected) {
              // Open the selected file
              const uri = vscode.Uri.parse(selected.result.document.id);
              const document = await vscode.workspace.openTextDocument(uri);
              await vscode.window.showTextDocument(document);
          }
      })
  );
  
  context.subscriptions.push(
      vscode.commands.registerCommand('copilotPPA.indexWorkspace', async () => {
          const manager = getVectorDatabaseManager();
          if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
              const result = await vscode.window.showInformationMessage(
                  'Vector database is not enabled or initialized. Would you like to set it up now?',
                  'Yes', 'No'
              );
              
              if (result === 'Yes') {
                  vscode.commands.executeCommand('copilotPPA.openVectorDatabasePanel');
              }
              return;
          }
          
          const searchService = getCodeSearchService();
          
          // Confirm with user
          const result = await vscode.window.showInformationMessage(
              'Index the current workspace for semantic code search? This may take a while for large workspaces.',
              'Yes', 'No'
          );
          
          if (result !== 'Yes') {
              return;
          }
          
          // Index workspace with progress indicator
          const count = await vscode.window.withProgress(
              {
                  location: vscode.ProgressLocation.Notification,
                  title: 'Indexing workspace for semantic search',
                  cancellable: true
              },
              async (progress, token) => {
                  return await searchService.indexWorkspace();
              }
          );
          
          vscode.window.showInformationMessage(`Successfully indexed ${count} files in the workspace.`);
      })
  );

  // Initialize the keybinding manager
  initializeKeybindingManager(context);
  
  // Initialize command registration service
  const commandService = initializeCommandRegistrationService(context);
  commandService.registerAllKeybindings();
  commandService.registerShortcutCommands();
  
  // Register the keyboard shortcuts view provider
  const keyboardShortcutsViewProvider = new KeyboardShortcutsViewProvider(context.extensionUri);
  context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
          KeyboardShortcutsViewProvider.viewType,
          keyboardShortcutsViewProvider
      )
  );
  
  // Register command to open UI settings panel with specific tab
  context.subscriptions.push(
      vscode.commands.registerCommand('copilotPPA.openUISettingsPanel', (tab?: string) => {
          const panel = UISettingsPanel.createOrShow(context.extensionUri);
          if (tab) {
              panel.selectTab(tab);
          }
      })
  );

  // Register display settings command
  const displaySettingsCommand = new DisplaySettingsCommand();
  context.subscriptions.push(displaySettingsCommand.register());
  
  // Add display settings command to context menu
  context.subscriptions.push(
      vscode.commands.registerCommand('copilotPPA.openDisplaySettings', () => {
          vscode.commands.executeCommand(DisplaySettingsCommand.commandId);
      })
  );

  // Register conversation export/import commands
  const conversationExportCommand = new ConversationExportCommand(context);
  context.subscriptions.push(...conversationExportCommand.register());
  
  const conversationImportCommand = new ConversationImportCommand(context);
  context.subscriptions.push(conversationImportCommand.register());
  
  // Register conversation search command
  const conversationSearchCommand = new ConversationSearchCommand(context);
  context.subscriptions.push(conversationSearchCommand.register());
  
  // Create search view model
  const conversationSearchViewModel = new ConversationSearchViewModel(context);
  
  // Handle webview messages for search and filter
  webviewPanelManager.registerMessageHandler('searchConversations', async (message) => {
      if (message.query) {
          await conversationSearchViewModel.quickSearch(message.query);
      }
  });
  
  webviewPanelManager.registerMessageHandler('filterConversations', async (message) => {
      if (message.filters) {
          await conversationSearchViewModel.filterConversations(message.filters);
      }
  });
  
  webviewPanelManager.registerMessageHandler('resetConversationFilters', async () => {
      conversationSearchViewModel.resetFilters();
  });
  
  webviewPanelManager.registerMessageHandler('openConversation', async (message) => {
      if (message.conversationId) {
          await conversationSearchViewModel.openConversationWithHighlights(message.conversationId);
      }
  });
  
  // Handle webview messages for export
  // Assuming you have a webviewPanelManager or similar
  webviewPanelManager.registerMessageHandler('exportConversation', async (message) => {
      if (message.conversationId) {
          await vscode.commands.executeCommand(
              ConversationExportCommand.commandId, 
              message.conversationId
          );
      }
  });

  // Register snippet commands
  const snippetCommands = new SnippetCommands(context);
  context.subscriptions.push(...snippetCommands.register());
  
  // Create snippets panel provider
  const snippetsPanelProvider = new SnippetsPanelProvider(context);
  
  // Register open snippets panel command
  context.subscriptions.push(
      vscode.commands.registerCommand('copilotPPA.openSnippetsPanel', () => {
          snippetsPanelProvider.open();
      })
  );
  
  // Handle webview messages for snippet creation
  webviewPanelManager.registerMessageHandler('createSnippet', async (message) => {
      if (message.conversationId) {
          await vscode.commands.executeCommand(
              'copilotPPA.createSnippet', 
              message.conversationId,
              message.messageIndices
          );
      }
  });

  // Initialize the theme manager
  const themeManager = ThemeManager.getInstance(context);
  
  // Register theme settings command
  const themeSettingsCommand = new ThemeSettingsCommand(context);
  context.subscriptions.push(...themeSettingsCommand.register());

  // Register test explorer view
  const testExplorerProvider = registerTestExplorerView(context);
  
  // Register test runner commands
  registerTestRunnerCommands(context);
  
  // Register event listeners for test results
  context.subscriptions.push(
      vscode.commands.registerCommand('localLLMAgent.updateTestResults', 
          (testType: string, result: any) => {
              testExplorerProvider.updateResults(testType, result);
          }
      )
  );

  // Create and register the coverage decoration provider
  const coverageDecorationProvider = new CoverageDecorationProvider();
  context.subscriptions.push(coverageDecorationProvider);
  
  // Register event listener for code coverage results
  context.subscriptions.push(
      vscode.commands.registerCommand('localLLMAgent.updateCoverageDecorations', 
          (coverage: any) => {
              coverageDecorationProvider.setCoverage(coverage);
          }
      )
  );

  // Register test reporting commands
  const testReporter = registerTestReportingCommands(context);
  
  // Make testReporter available to other parts of the extension
  context.subscriptions.push(
      vscode.commands.registerCommand('localLlmAgent.formatAndDisplayTestResults', (testResults) => {
          testReporter.formatAndDisplayResults(testResults);
      })
  );

  // Initialize terminal module
  const terminalModule = new TerminalModule(context);
  terminalModule.initialize();
  
  // Set LLM manager if available
  if (llmManager) {
      terminalModule.setLLMManager(llmManager);
  }
  
  // Make terminal module available to other parts of the extension
  context.subscriptions.push(
      vscode.commands.registerCommand('localLlmAgent.getTerminalModule', () => terminalModule)
  );

  // Register complexity analysis commands
  const complexityAnalysisCommand = new ComplexityAnalysisCommand();
  context.subscriptions.push(complexityAnalysisCommand.register());

  // Register dependency analysis command
  const dependencyAnalysisCommand = new DependencyAnalysisCommand();
  context.subscriptions.push(dependencyAnalysisCommand.register());
  
  // Register dependency graph view
  const dependencyGraphViewProvider = new DependencyGraphViewProvider(context.extensionUri);
  context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
          DependencyGraphViewProvider.viewType,
          dependencyGraphViewProvider
      )
  );

  // Register dependency analysis command
  context.subscriptions.push(
    vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeFileDependencies', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        
        const filePath = editor.document.uri.fsPath;
        
        // Check if file is JavaScript or TypeScript
        const fileExtension = path.extname(filePath).toLowerCase();
        if (!['.js', '.jsx', '.ts', '.tsx'].includes(fileExtension)) {
            vscode.window.showErrorMessage('Dependency analysis is only supported for JavaScript and TypeScript files');
            return;
        }
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing dependencies...',
            cancellable: false
        }, async (progress) => {
            try {
                const dependencyAnalyzer = new DependencyAnalyzer();
                const result = await dependencyAnalyzer.analyzeFileImports(filePath);
                
                // Show dependency graph view
                const panel = vscode.window.createWebviewPanel(
                    'dependencyGraph',
                    'Dependency Graph: ' + path.basename(filePath),
                    vscode.ViewColumn.Beside,
                    {
                        enableScripts: true,
                        localResourceRoots: [
                            vscode.Uri.file(path.join(context.extensionPath, 'media'))
                        ]
                    }
                );
                
                // Get path to the D3.js script
                const d3ScriptPath = vscode.Uri.file(
                    path.join(context.extensionPath, 'media', 'd3.min.js')
                );
                const d3ScriptUri = panel.webview.asWebviewUri(d3ScriptPath);
                
                // Get path to dependency graph script
                const depGraphScriptPath = vscode.Uri.file(
                    path.join(context.extensionPath, 'media', 'dependencyGraph.js')
                );
                const depGraphScriptUri = panel.webview.asWebviewUri(depGraphScriptPath);
                
                // Get path to CSS
                const cssPath = vscode.Uri.file(
                    path.join(context.extensionPath, 'media', 'styles.css')
                );
                const cssUri = panel.webview.asWebviewUri(cssPath);
                
                // Set webview HTML
                panel.webview.html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Dependency Graph</title>
                    <link rel="stylesheet" href="${cssUri}">
                    <script src="${d3ScriptUri}"></script>
                    <script src="${depGraphScriptUri}"></script>
                    <style>
                        body {
                            padding: 0;
                            margin: 0;
                            height: 100vh;
                            width: 100%;
                            overflow: hidden;
                            background-color: var(--vscode-editor-background);
                            color: var(--vscode-editor-foreground);
                        }
                        #graph-container {
                            width: 100%;
                            height: 100vh;
                            display: flex;
                            flex-direction: column;
                        }
                        #graph-header {
                            padding: 10px;
                            border-bottom: 1px solid var(--vscode-panel-border);
                        }
                        #graph-visualization {
                            flex-grow: 1;
                            overflow: auto;
                        }
                        .legend {
                            position: absolute;
                            bottom: 20px;
                            right: 20px;
                            background: rgba(30, 30, 30, 0.8);
                            padding: 10px;
                            border-radius: 5px;
                            border: 1px solid var(--vscode-panel-border);
                        }
                        .legend-item {
                            display: flex;
                            align-items: center;
                            margin: 5px 0;
                        }
                        .legend-dot {
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            margin-right: 8px;
                        }
                        .legend-dot.file { background-color: #c586c0; }
                        .legend-dot.package { background-color: #ce9178; }
                        .legend-dot.external { background-color: #dcdcaa; }
                        .legend-line {
                            width: 20px;
                            height: 2px;
                            margin-right: 8px;
                        }
                        .legend-line.dependency { background-color: #999; }
                        .legend-line.import { background-color: #569cd6; }
                        .legend-line.require { background-color: #4ec9b0; }
                        .empty-state {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100%;
                            color: var(--vscode-disabledForeground);
                        }
                    </style>
                </head>
                <body>
                    <div id="graph-container">
                        <div id="graph-header">
                            <h2>Dependency Graph: ${path.basename(filePath)}</h2>
                        </div>
                        <div id="graph-visualization"></div>
                    </div>
                    <script>
                        const vscode = acquireVsCodeApi();
                        let dependencyGraph;
                        
                        // Handle messages from the extension
                        window.addEventListener('message', event => {
                            const message = event.data;
                            
                            if (message.command === 'updateGraph') {
                                if (dependencyGraph) {
                                    dependencyGraph.destroy();
                                }
                                dependencyGraph = createDependencyGraph('graph-visualization', message.graph);
                            }
                        });
                        
                        // Request initial data
                        vscode.postMessage({ command: 'requestData' });
                    </script>
                </body>
                </html>
                `;
                
                // Handle messages from the webview
                panel.webview.onDidReceiveMessage(
                    message => {
                        switch (message.command) {
                            case 'requestData':
                                panel.webview.postMessage({
                                    command: 'updateGraph',
                                    graph: result.graph
                                });
                                break;
                        }
                    },
                    undefined,
                    context.subscriptions
                );
                
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to analyze dependencies: ${error.message}`);
            }
        });
    })
  );

  // Register structure reorganization command
  const structureReorganizationCommand = new StructureReorganizationCommand();
  context.subscriptions.push(structureReorganizationCommand.register());

  // Initialize the JSDoc/TSDoc integration
  const jsdocTsdocIntegration = new JSDocTSDocIntegration(context, llmProvider);
  
  // Register commands for JSDoc/TSDoc integration
  context.subscriptions.push(
      vscode.commands.registerCommand('localLLMAgent.generateAllDocumentation', () => {
          jsdocTsdocIntegration.generateDocForCurrentFile();
      })
  );

  // Register code simplification command
  const codeSimplifier = new CodeSimplifier();
  context.subscriptions.push(
      vscode.commands.registerCommand('localLLMAgent.refactoring.simplifyCode', () => {
          codeSimplifier.simplifyActiveEditorCode();
      })
  );

  // Register refactoring commands
  registerRefactoringCommands(context);

  // Initialize the BuildToolsManager
  const buildToolsManager = new BuildToolsManager(context);

  // Initialize the code formatting manager
  const codeFormattingManager = new CodeFormattingManager(context);

  // Register code formatting commands
  registerCodeFormatCommands(context);

  // Initialize the CodeEditorManager
  const codeEditorManager = new CodeEditorManager();
  
  // Register code editor commands
  context.subscriptions.push(
      vscode.commands.registerCommand('localLLMAgent.codeEditor.executeSelection', 
          () => codeEditorManager.executeSelectedCode()
      ),
      vscode.commands.registerCommand('localLLMAgent.codeEditor.showOverview', 
          () => codeEditorManager.showCodeOverview()
      ),
      vscode.commands.registerCommand('localLLMAgent.codeEditor.findReferences', 
          () => codeEditorManager.findReferences()
      ),
      vscode.commands.registerCommand('localLLMAgent.codeEditor.createLink', 
          () => codeEditorManager.createCodeLink()
      ),
      vscode.commands.registerCommand('localLLMAgent.codeEditor.navigateLink', 
          () => codeEditorManager.navigateCodeLink()
      )
  );

  // Initialize the security manager
  const securityManager = new SecurityManager(context);

  // Initialize the performance manager
  const performanceManager = new PerformanceManager(context);

  // Initialize the performance analyzer and bottleneck detector
  const performanceAnalyzer = new PerformanceAnalyzer(context, llmService);
  const bottleneckDetector = new BottleneckDetector(context);
  
  // Register commands for code optimization tools
  context.subscriptions.push(
      vscode.commands.registerCommand('vscode-local-llm-agent.analyzePerformance', () => {
          performanceAnalyzer.analyzeCurrentFile();
      }),
      vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspacePerformance', () => {
          performanceAnalyzer.analyzeWorkspace();
      }),
      vscode.commands.registerCommand('vscode-local-llm-agent.detectBottlenecks', () => {
          bottleneckDetector.detectBottlenecksInCurrentFile();
      }),
      vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspaceBottlenecks', () => {
          bottleneckDetector.analyzeWorkspaceBottlenecks();
      })
  );

  // Initialize the memory optimizer
  const memoryOptimizer = new MemoryOptimizer(context, llmService);
  
  // Register commands for memory optimization
  context.subscriptions.push(
      vscode.commands.registerCommand('vscode-local-llm-agent.analyzeMemoryUsage', () => {
          memoryOptimizer.analyzeCurrentFile();
      }),
      vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspaceMemory', () => {
          memoryOptimizer.analyzeWorkspace();
      }),
      vscode.commands.registerCommand('vscode-local-llm-agent.findMemoryLeaks', () => {
          memoryOptimizer.findMemoryLeaks();
      })
  );

  // Register runtime analyzer commands
  registerRuntimeAnalyzerCommands(context);
}

// Extension deactivation
export function deactivate() {
  // Close vector database connections
  const manager = getVectorDatabaseManager();
  if (manager) {
      manager.close().catch(err => {
          console.error('Error closing vector database connections:', err);
      });
  }
}
