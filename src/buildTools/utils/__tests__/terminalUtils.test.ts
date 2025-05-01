import * as vscode from 'vscode';
import {
    clearTerminal,
    executeCommand,
    getTerminal,
    runInTerminal,
    TerminalCommand
} from '../terminalUtils';

// Mock the vscode module
jest.mock('vscode', () => ({
    window: {
        terminals: [],
        createTerminal: jest.fn(),
        onDidCloseTerminal: jest.fn(),
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn()
    },
    workspace: {
        getConfiguration: jest.fn()
    },
    commands: {
        executeCommand: jest.fn()
    }
}));

describe('Terminal Utilities', () => {
    let mockTerminal: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockTerminal = {
            name: 'Build Tools Terminal',
            sendText: jest.fn(),
            show: jest.fn(),
            dispose: jest.fn(),
            processId: Promise.resolve(12345)
        };
        (vscode.window.createTerminal as jest.Mock).mockReturnValue(mockTerminal);
        (vscode.window.terminals as any) = [mockTerminal];
    });

    describe('getTerminal', () => {
        it('should return existing terminal if available', () => {
            const terminal = getTerminal('Build Tools Terminal');

            expect(terminal).toBe(mockTerminal);
            expect(vscode.window.createTerminal).not.toHaveBeenCalled();
        });

        it('should create new terminal if none exists with that name', () => {
            const terminal = getTerminal('New Terminal');

            expect(vscode.window.createTerminal).toHaveBeenCalledWith('New Terminal');
            expect(terminal).not.toBe(mockTerminal);
        });
    });

    describe('executeCommand', () => {
        it('should execute command in terminal', async () => {
            const command: TerminalCommand = {
                command: 'npm run build',
                showTerminal: true
            };

            await executeCommand(command);

            expect(mockTerminal.sendText).toHaveBeenCalledWith('npm run build');
            expect(mockTerminal.show).toHaveBeenCalled();
        });

        it('should not show terminal if specified', async () => {
            const command: TerminalCommand = {
                command: 'npm run build',
                showTerminal: false
            };

            await executeCommand(command);

            expect(mockTerminal.sendText).toHaveBeenCalledWith('npm run build');
            expect(mockTerminal.show).not.toHaveBeenCalled();
        });

        it('should use provided terminal name', async () => {
            const command: TerminalCommand = {
                command: 'npm run build',
                terminalName: 'Custom Terminal'
            };

            await executeCommand(command);

            expect(vscode.window.createTerminal).toHaveBeenCalledWith('Custom Terminal');
        });

        it('should handle command arrays', async () => {
            const command: TerminalCommand = {
                command: ['cd project', 'npm run build']
            };

            await executeCommand(command);

            expect(mockTerminal.sendText).toHaveBeenCalledWith('cd project');
            expect(mockTerminal.sendText).toHaveBeenCalledWith('npm run build');
        });
    });

    describe('runInTerminal', () => {
        it('should execute single command in terminal', async () => {
            await runInTerminal('npm test');

            expect(mockTerminal.sendText).toHaveBeenCalledWith('npm test');
            expect(mockTerminal.show).toHaveBeenCalled();
        });

        it('should execute multiple commands in terminal', async () => {
            await runInTerminal(['cd project', 'npm test']);

            expect(mockTerminal.sendText).toHaveBeenCalledWith('cd project');
            expect(mockTerminal.sendText).toHaveBeenCalledWith('npm test');
            expect(mockTerminal.show).toHaveBeenCalled();
        });

        it('should use custom terminal name if provided', async () => {
            await runInTerminal('npm test', 'Custom Terminal');

            expect(vscode.window.createTerminal).toHaveBeenCalledWith('Custom Terminal');
        });
    });

    describe('clearTerminal', () => {
        it('should send clear command to terminal', async () => {
            await clearTerminal();

            expect(mockTerminal.sendText).toHaveBeenCalledWith('clear', true);
        });

        it('should use specified terminal name', async () => {
            await clearTerminal('Custom Terminal');

            expect(vscode.window.createTerminal).toHaveBeenCalledWith('Custom Terminal');
        });
    });
});
