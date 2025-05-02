const { expect } = require('chai');
const sinon = require('sinon');
const vscode = require('vscode');
const { CodeLinkerService } = require('../../../../src/codeEditor/services/codeLinker');

describe('CodeLinkerService - JavaScript', () => {
  let service;
  let sandbox;
  let mockContext;
  let mockEditor;
  let mockPosition;
  let mockUri;
  let mockStatusBarItem;
  let mockDecorationType;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code APIs
    mockPosition = { line: 5, character: 10 };
    mockUri = { fsPath: '/path/to/file.js', scheme: 'file' };

    mockEditor = {
      document: {
        getText: sandbox.stub().returns('const test = "sample code";'),
        uri: mockUri,
        lineAt: sandbox.stub().returns({
          text: 'const test = "sample code";',
          range: { start: { line: 5, character: 0 }, end: { line: 5, character: 30 } }
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
    };

    mockDecorationType = {
      dispose: sandbox.stub()
    };

    sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
    sandbox.stub(vscode.window, 'showTextDocument').resolves(mockEditor);
    sandbox.stub(vscode.window, 'createStatusBarItem').returns(mockStatusBarItem);
    sandbox.stub(vscode.window, 'showInformationMessage').resolves();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox.stub(vscode.workspace, 'openTextDocument').resolves(mockEditor.document);
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
        range: { start: mockPosition, end: mockPosition }
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
      const mockLink = {
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

      expect(result.text).to.equal('selectedText');
      expect(result.range).to.equal(mockEditor.selection);
    });

    it('should return the word at cursor when no text is selected', () => {
      mockEditor.selection.isEmpty = true;
      sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);

      // Mock document.getWordRangeAtPosition
      const wordRange = { start: mockPosition, end: mockPosition };
      sandbox.stub(mockEditor.document, 'getWordRangeAtPosition').returns(wordRange);
      mockEditor.document.getText.withArgs(wordRange).returns('cursorWord');

      const result = service.getSelectionOrWordAtCursor(mockEditor);

      expect(result.text).to.equal('cursorWord');
      expect(result.range).to.equal(wordRange);
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
      const links = [
        {
          sourceUri: mockUri,
          sourcePosition: { line: 5, character: 10 },
          targetUri: { fsPath: '/path/to/target.js' },
          targetPosition: { line: 10, character: 15 },
          text: 'test'
        }
      ];

      service.links = links;
      const position = { line: 5, character: 10 };

      const result = service.findLinkAtPosition(mockUri, position);

      expect(result).to.deep.equal(links[0]);
    });

    it('should return null when no link is found at the position', () => {
      service.links = [];
      const position = { line: 5, character: 10 };

      const result = service.findLinkAtPosition(mockUri, position);

      expect(result).to.be.null;
    });
  });

  describe('navigateToTarget', () => {
    it('should open the target document and reveal the target position', async () => {
      const link = {
        targetUri: { fsPath: '/path/to/target.js' },
        targetPosition: { line: 10, character: 15 }
      };

      await service.navigateToTarget(link, mockEditor);

      expect(vscode.workspace.openTextDocument.calledWith(link.targetUri)).to.be.true;
      expect(vscode.window.showTextDocument.called).to.be.true;
      expect(mockEditor.revealRange.called).to.be.true;
    });

    it('should handle errors when navigating to a target', async () => {
      const link = {
        targetUri: { fsPath: '/invalid/path.js' },
        targetPosition: { line: 10, character: 15 }
      };

      vscode.workspace.openTextDocument.rejects(new Error('File not found'));

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
      const link = {
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
      const link = {
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
