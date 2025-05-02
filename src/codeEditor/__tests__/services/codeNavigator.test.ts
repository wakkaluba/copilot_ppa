import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeNavigatorService } from '../../services/codeNavigator';
import { CodeOverviewWebview } from '../../webviews/codeOverviewWebview';

describe('CodeNavigatorService', () => {
  let service: CodeNavigatorService;
  let sandbox: sinon.SinonSandbox;
  let mockEditor: any;
  let mockPosition: vscode.Position;
  let mockUri: vscode.Uri;
  let mockWebview: sinon.SinonStubbedInstance<CodeOverviewWebview>;
  let mockSymbols: vscode.DocumentSymbol[];
  let mockLocations: vscode.Location[];
  let mockDocument: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code APIs
    mockPosition = {
      line: 5,
      character: 10,
      translate: sandbox.stub().returns({ line: 5, character: 11 }),
      with: sandbox.stub().returns({ line: 5, character: 11 })
    } as unknown as vscode.Position;

    mockUri = {
      fsPath: '/path/to/file.ts',
      scheme: 'file',
      toString: sandbox.stub().returns('file:///path/to/file.ts')
    } as unknown as vscode.Uri;

    mockDocument = {
      getText: sandbox.stub().returns('const test: string = "sample code";'),
      uri: mockUri,
      lineAt: sandbox.stub().returns({
        text: 'const test: string = "sample code";',
        range: { start: { line: 5, character: 0 }, end: { line: 5, character: 35 } }
      }),
      languageId: 'typescript'
    };

    mockEditor = {
      document: mockDocument,
      selection: { active: mockPosition },
      revealRange: sandbox.stub()
    };

    mockSymbols = [
      {
        name: 'TestClass',
        detail: 'class',
        kind: vscode.SymbolKind.Class,
        range: { start: { line: 1, character: 0 }, end: { line: 10, character: 1 } },
        selectionRange: { start: { line: 1, character: 0 }, end: { line: 1, character: 9 } },
        children: [
          {
            name: 'testMethod',
            detail: 'method',
            kind: vscode.SymbolKind.Method,
            range: { start: { line: 2, character: 2 }, end: { line: 4, character: 3 } },
            selectionRange: { start: { line: 2, character: 2 }, end: { line: 2, character: 12 } },
            children: []
          }
        ]
      }
    ] as unknown as vscode.DocumentSymbol[];

    mockLocations = [
      {
        uri: mockUri,
        range: { start: { line: 5, character: 10 }, end: { line: 5, character: 15 } }
      },
      {
        uri: mockUri,
        range: { start: { line: 8, character: 5 }, end: { line: 8, character: 10 } }
      }
    ] as unknown as vscode.Location[];

    // Mock the CodeOverviewWebview
    mockWebview = sandbox.createStubInstance(CodeOverviewWebview);

    // Mock vscode namespace
    sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox.stub(vscode.window, 'showInformationMessage').resolves();
    sandbox.stub(vscode.window, 'showTextDocument').resolves(mockEditor);
    sandbox.stub(vscode.window, 'showQuickPick').resolves({
      label: 'Test reference',
      description: 'Test file - Line 6',
      reference: mockLocations[0]
    });
    sandbox.stub(vscode.workspace, 'openTextDocument').resolves(mockDocument as unknown as vscode.TextDocument);
    sandbox.stub(vscode.workspace, 'asRelativePath').returns('test/file.ts');
    sandbox.stub(vscode.commands, 'executeCommand').resolves([]);

    // Create service instance
    service = new CodeNavigatorService();
    (service as any).webviewProvider = mockWebview;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('showCodeOverview', () => {
    it('should show a code overview with symbols', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).resolves(mockSymbols);

      await service.showCodeOverview();

      expect(vscode.commands.executeCommand.calledWith(
        'vscode.executeDocumentSymbolProvider',
        mockUri
      )).to.be.true;
      expect(mockWebview.show.calledWith(mockSymbols, 'typescript')).to.be.true;
    });

    it('should show error when no editor is active', async () => {
      (vscode.window.activeTextEditor as any) = undefined;

      await service.showCodeOverview();

      expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
    });

    it('should show information when no symbols are found', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).resolves([]);

      await service.showCodeOverview();

      expect(vscode.window.showInformationMessage.calledWith('No symbols found in this file')).to.be.true;
    });

    it('should show information when symbols provider returns null', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).resolves(null);

      await service.showCodeOverview();

      expect(vscode.window.showInformationMessage.calledWith('No symbols found in this file')).to.be.true;
    });
  });

  describe('findReferences', () => {
    it('should find references and allow navigation', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).resolves(mockLocations);

      await service.findReferences();

      expect(vscode.commands.executeCommand.calledWith(
        'vscode.executeReferenceProvider',
        mockUri,
        mockPosition
      )).to.be.true;
      expect(vscode.window.showQuickPick.called).to.be.true;
      expect(vscode.workspace.openTextDocument.called).to.be.true;
      expect(vscode.window.showTextDocument.called).to.be.true;
    });

    it('should show error when no editor is active', async () => {
      (vscode.window.activeTextEditor as any) = undefined;

      await service.findReferences();

      expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
    });

    it('should show information when no references are found', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).resolves([]);

      await service.findReferences();

      expect(vscode.window.showInformationMessage.calledWith('No references found')).to.be.true;
    });

    it('should show information when reference provider returns null', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).resolves(null);

      await service.findReferences();

      expect(vscode.window.showInformationMessage.calledWith('No references found')).to.be.true;
    });

    it('should not navigate when user does not select a reference', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).resolves(mockLocations);
      (vscode.window.showQuickPick as sinon.SinonStub).resolves(undefined);

      await service.findReferences();

      expect(vscode.window.showQuickPick.called).to.be.true;
      expect(vscode.window.showTextDocument.called).to.be.false;
    });

    it('should handle errors during reference finding', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).rejects(new Error('Test error'));

      await service.findReferences();

      expect(vscode.window.showErrorMessage.calledWith('Error finding references: Error: Test error')).to.be.true;
    });
  });
});
