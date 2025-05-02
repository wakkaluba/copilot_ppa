import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeNavigatorService } from '../../../../src/codeEditor/services/codeNavigator';

describe('CodeNavigatorService - TypeScript', () => {
  let service: CodeNavigatorService;
  let sandbox: sinon.SinonSandbox;
  let mockWebview: any;
  let mockEditor: any;
  let mockPanel: any;
  let mockLocation: vscode.Location;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code APIs
    mockWebview = {
      onDidReceiveMessage: sandbox.stub(),
      postMessage: sandbox.stub().resolves(),
      html: '',
      options: {}
    };

    mockPanel = {
      webview: mockWebview,
      onDidDispose: sandbox.stub(),
      onDidChangeViewState: sandbox.stub(),
      reveal: sandbox.stub(),
      dispose: sandbox.stub(),
      title: 'Code Overview',
      visible: true
    };

    mockEditor = {
      document: {
        getText: sandbox.stub().returns('const test: string = "sample code";'),
        uri: { fsPath: '/path/to/file.ts', toString: () => 'file:///path/to/file.ts' },
        fileName: '/path/to/file.ts',
        languageId: 'typescript'
      },
      selection: {
        active: { line: 5, character: 10 },
        isEmpty: false
      }
    };

    mockLocation = {
      uri: { fsPath: '/path/to/reference.ts', toString: () => 'file:///path/to/reference.ts' } as vscode.Uri,
      range: { start: { line: 10, character: 5 }, end: { line: 10, character: 15 } }
    } as vscode.Location;

    sandbox.stub(vscode.window, 'createWebviewPanel').returns(mockPanel);
    sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
    sandbox.stub(vscode.window, 'showTextDocument').resolves(mockEditor);
    sandbox.stub(vscode.window, 'showInformationMessage').resolves();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox.stub(vscode.commands, 'executeCommand').resolves([mockLocation]);

    // Create service instance
    service = new CodeNavigatorService();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('showCodeOverview', () => {
    it('should create a webview panel to display code overview', async () => {
      await service.showCodeOverview();

      expect(vscode.window.createWebviewPanel.called).to.be.true;
      expect(mockPanel.webview.postMessage.called).to.be.true;

      // Check that some HTML is set as the webview content
      expect(mockPanel.webview.html).to.be.a('string');
      expect(mockPanel.webview.html.length).to.be.greaterThan(0);
    });

    it('should handle document structure and send to webview', async () => {
      // Simulate more complex code structure
      mockEditor.document.getText.returns(`
        function test(): number {
          const x: number = 1;
          return x + 2;
        }

        class Example {
          private value: number;

          constructor() {
            this.value = 10;
          }

          getValue(): number {
            return this.value;
          }
        }
      `);

      await service.showCodeOverview();

      expect(mockPanel.webview.postMessage.called).to.be.true;
      // Check that the message contains code structure info
      const postMessageCall = mockPanel.webview.postMessage.getCall(0);
      const message = postMessageCall.args[0];
      expect(message).to.have.property('command', 'setCodeStructure');
      expect(message).to.have.property('codeStructure');
    });

    it('should handle when no text editor is active', async () => {
      (vscode.window.activeTextEditor as any) = undefined;

      await service.showCodeOverview();

      expect(vscode.window.showInformationMessage.calledWith('No active text editor.')).to.be.true;
      expect(vscode.window.createWebviewPanel.called).to.be.false;
    });

    it('should handle errors during overview generation', async () => {
      (vscode.window.createWebviewPanel as sinon.SinonStub).throws(new Error('Failed to create webview'));

      await service.showCodeOverview();

      expect(vscode.window.showErrorMessage.called).to.be.true;
    });
  });

  describe('findReferences', () => {
    it('should find and display references to the selected code', async () => {
      await service.findReferences();

      expect(vscode.commands.executeCommand.calledWith('editor.action.referenceSearch.trigger')).to.be.true;
      expect(vscode.window.showTextDocument.called).to.be.true;
    });

    it('should navigate to the first reference found', async () => {
      await service.findReferences();

      // After finding references, it should open the first reference
      expect(vscode.window.showTextDocument.calledWith(mockLocation.uri)).to.be.true;
    });

    it('should handle when no references are found', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).resolves([]);

      await service.findReferences();

      expect(vscode.window.showInformationMessage.calledWith('No references found.')).to.be.true;
    });

    it('should handle when no location is returned', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).resolves(null);

      await service.findReferences();

      expect(vscode.window.showInformationMessage.calledWith('No references found.')).to.be.true;
    });

    it('should handle when no text editor is active', async () => {
      (vscode.window.activeTextEditor as any) = undefined;

      await service.findReferences();

      expect(vscode.window.showInformationMessage.calledWith('No active text editor.')).to.be.true;
    });

    it('should handle errors during reference search', async () => {
      (vscode.commands.executeCommand as sinon.SinonStub).rejects(new Error('Reference search failed'));

      await service.findReferences();

      expect(vscode.window.showErrorMessage.called).to.be.true;
    });
  });
});
