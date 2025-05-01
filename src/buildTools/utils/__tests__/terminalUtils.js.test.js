// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\utils\__tests__\terminalUtils.js.test.js

const vscode = require('vscode');
const { run_in_terminal } = require('../terminalUtils');

// Mock the vscode module
jest.mock('vscode', () => {
    const mockTerminal = {
        show: jest.fn(),
        sendText: jest.fn(),
        dispose: jest.fn()
    };

    return {
        window: {
            createTerminal: jest.fn(() => mockTerminal),
            onDidCloseTerminal: jest.fn(() => ({
                dispose: jest.fn()
            }))
        }
    };
});

describe('Terminal Utils', () => {
    let mockTerminal;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Get reference to the mock terminal
        mockTerminal = vscode.window.createTerminal();
    });

    describe('run_in_terminal', () => {
        test('should create a terminal with correct name', async () => {
            await run_in_terminal({
                command: 'npm install',
                isBackground: false
            });

            expect(vscode.window.createTerminal).toHaveBeenCalledWith('Build Script Optimizer');
        });

        test('should show terminal and send command text', async () => {
            const command = 'npm run build';

            await run_in_terminal({
                command,
                isBackground: false
            });

            expect(mockTerminal.show).toHaveBeenCalled();
            expect(mockTerminal.sendText).toHaveBeenCalledWith(command);
        });

        test('should register terminal close event listener for foreground tasks', async () => {
            await run_in_terminal({
                command: 'npm test',
                isBackground: false
            });

            expect(vscode.window.onDidCloseTerminal).toHaveBeenCalled();
        });

        test('should not register terminal close event listener for background tasks', async () => {
            await run_in_terminal({
                command: 'npm run watch',
                isBackground: true
            });

            expect(vscode.window.onDidCloseTerminal).not.toHaveBeenCalled();
        });

        test('should dispose terminal on error', async () => {
            // Setup terminal to throw when showing
            mockTerminal.show.mockImplementation(() => {
                throw new Error('Terminal error');
            });

            await expect(run_in_terminal({
                command: 'npm run build',
                isBackground: false
            })).rejects.toThrow('Terminal error');

            expect(mockTerminal.dispose).toHaveBeenCalled();
        });

        test('should handle complex commands with arguments', async () => {
            const complexCommand = 'webpack --mode=production --config webpack.prod.js';

            await run_in_terminal({
                command: complexCommand,
                isBackground: false
            });

            expect(mockTerminal.sendText).toHaveBeenCalledWith(complexCommand);
        });

        test('should handle long-running background commands', async () => {
            const watchCommand = 'npm run watch';

            await run_in_terminal({
                command: watchCommand,
                isBackground: true
            });

            expect(mockTerminal.sendText).toHaveBeenCalledWith(watchCommand);
            // Should not set up exit code tracking for background tasks
            expect(vscode.window.onDidCloseTerminal).not.toHaveBeenCalled();
        });

        test('should simulate terminal exit handler behavior', async () => {
            // Need to test the behavior when terminal closes
            const mockOnDidCloseHandler = jest.fn();
            vscode.window.onDidCloseTerminal.mockReturnValue({
                dispose: mockOnDidCloseHandler
            });

            await run_in_terminal({
                command: 'npm test',
                isBackground: false
            });

            // Get the callback function passed to onDidCloseTerminal
            const closeCallback = vscode.window.onDidCloseTerminal.mock.calls[0][0];

            // Call the callback with a terminal that has non-zero exit code
            // This simulates the terminal closing with an error
            closeCallback({
                ...mockTerminal,
                exitStatus: { code: 1 }
            });

            // Verify the dispose was called
            expect(mockOnDidCloseHandler).toHaveBeenCalled();
        });

        test('should properly handle successful terminal exit', async () => {
            const mockOnDidCloseHandler = jest.fn();
            vscode.window.onDidCloseTerminal.mockReturnValue({
                dispose: mockOnDidCloseHandler
            });

            await run_in_terminal({
                command: 'npm test',
                isBackground: false
            });

            const closeCallback = vscode.window.onDidCloseTerminal.mock.calls[0][0];

            // Simulate terminal closing with success (exit code 0)
            closeCallback({
                ...mockTerminal,
                exitStatus: { code: 0 }
            });

            // Should dispose the event listener
            expect(mockOnDidCloseHandler).toHaveBeenCalled();

            // Should not throw an error for exit code 0
            expect(() => closeCallback({
                ...mockTerminal,
                exitStatus: { code: 0 }
            })).not.toThrow();
        });

        test('should throw an error for non-zero exit code', async () => {
            const mockOnDidCloseHandler = jest.fn();
            vscode.window.onDidCloseTerminal.mockReturnValue({
                dispose: mockOnDidCloseHandler
            });

            await run_in_terminal({
                command: 'npm test',
                isBackground: false
            });

            const closeCallback = vscode.window.onDidCloseTerminal.mock.calls[0][0];

            // Simulate terminal closing with error (non-zero exit code)
            expect(() => closeCallback({
                ...mockTerminal,
                exitStatus: { code: 2 }
            })).toThrow('Command failed with exit code 2');
        });

        test('should handle undefined exit status gracefully', async () => {
            const mockOnDidCloseHandler = jest.fn();
            vscode.window.onDidCloseTerminal.mockReturnValue({
                dispose: mockOnDidCloseHandler
            });

            await run_in_terminal({
                command: 'npm test',
                isBackground: false
            });

            const closeCallback = vscode.window.onDidCloseTerminal.mock.calls[0][0];

            // Simulate terminal closing without exit status (shouldn't throw)
            expect(() => closeCallback({
                ...mockTerminal,
                exitStatus: undefined
            })).not.toThrow();
        });

        test('should ignore unrelated terminal close events', async () => {
            const mockOnDidCloseHandler = jest.fn();
            vscode.window.onDidCloseTerminal.mockReturnValue({
                dispose: mockOnDidCloseHandler
            });

            await run_in_terminal({
                command: 'npm test',
                isBackground: false
            });

            const closeCallback = vscode.window.onDidCloseTerminal.mock.calls[0][0];

            // Create a different terminal object
            const differentTerminal = {
                show: jest.fn(),
                sendText: jest.fn(),
                dispose: jest.fn(),
                exitStatus: { code: 1 }
            };

            // Simulate a different terminal closing (should be ignored)
            closeCallback(differentTerminal);

            // Should not dispose the event listener for unrelated terminals
            expect(mockOnDidCloseHandler).not.toHaveBeenCalled();
        });

        test('should handle terminal creation failure', async () => {
            // Force the createTerminal function to return null
            vscode.window.createTerminal.mockReturnValueOnce(null);

            await expect(run_in_terminal({
                command: 'npm test',
                isBackground: false
            })).rejects.toThrow();
        });
    });
});
