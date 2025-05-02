import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeEditorManager } from '../../../src/codeEditor/codeEditorManager';

describe('CodeEditorManager - TypeScript', () => {
  let manager: CodeEditorManager;
  let mockContext: any;
  let mockEditor: any;
  let mockDocument: any;
  let mockSelection: any;
  let sandbox: sinon.SinonSandbox;

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
      fileName: 'test.ts',
      languageId: 'typescript',
      lineAt: sandbox.stub().returns({
        text: 'const test: string = "sample code";',
        range: { start: { line: 5, character: 0 }, end: { line: 5, character: 35 } }
      }),
      getText: sandbox.stub().returns('const test: string = "sample code";'),
      uri: { fsPath: '/path/to/test.ts', scheme: 'file' },
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
      (vscode.window.activeTextEditor as any) = undefined;
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
      (vscode.window.activeTextEditor as any) = undefined;
      const text = manager.getSelectedText();
      expect(text).to.equal('');
    });
  });

  describe('openDocument', () => {
    it('should open a document and show it in the editor', async () => {
      const path = '/path/to/file.ts';
      await manager.openDocument(path);

      expect(vscode.workspace.openTextDocument.calledWith(path)).to.be.true;
      expect(vscode.window.showTextDocument.calledWith(mockDocument)).to.be.true;
    });

    it('should handle errors when opening a document', async () => {
      const path = '/invalid/path.ts';
      (vscode.workspace.openTextDocument as sinon.SinonStub).rejects(new Error('File not found'));

      try {
        await manager.openDocument(path);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
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
      } catch (error: any) {
        expect(error.message).to.include('Insertion failed');
      }
    });

    it('should do nothing when no editor is active', async () => {
      (vscode.window.activeTextEditor as any) = undefined;
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
      (vscode.window.activeTextEditor as any) = undefined;
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
      (vscode.window.activeTextEditor as any) = undefined;
      manager.navigateToLine(10);
      expect(mockEditor.revealRange.called).to.be.false;
    });
  });

  describe('getDocumentLanguage', () => {
    it('should return the language id of the active document', () => {
      const language = manager.getDocumentLanguage();
      expect(language).to.equal('typescript');
    });

    it('should return empty string when no editor is active', () => {
      (vscode.window.activeTextEditor as any) = undefined;
      const language = manager.getDocumentLanguage();
      expect(language).to.equal('');
    });
  });

  describe('getFilePath', () => {
    it('should return the file path of the active document', () => {
      const path = manager.getFilePath();
      expect(path).to.equal('/path/to/test.ts');
    });

    it('should return empty string when no editor is active', () => {
      (vscode.window.activeTextEditor as any) = undefined;
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
      (vscode.window.activeTextEditor as any) = undefined;
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


describe('CodeEditorManager - TypeScript', () => {
  let manager: CodeEditorManager;
  let mockContext: any;
  let mockWindow: any;
  let mockWorkspace: any;
  let mockTextDocument: any;
  let mockTextEditor: any;
  let mockRange: any;
  let mockPosition: any;
  let mockSelection: any;
  let mockCommands: any;
  let mockUri: any;

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
      fileName: '/path/to/file.ts',
      languageId: 'typescript',
      uri: { fsPath: '/path/to/file.ts' },
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
      file: sinon.stub().returns({ fsPath: '/path/to/file.ts' }),
      parse: sinon.stub().returns({ fsPath: '/path/to/file.ts' })
    };

    // Create mock VS Code namespace
    global.vscode = {
      window: mockWindow,
      workspace: mockWorkspace,
      commands: mockCommands,
      Uri: mockUri,
      Position: function(line: number, character: number) {
        return { line, character, translate: mockPosition.translate, with: mockPosition.with };
      },
      Range: function(startLine: number, startChar: number, endLine: number, endChar: number) {
        return {
          start: { line: startLine, character: startChar },
          end: { line: endLine, character: endChar },
          isEmpty: mockRange.isEmpty,
          with: mockRange.with
        };
      },
      Selection: function(anchorLine: number, anchorChar: number, activeLine: number, activeChar: number) {
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
    } as any;

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
      expect(path).to.equal('/path/to/file.ts');
    });

    it('should return empty string when no document is open', () => {
      mockWindow.activeTextEditor = null;
      const path = manager.getCurrentFilePath();
      expect(path).to.equal('');
    });

    it('should get the current language', () => {
      const language = manager.getCurrentLanguage();
      expect(language).to.equal('typescript');
    });

    it('should return empty string when no document is open for language', () => {
      mockWindow.activeTextEditor = null;
      const language = manager.getCurrentLanguage();
      expect(language).to.equal('');
    });

    it('should open a document', async () => {
      const editor = await manager.openDocument('/path/to/file.ts');
      expect(editor).to.equal(mockTextEditor);
      expect(mockWorkspace.openTextDocument.called).to.be.true;
      expect(mockWindow.showTextDocument.called).to.be.true;
    });

    it('should handle errors when opening a document', async () => {
      mockWorkspace.openTextDocument.rejects(new Error('Open error'));

      try {
        await manager.openDocument('/path/to/file.ts');
        // If we get here, the test should fail
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
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
      const success = await manager.navigateToPosition('/path/to/file.ts', 5, 10);
      expect(success).to.be.true;
      expect(mockWorkspace.openTextDocument.called).to.be.true;
      expect(mockWindow.showTextDocument.called).to.be.true;
      expect(mockTextEditor.selections).to.have.lengthOf(1);
    });

    it('should handle errors when navigating to position', async () => {
      mockWorkspace.openTextDocument.rejects(new Error('Navigation error'));

      const success = await manager.navigateToPosition('/path/to/file.ts', 5, 10);
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
        expect(error).to.be.instanceOf(Error);
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
