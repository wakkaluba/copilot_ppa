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
    });

    describe('message handling', () => {
        it('should handle jump to line messages', async () => {
            await webview.show(mockSymbols, 'typescript');

            const messageCallback = mockPanel.webview.onDidReceiveMessage.args[0][0];
            messageCallback({ command: 'jumpToLine', line: 5 });

            expect(revealRangeStub.called).to.be.true;
        });

        it('should cleanup on panel dispose', async () => {
            await webview.show(mockSymbols, 'typescript');

            const disposeCallback = mockPanel.onDidDispose.args[0][0];
            disposeCallback();

            await webview.show(mockSymbols, 'typescript');
            expect(createWebviewStub.callCount).to.equal(2);
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

            const messageCallback = mockPanel.webview.onDidReceiveMessage.args[0][0];
            expect(() => messageCallback({ command: 'jumpToLine', line: 5 })).to.not.throw();
        });
    });
});
