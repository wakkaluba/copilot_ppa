const vscode = require('vscode');
const os = require('os');
const path = require('path');
const { CodeExecutorService } = require('../codeExecutor');

// Mock VS Code API
jest.mock('vscode', () => ({
    window: {
        activeTextEditor: undefined,
        activeTerminal: undefined,
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn(),
        createTerminal: jest.fn().mockReturnValue({
            show: jest.fn(),
            sendText: jest.fn(),
            dispose: jest.fn()
        })
    },
    workspace: {
        fs: {
            writeFile: jest.fn().mockResolvedValue(undefined)
        }
    },
    Uri: {
        file: jest.fn().mockImplementation(path => ({ path }))
    }
}));

// Mock os and path modules
jest.mock('os', () => ({
    tmpdir: jest.fn().mockReturnValue('/temp')
}));

jest.mock('path', () => ({
    join: jest.fn().mockImplementation((...args) => args.join('/'))
}));

describe('CodeExecutorService (JavaScript Implementation)', () => {
    let executor;
    let mockTerminal;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create a mock terminal
        mockTerminal = {
            show: jest.fn(),
            sendText: jest.fn(),
            dispose: jest.fn()
        };

        // Set up the activeTerminal
        vscode.window.createTerminal = jest.fn().mockReturnValue(mockTerminal);

        // Create instance of the service
        executor = new CodeExecutorService();
    });

    describe('executeSelectedCode', () => {
        it('should show error when no active editor', async () => {
            // Setup: No active editor
            vscode.window.activeTextEditor = undefined;

            // Execute
            await executor.executeSelectedCode();

            // Verify
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No active editor found');
        });

        it('should show error when no text is selected', async () => {
            // Setup: Active editor with empty selection
            vscode.window.activeTextEditor = {
                selection: { isEmpty: true },
                document: { getText: jest.fn(), languageId: 'javascript' }
            };

            // Execute
            await executor.executeSelectedCode();

            // Verify
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No code selected');
        });

        it('should execute JavaScript code successfully', async () => {
            // Setup: Mock text editor with selection
            const mockEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('console.log("Hello");'),
                    languageId: 'javascript'
                }
            };
            vscode.window.activeTextEditor = mockEditor;

            // Execute
            await executor.executeSelectedCode();

            // Verify
            expect(vscode.workspace.fs.writeFile).toHaveBeenCalled();
            expect(mockTerminal.show).toHaveBeenCalled();
            expect(mockTerminal.sendText).toHaveBeenCalledWith(expect.stringContaining('node'));
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Code executed successfully');
        });

        it('should execute Python code successfully', async () => {
            // Setup: Mock text editor with Python selection
            const mockEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('print("Hello")'),
                    languageId: 'python'
                }
            };
            vscode.window.activeTextEditor = mockEditor;

            // Execute
            await executor.executeSelectedCode();

            // Verify
            expect(vscode.workspace.fs.writeFile).toHaveBeenCalled();
            expect(mockTerminal.show).toHaveBeenCalled();
            expect(mockTerminal.sendText).toHaveBeenCalledWith(expect.stringContaining('python'));
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Code executed successfully');
        });

        it('should execute shell script code successfully', async () => {
            // Setup: Mock text editor with shell script selection
            const mockEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('echo "Hello"'),
                    languageId: 'shellscript'
                }
            };
            vscode.window.activeTextEditor = mockEditor;

            // Execute
            await executor.executeSelectedCode();

            // Verify
            expect(vscode.workspace.fs.writeFile).toHaveBeenCalled();
            expect(mockTerminal.show).toHaveBeenCalled();
            expect(mockTerminal.sendText).toHaveBeenCalledWith(expect.stringContaining('bash'));
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Code executed successfully');
        });

        it('should execute PowerShell code successfully', async () => {
            // Setup: Mock text editor with PowerShell selection
            const mockEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('Write-Host "Hello"'),
                    languageId: 'powershell'
                }
            };
            vscode.window.activeTextEditor = mockEditor;

            // Execute
            await executor.executeSelectedCode();

            // Verify
            expect(vscode.workspace.fs.writeFile).toHaveBeenCalled();
            expect(mockTerminal.show).toHaveBeenCalled();
            expect(mockTerminal.sendText).toHaveBeenCalledWith(expect.stringContaining('powershell'));
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Code executed successfully');
        });

        it('should handle unsupported language error', async () => {
            // Setup: Mock text editor with unsupported language
            const mockEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('random code'),
                    languageId: 'unsupported'
                }
            };
            vscode.window.activeTextEditor = mockEditor;

            // Execute
            await executor.executeSelectedCode();

            // Verify
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to execute code'));
        });

        it('should use existing terminal if available', async () => {
            // Setup: Mock existing terminal
            const existingTerminal = {
                show: jest.fn(),
                sendText: jest.fn()
            };
            vscode.window.activeTerminal = existingTerminal;

            // Mock text editor with selection
            const mockEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('console.log("Hello");'),
                    languageId: 'javascript'
                }
            };
            vscode.window.activeTextEditor = mockEditor;

            // Execute
            await executor.executeSelectedCode();

            // Verify
            expect(existingTerminal.show).toHaveBeenCalled();
            expect(existingTerminal.sendText).toHaveBeenCalled();
            expect(vscode.window.createTerminal).not.toHaveBeenCalled();
        });

        it('should handle file system errors', async () => {
            // Setup: Mock file system error
            vscode.workspace.fs.writeFile.mockRejectedValue(new Error('File system error'));

            // Mock text editor with selection
            const mockEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('console.log("Hello");'),
                    languageId: 'javascript'
                }
            };
            vscode.window.activeTextEditor = mockEditor;

            // Execute
            await executor.executeSelectedCode();

            // Verify
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to execute code'));
        });
    });

    describe('temporary file creation', () => {
        it('should create temporary files with the correct extension', async () => {
            // Mock implementations for testing private methods indirectly
            const mockEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('console.log("Hello");'),
                    languageId: 'javascript'
                }
            };
            vscode.window.activeTextEditor = mockEditor;

            // Execute
            await executor.executeSelectedCode();

            // Verify
            expect(vscode.workspace.fs.writeFile).toHaveBeenCalled();
            // Should use .js extension for JavaScript
            expect(path.join).toHaveBeenCalledWith('/temp', expect.stringMatching(/vscode-exec-\d+\.js/));
        });

        it('should handle different file extensions for different languages', async () => {
            // Test Python extension
            const mockPythonEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('print("Hello")'),
                    languageId: 'python'
                }
            };
            vscode.window.activeTextEditor = mockPythonEditor;

            // Execute for Python
            await executor.executeSelectedCode();
            expect(path.join).toHaveBeenCalledWith('/temp', expect.stringMatching(/vscode-exec-\d+\.py/));

            // Reset mocks
            jest.clearAllMocks();

            // Test shell script extension
            const mockShellEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('echo "Hello"'),
                    languageId: 'shellscript'
                }
            };
            vscode.window.activeTextEditor = mockShellEditor;

            // Execute for shell script
            await executor.executeSelectedCode();
            expect(path.join).toHaveBeenCalledWith('/temp', expect.stringMatching(/vscode-exec-\d+\.sh/));
        });
    });
});
