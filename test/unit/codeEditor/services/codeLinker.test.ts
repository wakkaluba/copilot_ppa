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

  let mockWindow: any;
  let mockWorkspace: any;
  let mockCommands: any;
  let mockRange: any;
  let mockSelection: any;
  let mockDocument: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create mock position and range classes
    mockPosition = {
      line: 0,
      character: 0,
      translate: sandbox.stub().returns({ line: 1, character: 0 }),
      with: sandbox.stub().returns({ line: 0, character: 5 })
    };

    mockRange = {
      start: { line: 0, character: 0 },
      end: { line: 0, character: 10 },
      isEmpty: sandbox.stub().returns(false),
      with: sandbox.stub().returns({ start: { line: 0, character: 0 }, end: { line: 1, character: 0 } }),
      contains: sandbox.stub().returns(true)
    };

    mockSelection = {
      anchor: { line: 0, character: 0 },
      active: { line: 0, character: 10 },
      isEmpty: sandbox.stub().returns(false),
      start: { line: 0, character: 0 },
      end: { line: 0, character: 10 }
    };

    // Create mock document with selected text
    mockDocument = {
      getText: sandbox.stub().returns('function calculateTotal(amount) { return amount * 1.1; }'),
      lineAt: sandbox.stub().returns({ text: 'function calculateTotal(amount) { return amount * 1.1; }' }),
      fileName: '/path/to/file.ts',
      uri: { fsPath: '/path/to/file.ts', toString: sandbox.stub().returns('file:///path/to/file.ts') },
      languageId: 'typescript',
      getWordRangeAtPosition: sandbox.stub().returns(mockRange),
      positionAt: sandbox.stub().returns(mockPosition)
    };

    // Create mock editor
    mockEditor = {
      document: mockDocument,
      selection: mockSelection,
      edit: sandbox.stub().callsFake(async (callback) => {
        callback({
          replace: sandbox.stub().returns(true),
          insert: sandbox.stub().returns(true),
          delete: sandbox.stub().returns(true)
        });
        return true;
      }),
      revealRange: sandbox.stub(),
      setDecorations: sandbox.stub(),
      selections: [mockSelection],
      visibleRanges: [mockRange],
      viewColumn: 1
    };

    // Create mock status bar item
    mockStatusBarItem = {
      text: '',
      tooltip: '',
      command: '',
      show: sandbox.stub(),
      hide: sandbox.stub(),
      dispose: sandbox.stub()
    };

    // Mock VS Code APIs
    mockWindow = {
      activeTextEditor: mockEditor,
      showInformationMessage: sandbox.stub().resolves(),
      showErrorMessage: sandbox.stub().resolves(),
      showWarningMessage: sandbox.stub().resolves(),
      createTextEditorDecorationType: sandbox.stub().returns({
        key: 'linkDecoration',
        dispose: sandbox.stub()
      }),
      createStatusBarItem: sandbox.stub().returns(mockStatusBarItem),
      showTextDocument: sandbox.stub().resolves(mockEditor)
    };

    mockWorkspace = {
      openTextDocument: sandbox.stub().resolves(mockDocument),
      applyEdit: sandbox.stub().resolves(true),
      saveAll: sandbox.stub().resolves(true),
      textDocuments: [mockDocument],
      onDidChangeTextDocument: sandbox.stub().returns({ dispose: sandbox.stub() }),
      onDidOpenTextDocument: sandbox.stub().returns({ dispose: sandbox.stub() }),
      onDidCloseTextDocument: sandbox.stub().returns({ dispose: sandbox.stub() }),
      getConfiguration: sandbox.stub().returns({
        get: sandbox.stub().callsFake((key) => {
          const configs: Record<string, any> = {
            'codeLinks.highlightColor': 'rgba(255, 255, 0, 0.3)',
            'codeLinks.enabled': true
          };
          return configs[key];
        }),
        update: sandbox.stub().resolves()
      })
    };

    mockCommands = {
      executeCommand: sandbox.stub().resolves(),
      registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
    };

    // Create mock VS Code namespace
    global.vscode = {
      window: mockWindow,
      workspace: mockWorkspace,
      commands: mockCommands,
      Range: function(startLine: number, startChar: number, endLine: number, endChar: number) {
        return {
          start: { line: startLine, character: startChar },
          end: { line: endLine, character: endChar },
          isEmpty: mockRange.isEmpty,
          contains: mockRange.contains,
          with: mockRange.with
        };
      },
      Position: function(line: number, character: number) {
        return { line, character, translate: mockPosition.translate, with: mockPosition.with };
      },
      Selection: function(anchorLine: number, anchorChar: number, activeLine: number, activeChar: number) {
        return {
          anchor: { line: anchorLine, character: anchorChar },
          active: { line: activeLine, character: activeChar },
          start: { line: Math.min(anchorLine, activeLine), character: anchorLine < activeLine ? anchorChar : activeChar },
          end: { line: Math.max(anchorLine, activeLine), character: anchorLine > activeLine ? anchorChar : activeChar },
          isEmpty: mockSelection.isEmpty
        };
      },
      StatusBarAlignment: {
        Left: 1,
        Right: 2
      },
      Uri: {
        file: sandbox.stub().callsFake((path) => ({ fsPath: path, toString: () => `file://${path}` })),
        parse: sandbox.stub().callsFake((uri) => ({ fsPath: uri.replace('file://', ''), toString: () => uri }))
      },
      ThemeColor: function(id: string) {
        return { id };
      },
      window: mockWindow,
      workspace: mockWorkspace,
      commands: mockCommands
    } as any;

    // Create mock extension context
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: sandbox.stub().returns([]),
        update: sandbox.stub().resolves()
      }
    };

    // Create service instance
    service = new CodeLinkerService(mockContext);
  });

  afterEach(() => {
    sandbox.restore();
    delete global.vscode;
  });

  describe('Initialization', () => {
    it('should initialize properly', () => {
      expect(service).to.be.instanceOf(CodeLinkerService);
    });

    it('should register with extension context', () => {
      expect(mockContext.subscriptions).to.not.be.empty;
    });

    it('should create status bar item', () => {
      expect(mockWindow.createStatusBarItem.called).to.be.true;
      expect(mockStatusBarItem.show.called).to.be.true;
    });

    it('should register commands', () => {
      expect(mockCommands.registerCommand.called).to.be.true;
      expect(mockCommands.registerCommand.calledWith('codeLinker.createLink')).to.be.true;
      expect(mockCommands.registerCommand.calledWith('codeLinker.navigateToLink')).to.be.true;
    });

    it('should create decoration type for links', () => {
      expect(mockWindow.createTextEditorDecorationType.called).to.be.true;
      expect((service as any).linkDecorationType).to.not.be.undefined;
    });
  });

  describe('createLink', () => {
    it('should create a link from selected text', async () => {
      const result = await service.createLink();

      expect(result).to.be.true;
      expect(mockWindow.showInformationMessage.called).to.be.true;
      expect((service as any).links).to.have.lengthOf(1);
    });

    it('should handle no active editor', async () => {
      mockWindow.activeTextEditor = null;

      const result = await service.createLink();

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should handle empty selection', async () => {
      mockSelection.isEmpty.returns(true);

      const result = await service.createLink();

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should create a link with a custom target', async () => {
      mockWindow.showInputBox = sandbox.stub().resolves('/path/to/target.ts:10:5');

      const result = await service.createLink(true);

      expect(result).to.be.true;
      expect(mockWindow.showInputBox.called).to.be.true;
      expect((service as any).links).to.have.lengthOf(1);

      const link = (service as any).links[0];
      expect(link.targetUri).to.equal('/path/to/target.ts');
      expect(link.targetPosition.line).to.equal(10);
      expect(link.targetPosition.character).to.equal(5);
    });

    it('should update the status bar when creating a link', async () => {
      await service.createLink();

      expect(mockStatusBarItem.text).to.not.be.empty;
      expect(mockStatusBarItem.tooltip).to.not.be.empty;
      expect(mockStatusBarItem.show.called).to.be.true;
    });

    it('should apply decorations to the linked text', async () => {
      await service.createLink();

      expect(mockEditor.setDecorations.called).to.be.true;
    });
  });

  describe('findLinkAtPosition', () => {
    it('should find a link at the given position', async () => {
      // First create a link
      await service.createLink();

      // Then try to find it
      const position = new (global.vscode as any).Position(0, 5);
      const link = service.findLinkAtPosition(position);

      expect(link).to.not.be.null;
      expect(link!.sourceRange.contains(position)).to.be.true;
    });

    it('should return null if no link is found', () => {
      const position = new (global.vscode as any).Position(10, 5);
      const link = service.findLinkAtPosition(position);

      expect(link).to.be.null;
    });

    it('should return null if no editor is active', () => {
      mockWindow.activeTextEditor = null;

      const position = new (global.vscode as any).Position(0, 5);
      const link = service.findLinkAtPosition(position);

      expect(link).to.be.null;
    });
  });

  describe('navigateToLink', () => {
    it('should navigate to the target of a link', async () => {
      // First create a link
      await service.createLink();

      // Then navigate to it
      const position = new (global.vscode as any).Position(0, 5);
      const result = await service.navigateToLink(position);

      expect(result).to.be.true;
      expect(mockWorkspace.openTextDocument.called).to.be.true;
      expect(mockWindow.showTextDocument.called).to.be.true;
    });

    it('should handle no link at position', async () => {
      const position = new (global.vscode as any).Position(10, 5);
      const result = await service.navigateToLink(position);

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should handle errors when navigating', async () => {
      // First create a link
      await service.createLink();

      // Make openTextDocument throw an error
      mockWorkspace.openTextDocument.rejects(new Error('Navigation error'));

      const position = new (global.vscode as any).Position(0, 5);
      const result = await service.navigateToLink(position);

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });
  });

  describe('highlight management', () => {
    it('should update highlights when a new link is created', async () => {
      await service.createLink();

      expect(mockEditor.setDecorations.called).to.be.true;
    });

    it('should clear highlights when links are cleared', async () => {
      await service.createLink();
      mockEditor.setDecorations.resetHistory();

      (service as any).clearLinks();

      expect(mockEditor.setDecorations.called).to.be.true;
    });
  });

  describe('persistence', () => {
    it('should save links to workspace state', async () => {
      await service.createLink();

      // Call the private save method
      (service as any).saveLinks();

      expect(mockContext.workspaceState.update.called).to.be.true;
    });

    it('should load links from workspace state', () => {
      const mockLinks = [{
        sourceUri: '/path/to/file.ts',
        sourceRange: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
        targetUri: '/path/to/target.ts',
        targetPosition: { line: 5, character: 0 }
      }];

      mockContext.workspaceState.get.returns(mockLinks);

      // Call the private load method
      (service as any).loadLinks();

      expect((service as any).links).to.have.lengthOf(1);
    });
  });

  describe('command execution', () => {
    it('should execute the createLink command', async () => {
      const createLinkSpy = sandbox.spy(service, 'createLink');

      // Get the command callback
      const createLinkCallback = mockCommands.registerCommand.args.find(
        args => args[0] === 'codeLinker.createLink'
      )[1];

      // Execute the command
      await createLinkCallback();

      expect(createLinkSpy.called).to.be.true;
    });

    it('should execute the navigateToLink command', async () => {
      const navigateToLinkSpy = sandbox.spy(service, 'navigateToLink');

      // Get the command callback
      const navigateToLinkCallback = mockCommands.registerCommand.args.find(
        args => args[0] === 'codeLinker.navigateToLink'
      )[1];

      // Create a mock position
      const position = new (global.vscode as any).Position(0, 5);

      // Execute the command
      await navigateToLinkCallback(position);

      expect(navigateToLinkSpy.calledWith(position)).to.be.true;
    });
  });

  describe('dispose', () => {
    it('should clean up resources when disposed', () => {
      const statusBarDispose = sandbox.spy(mockStatusBarItem, 'dispose');
      const decorationTypeDispose = sandbox.spy((service as any).linkDecorationType, 'dispose');

      service.dispose();

      expect(statusBarDispose.called).to.be.true;
      expect(decorationTypeDispose.called).to.be.true;
      expect(mockContext.subscriptions).to.be.empty;
    });
  });
});
