import * as vscode from 'vscode';
import { CodeOverviewWebview } from '../../webviews/codeOverviewWebview';

// Mock VS Code API
jest.mock('vscode', () => {
    const mockWebviewPanel = {
        webview: {
            html: '',
            onDidReceiveMessage: jest.fn(),
            postMessage: jest.fn().mockResolvedValue(true),
        },
        onDidDispose: jest.fn(),
        reveal: jest.fn(),
        dispose: jest.fn(),
    };

    return {
        window: {
            createWebviewPanel: jest.fn().mockReturnValue(mockWebviewPanel),
            activeTextEditor: {
                selection: {
                    active: { line: 5, character: 0 },
                },
                document: {},
            },
            showInformationMessage: jest.fn(),
            showErrorMessage: jest.fn(),
        },
        ViewColumn: {
            Beside: 2,
        },
        Position: jest.fn().mockImplementation((line, character) => ({ line, character })),
        Selection: jest.fn().mockImplementation((anchor, active) => ({ anchor, active })),
        Range: jest.fn().mockImplementation((start, end) => ({ start, end })),
        TextEditorRevealType: {
            InCenter: 2,
        },
        SymbolKind: {
            File: 0,
            Module: 1,
            Namespace: 2,
            Package: 3,
            Class: 4,
            Method: 5,
            Property: 6,
            Field: 7,
            Constructor: 8,
            Enum: 9,
            Interface: 10,
            Function: 11,
            Variable: 12,
            Constant: 13,
            String: 14,
            Number: 15,
            Boolean: 16,
            Array: 17,
        },
    };
});

describe('CodeOverviewWebview', () => {
    let webview: CodeOverviewWebview;
    let mockSymbols: vscode.DocumentSymbol[];

    beforeEach(() => {
        webview = new CodeOverviewWebview();
        mockSymbols = [
            {
                name: 'TestClass',
                detail: 'class',
                kind: vscode.SymbolKind.Class,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 20, character: 0 }
                },
                selectionRange: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 9 }
                },
                children: [
                    {
                        name: 'constructor',
                        detail: '',
                        kind: vscode.SymbolKind.Constructor,
                        range: {
                            start: { line: 1, character: 0 },
                            end: { line: 3, character: 0 }
                        },
                        selectionRange: {
                            start: { line: 1, character: 0 },
                            end: { line: 1, character: 11 }
                        },
                        children: [],
                    },
                    {
                        name: 'testMethod',
                        detail: '(arg: string): void',
                        kind: vscode.SymbolKind.Method,
                        range: {
                            start: { line: 4, character: 0 },
                            end: { line: 6, character: 0 }
                        },
                        selectionRange: {
                            start: { line: 4, character: 0 },
                            end: { line: 4, character: 10 }
                        },
                        children: [],
                    },
                ],
            },
            {
                name: 'helperFunction',
                detail: '(arg: number): number',
                kind: vscode.SymbolKind.Function,
                range: {
                    start: { line: 22, character: 0 },
                    end: { line: 24, character: 0 }
                },
                selectionRange: {
                    start: { line: 22, character: 0 },
                    end: { line: 22, character: 14 }
                },
                children: [],
            },
            {
                name: 'testVariable',
                detail: 'string',
                kind: vscode.SymbolKind.Variable,
                range: {
                    start: { line: 26, character: 0 },
                    end: { line: 26, character: 0 }
                },
                selectionRange: {
                    start: { line: 26, character: 0 },
                    end: { line: 26, character: 0 }
                },
                children: [],
            },
        ];
    });

    describe('show()', () => {
        it('should create a new webview panel when none exists', () => {
            webview.show(mockSymbols, 'typescript');

            expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
                'codeOverview',
                'Code Overview',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );
        });

        it('should reuse existing panel when one exists', () => {
            // First call creates panel
            webview.show(mockSymbols, 'typescript');

            // Reset mock to check if it gets called again
            (vscode.window.createWebviewPanel as jest.Mock).mockClear();

            // Second call should reuse existing panel
            webview.show(mockSymbols, 'typescript');

            expect(vscode.window.createWebviewPanel).not.toHaveBeenCalled();
        });

        it('should set HTML content on the webview', () => {
            const mockPanel = vscode.window.createWebviewPanel();
            webview.show(mockSymbols, 'typescript');

            expect(mockPanel.webview.html).toBeTruthy();
            expect(mockPanel.webview.html).toContain('<!DOCTYPE html>');
            expect(mockPanel.webview.html).toContain('Code Overview (typescript)');
        });

        it('should register message handling', () => {
            const mockPanel = vscode.window.createWebviewPanel();
            webview.show(mockSymbols, 'typescript');

            expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
        });

        it('should clean up panel reference when disposed', () => {
            const mockPanel = vscode.window.createWebviewPanel();
            webview.show(mockSymbols, 'typescript');

            // Get the dispose handler and call it
            const disposeHandler = mockPanel.onDidDispose.mock.calls[0][0];
            disposeHandler();

            // Test that showing again creates a new panel
            (vscode.window.createWebviewPanel as jest.Mock).mockClear();
            webview.show(mockSymbols, 'typescript');

            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });
    });

    describe('jumpToLine()', () => {
        it('should jump to the specified line in the active editor', () => {
            webview.show(mockSymbols, 'typescript');

            // Get message handler and simulate message
            const mockPanel = vscode.window.createWebviewPanel();
            const messageHandler = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            messageHandler({ command: 'jumpToLine', line: 10 });

            expect(vscode.Position).toHaveBeenCalledWith(10, 0);
            expect(vscode.Selection).toHaveBeenCalled();
            expect(vscode.Range).toHaveBeenCalled();
        });

        it('should do nothing if no active editor is available', () => {
            // Set active editor to undefined
            (vscode.window as any).activeTextEditor = undefined;

            webview.show(mockSymbols, 'typescript');

            // Get message handler and simulate message
            const mockPanel = vscode.window.createWebviewPanel();
            const messageHandler = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            // This should not throw
            expect(() => {
                messageHandler({ command: 'jumpToLine', line: 10 });
            }).not.toThrow();
        });

        it('should handle invalid line values gracefully', () => {
            webview.show(mockSymbols, 'typescript');

            // Get message handler
            const mockPanel = vscode.window.createWebviewPanel();
            const messageHandler = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            // Simulate receiving a message with undefined line value
            expect(() => {
                messageHandler({ command: 'jumpToLine', line: undefined });
            }).not.toThrow();

            // Simulate receiving a message with null line value
            expect(() => {
                messageHandler({ command: 'jumpToLine', line: null });
            }).not.toThrow();
        });
    });

    describe('getSymbolsHtml()', () => {
        it('should generate correct HTML for symbols', () => {
            webview.show(mockSymbols, 'typescript');

            // Access the private method using type assertion
            const symbolsHtml = (webview as any).getSymbolsHtml(mockSymbols);

            // Check if the HTML contains the symbol names
            expect(symbolsHtml).toContain('TestClass');
            expect(symbolsHtml).toContain('testMethod');
            expect(symbolsHtml).toContain('helperFunction');

            // Check if it properly includes the details
            expect(symbolsHtml).toContain('(arg: string): void');
            expect(symbolsHtml).toContain('(arg: number): number');

            // Check if it includes data-line attributes
            expect(symbolsHtml).toContain('data-line="0"');   // TestClass
            expect(symbolsHtml).toContain('data-line="4"');   // testMethod
            expect(symbolsHtml).toContain('data-line="22"');  // helperFunction
            expect(symbolsHtml).toContain('data-line="26"');  // testVariable
        });

        it('should properly represent nested symbols', () => {
            const nestedSymbols = [
                {
                    name: 'OuterClass',
                    kind: vscode.SymbolKind.Class,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: 15, character: 0 }
                    },
                    selectionRange: {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: 10 }
                    },
                    children: [
                        {
                            name: 'InnerClass',
                            kind: vscode.SymbolKind.Class,
                            range: {
                                start: { line: 5, character: 0 },
                                end: { line: 15, character: 0 }
                            },
                            selectionRange: {
                                start: { line: 5, character: 0 },
                                end: { line: 5, character: 10 }
                            },
                            children: [
                                {
                                    name: 'innerMethod',
                                    kind: vscode.SymbolKind.Method,
                                    range: {
                                        start: { line: 10, character: 0 },
                                        end: { line: 12, character: 0 }
                                    },
                                    selectionRange: {
                                        start: { line: 10, character: 0 },
                                        end: { line: 10, character: 11 }
                                    },
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ];

            const symbolsHtml = (webview as any).getSymbolsHtml(nestedSymbols);

            // Check nested structure
            expect(symbolsHtml).toContain('OuterClass');
            expect(symbolsHtml).toContain('InnerClass');
            expect(symbolsHtml).toContain('innerMethod');
            expect(symbolsHtml).toContain('data-line="0"');   // OuterClass
            expect(symbolsHtml).toContain('data-line="5"');   // InnerClass
            expect(symbolsHtml).toContain('data-line="10"');  // innerMethod
        });
    });

    describe('getStyles() and getClientScript()', () => {
        it('should generate valid CSS styles', () => {
            const styles = (webview as any).getStyles();

            // Check for some basic expected CSS selectors
            expect(styles).toContain('body {');
            expect(styles).toContain('.symbol {');
            expect(styles).toContain('.name {');
            expect(styles).toContain('.detail {');
            expect(styles).toContain('.children {');
            expect(styles).toContain('.icon {');
        });

        it('should generate valid client-side JavaScript', () => {
            const script = (webview as any).getClientScript();

            // Check for key JavaScript components
            expect(script).toContain('const vscode = acquireVsCodeApi()');
            expect(script).toContain('addEventListener(\'click\'');
            expect(script).toContain('vscode.postMessage');
            expect(script).toContain('command: \'jumpToLine\'');
        });
    });

    describe('getWebviewContent()', () => {
        it('should generate complete HTML document', () => {
            const html = (webview as any).getWebviewContent(mockSymbols, 'typescript');

            // Check for essential HTML structure
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html lang="en">');
            expect(html).toContain('<head>');
            expect(html).toContain('<body>');
            expect(html).toContain('<style>');
            expect(html).toContain('<script>');

            // Check for content-specific elements
            expect(html).toContain('Code Overview (typescript)');
            expect(html).toContain('<div id="symbols">');
        });

        it('should properly handle XSS-vulnerable input', () => {
            // Create symbols with potentially dangerous content
            const dangerousSymbols = [
                {
                    name: '<script>alert("XSS")</script>',
                    detail: 'javascript:alert("XSS")',
                    kind: vscode.SymbolKind.Variable,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: 0 }
                    },
                    selectionRange: {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: 0 }
                    },
                    children: []
                }
            ];

            const html = (webview as any).getWebviewContent(dangerousSymbols, 'javascript');

            // The HTML should escape < and > characters
            expect(html).toContain('&lt;script&gt;');
            expect(html).toContain('javascript:alert');
            // The raw script tag should not be present
            expect(html).not.toContain('<script>alert("XSS")</script>');
        });
    });
});
