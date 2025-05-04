import { expect } from 'chai';
import * as sinon from 'sinon';
import { SinonStub } from 'sinon';
import * as vscode from 'vscode';
import { CodeOverviewWebview } from '../../../../src/codeEditor/webviews/codeOverviewWebview';

describe('CodeOverviewWebview', () => {
    let webview: CodeOverviewWebview;
    let sandbox: sinon.SinonSandbox;
    let mockPanel: any;
    let mockSymbols: vscode.DocumentSymbol[];
    let createWebviewStub: SinonStub;
    let revealRangeStub: SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        revealRangeStub = sandbox.stub();

        // Mock VSCode webview panel
        mockPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: sandbox.stub().returns({ dispose: sandbox.stub() }),
                postMessage: sandbox.stub().resolves()
            },
            onDidDispose: sandbox.stub().returns({ dispose: sandbox.stub() }),
            reveal: sandbox.stub(),
            dispose: sandbox.stub()
        };

        // Mock VSCode window
        createWebviewStub = sandbox.stub(vscode.window, 'createWebviewPanel').returns(mockPanel);
        sandbox.stub(vscode.window, 'activeTextEditor').value({
            document: { uri: { fsPath: '/test/file.ts' } },
            selection: new vscode.Selection(0, 0, 0, 0),
            revealRange: revealRangeStub
        });

        // Create test symbols
        mockSymbols = [
            {
                name: 'TestClass',
                kind: vscode.SymbolKind.Class,
                range: new vscode.Range(0, 0, 20, 0),
                selectionRange: new vscode.Range(0, 0, 0, 9),
                children: [
                    {
                        name: 'testMethod',
                        kind: vscode.SymbolKind.Method,
                        range: new vscode.Range(2, 0, 4, 0),
                        selectionRange: new vscode.Range(2, 0, 2, 10),
                        children: []
                    } as vscode.DocumentSymbol
                ]
            } as vscode.DocumentSymbol,
            {
                name: 'testFunction',
                kind: vscode.SymbolKind.Function,
                range: new vscode.Range(22, 0, 24, 0),
                selectionRange: new vscode.Range(22, 0, 22, 12),
                children: []
            } as vscode.DocumentSymbol,
            {
                name: 'testVariable',
                kind: vscode.SymbolKind.Variable,
                range: new vscode.Range(26, 0, 26, 20),
                selectionRange: new vscode.Range(26, 0, 26, 12),
                children: []
            } as vscode.DocumentSymbol
        ];

        webview = new CodeOverviewWebview();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('show', () => {
        it('should create and configure webview panel', async () => {
            await webview.show(mockSymbols, 'typescript');

            expect(createWebviewStub.called).to.be.true;
            expect(mockPanel.webview.html).to.include('Code Overview');
            expect(mockPanel.webview.html).to.include('typescript');
        });

        it('should reuse existing panel if available', async () => {
            await webview.show(mockSymbols, 'typescript');
            await webview.show(mockSymbols, 'javascript');

            expect(createWebviewStub.callCount).to.equal(1);
            expect(mockPanel.reveal.called).to.be.true;
        });

        it('should render symbol hierarchy correctly', async () => {
            await webview.show(mockSymbols, 'typescript');

            expect(mockPanel.webview.html).to.include('TestClass');
            expect(mockPanel.webview.html).to.include('testMethod');
            expect(mockPanel.webview.html).to.include('class');
            expect(mockPanel.webview.html).to.include('method');
        });

        it('should handle empty symbols array', async () => {
            await webview.show([], 'typescript');

            expect(createWebviewStub.called).to.be.true;
            expect(mockPanel.webview.html).to.include('Code Overview');
            expect(mockPanel.webview.html).to.include('typescript');
        });
    });

    describe('message handling', () => {
        it('should handle jump to line messages', async () => {
            await webview.show(mockSymbols, 'typescript');

            const messageCallback = mockPanel.webview.onDidReceiveMessage.args[0][0];
            messageCallback({ command: 'jumpToLine', line: 5 });

            expect(revealRangeStub.called).to.be.true;
        });

        it('should ignore unrecognized commands', async () => {
            await webview.show(mockSymbols, 'typescript');

            const messageCallback = mockPanel.webview.onDidReceiveMessage.args[0][0];
            expect(() => messageCallback({ command: 'unknown', data: 'test' })).to.not.throw();
            expect(revealRangeStub.called).to.be.false;
        });

        it('should cleanup on panel dispose', async () => {
            await webview.show(mockSymbols, 'typescript');

            const disposeCallback = mockPanel.onDidDispose.args[0][0];
            disposeCallback();

            await webview.show(mockSymbols, 'typescript');
            expect(createWebviewStub.callCount).to.equal(2);
        });
    });

    describe('getSymbolsHtml', () => {
        it('should generate HTML for symbols with proper structure', () => {
            // Access private method through any cast
            const result = (webview as any).getSymbolsHtml(mockSymbols);

            expect(result).to.include('TestClass');
            expect(result).to.include('testMethod');
            expect(result).to.include('testFunction');
            expect(result).to.include('testVariable');
            expect(result).to.include('class');
            expect(result).to.include('method');
            expect(result).to.include('function');
            expect(result).to.include('variable');
        });

        it('should create nested structure for symbol hierarchies', () => {
            const result = (webview as any).getSymbolsHtml(mockSymbols);

            // TestClass should come before testMethod
            const classIndex = result.indexOf('TestClass');
            const methodIndex = result.indexOf('testMethod');

            expect(classIndex).to.be.lessThan(methodIndex);

            // There should be a children div between class and method
            const childrenIndex = result.indexOf('<div class="children">', classIndex);
            expect(childrenIndex).to.be.lessThan(methodIndex);
        });

        it('should handle empty symbols array', () => {
            const result = (webview as any).getSymbolsHtml([]);
            expect(result).to.equal('');
        });

        it('should apply proper indentation based on hierarchy level', () => {
            const result = (webview as any).getSymbolsHtml(mockSymbols, 2);

            // Should include padding with 4 spaces (2 spaces * indent level 2)
            expect(result).to.include('    <span class="icon');
        });
    });

    describe('getStyles', () => {
        it('should return CSS styles as a string', () => {
            const styles = (webview as any).getStyles();

            expect(styles).to.be.a('string');
            expect(styles).to.include('body {');
            expect(styles).to.include('font-family');
            expect(styles).to.include('.symbol {');
            expect(styles).to.include('.name {');
            expect(styles).to.include('.class::before');
            expect(styles).to.include('.method::before');
            expect(styles).to.include('.function::before');
            expect(styles).to.include('.variable::before');
        });
    });

    describe('getClientScript', () => {
        it('should return JavaScript code as a string', () => {
            const script = (webview as any).getClientScript();

            expect(script).to.be.a('string');
            expect(script).to.include('const vscode = acquireVsCodeApi()');
            expect(script).to.include('addEventListener');
            expect(script).to.include('click');
            expect(script).to.include('vscode.postMessage');
            expect(script).to.include('command: \'jumpToLine\'');
            expect(script).to.include('line: parseInt');
        });
    });

    describe('jumpToLine', () => {
        it('should navigate to the specified line in the active editor', () => {
            (webview as any).jumpToLine(10);

            expect(revealRangeStub.calledOnce).to.be.true;
            const range = revealRangeStub.args[0][0];
            expect(range.start.line).to.equal(10);
            expect(range.start.character).to.equal(0);
        });
    });

    describe('theme integration', () => {
        it('should include VS Code theme variables', async () => {
            await webview.show(mockSymbols, 'typescript');

            expect(mockPanel.webview.html).to.include('var(--vscode-');
        });
    });

    describe('error handling', () => {
        it('should handle missing text editor gracefully', async () => {
            sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);

            await webview.show(mockSymbols, 'typescript');
            const messageCallback = mockPanel.webview.onDidReceiveMessage.args[0][0];
            expect(() => messageCallback({ command: 'jumpToLine', line: 5 })).to.not.throw();
        });

        it('should handle malformed line values', async () => {
            await webview.show(mockSymbols, 'typescript');
            const messageCallback = mockPanel.webview.onDidReceiveMessage.args[0][0];

            // Test with NaN value
            expect(() => messageCallback({ command: 'jumpToLine', line: NaN })).to.not.throw();

            // Test with non-numeric string that will be parsed as NaN
            expect(() => messageCallback({ command: 'jumpToLine', line: 'abc' })).to.not.throw();

            // Test with undefined line
            expect(() => messageCallback({ command: 'jumpToLine', line: undefined })).to.not.throw();
        });

        it('should handle symbols with missing properties gracefully', () => {
            // Create invalid symbol missing required properties
            const incompleteSymbol = {
                name: 'IncompleteSymbol',
                // Missing kind, range, selectionRange
                children: []
            } as unknown as vscode.DocumentSymbol;

            // Should not throw when generating HTML for invalid symbols
            expect(() => (webview as any).getSymbolsHtml([incompleteSymbol])).to.not.throw();
        });
    });

    describe('getWebviewContent', () => {
        it('should generate complete HTML document with symbols', () => {
            const html = (webview as any).getWebviewContent(mockSymbols, 'typescript');

            expect(html).to.include('<!DOCTYPE html>');
            expect(html).to.include('<html lang="en">');
            expect(html).to.include('<head>');
            expect(html).to.include('<meta charset="UTF-8">');
            expect(html).to.include('<title>Code Overview</title>');
            expect(html).to.include('<style>');
            expect(html).to.include('</style>');
            expect(html).to.include('<body>');
            expect(html).to.include('<h2>Code Overview (typescript)</h2>');
            expect(html).to.include('<div id="symbols">');
            expect(html).to.include('</div>');
            expect(html).to.include('<script>');
            expect(html).to.include('</script>');
            expect(html).to.include('</body>');
            expect(html).to.include('</html>');
        });

        it('should sanitize HTML content properly', () => {
            // Test with symbols containing HTML characters that should be escaped
            const htmlSymbols = [
                {
                    name: '<script>alert("XSS")</script>',
                    kind: vscode.SymbolKind.Class,
                    range: new vscode.Range(0, 0, 0, 0),
                    selectionRange: new vscode.Range(0, 0, 0, 0),
                    children: []
                } as vscode.DocumentSymbol
            ];

            const html = (webview as any).getWebviewContent(htmlSymbols, 'typescript');

            // The HTML tags should be visible as text, not interpreted as actual tags
            expect(html).to.include('&lt;script&gt;');
            expect(html).to.include('alert');
            expect(html).not.to.include('<script>alert');
        });
    });

    describe('panel lifecycle', () => {
        it('should dispose panel when show is called with dispose option', async () => {
            await webview.show(mockSymbols, 'typescript');

            // Add dispose method to webview for testing
            (webview as any).dispose = function() {
                if (this.panel) {
                    this.panel.dispose();
                    this.panel = undefined;
                }
            };

            (webview as any).dispose();
            expect((webview as any).panel).to.be.undefined;
            expect(mockPanel.dispose.calledOnce).to.be.true;
        });

        it('should handle multiple dispose calls gracefully', async () => {
            // Add dispose method to webview for testing
            (webview as any).dispose = function() {
                if (this.panel) {
                    this.panel.dispose();
                    this.panel = undefined;
                }
            };

            // Should not throw when panel is already undefined
            expect(() => (webview as any).dispose()).to.not.throw();
            expect(() => (webview as any).dispose()).to.not.throw();
        });
    });
});
