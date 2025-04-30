import {
    CommandAnalysis,
    CommandGenerationResult,
    CommandHistoryEntry,
    CommandResult,
    TerminalSession,
    TerminalShellType
} from '../../../src/terminal/types';

describe('Terminal Types', () => {
    describe('TerminalShellType', () => {
        test('should have the expected enum values', () => {
            expect(TerminalShellType.VSCodeDefault).toBe('vscode-default');
            expect(TerminalShellType.PowerShell).toBe('powershell');
            expect(TerminalShellType.GitBash).toBe('git-bash');
            expect(TerminalShellType.WSLBash).toBe('wsl-bash');
        });
    });

    describe('CommandResult interface', () => {
        test('should create a valid CommandResult object', () => {
            const result: CommandResult = {
                stdout: 'command output',
                stderr: 'error output',
                exitCode: 0,
                success: true
            };

            expect(result.stdout).toBe('command output');
            expect(result.stderr).toBe('error output');
            expect(result.exitCode).toBe(0);
            expect(result.success).toBe(true);
        });

        test('should handle failed command', () => {
            const result: CommandResult = {
                stdout: '',
                stderr: 'command not found',
                exitCode: 127,
                success: false
            };

            expect(result.stdout).toBe('');
            expect(result.stderr).toBe('command not found');
            expect(result.exitCode).toBe(127);
            expect(result.success).toBe(false);
        });
    });

    describe('CommandHistoryEntry interface', () => {
        test('should create a valid CommandHistoryEntry', () => {
            const now = new Date();
            const entry: CommandHistoryEntry = {
                command: 'ls -la',
                timestamp: now,
                shellType: TerminalShellType.GitBash
            };

            expect(entry.command).toBe('ls -la');
            expect(entry.timestamp).toBe(now);
            expect(entry.shellType).toBe(TerminalShellType.GitBash);
        });

        test('should include result when provided', () => {
            const entry: CommandHistoryEntry = {
                command: 'echo hello',
                timestamp: new Date(),
                shellType: TerminalShellType.PowerShell,
                result: {
                    stdout: 'hello',
                    stderr: '',
                    exitCode: 0,
                    success: true
                }
            };

            expect(entry.result).toBeDefined();
            expect(entry.result!.stdout).toBe('hello');
            expect(entry.result!.success).toBe(true);
        });
    });

    describe('TerminalSession interface', () => {
        test('should create a valid TerminalSession', () => {
            const session: TerminalSession = {
                id: 'terminal-1',
                name: 'Test Terminal',
                shellType: TerminalShellType.VSCodeDefault,
                createdAt: new Date(),
                commandHistory: []
            };

            expect(session.id).toBe('terminal-1');
            expect(session.name).toBe('Test Terminal');
            expect(session.shellType).toBe(TerminalShellType.VSCodeDefault);
            expect(Array.isArray(session.commandHistory)).toBe(true);
        });

        test('should store command history', () => {
            const history: CommandHistoryEntry[] = [
                {
                    command: 'npm install',
                    timestamp: new Date(),
                    shellType: TerminalShellType.VSCodeDefault
                },
                {
                    command: 'git status',
                    timestamp: new Date(),
                    shellType: TerminalShellType.VSCodeDefault
                }
            ];

            const session: TerminalSession = {
                id: 'terminal-2',
                name: 'Development Terminal',
                shellType: TerminalShellType.VSCodeDefault,
                createdAt: new Date(),
                commandHistory: history
            };

            expect(session.commandHistory.length).toBe(2);
            expect(session.commandHistory[0].command).toBe('npm install');
            expect(session.commandHistory[1].command).toBe('git status');
        });
    });

    describe('CommandGenerationResult interface', () => {
        test('should create a valid CommandGenerationResult', () => {
            const result: CommandGenerationResult = {
                command: 'npm run build',
                explanation: 'Builds the project',
                isValid: true
            };

            expect(result.command).toBe('npm run build');
            expect(result.explanation).toBe('Builds the project');
            expect(result.isValid).toBe(true);
        });
    });

    describe('CommandAnalysis interface', () => {
        test('should create a valid CommandAnalysis', () => {
            const analysis: CommandAnalysis = {
                command: 'rm -rf /',
                analysis: 'This command deletes all files on the system',
                riskLevel: 'high',
                safeToExecute: false
            };

            expect(analysis.command).toBe('rm -rf /');
            expect(analysis.analysis).toBe('This command deletes all files on the system');
            expect(analysis.riskLevel).toBe('high');
            expect(analysis.safeToExecute).toBe(false);
        });

        test('should handle low risk commands', () => {
            const analysis: CommandAnalysis = {
                command: 'echo hello',
                analysis: 'Simple echo command',
                riskLevel: 'low',
                safeToExecute: true
            };

            expect(analysis.riskLevel).toBe('low');
            expect(analysis.safeToExecute).toBe(true);
        });
    });
});
