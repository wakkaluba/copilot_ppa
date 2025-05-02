import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeLinkerService } from '../../../../src/codeEditor/services/codeLinker';
import { CodeLink } from '../../../../src/codeEditor/types';

describe('CodeLinkerService - TypeScript', () => {
  let service: CodeLinkerService;
  let sandbox: sinon.SinonSandbox;
  let mockContext: any;
  let mockEditor: any;
  let mockPosition: vscode.Position;
  let mockUri: vscode.Uri;
  let mockStatusBarItem: vscode.StatusBarItem;
  let mockDecorationType: vscode.TextEditorDecorationType;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code APIs
    mockPosition = { line: 5, character: 10 } as vscode.Position;
    mockUri = { fsPath: '/path/to/file.ts', scheme: 'file' } as vscode.Uri;

    mockEditor = {
      document: {
        getText: sandbox.stub().returns('const test: string = "sample code";'),
        uri: mockUri,
        lineAt: sandbox.stub().returns({
          text: 'const test: string = "sample code";',
          range: { start: { line: 5, character: 0 }, end: { line: 5, character: 35 } }
        }),
        positionAt: sandbox.stub().returns(mockPosition),
        offsetAt: sandbox.stub().returns(100)
      },
      selection: {
        isEmpty: false,
        active: mockPosition,
        anchor: mockPosition
      },
      revealRange: sandbox.stub(),
      setDecorations: sandbox.stub()
    };

    mockStatusBarItem = {
      text: '',
      tooltip: '',
      command: '',
      show: sandbox.stub(),
      hide: sandbox.stub(),
      dispose: sandbox.stub()
    } as unknown as vscode.StatusBarItem;

    mockDecorationType = {
      dispose: sandbox.stub()
    } as unknown as vscode.TextEditorDecorationType;

    sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
    sandbox.stub(vscode.window, 'showTextDocument').resolves(mockEditor);
    sandbox.stub(vscode.window, 'createStatusBarItem').returns(mockStatusBarItem);
    sandbox.stub(vscode.window, 'showInformationMessage').resolves();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox.stub(vscode.workspace, 'openTextDocument').resolves(mockEditor.document as vscode.TextDocument);
    sandbox.stub(vscode.commands, 'executeCommand').resolves();
    sandbox.stub(vscode.languages, 'createDiagnosticCollection').returns({
      set: sandbox.stub(),
      clear: sandbox.stub(),
      dispose: sandbox.stub()
    });
    sandbox.stub(vscode.window, 'createTextEditorDecorationType').returns(mockDecorationType);

    // Mock context
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: sandbox.stub().returns([]),
        update: sandbox.stub().resolves()
      }
    };

    // Create service instance
    service = new CodeLinkerService();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createCodeLink', () => {
    it('should create a code link from the current selection', async () => {
      // Mock getting selection
      sandbox.stub(service, 'getSelectionOrWordAtCursor').returns({
        text: 'test',
        range: { start: mockPosition, end: mockPosition } as vscode.Range
      });

      // Mock saving the link
      sandbox.stub(service, 'saveCodeLink').resolves();

      await service.createCodeLink();

      expect(service.getSelectionOrWordAtCursor.calledWith(mockEditor)).to.be.true;
      expect(service.saveCodeLink.called).to.be.true;
      expect(vscode.window.showInformationMessage.called).to.be.true;
    });

    it('should handle when no text is selected', async () => {
      sandbox.stub(service, 'getSelectionOrWordAtCursor').returns(null);

      await service.createCodeLink();

      expect(vscode.window.showInformationMessage.calledWith('No text selected or cursor not on a word.')).to.be.true;
    });

    it('should handle errors when creating a code link', async () => {
      sandbox.stub(service, 'getSelectionOrWordAtCursor').throws(new Error('Test error'));

      await service.createCodeLink();

      expect(vscode.window.showErrorMessage.called).to.be.true;
    });
  });

  describe('navigateCodeLink', () => {
    it('should navigate to a code link at the current position', async () => {
      // Mock finding a link
      const mockLink: CodeLink = {
        sourceUri: mockUri,
        sourcePosition: mockPosition,
        targetUri: mockUri,
        targetPosition: mockPosition,
        text: 'test'
      };
      sandbox.stub(service, 'findLinkAtPosition').returns(mockLink);

      // Mock navigating to the target
      sandbox.stub(service, 'navigateToTarget').resolves();

      await service.navigateCodeLink();

      expect(service.findLinkAtPosition.called).to.be.true;
      expect(service.navigateToTarget.calledWith(mockLink, mockEditor)).to.be.true;
    });

    it('should handle when no link is found at the current position', async () => {
      sandbox.stub(service, 'findLinkAtPosition').returns(null);

      await service.navigateCodeLink();

      expect(vscode.window.showInformationMessage.calledWith('No code link found at the current position.')).to.be.true;
    });

    it('should handle errors when navigating to a code link', async () => {
      sandbox.stub(service, 'findLinkAtPosition').throws(new Error('Test error'));

      await service.navigateCodeLink();

      expect(vscode.window.showErrorMessage.called).to.be.true;
    });
  });

  describe('getSelectionOrWordAtCursor', () => {
    it('should return the selected text and range when text is selected', () => {
      mockEditor.selection.isEmpty = false;
      mockEditor.document.getText.withArgs(mockEditor.selection).returns('selectedText');

      const result = service.getSelectionOrWordAtCursor(mockEditor);

      expect(result!.text).to.equal('selectedText');
      expect(result!.range).to.equal(mockEditor.selection);
    });

    it('should return the word at cursor when no text is selected', () => {
      mockEditor.selection.isEmpty = true;
      (vscode.window.activeTextEditor as any) = mockEditor;

      // Mock document.getWordRangeAtPosition
      const wordRange = { start: mockPosition, end: mockPosition } as vscode.Range;
      sandbox.stub(mockEditor.document, 'getWordRangeAtPosition').returns(wordRange);
      mockEditor.document.getText.withArgs(wordRange).returns('cursorWord');

      const result = service.getSelectionOrWordAtCursor(mockEditor);

      expect(result!.text).to.equal('cursorWord');
      expect(result!.range).to.equal(wordRange);
    });

    it('should return null when no text is selected and no word is at cursor', () => {
      mockEditor.selection.isEmpty = true;
      sandbox.stub(mockEditor.document, 'getWordRangeAtPosition').returns(null);

      const result = service.getSelectionOrWordAtCursor(mockEditor);

      expect(result).to.be.null;
    });
  });

  describe('findLinkAtPosition', () => {
    it('should find a link at the given position', () => {
      const links: CodeLink[] = [
        {
          sourceUri: mockUri,
          sourcePosition: { line: 5, character: 10 } as vscode.Position,
          targetUri: { fsPath: '/path/to/target.ts' } as vscode.Uri,
          targetPosition: { line: 10, character: 15 } as vscode.Position,
          text: 'test'
        }
      ];

      service.links = links;
      const position = { line: 5, character: 10 } as vscode.Position;

      const result = service.findLinkAtPosition(mockUri, position);

      expect(result).to.deep.equal(links[0]);
    });

    it('should return null when no link is found at the position', () => {
      service.links = [];
      const position = { line: 5, character: 10 } as vscode.Position;

      const result = service.findLinkAtPosition(mockUri, position);

      expect(result).to.be.null;
    });
  });

  describe('navigateToTarget', () => {
    it('should open the target document and reveal the target position', async () => {
      const link: CodeLink = {
        sourceUri: mockUri,
        sourcePosition: mockPosition,
        targetUri: { fsPath: '/path/to/target.ts' } as vscode.Uri,
        targetPosition: { line: 10, character: 15 } as vscode.Position,
        text: 'test'
      };

      await service.navigateToTarget(link, mockEditor);

      expect(vscode.workspace.openTextDocument.calledWith(link.targetUri)).to.be.true;
      expect(vscode.window.showTextDocument.called).to.be.true;
      expect(mockEditor.revealRange.called).to.be.true;
    });

    it('should handle errors when navigating to a target', async () => {
      const link: CodeLink = {
        sourceUri: mockUri,
        sourcePosition: mockPosition,
        targetUri: { fsPath: '/invalid/path.ts' } as vscode.Uri,
        targetPosition: { line: 10, character: 15 } as vscode.Position,
        text: 'test'
      };

      (vscode.workspace.openTextDocument as sinon.SinonStub).rejects(new Error('File not found'));

      await service.navigateToTarget(link, mockEditor);

      expect(vscode.window.showErrorMessage.called).to.be.true;
    });
  });

  describe('createStatusBarItem', () => {
    it('should create a status bar item with the correct properties', () => {
      const statusBar = service.createStatusBarItem();

      expect(statusBar).to.equal(mockStatusBarItem);
      expect(statusBar.text).to.include('Code Link');
      expect(statusBar.command).to.be.a('string');
      expect(statusBar.show.called).to.be.true;
    });
  });

  describe('createHighlightDecoration', () => {
    it('should create a text editor decoration type with the correct properties', () => {
      const decoration = service.createHighlightDecoration();

      expect(decoration).to.equal(mockDecorationType);
      expect(vscode.window.createTextEditorDecorationType.called).to.be.true;
    });
  });

  describe('saveCodeLink', () => {
    it('should save a code link to the links array', async () => {
      const link: CodeLink = {
        sourceUri: mockUri,
        sourcePosition: mockPosition,
        targetUri: mockUri,
        targetPosition: mockPosition,
        text: 'test'
      };

      service.links = [];
      await service.saveCodeLink(link);

      expect(service.links).to.include(link);
    });

    it('should update the decoration for the saved link', async () => {
      const link: CodeLink = {
        sourceUri: mockUri,
        sourcePosition: mockPosition,
        targetUri: mockUri,
        targetPosition: mockPosition,
        text: 'test'
      };

      service.decoration = mockDecorationType;
      await service.saveCodeLink(link);

      expect(mockEditor.setDecorations.called).to.be.true;
    });
  });
});
