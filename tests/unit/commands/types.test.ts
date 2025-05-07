// filepath: d:\___coding\tools\copilot_ppa\tests\unit\commands\types.test.ts
import { beforeEach, describe, expect, test } from '@jest/globals';
import {
    AgentCommands,
    CommandHandler,
    CommandRegistry,
    ConfigurationCommands,
    MenuCommands,
    VisualizationCommands
} from '../../../src/commands/types';

// Test implementations of interfaces
class TestCommandHandler implements CommandHandler {
  public executeCalled = false;
  public executeArgs: any[] = [];

  async execute(...args: any[]): Promise<void> {
    this.executeCalled = true;
    this.executeArgs = args;
  }
}

class TestCommandRegistry implements CommandRegistry {
  public registeredCommands: Map<string, CommandHandler> = new Map();

  registerCommand(command: string, handler: CommandHandler): void {
    this.registeredCommands.set(command, handler);
  }

  async registerCommands(): Promise<void> {
    // Implementation not needed for test
  }
}

class TestAgentCommands implements AgentCommands {
  public startCalled = false;
  public stopCalled = false;
  public restartCalled = false;

  async startAgent(): Promise<void> {
    this.startCalled = true;
  }

  async stopAgent(): Promise<void> {
    this.stopCalled = true;
  }

  async restartAgent(): Promise<void> {
    this.restartCalled = true;
  }
}

class TestConfigurationCommands implements ConfigurationCommands {
  public configureCalled = false;
  public clearCalled = false;

  async configureModel(): Promise<void> {
    this.configureCalled = true;
  }

  async clearConversation(): Promise<void> {
    this.clearCalled = true;
  }
}

class TestVisualizationCommands implements VisualizationCommands {
  public showMemoryCalled = false;
  public showPerformanceCalled = false;
  public exportCalled = false;

  async showMemoryVisualization(): Promise<void> {
    this.showMemoryCalled = true;
  }

  async showPerformanceMetrics(): Promise<void> {
    this.showPerformanceCalled = true;
  }

  async exportMetrics(): Promise<void> {
    this.exportCalled = true;
  }
}

class TestMenuCommands implements MenuCommands {
  public openMenuCalled = false;
  public showMetricsCalled = false;

  async openMenu(): Promise<void> {
    this.openMenuCalled = true;
  }

  async showMetrics(): Promise<void> {
    this.showMetricsCalled = true;
  }
}

describe('CommandHandler interface', () => {
  let handler: TestCommandHandler;

  beforeEach(() => {
    handler = new TestCommandHandler();
  });

  test('should be able to implement execute method', async () => {
    await handler.execute('test', 123, { key: 'value' });

    expect(handler.executeCalled).toBe(true);
    expect(handler.executeArgs).toEqual(['test', 123, { key: 'value' }]);
  });
});

describe('CommandRegistry interface', () => {
  let registry: TestCommandRegistry;
  let handler: TestCommandHandler;

  beforeEach(() => {
    registry = new TestCommandRegistry();
    handler = new TestCommandHandler();
  });

  test('should be able to register commands', () => {
    registry.registerCommand('test.command', handler);

    expect(registry.registeredCommands.has('test.command')).toBe(true);
    expect(registry.registeredCommands.get('test.command')).toBe(handler);
  });

  test('should implement registerCommands method', async () => {
    await expect(registry.registerCommands()).resolves.not.toThrow();
  });
});

describe('AgentCommands interface', () => {
  let commands: TestAgentCommands;

  beforeEach(() => {
    commands = new TestAgentCommands();
  });

  test('should be able to implement startAgent method', async () => {
    await commands.startAgent();
    expect(commands.startCalled).toBe(true);
  });

  test('should be able to implement stopAgent method', async () => {
    await commands.stopAgent();
    expect(commands.stopCalled).toBe(true);
  });

  test('should be able to implement restartAgent method', async () => {
    await commands.restartAgent();
    expect(commands.restartCalled).toBe(true);
  });
});

describe('ConfigurationCommands interface', () => {
  let commands: TestConfigurationCommands;

  beforeEach(() => {
    commands = new TestConfigurationCommands();
  });

  test('should be able to implement configureModel method', async () => {
    await commands.configureModel();
    expect(commands.configureCalled).toBe(true);
  });

  test('should be able to implement clearConversation method', async () => {
    await commands.clearConversation();
    expect(commands.clearCalled).toBe(true);
  });
});

describe('VisualizationCommands interface', () => {
  let commands: TestVisualizationCommands;

  beforeEach(() => {
    commands = new TestVisualizationCommands();
  });

  test('should be able to implement showMemoryVisualization method', async () => {
    await commands.showMemoryVisualization();
    expect(commands.showMemoryCalled).toBe(true);
  });

  test('should be able to implement showPerformanceMetrics method', async () => {
    await commands.showPerformanceMetrics();
    expect(commands.showPerformanceCalled).toBe(true);
  });

  test('should be able to implement exportMetrics method', async () => {
    await commands.exportMetrics();
    expect(commands.exportCalled).toBe(true);
  });
});

describe('MenuCommands interface', () => {
  let commands: TestMenuCommands;

  beforeEach(() => {
    commands = new TestMenuCommands();
  });

  test('should be able to implement openMenu method', async () => {
    await commands.openMenu();
    expect(commands.openMenuCalled).toBe(true);
  });

  test('should be able to implement showMetrics method', async () => {
    await commands.showMetrics();
    expect(commands.showMetricsCalled).toBe(true);
  });
});
