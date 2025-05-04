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
                range: new vscode.Range(0, 0, 20, 0),
                selectionRange: new vscode.Range(0, 0, 0, 9),
                children: [
                    {
                        name: 'constructor',
                        detail: '',
                        kind: vscode.SymbolKind.Constructor,
                        range: new vscode.Range(1, 0, 3, 0),
                        selectionRange: new vscode.Range(1, 0, 1, 11),
                        children: [],
                    },
                    {
                        name: 'testMethod',
                        detail: '(arg: string): void',
                        kind: vscode.SymbolKind.Method,
                        range: new vscode.Range(4, 0, 6, 0),
                        selectionRange: new vscode.Range(4, 0, 4, 10),
                        children: [],
                    },
                ],
            },
            {
                name: 'helperFunction',
                detail: '(arg: number): number',
                kind: vscode.SymbolKind.Function,
                range: new vscode.Range(21, 0, 23, 0),
                selectionRange: new vscode.Range(21, 0, 21, 14),
                children: [],
            },
        ];

        // Reset mock calls
        jest.clearAllMocks();
    });

    describe('show()', () => {
        it('should create a webview panel when one does not exist', () => {
            webview.show(mockSymbols, 'typescript');

            expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
                'codeOverview',
                'Code Overview',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );
        });

        it('should reuse existing panel if one exists', () => {
            // Show webview first time
            webview.show(mockSymbols, 'typescript');

            // Reset mocks
            jest.clearAllMocks();

            // Show webview second time
            webview.show(mockSymbols, 'typescript');

            // Should not create a new webview panel
            expect(vscode.window.createWebviewPanel).not.toHaveBeenCalled();

            // Should reveal the existing one
            const mockPanel = (vscode.window.createWebviewPanel as jest.Mock).mock.results[0].value;
            expect(mockPanel.reveal).toHaveBeenCalled();
        });

        it('should set HTML content with proper structure', () => {
            webview.show(mockSymbols, 'typescript');

            const mockPanel = (vscode.window.createWebviewPanel as jest.Mock).mock.results[0].value;

            // Check if HTML was set
            expect(mockPanel.webview.html).toBeDefined();
            expect(mockPanel.webview.html.length).toBeGreaterThan(0);

            // Check for key elements in the HTML
            expect(mockPanel.webview.html).toContain('Code Overview (typescript)');
            expect(mockPanel.webview.html).toContain('TestClass');
            expect(mockPanel.webview.html).toContain('testMethod');
            expect(mockPanel.webview.html).toContain('helperFunction');
        });

        it('should register webview message handling', () => {
            webview.show(mockSymbols, 'typescript');

            const mockPanel = (vscode.window.createWebviewPanel as jest.Mock).mock.results[0].value;
            expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
        });

        it('should handle dispose event correctly', () => {
            webview.show(mockSymbols, 'typescript');

            const mockPanel = (vscode.window.createWebviewPanel as jest.Mock).mock.results[0].value;
            const disposeFn = mockPanel.onDidDispose.mock.calls[0][0];

            // Call the dispose function
            disposeFn();

            // Show webview again - it should create a new panel instead of reusing the disposed one
            jest.clearAllMocks();
            webview.show(mockSymbols, 'typescript');

            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });
    });

    describe('jumpToLine()', () => {
        it('should jump to the specified line in the active editor', () => {
            // Call show to initialize the webview
            webview.show(mockSymbols, 'typescript');

            // Get the message handler that was registered
            const mockPanel = (vscode.window.createWebviewPanel as jest.Mock).mock.results[0].value;
            const messageHandler = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            // Simulate receiving a message
            messageHandler({ command: 'jumpToLine', line: 10 });

            // Check if the editor's selection was updated
            const activeEditor = vscode.window.activeTextEditor;
            expect(activeEditor.selection.active.line).toBe(10);
        });

        it('should handle case when no active editor exists', () => {
            // Save the original activeTextEditor
            const originalActiveEditor = vscode.window.activeTextEditor;

            // Set activeTextEditor to undefined to simulate no active editor
            (vscode.window as any).activeTextEditor = undefined;

            // Call show to initialize the webview
            webview.show(mockSymbols, 'typescript');

            // Get the message handler that was registered
            const mockPanel = (vscode.window.createWebviewPanel as jest.Mock).mock.results[0].value;
            const messageHandler = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            // Simulate receiving a message - should not throw error
            expect(() => {
                messageHandler({ command: 'jumpToLine', line: 10 });
            }).not.toThrow();

            // Restore activeTextEditor
            (vscode.window as any).activeTextEditor = originalActiveEditor;
        });

        it('should handle invalid line numbers gracefully', () => {
            // Call show to initialize the webview
            webview.show(mockSymbols, 'typescript');

            // Get the message handler that was registered
            const mockPanel = (vscode.window.createWebviewPanel as jest.Mock).mock.results[0].value;
            const messageHandler = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            // Simulate receiving a message with invalid line number
            expect(() => {
                messageHandler({ command: 'jumpToLine', line: 'not-a-number' });
            }).not.toThrow();
        });
    });

    describe('getSymbolsHtml()', () => {
        it('should generate correct HTML for symbols', () => {
            // We can call this private method using type casting
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
            expect(symbolsHtml).toContain('data-line="21"');  // helperFunction
        });

        it('should handle empty symbol list', () => {
            const symbolsHtml = (webview as any).getSymbolsHtml([]);
            expect(symbolsHtml).toBe('');
        });

        it('should handle symbols with missing properties', () => {
            const incompleteSymbols = [
                {
                    // Missing name
                    detail: 'class',
                    kind: vscode.SymbolKind.Class,
                    range: new vscode.Range(0, 0, 20, 0),
                    selectionRange: new vscode.Range(0, 0, 0, 9),
                    children: []
                }
            ];

            expect(() => {
                (webview as any).getSymbolsHtml(incompleteSymbols);
            }).not.toThrow();
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

        it('should include sanitized content for XSS protection', () => {
            // Create symbols with potentially dangerous content
            const dangerousSymbols = [
                {
                    name: '<script>alert("XSS")</script>',
                    detail: 'class',
                    kind: vscode.SymbolKind.Class,
                    range: new vscode.Range(0, 0, 20, 0),
                    selectionRange: new vscode.Range(0, 0, 0, 9),
                    children: []
                }
            ];

            const html = (webview as any).getWebviewContent(dangerousSymbols, 'typescript');

            // The raw script tag should not be present in the output
            expect(html).not.toContain('<script>alert("XSS")</script>');

            // The content should be properly encoded/escaped
            expect(html).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
        });
    });

    describe('panel lifecycle management', () => {
        it('should handle multiple panel dispose calls gracefully', () => {
            // Show webview to initialize the panel
            webview.show(mockSymbols, 'typescript');

            // Get the dispose handler
            const mockPanel = (vscode.window.createWebviewPanel as jest.Mock).mock.results[0].value;
            const disposeHandler = mockPanel.onDidDispose.mock.calls[0][0];

            // Call dispose multiple times
            disposeHandler();
            disposeHandler();

            // Show webview again - it should create a new panel
            jest.clearAllMocks();
            webview.show(mockSymbols, 'typescript');

            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });
    });
});
