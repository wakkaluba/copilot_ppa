import { TerminalSession, TerminalShellType, CommandHistoryEntry } from '../../../../src/terminal/types';

describe('TerminalSession Interface', () => {
  test('should create a terminal session with all properties', () => {
    const commandHistory: CommandHistoryEntry[] = [
      {
        command: 'cd projects',
        timestamp: new Date('2025-04-16T10:25:00'),
        shellType: TerminalShellType.VSCodeDefault
      },
      {
        command: 'git status',
        timestamp: new Date('2025-04-16T10:26:00'),
        shellType: TerminalShellType.VSCodeDefault
      }
    ];

    const session: TerminalSession = {
      id: 'terminal-1',
      name: 'Development Terminal',
      shellType: TerminalShellType.VSCodeDefault,
      createdAt: new Date('2025-04-16T10:20:00'),
      commandHistory
    };

    expect(session).toBeDefined();
    expect(session.id).toBe('terminal-1');
    expect(session.name).toBe('Development Terminal');
    expect(session.shellType).toBe(TerminalShellType.VSCodeDefault);
    expect(session.createdAt).toEqual(new Date('2025-04-16T10:20:00'));
    expect(session.commandHistory).toEqual(commandHistory);
    expect(session.commandHistory.length).toBe(2);
  });

  test('should create a terminal session with empty command history', () => {
    const session: TerminalSession = {
      id: 'terminal-2',
      name: 'Empty Terminal',
      shellType: TerminalShellType.PowerShell,
      createdAt: new Date('2025-04-16T10:30:00'),
      commandHistory: []
    };

    expect(session).toBeDefined();
    expect(session.id).toBe('terminal-2');
    expect(session.name).toBe('Empty Terminal');
    expect(session.shellType).toBe(TerminalShellType.PowerShell);
    expect(session.createdAt).toEqual(new Date('2025-04-16T10:30:00'));
    expect(session.commandHistory).toEqual([]);
    expect(session.commandHistory.length).toBe(0);
  });

  test('should create terminal sessions with different shell types', () => {
    const gitBashSession: TerminalSession = {
      id: 'git-bash',
      name: 'Git Bash',
      shellType: TerminalShellType.GitBash,
      createdAt: new Date(),
      commandHistory: []
    };

    const wslSession: TerminalSession = {
      id: 'wsl',
      name: 'WSL Terminal',
      shellType: TerminalShellType.WSLBash,
      createdAt: new Date(),
      commandHistory: []
    };

    expect(gitBashSession.shellType).toBe(TerminalShellType.GitBash);
    expect(wslSession.shellType).toBe(TerminalShellType.WSLBash);
  });

  test('should ensure properties have the correct types', () => {
    const session: TerminalSession = {
      id: 'terminal-3',
      name: 'Test Terminal',
      shellType: TerminalShellType.VSCodeDefault,
      createdAt: new Date(),
      commandHistory: []
    };

    expect(typeof session.id).toBe('string');
    expect(typeof session.name).toBe('string');
    expect(typeof session.shellType).toBe('string');
    expect(session.createdAt instanceof Date).toBe(true);
    expect(Array.isArray(session.commandHistory)).toBe(true);
  });
});