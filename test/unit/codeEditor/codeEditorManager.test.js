const { expect } = require('chai');
const sinon = require('sinon');
const { CodeEditorManager } = require('../../../src/codeEditor/codeEditorManager');

describe('CodeEditorManager - JavaScript', () => {
  let manager;
  let mockContext;
  let mockWindow;
  let mockWorkspace;
  let mockTextDocument;
  let mockTextEditor;
  let mockRange;
  let mockPosition;
  let mockSelection;
  let mockCommands;
  let mockUri;

  beforeEach(() => {
    // Create mock position and range classes
    mockPosition = {
      line: 0,
      character: 0,
      translate: sinon.stub().returns({ line: 1, character: 0 }),
      with: sinon.stub().returns({ line: 0, character: 5 })
    };

    mockRange = {
      start: { line: 0, character: 0 },
      end: { line: 0, character: 10 },
      isEmpty: sinon.stub().returns(false),
      with: sinon.stub().returns({ start: { line: 0, character: 0 }, end: { line: 1, character: 0 } })
    };

    mockSelection = {
      anchor: { line: 0, character: 0 },
      active: { line: 0, character: 10 },
      isEmpty: sinon.stub().returns(false)
    };

    // Create mock text document
    mockTextDocument = {
      getText: sinon.stub().returns('const test = "Hello World";'),
      lineAt: sinon.stub().returns({ text: 'const test = "Hello World";' }),
      fileName: '/path/to/file.js',
      languageId: 'javascript',
      uri: { fsPath: '/path/to/file.js' },
      save: sinon.stub().resolves(true),
      lineCount: 10,
      positionAt: sinon.stub().returns(mockPosition),
      offsetAt: sinon.stub().returns(5),
      getWordRangeAtPosition: sinon.stub().returns(mockRange)
    };

    // Create mock editor
    mockTextEditor = {
      document: mockTextDocument,
      selection: mockSelection,
      edit: sinon.stub().callsFake(async (callback) => {
        callback({
          replace: sinon.stub(),
          insert: sinon.stub(),
          delete: sinon.stub()
        });
        return true;
      }),
      revealRange: sinon.stub(),
      setDecorations: sinon.stub(),
      selections: [mockSelection],
      visibleRanges: [mockRange],
      viewColumn: 1
    };

    // Mock VS Code's window, workspace, and commands
    mockWindow = {
      activeTextEditor: mockTextEditor,
      showInformationMessage: sinon.stub(),
      showErrorMessage: sinon.stub(),
      showWarningMessage: sinon.stub(),
      createTextEditorDecorationType: sinon.stub().returns({
        dispose: sinon.stub()
      }),
      showTextDocument: sinon.stub().resolves(mockTextEditor)
    };

    mockWorkspace = {
      openTextDocument: sinon.stub().resolves(mockTextDocument),
      applyEdit: sinon.stub().resolves(true),
      saveAll: sinon.stub().resolves(true),
      textDocuments: [mockTextDocument],
      onDidChangeTextDocument: sinon.stub().returns({ dispose: sinon.stub() }),
      onDidOpenTextDocument: sinon.stub().returns({ dispose: sinon.stub() }),
      onDidCloseTextDocument: sinon.stub().returns({ dispose: sinon.stub() })
    };

    mockCommands = {
      executeCommand: sinon.stub().resolves()
    };

    mockUri = {
      file: sinon.stub().returns({ fsPath: '/path/to/file.js' }),
      parse: sinon.stub().returns({ fsPath: '/path/to/file.js' })
    };

    // Create mock VS Code namespace
    global.vscode = {
      window: mockWindow,
      workspace: mockWorkspace,
      commands: mockCommands,
      Uri: mockUri,
      Position: function(line, character) {
        return { line, character, translate: mockPosition.translate, with: mockPosition.with };
      },
      Range: function(startLine, startChar, endLine, endChar) {
        return {
          start: { line: startLine, character: startChar },
          end: { line: endLine, character: endChar },
          isEmpty: mockRange.isEmpty,
          with: mockRange.with
        };
      },
      Selection: function(anchorLine, anchorChar, activeLine, activeChar) {
        return {
          anchor: { line: anchorLine, character: anchorChar },
          active: { line: activeLine, character: activeChar },
          isEmpty: mockSelection.isEmpty
        };
      },
      TextEditorRevealType: {
        Default: 0,
        InCenter: 1,
        InCenterIfOutsideViewport: 2,
        AtTop: 3
      },
      ViewColumn: {
        Active: -1,
        Beside: -2,
        One: 1,
        Two: 2
      }
    };

    // Create mock extension context
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: sinon.stub(),
        update: sinon.stub()
      }
    };

    // Create manager instance
    manager = new CodeEditorManager(mockContext);
  });

  afterEach(() => {
    sinon.restore();
    delete global.vscode;
  });

  describe('Initialization', () => {
    it('should initialize properly', () => {
      expect(manager).to.be.instanceOf(CodeEditorManager);
    });

    it('should register with extension context', () => {
      expect(mockContext.subscriptions).to.not.be.empty;
    });
  });

  describe('Editor Operations', () => {
    it('should get the active text editor', () => {
      const editor = manager.getActiveEditor();
      expect(editor).to.equal(mockTextEditor);
    });

    it('should get the current document', () => {
      const document = manager.getCurrentDocument();
      expect(document).to.equal(mockTextDocument);
    });

    it('should return null when no editor is active', () => {
      mockWindow.activeTextEditor = null;
      const editor = manager.getActiveEditor();
      expect(editor).to.be.null;
    });

    it('should check if an editor is active', () => {
      expect(manager.isEditorActive()).to.be.true;

      mockWindow.activeTextEditor = null;
      expect(manager.isEditorActive()).to.be.false;
    });
  });

  describe('Text Operations', () => {
    it('should get the selected text', () => {
      mockTextDocument.getText.withArgs(mockSelection).returns('Selected Text');
      const text = manager.getSelectedText();
      expect(text).to.equal('Selected Text');
    });

    it('should handle empty selection when getting selected text', () => {
      mockSelection.isEmpty.returns(true);
      const text = manager.getSelectedText();
      expect(text).to.equal('');
    });

    it('should insert text at the current position', async () => {
      const success = await manager.insertText('New Text');
      expect(success).to.be.true;
      expect(mockTextEditor.edit.called).to.be.true;
    });

    it('should handle errors when inserting text', async () => {
      mockTextEditor.edit.rejects(new Error('Edit error'));
      const success = await manager.insertText('New Text');
      expect(success).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should replace selected text', async () => {
      const success = await manager.replaceSelection('Replacement Text');
      expect(success).to.be.true;
      expect(mockTextEditor.edit.called).to.be.true;
    });

    it('should handle errors when replacing text', async () => {
      mockTextEditor.edit.rejects(new Error('Replace error'));
      const success = await manager.replaceSelection('Replacement Text');
      expect(success).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });
  });

  describe('Document Operations', () => {
    it('should get the current file path', () => {
      const path = manager.getCurrentFilePath();
      expect(path).to.equal('/path/to/file.js');
    });

    it('should return empty string when no document is open', () => {
      mockWindow.activeTextEditor = null;
      const path = manager.getCurrentFilePath();
      expect(path).to.equal('');
    });

    it('should get the current language', () => {
      const language = manager.getCurrentLanguage();
      expect(language).to.equal('javascript');
    });

    it('should return empty string when no document is open for language', () => {
      mockWindow.activeTextEditor = null;
      const language = manager.getCurrentLanguage();
      expect(language).to.equal('');
    });

    it('should open a document', async () => {
      const editor = await manager.openDocument('/path/to/file.js');
      expect(editor).to.equal(mockTextEditor);
      expect(mockWorkspace.openTextDocument.called).to.be.true;
      expect(mockWindow.showTextDocument.called).to.be.true;
    });

    it('should handle errors when opening a document', async () => {
      mockWorkspace.openTextDocument.rejects(new Error('Open error'));

      try {
        await manager.openDocument('/path/to/file.js');
        // If we get here, the test should fail
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(mockWindow.showErrorMessage.called).to.be.true;
      }
    });

    it('should save the current document', async () => {
      const success = await manager.saveDocument();
      expect(success).to.be.true;
      expect(mockTextDocument.save.called).to.be.true;
    });

    it('should handle no active document when saving', async () => {
      mockWindow.activeTextEditor = null;
      const success = await manager.saveDocument();
      expect(success).to.be.false;
    });

    it('should save all documents', async () => {
      const success = await manager.saveAllDocuments();
      expect(success).to.be.true;
      expect(mockWorkspace.saveAll.called).to.be.true;
    });

    it('should format the document', async () => {
      const success = await manager.formatDocument();
      expect(success).to.be.true;
      expect(mockCommands.executeCommand.calledWith('editor.action.formatDocument')).to.be.true;
    });

    it('should handle errors when formatting the document', async () => {
      mockCommands.executeCommand.rejects(new Error('Format error'));
      const success = await manager.formatDocument();
      expect(success).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });
  });

  describe('Navigation', () => {
    it('should reveal a specific range', () => {
      manager.revealRange(mockRange);
      expect(mockTextEditor.revealRange.called).to.be.true;
    });

    it('should handle no active editor when revealing range', () => {
      mockWindow.activeTextEditor = null;
      manager.revealRange(mockRange);
      expect(mockTextEditor.revealRange.called).to.be.false;
    });

    it('should set cursor position', async () => {
      const success = await manager.setCursorPosition(5, 10);
      expect(success).to.be.true;
      expect(mockTextEditor.selections).to.have.lengthOf(1);
    });

    it('should handle no active editor when setting cursor position', async () => {
      mockWindow.activeTextEditor = null;
      const success = await manager.setCursorPosition(5, 10);
      expect(success).to.be.false;
    });

    it('should navigate to a specific position in a file', async () => {
      const success = await manager.navigateToPosition('/path/to/file.js', 5, 10);
      expect(success).to.be.true;
      expect(mockWorkspace.openTextDocument.called).to.be.true;
      expect(mockWindow.showTextDocument.called).to.be.true;
      expect(mockTextEditor.selections).to.have.lengthOf(1);
    });

    it('should handle errors when navigating to position', async () => {
      mockWorkspace.openTextDocument.rejects(new Error('Navigation error'));

      const success = await manager.navigateToPosition('/path/to/file.js', 5, 10);
      expect(success).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });
  });

  describe('Command Execution', () => {
    it('should execute VS Code commands', async () => {
      const result = await manager.executeCommand('command.id', 'arg1', 'arg2');
      expect(result).to.not.be.undefined;
      expect(mockCommands.executeCommand.calledWith('command.id', 'arg1', 'arg2')).to.be.true;
    });

    it('should handle errors when executing commands', async () => {
      mockCommands.executeCommand.rejects(new Error('Command error'));

      try {
        await manager.executeCommand('command.id');
        // If we get here, the test should fail
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(mockWindow.showErrorMessage.called).to.be.true;
      }
    });
  });

  describe('Resource Management', () => {
    it('should register a disposable', () => {
      const disposable = { dispose: sinon.stub() };
      manager.registerDisposable(disposable);
      expect(mockContext.subscriptions).to.include(disposable);
    });

    it('should dispose resources', () => {
      const disposable1 = { dispose: sinon.stub() };
      const disposable2 = { dispose: sinon.stub() };

      manager.registerDisposable(disposable1);
      manager.registerDisposable(disposable2);

      manager.dispose();

      expect(disposable1.dispose.called).to.be.true;
      expect(disposable2.dispose.called).to.be.true;
      expect(mockContext.subscriptions).to.be.empty;
    });
  });
});
