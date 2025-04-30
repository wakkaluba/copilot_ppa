import * as vscode from 'vscode';
import { TerminalManager } from '../../../src/terminal/terminalManager';
import { TerminalShellType } from '../../../src/terminal/types';

// Mock dependencies
jest.mock('vscode');

describe('TerminalManager', () => {
    let terminalManager: TerminalManager;

    // Mock terminal instance that will be returned by vscode.window.createTerminal
    const mockTerminal: Partial<vscode.Terminal> = {
        name: 'Test Terminal',
        processId: Promise.resolve(123),
        sendText: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mocks
        (vscode.window.createTerminal as jest.Mock).mockReturnValue(mockTerminal);

        // Initialize TerminalManager
        terminalManager = new TerminalManager();
    });

    describe('Terminal creation', () => {
        test('should create a terminal with the specified name and shell type', () => {
            const terminal = terminalManager.createTerminal('Test Terminal', TerminalShellType.PowerShell);

            // Verify VSCode API was called correctly
            expect(vscode.window.createTerminal).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Test Terminal'
                    // Shell path and args are checked in separate tests
                })
            );

            // Verify terminal was returned
            expect(terminal).toBeTruthy();
        });

        test('should set the appropriate shell path for PowerShell', () => {
            terminalManager.createTerminal('PowerShell Terminal', TerminalShellType.PowerShell);

            // Check if the terminal was created with PowerShell options
            expect(vscode.window.createTerminal).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'PowerShell Terminal',
                    shellPath: expect.stringMatching(/powershell/i)
                })
            );
        });

        test('should set the appropriate shell path for Git Bash', () => {
            terminalManager.createTerminal('Git Bash Terminal', TerminalShellType.GitBash);

            // Check if the terminal was created with Git Bash options
            expect(vscode.window.createTerminal).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Git Bash Terminal',
                    shellPath: expect.stringMatching(/git|bash/i)
                })
            );
        });
    });

    describe('Terminal operations', () => {
        test('should show an existing terminal by name', () => {
            // Create a terminal first
            terminalManager.createTerminal('Terminal to Show', TerminalShellType.VSCodeDefault);

            // Clear mock to isolate the showTerminal call
            jest.clearAllMocks();

            // Show the terminal
            terminalManager.showTerminal('Terminal to Show', TerminalShellType.VSCodeDefault);

            // Check if terminal.show was called
            expect(mockTerminal.show).toHaveBeenCalled();
        });

        test('should create a new terminal if one with the specified name does not exist', () => {
            // Show (and create) the terminal
            terminalManager.showTerminal('New Terminal', TerminalShellType.VSCodeDefault);

            // Check if a new terminal was created
            expect(vscode.window.createTerminal).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New Terminal'
                })
            );

            // Check if show was called
            expect(mockTerminal.show).toHaveBeenCalled();
        });
    });

    describe('Command execution', () => {
        test('should execute a command in the specified terminal', async () => {
            // Create a terminal
            const terminal = terminalManager.createTerminal('Command Terminal', TerminalShellType.VSCodeDefault);

            // Clear mocks after creation
            jest.clearAllMocks();

            // Execute a command
            await terminalManager.executeCommand('echo Hello World', 'Command Terminal');

            // Check if the command was sent to the terminal
            expect(mockTerminal.sendText).toHaveBeenCalledWith('echo Hello World', true);
        });

        test('should execute a command with output', async () => {
            // Mock the command execution
            const mockExecuteWithOutput = jest.spyOn(
                terminalManager['commandExecutor'],
                'executeWithOutput'
            ).mockResolvedValue({
                stdout: 'command output',
                stderr: '',
                exitCode: 0,
                success: true
            });

            // Execute command with output
            const output = await terminalManager.executeCommandWithOutput(
                'echo Hello World',
                TerminalShellType.VSCodeDefault
            );

            // Verify command was executed
            expect(mockExecuteWithOutput).toHaveBeenCalledWith('echo Hello World', TerminalShellType.VSCodeDefault);
            expect(output).toBe('command output');
        });
    });

    describe('Terminal management', () => {
        test('should get active terminals', () => {
            // Create a few terminals
            terminalManager.createTerminal('Terminal 1', TerminalShellType.VSCodeDefault);
            terminalManager.createTerminal('Terminal 2', TerminalShellType.PowerShell);

            // Get active terminals
            const activeTerminals = terminalManager.getActiveTerminals();

            // Check if we have the correct terminals
            expect(activeTerminals.size).toBe(2);
            expect(activeTerminals.has('Terminal 1')).toBe(true);
            expect(activeTerminals.has('Terminal 2')).toBe(true);
        });

        test('should close a specific terminal by name', () => {
            // Create a terminal
            terminalManager.createTerminal('Terminal to Close', TerminalShellType.VSCodeDefault);

            // Clear mocks
            jest.clearAllMocks();

            // Close the terminal
            terminalManager.closeTerminal('Terminal to Close');

            // Verify terminal was disposed
            expect(mockTerminal.dispose).toHaveBeenCalled();
        });

        test('should close all terminals', () => {
            // Create multiple terminals
            terminalManager.createTerminal('Terminal 1', TerminalShellType.VSCodeDefault);
            terminalManager.createTerminal('Terminal 2', TerminalShellType.PowerShell);

            // Clear mocks
            jest.clearAllMocks();

            // Close all terminals
            terminalManager.closeAllTerminals();

            // Verify dispose was called for all terminals
            expect(mockTerminal.dispose).toHaveBeenCalledTimes(2);
        });
    });
});
