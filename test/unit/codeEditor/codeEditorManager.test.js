const { expect } = require('chai');
const sinon = require('sinon');
const vscode = require('vscode');
const { CodeEditorManager } = require('../../../src/codeEditor/codeEditorManager');

describe('CodeEditorManager - JavaScript', () => {
  let manager;
  let mockContext;
  let mockEditor;
  let mockDocument;
  let mockSelection;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code APIs
    mockSelection = {
      active: { line: 5, character: 10 },
      anchor: { line: 5, character: 20 },
      isEmpty: false,
      isReversed: false,
      isSingleLine: true
    };

    mockDocument = {
      fileName: 'test.js',
      languageId: 'javascript',
      lineAt: sandbox.stub().returns({
        text: 'const test = "sample code";',
        range: { start: { line: 5, character: 0 }, end: { line: 5, character: 30 } }
      }),
      getText: sandbox.stub().returns('const test = "sample code";'),
      uri: { fsPath: '/path/to/test.js', scheme: 'file' },
      version: 1
    };

    mockEditor = {
      document: mockDocument,
      selection: mockSelection,
      selections: [mockSelection],
      edit: sandbox.stub().resolves(true),
      setDecorations: sandbox.stub(),
      revealRange: sandbox.stub(),
      insertSnippet: sandbox.stub().resolves(true),
      options: { tabSize: 2, insertSpaces: true }
    };

    sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
    sandbox.stub(vscode.window, 'showTextDocument').resolves(mockEditor);
    sandbox.stub(vscode.window, 'showInformationMessage').resolves();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox.stub(vscode.workspace, 'openTextDocument').resolves(mockDocument);

    // Context mock
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: sandbox.stub().returns(null),
        update: sandbox.stub().resolves()
      }
    };

    // Create manager instance
    manager = new CodeEditorManager(mockContext);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Constructor', () => {
    it('should initialize with the provided context', () => {
      expect(manager.context).to.equal(mockContext);
      expect(manager.disposables).to.be.an('array');
    });

    it('should register commands on initialization', () => {
      expect(mockContext.subscriptions.length).to.be.greaterThan(0);
    });
  });

  describe('getActiveEditor', () => {
    it('should return the active text editor', () => {
      const editor = manager.getActiveEditor();
      expect(editor).to.equal(mockEditor);
    });

    it('should return null when no editor is active', () => {
      vscode.window.activeTextEditor = undefined;
      const editor = manager.getActiveEditor();
      expect(editor).to.be.null;
    });
  });

  describe('getSelectedText', () => {
    it('should return the selected text from the active editor', () => {
      mockEditor.document.getText.withArgs(mockSelection).returns('sample code');
      const text = manager.getSelectedText();
      expect(text).to.equal('sample code');
    });

    it('should return empty string when no text is selected', () => {
      mockSelection.isEmpty = true;
      const text = manager.getSelectedText();
      expect(text).to.equal('');
    });

    it('should return empty string when no editor is active', () => {
      vscode.window.activeTextEditor = undefined;
      const text = manager.getSelectedText();
      expect(text).to.equal('');
    });
  });

  describe('openDocument', () => {
    it('should open a document and show it in the editor', async () => {
      const path = '/path/to/file.js';
      await manager.openDocument(path);

      expect(vscode.workspace.openTextDocument.calledWith(path)).to.be.true;
      expect(vscode.window.showTextDocument.calledWith(mockDocument)).to.be.true;
    });

    it('should handle errors when opening a document', async () => {
      const path = '/invalid/path.js';
      vscode.workspace.openTextDocument.rejects(new Error('File not found'));

      try {
        await manager.openDocument(path);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('File not found');
      }
    });
  });

  describe('insertTextAtCursor', () => {
    it('should insert text at the current cursor position', async () => {
      const text = 'inserted text';
      await manager.insertTextAtCursor(text);

      expect(mockEditor.edit.called).to.be.true;
    });

    it('should handle errors when inserting text', async () => {
      const text = 'inserted text';
      mockEditor.edit.rejects(new Error('Insertion failed'));

      try {
        await manager.insertTextAtCursor(text);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Insertion failed');
      }
    });

    it('should do nothing when no editor is active', async () => {
      vscode.window.activeTextEditor = undefined;
      await manager.insertTextAtCursor('text');
      expect(mockEditor.edit.called).to.be.false;
    });
  });

  describe('replaceSelection', () => {
    it('should replace the selected text with the provided text', async () => {
      const text = 'replacement text';
      await manager.replaceSelection(text);

      expect(mockEditor.edit.called).to.be.true;
    });

    it('should do nothing when no editor is active', async () => {
      vscode.window.activeTextEditor = undefined;
      await manager.replaceSelection('text');
      expect(mockEditor.edit.called).to.be.false;
    });
  });

  describe('navigateToLine', () => {
    it('should navigate to the specified line number', () => {
      const line = 10;
      manager.navigateToLine(line);

      expect(mockEditor.revealRange.called).to.be.true;
    });

    it('should do nothing when no editor is active', () => {
      vscode.window.activeTextEditor = undefined;
      manager.navigateToLine(10);
      expect(mockEditor.revealRange.called).to.be.false;
    });
  });

  describe('getDocumentLanguage', () => {
    it('should return the language id of the active document', () => {
      const language = manager.getDocumentLanguage();
      expect(language).to.equal('javascript');
    });

    it('should return empty string when no editor is active', () => {
      vscode.window.activeTextEditor = undefined;
      const language = manager.getDocumentLanguage();
      expect(language).to.equal('');
    });
  });

  describe('getFilePath', () => {
    it('should return the file path of the active document', () => {
      const path = manager.getFilePath();
      expect(path).to.equal('/path/to/test.js');
    });

    it('should return empty string when no editor is active', () => {
      vscode.window.activeTextEditor = undefined;
      const path = manager.getFilePath();
      expect(path).to.equal('');
    });
  });

  describe('formatDocument', () => {
    it('should format the current document', async () => {
      sandbox.stub(vscode.commands, 'executeCommand').resolves();

      await manager.formatDocument();

      expect(vscode.commands.executeCommand.calledWith('editor.action.formatDocument')).to.be.true;
    });
  });

  describe('saveDocument', () => {
    it('should save the current document', async () => {
      mockDocument.save = sandbox.stub().resolves(true);

      await manager.saveDocument();

      expect(mockDocument.save.called).to.be.true;
    });

    it('should do nothing when no editor is active', async () => {
      vscode.window.activeTextEditor = undefined;
      await manager.saveDocument();
      // No error should be thrown
    });
  });

  describe('executeCommand', () => {
    it('should execute a VS Code command', async () => {
      sandbox.stub(vscode.commands, 'executeCommand').resolves('result');

      const result = await manager.executeCommand('command.id', 'arg1', 'arg2');

      expect(vscode.commands.executeCommand.calledWith('command.id', 'arg1', 'arg2')).to.be.true;
      expect(result).to.equal('result');
    });
  });

  describe('dispose', () => {
    it('should dispose all registered disposables', () => {
      const disposable1 = { dispose: sandbox.stub() };
      const disposable2 = { dispose: sandbox.stub() };

      manager.disposables.push(disposable1, disposable2);
      manager.dispose();

      expect(disposable1.dispose.called).to.be.true;
      expect(disposable2.dispose.called).to.be.true;
      expect(manager.disposables.length).to.equal(0);
    });
  });
});
