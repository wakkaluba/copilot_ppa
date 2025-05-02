import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeLinkerService } from '../../../../src/codeEditor/services/codeLinker';
import { CodeLink } from '../../../../src/codeEditor/types';

describe('CodeLinkerService', () => {
    let service: CodeLinkerService;
    let sandbox: sinon.SinonSandbox;
    let mockUri: vscode.Uri;
    let mockDocument: any;
    let mockEditor: any;
    let mockPosition: any;
    let mockSelection: any;
    let mockStatusBarItem: any;
    let mockDecorationType: any;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockUri = {
            scheme: 'file',
            path: '/path/to/file.ts',
            toString: () => 'file:///path/to/file.ts'
        } as vscode.Uri;

        mockPosition = {
            line: 5,
            character: 10
        };

        mockSelection = {
            active: mockPosition,
            anchor: mockPosition,
            start: { line: 5, character: 10 },
            end: { line: 5, character: 14 },
            isEmpty: false
        };

        mockDocument = {
            uri: mockUri,
            getText: sandbox.stub().returns('const test = "sample code";'),
            fileName: '/path/to/file.ts',
            lineAt: sandbox.stub().returns({
                text: 'const test = "sample code";',
                range: { start: { line: 5, character: 0 }, end: { line: 5, character: 30 } }
            }),
            getWordRangeAtPosition: sandbox.stub().returns({
                start: { line: 5, character: 10 },
                end: { line: 5, character: 14 }
            })
        };

        mockEditor = {
            document: mockDocument,
            selection: mockSelection,
            setDecorations: sandbox.stub(),
            revealRange: sandbox.stub()
        };

        mockStatusBarItem = {
            text: '',
            show: sandbox.stub(),
            dispose: sandbox.stub()
        };

        mockDecorationType = {
            dispose: sandbox.stub()
        };

        sandbox.stub(vscode.window, 'createStatusBarItem').returns(mockStatusBarItem);
        sandbox.stub(vscode.window, 'createTextEditorDecorationType').returns(mockDecorationType);
        sandbox.stub(vscode.window, 'showInformationMessage');
        sandbox.stub(vscode.window, 'showErrorMessage');
        sandbox.stub(vscode.window, 'showOpenDialog');
        sandbox.stub(vscode.window, 'showTextDocument');
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(vscode.workspace, 'openTextDocument');
        sandbox.stub(vscode.workspace, 'getConfiguration');

        service = new CodeLinkerService();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('createCodeLink', () => {
        it('should handle when no editor is active', async () => {
            (vscode.window.activeTextEditor as any) = undefined;
            await service.createCodeLink();
            expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
        });

        it('should handle empty selection', async () => {
            mockSelection.isEmpty = true;
            await service.createCodeLink();
            expect(vscode.window.showErrorMessage.calledWith('No text selected or cursor not on a word')).to.be.true;
        });

        it('should handle canceled file selection', async () => {
            (vscode.window.showOpenDialog as sinon.SinonStub).resolves(undefined);
            await service.createCodeLink();
            expect(vscode.window.showOpenDialog.called).to.be.true;
        });

        it('should create and save code link', async () => {
            const targetUri = { ...mockUri, toString: () => 'file:///path/to/target.ts' };
            (vscode.window.showOpenDialog as sinon.SinonStub).resolves([targetUri]);
            (vscode.workspace.openTextDocument as sinon.SinonStub).resolves(mockDocument);

            await service.createCodeLink();

            expect(vscode.window.showOpenDialog.called).to.be.true;
            expect(vscode.workspace.openTextDocument.called).to.be.true;
            expect(vscode.window.showInformationMessage.calledWith('Code link created successfully')).to.be.true;
        });

        it('should handle errors during link creation', async () => {
            (vscode.window.showOpenDialog as sinon.SinonStub).rejects(new Error('Test error'));
            await service.createCodeLink();
            expect(vscode.window.showErrorMessage.calledWith('Failed to create code link: Error: Test error')).to.be.true;
        });
    });

    describe('navigateCodeLink', () => {
        it('should handle when no editor is active', async () => {
            (vscode.window.activeTextEditor as any) = undefined;
            await service.navigateCodeLink();
            expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
        });

        it('should handle when no link found at position', async () => {
            sandbox.stub(service as any, 'findLinkAtPosition').resolves(null);
            await service.navigateCodeLink();
            expect(vscode.window.showInformationMessage.calledWith('No code link found at current position')).to.be.true;
        });

        it('should navigate to link target', async () => {
            const mockLink: CodeLink = {
                source: {
                    uri: mockUri.toString(),
                    position: mockPosition,
                    text: 'test'
                },
                target: {
                    uri: 'file:///path/to/target.ts',
                    position: { line: 10, character: 15 }
                }
            };

            sandbox.stub(service as any, 'findLinkAtPosition').resolves(mockLink);
            (vscode.workspace.openTextDocument as sinon.SinonStub).resolves(mockDocument);
            (vscode.window.showTextDocument as sinon.SinonStub).resolves(mockEditor);

            await service.navigateCodeLink();

            expect(vscode.workspace.openTextDocument.called).to.be.true;
            expect(vscode.window.showTextDocument.called).to.be.true;
            expect(vscode.window.showInformationMessage.calledWith('Navigated to linked code')).to.be.true;
        });

        it('should handle errors during navigation', async () => {
            const mockLink: CodeLink = {
                source: {
                    uri: mockUri.toString(),
                    position: mockPosition,
                    text: 'test'
                },
                target: {
                    uri: 'file:///path/to/target.ts',
                    position: { line: 10, character: 15 }
                }
            };

            sandbox.stub(service as any, 'findLinkAtPosition').resolves(mockLink);
            (vscode.workspace.openTextDocument as sinon.SinonStub).rejects(new Error('Test error'));

            await service.navigateCodeLink();
            expect(vscode.window.showErrorMessage.calledWith('Failed to navigate to linked code: Error: Test error')).to.be.true;
        });
    });

    describe('dispose', () => {
        it('should clean up resources', () => {
            const mockStatusBarItems = [
                { dispose: sandbox.stub() } as unknown as vscode.StatusBarItem,
                { dispose: sandbox.stub() } as unknown as vscode.StatusBarItem
            ];

            const mockDecorationTypes = [
                { dispose: sandbox.stub() } as unknown as vscode.TextEditorDecorationType,
                { dispose: sandbox.stub() } as unknown as vscode.TextEditorDecorationType
            ];

            (service as any).statusBarItems = mockStatusBarItems;
            (service as any).decorationTypes = mockDecorationTypes;

            service.dispose();

            mockStatusBarItems.forEach(item => {
                expect(item.dispose.called).to.be.true;
            });

            mockDecorationTypes.forEach(decoration => {
                expect(decoration.dispose.called).to.be.true;
            });
        });
    });
});
