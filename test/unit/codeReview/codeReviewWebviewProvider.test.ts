import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeReviewWebviewProvider } from '../../../src/codeReview/codeReviewWebviewProvider';
import { CodeReviewService } from '../../../src/codeReview/services/CodeReviewService';
import { ILogger } from '../../../src/logging/ILogger';

describe('CodeReviewWebviewProvider', () => {
    let provider: CodeReviewWebviewProvider;
    let sandbox: sinon.SinonSandbox;
    let mockLogger: sinon.SinonStubbedInstance<ILogger>;
    let mockContext: vscode.ExtensionContext;
    let mockService: Partial<CodeReviewService>;
    let mockWebviewView: vscode.WebviewView;
    let mockWebview: vscode.Webview;
    let resolveContext: vscode.WebviewViewResolveContext<unknown>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create mock objects
        mockLogger = sandbox.createStubInstance<ILogger>({} as any);

        mockService = {
            getWebviewHtml: sandbox.stub().returns('<html>Test</html>'),
            handleWebviewMessage: sandbox.stub().resolves({ command: 'test' })
        };

        // Set up VS Code mocks
        mockWebview = {
            onDidReceiveMessage: sandbox.stub().returns({ dispose: sandbox.stub() }),
            postMessage: sandbox.stub().resolves(true),
            options: {
                enableScripts: false,
                localResourceRoots: []
            },
            html: '',
            asWebviewUri: sandbox.stub(),
            cspSource: ''
        } as any;

        mockWebviewView = {
            webview: mockWebview,
            onDidDispose: sandbox.stub().returns({ dispose: sandbox.stub() }),
            title: 'Code Review',
            description: '',
            visible: true,
            show: sandbox.stub(),
            dispose: sandbox.stub()
        } as any;

        mockContext = {
            extensionUri: vscode.Uri.parse('file:///extension/path'),
            subscriptions: [],
            workspaceState: {
                get: sandbox.stub(),
                update: sandbox.stub().resolves()
            }
        } as any;

        resolveContext = {
            state: undefined
        };

        provider = new CodeReviewWebviewProvider(
            mockLogger,
            mockContext.extensionUri,
            mockContext,
            mockService as CodeReviewService
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('resolveWebviewView', () => {
        it('should initialize the webview properly', async () => {
            await provider.resolveWebviewView(mockWebviewView, resolveContext, {} as vscode.CancellationToken);

            expect(mockWebviewView.webview.options.enableScripts).to.be.true;
            expect(mockWebviewView.webview.options.localResourceRoots).to.be.an('array');
            expect(mockService.getWebviewHtml).to.have.been.called;
            expect(mockWebview.onDidReceiveMessage).to.have.been.called;
        });

        it('should handle webview initialization errors', async () => {
            const error = new Error('HTML generation failed');
            (mockService.getWebviewHtml as sinon.SinonStub).throws(error);

            try {
                await provider.resolveWebviewView(mockWebviewView, resolveContext, {} as vscode.CancellationToken);
                expect.fail('Should have thrown an error');
            } catch (e) {
                expect(e).to.equal(error);
                expect(mockLogger.error).to.have.been.calledWith('Error resolving webview:', error);
            }
        });
    });

    describe('message handling', () => {
        let messageHandler: (message: any) => Promise<void>;

        beforeEach(async () => {
            await provider.resolveWebviewView(mockWebviewView, resolveContext, {} as vscode.CancellationToken);
            messageHandler = (mockWebview.onDidReceiveMessage as sinon.SinonStub).args[0][0];
        });

        it('should handle webview messages', async () => {
            const testMessage = { command: 'test' };
            await messageHandler(testMessage);
            expect(mockService.handleWebviewMessage).to.have.been.calledWith(testMessage);
        });

        it('should handle message processing errors', async () => {
            const error = new Error('Processing failed');
            (mockService.handleWebviewMessage as sinon.SinonStub).rejects(error);

            await messageHandler({ command: 'test' });
            expect(mockLogger.error).to.have.been.calledWith('Error handling webview message:', error);
        });

        it('should handle null responses from service', async () => {
            (mockService.handleWebviewMessage as sinon.SinonStub).resolves(null);
            await messageHandler({ command: 'test' });
            expect(mockWebview.postMessage).not.to.have.been.called;
        });
    });

    describe('cleanup', () => {
        it('should clean up resources when view is disposed', async () => {
            await provider.resolveWebviewView(mockWebviewView, resolveContext, {} as vscode.CancellationToken);

            const disposeSpy = sandbox.spy();
            (mockWebview.onDidReceiveMessage as sinon.SinonStub).returns({ dispose: disposeSpy });

            const disposeHandler = (mockWebviewView.onDidDispose as sinon.SinonStub).args[0][0];
            disposeHandler();

            expect(disposeSpy).to.have.been.called;
        });

        it('should handle multiple dispose calls gracefully', async () => {
            await provider.resolveWebviewView(mockWebviewView, resolveContext, {} as vscode.CancellationToken);

            const disposeSpy = sandbox.spy();
            (mockWebview.onDidReceiveMessage as sinon.SinonStub).returns({ dispose: disposeSpy });

            const disposeHandler = (mockWebviewView.onDidDispose as sinon.SinonStub).args[0][0];
            disposeHandler();
            disposeHandler();

            expect(disposeSpy).to.have.been.calledOnce;
        });
    });
});
