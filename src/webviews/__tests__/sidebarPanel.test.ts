import * as path from 'path';
import * as vscode from 'vscode';
import { SidebarPanel } from '../sidebarPanel';

jest.mock('vscode');

describe('SidebarPanel', () => {
    let panel: SidebarPanel;
    let mockWebviewPanel: any;
    let mockExtensionUri: vscode.Uri;

    beforeEach(() => {
        mockWebviewPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: jest.fn(),
                postMessage: jest.fn(),
                asWebviewUri: jest.fn(uri => uri)
            },
            onDidDispose: jest.fn(),
            reveal: jest.fn(),
            dispose: jest.fn()
        };

        mockExtensionUri = vscode.Uri.file('/test/extension');
        (vscode.window.createWebviewPanel as jest.Mock).mockReturnValue(mockWebviewPanel);
    });

    describe('panel creation', () => {
        it('should create webview panel with correct options', () => {
            SidebarPanel.createOrShow(mockExtensionUri);

            expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
                SidebarPanel.viewType,
                'Local LLM Agent',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    localResourceRoots: [expect.any(vscode.Uri)]
                }
            );
        });

        it('should reuse existing panel', () => {
            const firstPanel = SidebarPanel.createOrShow(mockExtensionUri);
            const secondPanel = SidebarPanel.createOrShow(mockExtensionUri);

            expect(firstPanel).toBe(secondPanel);
            expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
            expect(mockWebviewPanel.reveal).toHaveBeenCalled();
        });
    });

    describe('webview content', () => {
        beforeEach(() => {
            panel = SidebarPanel.createOrShow(mockExtensionUri);
        });

        it('should set up initial HTML content', () => {
            expect(mockWebviewPanel.webview.html).toBeTruthy();
            expect(mockWebviewPanel.webview.html).toContain('<!DOCTYPE html>');
            expect(mockWebviewPanel.webview.html).toContain('Content-Security-Policy');
        });

        it('should include required script and style resources', () => {
            expect(mockWebviewPanel.webview.html).toContain('script');
            expect(mockWebviewPanel.webview.html).toContain('link');
            expect(mockWebviewPanel.webview.asWebviewUri).toHaveBeenCalled();
        });
    });

    describe('message handling', () => {
        beforeEach(() => {
            panel = SidebarPanel.createOrShow(mockExtensionUri);
        });

        it('should handle message posting', () => {
            const message = { type: 'test', content: 'test content' };
            panel.postMessage(message);

            expect(mockWebviewPanel.webview.postMessage).toHaveBeenCalledWith(message);
        });

        it('should handle chat clearing', () => {
            panel.clearChat();

            expect(mockWebviewPanel.webview.postMessage).toHaveBeenCalledWith({
                type: 'clearChat'
            });
        });

        it('should set up message reception', () => {
            const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0];
            messageHandler({ command: 'testCommand', text: 'test' });

            // Verify message handling behavior based on your implementation
            expect(mockWebviewPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
        });
    });

    describe('URI handling', () => {
        beforeEach(() => {
            panel = SidebarPanel.createOrShow(mockExtensionUri);
        });

        it('should get correct script path', () => {
            const scriptPathOnDisk = panel['getScriptPath']();
            expect(path.basename(scriptPathOnDisk.fsPath)).toBe('main.js');
        });

        it('should get correct style path', () => {
            const stylePathOnDisk = panel['getStylePath']();
            expect(path.basename(stylePathOnDisk.fsPath)).toBe('style.css');
        });
    });

    describe('panel revival', () => {
        it('should handle panel revival', () => {
            const revivedPanel = SidebarPanel.revive(mockWebviewPanel, mockExtensionUri);
            expect(revivedPanel).toBeInstanceOf(SidebarPanel);
        });

        it('should set up revived panel correctly', () => {
            const revivedPanel = SidebarPanel.revive(mockWebviewPanel, mockExtensionUri);
            expect(mockWebviewPanel.webview.html).toBeTruthy();
            expect(mockWebviewPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
        });
    });

    describe('cleanup', () => {
        beforeEach(() => {
            panel = SidebarPanel.createOrShow(mockExtensionUri);
        });

        it('should dispose panel correctly', () => {
            const disposeHandler = mockWebviewPanel.onDidDispose.mock.calls[0][0];
            disposeHandler();

            expect(SidebarPanel['currentPanel']).toBeUndefined();
        });

        it('should clean up resources on disposal', () => {
            SidebarPanel['currentPanel'] = panel;
            panel.dispose();

            expect(mockWebviewPanel.dispose).toHaveBeenCalled();
            expect(SidebarPanel['currentPanel']).toBeUndefined();
        });
    });

    describe('html generation', () => {
        beforeEach(() => {
            panel = SidebarPanel.createOrShow(mockExtensionUri);
        });

        it('should generate valid HTML', () => {
            const html = panel['_getHtmlForWebview'](mockWebviewPanel.webview);

            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html>');
            expect(html).toContain('</html>');
            expect(html).toContain('<head>');
            expect(html).toContain('</head>');
            expect(html).toContain('<body>');
            expect(html).toContain('</body>');
        });

        it('should include security headers', () => {
            const html = panel['_getHtmlForWebview'](mockWebviewPanel.webview);

            expect(html).toContain('Content-Security-Policy');
            expect(html).toContain('meta charset="UTF-8"');
        });

        it('should include required resources', () => {
            const html = panel['_getHtmlForWebview'](mockWebviewPanel.webview);

            expect(html).toContain('<script');
            expect(html).toContain('<link');
            expect(html).toContain('stylesheet');
        });
    });
});
