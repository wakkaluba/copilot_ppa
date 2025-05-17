import * as vscode from 'vscode';
import { Container, injectable } from 'inversify';
import { TerminalManager } from './terminalManager';
import { InteractiveShell } from './interactiveShell';
import { AITerminalHelper } from './aiTerminalHelper';
import { CommandGenerationWebview } from './commandGenerationWebview';
import { ILogger } from '../logging/ILogger';
import { TerminalConfigurationService } from './services/TerminalConfigurationService';
import { TerminalCommandRegistrar } from './commands/TerminalCommandRegistrar';

export * from './types';
export * from './terminalManager';
export * from './interactiveShell';
export * from './aiTerminalHelper';

@injectable()
export class TerminalModule implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private container: Container;

  constructor(
    @inject(ILogger) private readonly logger: ILogger,
    private readonly context: vscode.ExtensionContext,
  ) {
    this.container = new Container();
    this.configureContainer();
    this.registerDisposables();
  }

  private configureContainer(): void {
    this.container.bind<ILogger>(ILogger).toConstantValue(this.logger);
    this.container.bind<TerminalManager>(TerminalManager).toSelf().inSingletonScope();
    this.container.bind<InteractiveShell>(InteractiveShell).toSelf().inSingletonScope();
    this.container
      .bind<TerminalConfigurationService>(TerminalConfigurationService)
      .toSelf()
      .inSingletonScope();
    this.container
      .bind<TerminalCommandRegistrar>(TerminalCommandRegistrar)
      .toSelf()
      .inSingletonScope();
  }

  private registerDisposables(): void {
    this.disposables.push(
      this.container.get(TerminalManager),
      this.container.get(InteractiveShell),
      this.container.get(TerminalCommandRegistrar),
    );
  }

  public setLLMManager(llmManager: any): void {
    try {
      const aiHelper = new AITerminalHelper(
        llmManager,
        this.container.get(InteractiveShell),
        this.context,
      );

      this.container.bind<AITerminalHelper>('AITerminalHelper').toConstantValue(aiHelper);
      this.container
        .bind<CommandGenerationWebview>('CommandGenerationWebview')
        .toDynamicValue(() => {
          return new CommandGenerationWebview(
            this.context,
            aiHelper,
            this.container.get(InteractiveShell),
          );
        });

      this.logger.info('LLM manager configured successfully');
    } catch (error) {
      this.logger.error('Failed to configure LLM manager:', error);
      throw error;
    }
  }

  public initialize(): void {
    try {
      this.container.get(TerminalCommandRegistrar).register(this.context);
      this.logger.info('Terminal module initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize terminal module:', error);
      throw error;
    }
  }

  public getTerminalManager(): TerminalManager {
    return this.container.get(TerminalManager);
  }

  public getInteractiveShell(): InteractiveShell {
    return this.container.get(InteractiveShell);
  }

  public getAIHelper(): AITerminalHelper | null {
    return this.container.isBound('AITerminalHelper')
      ? this.container.get('AITerminalHelper')
      : null;
  }

  public dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }
}
