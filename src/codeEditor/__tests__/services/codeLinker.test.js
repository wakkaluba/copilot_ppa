const { expect } = require('chai');
const sinon = require('sinon');
const vscode = require('vscode');
const { CodeLinkerService } = require('../../services/codeLinker');

describe('CodeLinkerService', () => {
    let service;
    let sandbox;
    let mockEditor;
    let mockPosition;
    let mockUri;
    let mockStatusBarItem;
    let mockDecorationType;
    let mockSelection;
    let mockDocument;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock VS Code APIs
        mockPosition = {
            line: 5,
            character: 10,
            translate: sandbox.stub().returns({ line: 5, character: 11 }),
            with: sandbox.stub().returns({ line: 5, character: 11 })
        };

        mockUri = {
            fsPath: '/path/to/file.js',
            scheme: 'file',
            toString: sandbox.stub().returns('file:///path/to/file.js')
        };

        mockDocument = {
            getText: sandbox.stub().returns('const test = "sample code";'),
            uri: mockUri,
            lineAt: sandbox.stub().returns({
                text: 'const test = "sample code";',
                range: { start: { line: 5, character: 0 }, end: { line: 5, character: 35 } }
            }),
            positionAt: sandbox.stub().returns(mockPosition),
            offsetAt: sandbox.stub().returns(100),
            getWordRangeAtPosition: sandbox.stub().returns({
                start: { line: 5, character: 10 },
                end: { line: 5, character: 14 },
                isEmpty: sandbox.stub().returns(false),
                contains: sandbox.stub().returns(true)
            })
        };

        mockSelection = {
            isEmpty: false,
            active: mockPosition,
            anchor: mockPosition,
            start: { line: 5, character: 10 },
            end: { line: 5, character: 14 }
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

        // Stub VS Code APIs
        sandbox.stub(vscode.window, 'createStatusBarItem').returns(mockStatusBarItem);
        sandbox.stub(vscode.window, 'createTextEditorDecorationType').returns(mockDecorationType);
        sandbox.stub(vscode.window, 'showInformationMessage');
        sandbox.stub(vscode.window, 'showErrorMessage');
        sandbox.stub(vscode.window, 'showOpenDialog');
        sandbox.stub(vscode.window, 'showTextDocument');
        sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
        sandbox.stub(vscode.workspace, 'openTextDocument');
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().returns({}),
            update: sandbox.stub().resolves()
        });
        sandbox.stub(vscode.Uri, 'parse').returns(mockUri);

        // Create service instance
        service = new CodeLinkerService();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('createCodeLink', () => {
        it('should handle when no editor is active', async () => {
            vscode.window.activeTextEditor = undefined;
            await service.createCodeLink();
            expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
        });

        it('should handle empty selection', async () => {
            mockSelection.isEmpty = true;
            mockDocument.getWordRangeAtPosition.returns(null);
            await service.createCodeLink();
            expect(vscode.window.showErrorMessage.calledWith('No text selected or cursor not on a word')).to.be.true;
        });

        it('should handle canceled file selection', async () => {
            vscode.window.showOpenDialog.resolves(undefined);
            await service.createCodeLink();
            expect(vscode.window.showOpenDialog.called).to.be.true;
        });

        it('should create a code link with proper structure', async () => {
            const targetUri = { ...mockUri, toString: () => 'file:///path/to/target.js' };
            vscode.window.showOpenDialog.resolves([targetUri]);
            vscode.workspace.openTextDocument.resolves(mockDocument);

            await service.createCodeLink();

            const config = vscode.workspace.getConfiguration();
            expect(config.update.called).to.be.true;
            const updateCall = config.update.getCall(0);
            expect(updateCall.args[0]).to.equal('copilot-ppa.codeLinks');
            expect(updateCall.args[1]).to.be.an('object');
            expect(updateCall.args[2]).to.equal(vscode.ConfigurationTarget.Workspace);
        });

        it('should handle errors during link creation', async () => {
            const error = new Error('Test error');
            vscode.window.showOpenDialog.rejects(error);
            await service.createCodeLink();
            expect(vscode.window.showErrorMessage.calledWith(`Failed to create code link: ${error}`)).to.be.true;
        });
    });

    describe('navigateCodeLink', () => {
        it('should handle when no editor is active', async () => {
            vscode.window.activeTextEditor = undefined;
            await service.navigateCodeLink();
            expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
        });

        it('should handle when no link found at position', async () => {
            vscode.workspace.getConfiguration.returns({
                get: sandbox.stub().returns(null)
            });

            await service.navigateCodeLink();
            expect(vscode.window.showInformationMessage.calledWith('No code link found at current position')).to.be.true;
        });

        it('should navigate to linked code successfully', async () => {
            const mockLink = {
                source: {
                    uri: mockUri.toString(),
                    position: {
                        line: 5,
                        character: 10
                    },
                    text: 'test'
                },
                target: {
                    uri: 'file:///path/to/target.js',
                    position: {
                        line: 10,
                        character: 15
                    }
                }
            };

            vscode.workspace.getConfiguration.returns({
                get: sandbox.stub().returns({
                    [`codeLink:${mockUri.toString()}:5:10`]: mockLink
                })
            });

            await service.navigateCodeLink();
            expect(vscode.workspace.openTextDocument.called).to.be.true;
            expect(vscode.window.showTextDocument.called).to.be.true;
            expect(vscode.window.showInformationMessage.calledWith('Navigated to linked code')).to.be.true;
        });

        it('should handle errors during navigation', async () => {
            const mockLink = {
                source: {
                    uri: mockUri.toString(),
                    position: {
                        line: 5,
                        character: 10
                    },
                    text: 'test'
                },
                target: {
                    uri: 'file:///path/to/target.js',
                    position: {
                        line: 10,
                        character: 15
                    }
                }
            };

            vscode.workspace.getConfiguration.returns({
                get: sandbox.stub().returns({
                    [`codeLink:${mockUri.toString()}:5:10`]: mockLink
                })
            });

            const error = new Error('Test error');
            vscode.workspace.openTextDocument.rejects(error);
            await service.navigateCodeLink();
            expect(vscode.window.showErrorMessage.calledWith(`Failed to navigate to linked code: ${error}`)).to.be.true;
        });
    });

    describe('dispose', () => {
        it('should clean up resources', () => {
            const mockStatusBarItems = [
                { dispose: sandbox.stub() },
                { dispose: sandbox.stub() }
            ];
            const mockDecorationTypes = [
                { dispose: sandbox.stub() },
                { dispose: sandbox.stub() }
            ];

            service.statusBarItems = mockStatusBarItems;
            service.decorationTypes = mockDecorationTypes;

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
