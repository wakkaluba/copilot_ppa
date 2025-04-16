import { CommandHistoryEntry, TerminalShellType, CommandResult } from '../../../../src/terminal/types';

describe('CommandHistoryEntry Interface', () => {
  test('should create a command history entry with all properties', () => {
    const commandResult: CommandResult = {
      stdout: 'Command output',
      stderr: '',
      exitCode: 0,
      success: true
    };

    const entry: CommandHistoryEntry = {
      command: 'ls -la',
      timestamp: new Date('2025-04-16T10:30:00'),
      shellType: TerminalShellType.VSCodeDefault,
      result: commandResult
    };

    expect(entry).toBeDefined();
    expect(entry.command).toBe('ls -la');
    expect(entry.timestamp).toEqual(new Date('2025-04-16T10:30:00'));
    expect(entry.shellType).toBe(TerminalShellType.VSCodeDefault);
    expect(entry.result).toEqual(commandResult);
  });

  test('should create a command history entry without result', () => {
    const entry: CommandHistoryEntry = {
      command: 'git status',
      timestamp: new Date('2025-04-16T10:35:00'),
      shellType: TerminalShellType.GitBash
    };

    expect(entry).toBeDefined();
    expect(entry.command).toBe('git status');
    expect(entry.timestamp).toEqual(new Date('2025-04-16T10:35:00'));
    expect(entry.shellType).toBe(TerminalShellType.GitBash);
    expect(entry.result).toBeUndefined();
  });

  test('should work with different shell types', () => {
    const entry1: CommandHistoryEntry = {
      command: 'dir',
      timestamp: new Date(),
      shellType: TerminalShellType.PowerShell
    };

    const entry2: CommandHistoryEntry = {
      command: 'ls',
      timestamp: new Date(),
      shellType: TerminalShellType.WSLBash
    };

    expect(entry1.shellType).toBe(TerminalShellType.PowerShell);
    expect(entry2.shellType).toBe(TerminalShellType.WSLBash);
  });

  test('should ensure properties have the correct types', () => {
    const entry: CommandHistoryEntry = {
      command: 'npm install',
      timestamp: new Date(),
      shellType: TerminalShellType.VSCodeDefault
    };

    expect(typeof entry.command).toBe('string');
    expect(entry.timestamp instanceof Date).toBe(true);
    expect(typeof entry.shellType).toBe('string');
  });
});