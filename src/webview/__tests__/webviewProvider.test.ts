import * as vscode from 'vscode';
import { WebviewProvider } from '../webviewProvider';

jest.mock('vscode');

describe('WebviewProvider', () => {
    let provider: WebviewProvider;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        mockContext = {
            extensionUri: vscode.Uri.file('/test/extension/path'),
            subscriptions: []
        } as unknown as vscode.ExtensionContext;
        provider = new WebviewProvider();
    });

    describe('style handling', () => {
        it('should return common styles', () => {
            const styles = provider.getCommonStyles();
            expect(styles).toContain('body {');
            expect(styles).toContain('font-family:');
            expect(styles).toContain('background-color:');
        });

        it('should include responsive design styles', () => {
            const styles = provider.getCommonStyles();
            expect(styles).toContain('@media');
            expect(styles).toContain('max-width:');
        });
    });

    describe('webview utilities', () => {
        it('should generate nonce', () => {
            const nonce = provider['getNonce']();
            expect(typeof nonce).toBe('string');
            expect(nonce.length).toBeGreaterThan(0);
        });

        it('should generate unique nonces', () => {
            const nonce1 = provider['getNonce']();
            const nonce2 = provider['getNonce']();
            expect(nonce1).not.toBe(nonce2);
        });
    });

    describe('content security policy', () => {
        it('should get CSP with nonce', () => {
            const nonce = 'test-nonce';
            const csp = provider['getContentSecurityPolicy'](nonce);
            expect(csp).toContain(`'nonce-${nonce}'`);
            expect(csp).toContain('default-src');
            expect(csp).toContain('script-src');
        });

        it('should restrict default sources', () => {
            const csp = provider['getContentSecurityPolicy']('test-nonce');
            expect(csp).toContain("default-src 'none'");
        });
    });

    describe('resource handling', () => {
        it('should get script uri', () => {
            const mockWebview = {
                asWebviewUri: jest.fn().mockReturnValue('mock-uri')
            } as unknown as vscode.Webview;

            const uri = provider['getScriptUri'](mockWebview, mockContext, 'test.js');
            expect(mockWebview.asWebviewUri).toHaveBeenCalled();
            expect(uri).toBe('mock-uri');
        });

        it('should get style uri', () => {
            const mockWebview = {
                asWebviewUri: jest.fn().mockReturnValue('mock-uri')
            } as unknown as vscode.Webview;

            const uri = provider['getStyleUri'](mockWebview, mockContext, 'test.css');
            expect(mockWebview.asWebviewUri).toHaveBeenCalled();
            expect(uri).toBe('mock-uri');
        });
    });

    describe('theme handling', () => {
        it('should detect dark theme', () => {
            (vscode.window.activeColorTheme as any) = { kind: vscode.ColorThemeKind.Dark };
            const theme = provider['getTheme']();
            expect(theme).toBe('dark');
        });

        it('should detect light theme', () => {
            (vscode.window.activeColorTheme as any) = { kind: vscode.ColorThemeKind.Light };
            const theme = provider['getTheme']();
            expect(theme).toBe('light');
        });
    });
});
