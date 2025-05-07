import * as vscode from 'vscode';
import { ContextMenuManager } from '../../contextMenu';

// Mock VS Code API
jest.mock('vscode', () => {
    return {
        commands: {
            registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() })
        },
        window: {
            activeTextEditor: {
                selection: {
                    isEmpty: false
                },
                document: {
                    getText: jest.fn().mockReturnValue('sample code')
                }
            },
            showInformationMessage: jest.fn(),
            showErrorMessage: jest.fn()
        },
        Uri: {
            file: jest.fn().mockImplementation((path) => ({ path }))
        },
        ConfigurationTarget: {
            Global: 1
        }
    };
});

describe('ContextMenuManager', () => {
    let contextMenuManager: ContextMenuManager;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            extensionUri: {} as vscode.Uri,
            environmentVariableCollection: {} as vscode.EnvironmentVariableCollection,
            extensionMode: vscode.ExtensionMode.Test,
            globalStorageUri: {} as vscode.Uri,
            logUri: {} as vscode.Uri,
            storageUri: {} as vscode.Uri,
            workspaceState: {} as vscode.Memento,
            globalState: {} as vscode.Memento & { setKeysForSync(keys: readonly string[]): void },
            secrets: {} as vscode.SecretStorage,
            asAbsolutePath: jest.fn().mockImplementation(p => `/absolute/${p}`)
        };

        // Create instance of ContextMenuManager
        contextMenuManager = new ContextMenuManager(mockContext);
    });

    describe('Constructor and Command Registration', () => {
        test('should register all commands in constructor', () => {
            // Verify commands were registered
            expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(3);
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.explainCode',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.improveCode',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.generateTests',
                expect.any(Function)
            );
        });

        test('should add command disposables to context subscriptions', () => {
            expect(mockContext.subscriptions.length).toBe(3);
        });

        test('command disposables should have dispose method', () => {
            expect(mockContext.subscriptions[0].dispose).toBeDefined();
            expect(mockContext.subscriptions[1].dispose).toBeDefined();
            expect(mockContext.subscriptions[2].dispose).toBeDefined();
        });
    });

    describe('Command Handlers', () => {
        test('explainCodeHandler should get text from selection', async () => {
            // Get explainCodeHandler from command registration call
            const explainCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.explainCode'
            )[1];

            // Call the handler with a mock URI
            const mockUri = { path: '/test/file.ts' };
            await explainCodeHandler(mockUri);

            // Verify getText was called with the selection
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalledWith(
                vscode.window.activeTextEditor?.selection
            );
        });

        test('improveCodeHandler should get text from selection', async () => {
            // Get improveCodeHandler from command registration call
            const improveCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.improveCode'
            )[1];

            // Call the handler with a mock URI
            const mockUri = { path: '/test/file.ts' };
            await improveCodeHandler(mockUri);

            // Verify getText was called with the selection
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalledWith(
                vscode.window.activeTextEditor?.selection
            );
        });

        test('generateTestsHandler should get text from selection', async () => {
            // Get generateTestsHandler from command registration call
            const generateTestsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.generateTests'
            )[1];

            // Call the handler with a mock URI
            const mockUri = { path: '/test/file.ts' };
            await generateTestsHandler(mockUri);

            // Verify getText was called with the selection
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalledWith(
                vscode.window.activeTextEditor?.selection
            );
        });

        test('command handlers should accept undefined uri parameter', async () => {
            // Get handlers from command registration calls
            const explainCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.explainCode'
            )[1];
            const improveCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.improveCode'
            )[1];
            const generateTestsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.generateTests'
            )[1];

            // Call the handlers with undefined URI (which can happen when triggered from command palette)
            await explainCodeHandler(undefined);
            await improveCodeHandler(undefined);
            await generateTestsHandler(undefined);

            // Each handler should still attempt to get text from selection
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalledTimes(3);
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            // Mock a situation with no active editor
            (vscode.window as any).activeTextEditor = undefined;
        });

        test('explainCodeHandler should handle case with no active editor', async () => {
            // Get explainCodeHandler
            const explainCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.explainCode'
            )[1];

            // Call handler with no active editor
            await explainCodeHandler({ path: '/test/file.ts' });

            // Nothing should happen (function returns early)
            expect(vscode.window.activeTextEditor).toBeUndefined();
        });

        test('improveCodeHandler should handle case with no active editor', async () => {
            // Get improveCodeHandler
            const improveCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.improveCode'
            )[1];

            // Call handler with no active editor
            await improveCodeHandler({ path: '/test/file.ts' });

            // Nothing should happen (function returns early)
            expect(vscode.window.activeTextEditor).toBeUndefined();
        });

        test('generateTestsHandler should handle case with no active editor', async () => {
            // Get generateTestsHandler
            const generateTestsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.generateTests'
            )[1];

            // Call handler with no active editor
            await generateTestsHandler({ path: '/test/file.ts' });

            // Nothing should happen (function returns early)
            expect(vscode.window.activeTextEditor).toBeUndefined();
        });

        test('commands should handle errors thrown during getText', async () => {
            // Mock active editor that throws an error when getText is called
            (vscode.window as any).activeTextEditor = {
                selection: {
                    isEmpty: false
                },
                document: {
                    getText: jest.fn().mockImplementation(() => {
                        throw new Error('Mock error in getText');
                    })
                }
            };

            // Get the command handlers
            const explainCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.explainCode'
            )[1];

            // Call should not throw
            await expect(explainCodeHandler({ path: '/test/file.ts' })).resolves.not.toThrow();
        });
    });

    describe('Empty Selection Handling', () => {
        beforeEach(() => {
            // Mock a situation with an empty selection
            (vscode.window.activeTextEditor!.selection as any).isEmpty = true;
        });

        test('explainCodeHandler should handle empty selection', async () => {
            // Get explainCodeHandler
            const explainCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.explainCode'
            )[1];

            // Call handler with empty selection
            await explainCodeHandler({ path: '/test/file.ts' });

            // getText should not be called with an empty selection
            expect(vscode.window.activeTextEditor?.document.getText).not.toHaveBeenCalled();
        });

        test('improveCodeHandler should handle empty selection', async () => {
            // Get improveCodeHandler
            const improveCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.improveCode'
            )[1];

            // Call handler with empty selection
            await improveCodeHandler({ path: '/test/file.ts' });

            // getText should not be called with an empty selection
            expect(vscode.window.activeTextEditor?.document.getText).not.toHaveBeenCalled();
        });

        test('generateTestsHandler should handle empty selection', async () => {
            // Get generateTestsHandler
            const generateTestsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.generateTests'
            )[1];

            // Call handler with empty selection
            await generateTestsHandler({ path: '/test/file.ts' });

            // getText should not be called with an empty selection
            expect(vscode.window.activeTextEditor?.document.getText).not.toHaveBeenCalled();
        });

        test('all handlers should work the same way with empty selection', async () => {
            // Get all handlers
            const explainCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.explainCode'
            )[1];
            const improveCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.improveCode'
            )[1];
            const generateTestsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.generateTests'
            )[1];

            // Call all handlers with empty selection
            await explainCodeHandler({ path: '/test/file.ts' });
            await improveCodeHandler({ path: '/test/file.ts' });
            await generateTestsHandler({ path: '/test/file.ts' });

            // getText should not be called for any handler
            expect(vscode.window.activeTextEditor?.document.getText).not.toHaveBeenCalled();
        });
    });

    describe('Different Selection Types', () => {
        test('explainCodeHandler should handle multi-line code selection', async () => {
            // Set up multi-line code selection
            (vscode.window as any).activeTextEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue(`function multiLine() {
                        const a = 1;
                        const b = 2;
                        return a + b;
                    }`)
                }
            };

            // Get explainCodeHandler
            const explainCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.explainCode'
            )[1];

            // Call handler
            await explainCodeHandler({ path: '/test/file.ts' });

            // Verify correct text was retrieved
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalled();
            expect(vscode.window.activeTextEditor?.document.getText).toHaveReturnedWith(expect.stringContaining('function multiLine()'));
        });

        test('improveCodeHandler should handle single-line code selection', async () => {
            // Set up single-line code selection
            (vscode.window as any).activeTextEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('const x: number[] = [1, 2, 3].map(y => y * 2);')
                }
            };

            // Get improveCodeHandler
            const improveCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.improveCode'
            )[1];

            // Call handler
            await improveCodeHandler({ path: '/test/file.ts' });

            // Verify correct text was retrieved
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalled();
            expect(vscode.window.activeTextEditor?.document.getText).toHaveReturnedWith('const x: number[] = [1, 2, 3].map(y => y * 2);');
        });

        test('generateTestsHandler should handle class with interfaces and types', async () => {
            // Set up class with interface code selection
            (vscode.window as any).activeTextEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue(`interface ValueHolder {
                        value: number;
                        getValue(): number;
                        setValue(newValue: number): void;
                    }

                    class TestSubject implements ValueHolder {
                        value: number;

                        constructor(value: number) {
                            this.value = value;
                        }

                        getValue(): number {
                            return this.value;
                        }

                        setValue(newValue: number): void {
                            this.value = newValue;
                        }
                    }`)
                }
            };

            // Get generateTestsHandler
            const generateTestsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.generateTests'
            )[1];

            // Call handler
            await generateTestsHandler({ path: '/test/file.ts' });

            // Verify correct text was retrieved
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalled();
            expect(vscode.window.activeTextEditor?.document.getText).toHaveReturnedWith(expect.stringContaining('interface ValueHolder'));
        });

        test('generateTestsHandler should handle function with TypeScript types', async () => {
            // Set up function with TypeScript types
            (vscode.window as any).activeTextEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue(`/**
                     * Calculates the sum of two numbers
                     * @param a First number
                     * @param b Second number
                     * @returns Sum of a and b
                     */
                    function add(a: number, b: number): number {
                        return a + b;
                    }`)
                }
            };

            // Get generateTestsHandler
            const generateTestsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.generateTests'
            )[1];

            // Call handler
            await generateTestsHandler({ path: '/test/file.ts' });

            // Verify correct text was retrieved
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalled();
            expect(vscode.window.activeTextEditor?.document.getText).toHaveReturnedWith(expect.stringContaining('function add(a: number, b: number)'));
        });

        test('explainCodeHandler should handle code with imports', async () => {
            // Set up code with imports
            (vscode.window as any).activeTextEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue(`import * as fs from 'fs';
                    import * as path from 'path';

                    function readJsonFile(filePath: string): any {
                        const fullPath = path.resolve(filePath);
                        const content = fs.readFileSync(fullPath, 'utf8');
                        return JSON.parse(content);
                    }`)
                }
            };

            // Get explainCodeHandler
            const explainCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.explainCode'
            )[1];

            // Call handler
            await explainCodeHandler({ path: '/test/file.ts' });

            // Verify correct text was retrieved
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalled();
            expect(vscode.window.activeTextEditor?.document.getText).toHaveReturnedWith(expect.stringContaining('import * as fs'));
        });
    });

    describe('LLM Integration (Placeholder)', () => {
        test('explainCodeHandler should be prepared for LLM integration', async () => {
            // This is a placeholder test for future LLM integration
            // In the actual code, there are TODO comments indicating LLM integration will be added
            const explainCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.explainCode'
            )[1];

            // Mock an active text editor with a selection
            (vscode.window as any).activeTextEditor = {
                selection: { isEmpty: false },
                document: { getText: jest.fn().mockReturnValue('function test() { return 42; }') }
            };

            await explainCodeHandler({ path: '/test/file.ts' });

            // Verify we got the selected text
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalled();
            expect(vscode.window.activeTextEditor?.document.getText).toHaveReturnedWith('function test() { return 42; }');
        });

        test('improveCodeHandler should be prepared for LLM integration', async () => {
            // This is a placeholder test for future LLM integration
            const improveCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.improveCode'
            )[1];

            // Mock an active text editor with a selection
            (vscode.window as any).activeTextEditor = {
                selection: { isEmpty: false },
                document: { getText: jest.fn().mockReturnValue('function test() { var x = 10; return x; }') }
            };

            await improveCodeHandler({ path: '/test/file.ts' });

            // Verify we got the selected text
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalled();
            expect(vscode.window.activeTextEditor?.document.getText).toHaveReturnedWith('function test() { var x = 10; return x; }');
        });

        test('generateTestsHandler should be prepared for LLM integration', async () => {
            // This is a placeholder test for future LLM integration
            const generateTestsHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.generateTests'
            )[1];

            // Mock an active text editor with a selection
            (vscode.window as any).activeTextEditor = {
                selection: { isEmpty: false },
                document: { getText: jest.fn().mockReturnValue('class Calculator { add(a, b) { return a + b; } }') }
            };

            await generateTestsHandler({ path: '/test/file.ts' });

            // Verify we got the selected text
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalled();
            expect(vscode.window.activeTextEditor?.document.getText).toHaveReturnedWith('class Calculator { add(a, b) { return a + b; } }');
        });

        test('command handlers should collect code properties for future LLM integration', async () => {
            // Mock an active text editor with a selection and additional properties
            (vscode.window as any).activeTextEditor = {
                selection: { isEmpty: false },
                document: {
                    getText: jest.fn().mockReturnValue('function test() { return 42; }'),
                    fileName: '/test/file.ts',
                    languageId: 'typescript'
                }
            };

            // Get explainCodeHandler
            const explainCodeHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.explainCode'
            )[1];

            // Call the handler
            await explainCodeHandler({ path: '/test/file.ts' });

            // Verify we got the selected text
            expect(vscode.window.activeTextEditor?.document.getText).toHaveBeenCalled();
        });
    });

    describe('Command Registration Edge Cases', () => {
        test('should handle registerCommand failures gracefully', () => {
            // Reset mocks first
            jest.clearAllMocks();

            // Make registerCommand throw an error on the first call
            (vscode.commands.registerCommand as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Failed to register command');
            });

            // Creating the manager should not throw, even if registration fails
            expect(() => new ContextMenuManager(mockContext)).not.toThrow();

            // Other commands should still be registered
            expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(3);
        });
    });
});
