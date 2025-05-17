export interface CommandHandler {
  execute(...args: any[]): Promise<void>;
}

export interface CommandRegistry {
  registerCommand(command: string, handler: CommandHandler): void;
  registerCommands(): Promise<void>;
}

export interface AgentCommands {
  startAgent(): Promise<void>;
  stopAgent(): Promise<void>;
  restartAgent(): Promise<void>;
}

export interface ConfigurationCommands {
  configureModel(): Promise<void>;
  clearConversation(): Promise<void>;
}

export interface VisualizationCommands {
  showMemoryVisualization(): Promise<void>;
  showPerformanceMetrics(): Promise<void>;
  exportMetrics(): Promise<void>;
}

export interface MenuCommands {
  openMenu(): Promise<void>;
  showMetrics(): Promise<void>;
}
