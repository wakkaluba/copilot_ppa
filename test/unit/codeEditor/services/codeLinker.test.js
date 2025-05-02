const { expect } = require('chai');
const sinon = require('sinon');
const { CodeLinkerService } = require('../../../../src/codeEditor/services/codeLinker');

describe('CodeLinkerService - JavaScript', () => {
  let service;
  let mockContext;
  let mockWindow;
  let mockWorkspace;
  let mockCommands;
  let mockRange;
  let mockPosition;
  let mockSelection;
  let mockStatusBar;
  let mockEditor;
  let mockDocument;
  let sandbox;

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
      fileName: '/path/to/file.js',
      uri: { fsPath: '/path/to/file.js', toString: sandbox.stub().returns('file:///path/to/file.js') },
      languageId: 'javascript',
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
    mockStatusBar = {
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
      createStatusBarItem: sandbox.stub().returns(mockStatusBar),
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
          const configs = {
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
      Range: function(startLine, startChar, endLine, endChar) {
        return {
          start: { line: startLine, character: startChar },
          end: { line: endLine, character: endChar },
          isEmpty: mockRange.isEmpty,
          contains: mockRange.contains,
          with: mockRange.with
        };
      },
      Position: function(line, character) {
        return { line, character, translate: mockPosition.translate, with: mockPosition.with };
      },
      Selection: function(anchorLine, anchorChar, activeLine, activeChar) {
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
      ThemeColor: function(id) {
        return { id };
      },
      window: mockWindow,
      workspace: mockWorkspace,
      commands: mockCommands
    };

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
      expect(mockStatusBar.show.called).to.be.true;
    });

    it('should register commands', () => {
      expect(mockCommands.registerCommand.called).to.be.true;
      expect(mockCommands.registerCommand.calledWith('codeLinker.createLink')).to.be.true;
      expect(mockCommands.registerCommand.calledWith('codeLinker.navigateToLink')).to.be.true;
    });

    it('should create decoration type for links', () => {
      expect(mockWindow.createTextEditorDecorationType.called).to.be.true;
      expect(service.linkDecorationType).to.not.be.undefined;
    });
  });

  describe('createLink', () => {
    it('should create a link from selected text', async () => {
      const result = await service.createLink();

      expect(result).to.be.true;
      expect(mockWindow.showInformationMessage.called).to.be.true;
      expect(service.links).to.have.lengthOf(1);
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
      mockWindow.showInputBox = sandbox.stub().resolves('/path/to/target.js:10:5');

      const result = await service.createLink(true);

      expect(result).to.be.true;
      expect(mockWindow.showInputBox.called).to.be.true;
      expect(service.links).to.have.lengthOf(1);

      const link = service.links[0];
      expect(link.targetUri).to.equal('/path/to/target.js');
      expect(link.targetPosition.line).to.equal(10);
      expect(link.targetPosition.character).to.equal(5);
    });

    it('should update the status bar when creating a link', async () => {
      await service.createLink();

      expect(mockStatusBar.text).to.not.be.empty;
      expect(mockStatusBar.tooltip).to.not.be.empty;
      expect(mockStatusBar.show.called).to.be.true;
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
      const position = new global.vscode.Position(0, 5);
      const link = service.findLinkAtPosition(position);

      expect(link).to.not.be.null;
      expect(link.sourceRange.contains(position)).to.be.true;
    });

    it('should return null if no link is found', () => {
      const position = new global.vscode.Position(10, 5);
      const link = service.findLinkAtPosition(position);

      expect(link).to.be.null;
    });

    it('should return null if no editor is active', () => {
      mockWindow.activeTextEditor = null;

      const position = new global.vscode.Position(0, 5);
      const link = service.findLinkAtPosition(position);

      expect(link).to.be.null;
    });
  });

  describe('navigateToLink', () => {
    it('should navigate to the target of a link', async () => {
      // First create a link
      await service.createLink();

      // Then navigate to it
      const position = new global.vscode.Position(0, 5);
      const result = await service.navigateToLink(position);

      expect(result).to.be.true;
      expect(mockWorkspace.openTextDocument.called).to.be.true;
      expect(mockWindow.showTextDocument.called).to.be.true;
    });

    it('should handle no link at position', async () => {
      const position = new global.vscode.Position(10, 5);
      const result = await service.navigateToLink(position);

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should handle errors when navigating', async () => {
      // First create a link
      await service.createLink();

      // Make openTextDocument throw an error
      mockWorkspace.openTextDocument.rejects(new Error('Navigation error'));

      const position = new global.vscode.Position(0, 5);
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

      service.clearLinks();

      expect(mockEditor.setDecorations.called).to.be.true;
    });
  });

  describe('persistence', () => {
    it('should save links to workspace state', async () => {
      await service.createLink();

      // Call the save method
      service.saveLinks();

      expect(mockContext.workspaceState.update.called).to.be.true;
    });

    it('should load links from workspace state', () => {
      const mockLinks = [{
        sourceUri: '/path/to/file.js',
        sourceRange: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
        targetUri: '/path/to/target.js',
        targetPosition: { line: 5, character: 0 }
      }];

      mockContext.workspaceState.get.returns(mockLinks);

      // Call the load method
      service.loadLinks();

      expect(service.links).to.have.lengthOf(1);
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
      const position = new global.vscode.Position(0, 5);

      // Execute the command
      await navigateToLinkCallback(position);

      expect(navigateToLinkSpy.calledWith(position)).to.be.true;
    });
  });

  describe('dispose', () => {
    it('should clean up resources when disposed', () => {
      const statusBarDispose = sandbox.spy(mockStatusBar, 'dispose');
      const decorationTypeDispose = sandbox.spy(service.linkDecorationType, 'dispose');

      service.dispose();

      expect(statusBarDispose.called).to.be.true;
      expect(decorationTypeDispose.called).to.be.true;
      expect(mockContext.subscriptions).to.be.empty;
    });
  });
});
