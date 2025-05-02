const { expect } = require('chai');
const sinon = require('sinon');
const { CodeNavigatorService } = require('../../../../src/codeEditor/services/codeNavigator');

describe('CodeNavigatorService - JavaScript', () => {
  let service;
  let mockContext;
  let mockWindow;
  let mockWorkspace;
  let mockCommands;
  let mockLanguages;
  let mockWebviewPanel;
  let mockTextEditor;
  let mockTextDocument;
  let mockRange;
  let mockPosition;
  let mockSelection;
  let mockLocationArray;
  let mockSymbolArray;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create mock position and range classes
    mockPosition = {
      line: 5,
      character: 10,
      translate: sandbox.stub().returns({ line: 6, character: 10 }),
      with: sandbox.stub().returns({ line: 5, character: 15 })
    };

    mockRange = {
      start: { line: 5, character: 10 },
      end: { line: 5, character: 20 },
      isEmpty: sandbox.stub().returns(false),
      contains: sandbox.stub().returns(true),
      with: sandbox.stub().returns({ start: { line: 5, character: 10 }, end: { line: 6, character: 0 } })
    };

    mockSelection = {
      anchor: { line: 5, character: 10 },
      active: { line: 5, character: 20 },
      isEmpty: sandbox.stub().returns(false),
      start: { line: 5, character: 10 },
      end: { line: 5, character: 20 }
    };

    // Create mock locations
    mockLocationArray = [
      {
        uri: { fsPath: '/path/to/file1.js', toString: () => 'file:///path/to/file1.js' },
        range: { ...mockRange }
      },
      {
        uri: { fsPath: '/path/to/file2.js', toString: () => 'file:///path/to/file2.js' },
        range: { ...mockRange }
      }
    ];

    // Create mock document symbols
    mockSymbolArray = [
      {
        name: 'TestClass',
        kind: 5, // Class
        range: { ...mockRange },
        selectionRange: { ...mockRange },
        children: [
          {
            name: 'testMethod',
            kind: 6, // Method
            range: { ...mockRange },
            selectionRange: { ...mockRange },
            children: []
          }
        ]
      },
      {
        name: 'testFunction',
        kind: 12, // Function
        range: { ...mockRange },
        selectionRange: { ...mockRange },
        children: []
      }
    ];

    // Create mock document
    mockTextDocument = {
      getText: sandbox.stub().returns('function testFunction() { console.log("Hello"); }'),
      fileName: '/path/to/file.js',
      uri: { fsPath: '/path/to/file.js', toString: () => 'file:///path/to/file.js' },
      languageId: 'javascript',
      getWordRangeAtPosition: sandbox.stub().returns(mockRange),
      lineAt: sandbox.stub().returns({ text: 'function testFunction() { console.log("Hello"); }' }),
      positionAt: sandbox.stub().returns(mockPosition),
      offsetAt: sandbox.stub().returns(10)
    };

    // Create mock editor
    mockTextEditor = {
      document: mockTextDocument,
      selection: mockSelection,
      edit: sandbox.stub().resolves(true),
      revealRange: sandbox.stub(),
      setDecorations: sandbox.stub(),
      selections: [mockSelection],
      visibleRanges: [mockRange]
    };

    // Create mock webview panel
    mockWebviewPanel = {
      webview: {
        html: '',
        onDidReceiveMessage: sandbox.stub().returns({ dispose: sandbox.stub() }),
        postMessage: sandbox.stub().resolves(true),
        asWebviewUri: sandbox.stub().callsFake(uri => uri)
      },
      onDidDispose: sandbox.stub().returns({ dispose: sandbox.stub() }),
      onDidChangeViewState: sandbox.stub().returns({ dispose: sandbox.stub() }),
      reveal: sandbox.stub(),
      dispose: sandbox.stub(),
      active: true,
      visible: true
    };

    // Mock VS Code APIs
    mockWindow = {
      activeTextEditor: mockTextEditor,
      showInformationMessage: sandbox.stub().resolves(),
      showErrorMessage: sandbox.stub().resolves(),
      showWarningMessage: sandbox.stub().resolves(),
      createWebviewPanel: sandbox.stub().returns(mockWebviewPanel),
      showTextDocument: sandbox.stub().resolves(mockTextEditor)
    };

    mockWorkspace = {
      openTextDocument: sandbox.stub().resolves(mockTextDocument),
      findFiles: sandbox.stub().resolves([]),
      onDidChangeTextDocument: sandbox.stub().returns({ dispose: sandbox.stub() })
    };

    mockCommands = {
      executeCommand: sandbox.stub().resolves(mockLocationArray),
      registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
    };

    mockLanguages = {
      registerHoverProvider: sandbox.stub().returns({ dispose: sandbox.stub() }),
      registerDefinitionProvider: sandbox.stub().returns({ dispose: sandbox.stub() }),
      registerReferenceProvider: sandbox.stub().returns({ dispose: sandbox.stub() }),
      registerDocumentSymbolProvider: sandbox.stub().returns({ dispose: sandbox.stub() })
    };

    // Create mock VS Code namespace
    global.vscode = {
      window: mockWindow,
      workspace: mockWorkspace,
      commands: mockCommands,
      languages: mockLanguages,
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
          start: { line: Math.min(anchorLine, activeLine), character: anchorChar },
          end: { line: Math.max(anchorLine, activeLine), character: activeChar },
          isEmpty: mockSelection.isEmpty
        };
      },
      SymbolKind: {
        Class: 5,
        Method: 6,
        Function: 12,
        Variable: 13,
        Interface: 8
      },
      ViewColumn: {
        Beside: -2
      },
      Uri: {
        file: sandbox.stub().callsFake(path => ({
          fsPath: path,
          toString: () => `file://${path}`,
          with: () => ({ fsPath: path, toString: () => `file://${path}` })
        })),
        parse: sandbox.stub().callsFake(uri => ({
          fsPath: uri.replace('file://', ''),
          toString: () => uri,
          with: () => ({ fsPath: uri.replace('file://', ''), toString: () => uri })
        }))
      }
    };

    // Create mock extension context
    mockContext = {
      subscriptions: [],
      extensionPath: '/path/to/extension',
      extensionUri: {
        fsPath: '/path/to/extension',
        toString: () => 'file:///path/to/extension'
      }
    };

    // Create service instance
    service = new CodeNavigatorService(mockContext);
  });

  afterEach(() => {
    sandbox.restore();
    delete global.vscode;
  });

  describe('Initialization', () => {
    it('should initialize properly', () => {
      expect(service).to.be.instanceOf(CodeNavigatorService);
    });

    it('should register with extension context', () => {
      expect(mockContext.subscriptions).to.not.be.empty;
    });

    it('should register commands', () => {
      expect(mockCommands.registerCommand.called).to.be.true;
    });
  });

  describe('Code Overview', () => {
    it('should show document structure in a webview panel', async () => {
      // Mock symbols
      mockCommands.executeCommand.withArgs('vscode.executeDocumentSymbolProvider', sinon.match.any).resolves(mockSymbolArray);

      const result = await service.showCodeOverview();

      expect(result).to.be.true;
      expect(mockWindow.createWebviewPanel.called).to.be.true;
      expect(mockWebviewPanel.webview.html).to.not.be.empty;
    });

    it('should handle error when no symbols are found', async () => {
      // Mock no symbols found
      mockCommands.executeCommand.withArgs('vscode.executeDocumentSymbolProvider', sinon.match.any).resolves([]);

      const result = await service.showCodeOverview();

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should handle no active editor', async () => {
      mockWindow.activeTextEditor = null;

      const result = await service.showCodeOverview();

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });
  });

  describe('Find References', () => {
    it('should find and display references to the current symbol', async () => {
      mockCommands.executeCommand.withArgs('vscode.executeReferenceProvider', sinon.match.any, sinon.match.any).resolves(mockLocationArray);

      const result = await service.findReferences();

      expect(result).to.deep.equal(mockLocationArray);
      expect(mockCommands.executeCommand.calledWith('vscode.executeReferenceProvider')).to.be.true;
    });

    it('should handle no references found', async () => {
      mockCommands.executeCommand.withArgs('vscode.executeReferenceProvider', sinon.match.any, sinon.match.any).resolves([]);

      const result = await service.findReferences();

      expect(result).to.be.an('array').that.is.empty;
      expect(mockWindow.showInformationMessage.called).to.be.true;
    });

    it('should handle error when finding references', async () => {
      mockCommands.executeCommand.withArgs('vscode.executeReferenceProvider', sinon.match.any, sinon.match.any).rejects(new Error('Find references error'));

      const result = await service.findReferences();

      expect(result).to.be.an('array').that.is.empty;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should handle no active editor', async () => {
      mockWindow.activeTextEditor = null;

      const result = await service.findReferences();

      expect(result).to.be.an('array').that.is.empty;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });
  });

  describe('Navigate To Reference', () => {
    it('should navigate to a reference location', async () => {
      const location = mockLocationArray[0];

      const result = await service.navigateToReference(location);

      expect(result).to.be.true;
      expect(mockWorkspace.openTextDocument.called).to.be.true;
      expect(mockWindow.showTextDocument.called).to.be.true;
      expect(mockTextEditor.revealRange.called).to.be.true;
    });

    it('should handle error when navigating to reference', async () => {
      const location = mockLocationArray[0];
      mockWorkspace.openTextDocument.rejects(new Error('Open document error'));

      const result = await service.navigateToReference(location);

      expect(result).to.be.false;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });
  });

  describe('Get Document Symbols', () => {
    it('should get document symbols from the current document', async () => {
      mockCommands.executeCommand.withArgs('vscode.executeDocumentSymbolProvider', sinon.match.any).resolves(mockSymbolArray);

      const result = await service.getDocumentSymbols();

      expect(result).to.deep.equal(mockSymbolArray);
      expect(mockCommands.executeCommand.calledWith('vscode.executeDocumentSymbolProvider')).to.be.true;
    });

    it('should handle no symbols found', async () => {
      mockCommands.executeCommand.withArgs('vscode.executeDocumentSymbolProvider', sinon.match.any).resolves([]);

      const result = await service.getDocumentSymbols();

      expect(result).to.be.an('array').that.is.empty;
    });

    it('should handle error when getting symbols', async () => {
      mockCommands.executeCommand.withArgs('vscode.executeDocumentSymbolProvider', sinon.match.any).rejects(new Error('Get symbols error'));

      const result = await service.getDocumentSymbols();

      expect(result).to.be.an('array').that.is.empty;
      expect(mockWindow.showErrorMessage.called).to.be.true;
    });

    it('should handle no active editor', async () => {
      mockWindow.activeTextEditor = null;

      const result = await service.getDocumentSymbols();

      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('Webview Message Handling', () => {
    it('should handle navigation messages from webview', async () => {
      // First create a webview
      await service.showCodeOverview();

      // Simulate message from webview
      const navigateToSymbolSpy = sandbox.spy(service, 'navigateToSymbol');
      const message = {
        command: 'navigate',
        line: 5,
        character: 10
      };

      // Get the message handler and call it directly
      const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.args[0][0];
      await messageHandler(message);

      expect(navigateToSymbolSpy.calledWith(5, 10)).to.be.true;
    });

    it('should handle unknown messages gracefully', async () => {
      // First create a webview
      await service.showCodeOverview();

      // Simulate unknown message type from webview
      const message = {
        command: 'unknown',
        data: 'test'
      };

      // Get the message handler and call it directly
      const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.args[0][0];

      // Should not throw error
      expect(() => messageHandler(message)).to.not.throw();
    });
  });

  describe('Navigate To Symbol', () => {
    it('should navigate to a symbol at specific line and character', async () => {
      const line = 5;
      const character = 10;

      const result = await service.navigateToSymbol(line, character);

      expect(result).to.be.true;
      expect(mockTextEditor.revealRange.called).to.be.true;
    });

    it('should handle no active editor', async () => {
      mockWindow.activeTextEditor = null;

      const result = await service.navigateToSymbol(5, 10);

      expect(result).to.be.false;
    });
  });

  describe('Generate HTML Content', () => {
    it('should generate HTML content for the webview', async () => {
      // Mock symbols
      mockCommands.executeCommand.withArgs('vscode.executeDocumentSymbolProvider', sinon.match.any).resolves(mockSymbolArray);

      await service.showCodeOverview();

      // Extract the HTML content
      const html = mockWebviewPanel.webview.html;

      expect(html).to.include('<!DOCTYPE html>');
      expect(html).to.include('<html>');
      expect(html).to.include('<head>');
      expect(html).to.include('<body>');
      expect(html).to.include('Code Overview');
      expect(html).to.include('TestClass');
      expect(html).to.include('testMethod');
      expect(html).to.include('testFunction');
    });

    it('should include navigation scripts in the HTML', async () => {
      // Mock symbols
      mockCommands.executeCommand.withArgs('vscode.executeDocumentSymbolProvider', sinon.match.any).resolves(mockSymbolArray);

      await service.showCodeOverview();

      // Extract the HTML content
      const html = mockWebviewPanel.webview.html;

      expect(html).to.include('<script>');
      expect(html).to.include('navigate');
      expect(html).to.include('vscode.postMessage');
    });
  });

  describe('Resource Management', () => {
    it('should dispose resources when disposed', () => {
      // Create a webview panel first
      service.showCodeOverview();

      service.dispose();

      expect(mockWebviewPanel.dispose.called).to.be.true;
      expect(mockContext.subscriptions).to.be.empty;
    });

    it('should handle disposal when no webview exists', () => {
      // No webview created
      expect(() => service.dispose()).to.not.throw();
      expect(mockContext.subscriptions).to.be.empty;
    });
  });
});
