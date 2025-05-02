const { expect } = require('chai');
const sinon = require('sinon');
const { CodeOverviewWebview } = require('../../../../src/codeEditor/webviews/codeOverviewWebview');

describe('CodeOverviewWebview - JavaScript', () => {
  let webview;
  let mockWebviewPanel;
  let mockVscode;
  let mockSymbols;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create mock document symbols
    mockSymbols = [
      {
        name: 'TestClass',
        kind: 5, // Class
        range: {
          start: { line: 5, character: 0 },
          end: { line: 20, character: 1 }
        },
        selectionRange: {
          start: { line: 5, character: 0 },
          end: { line: 5, character: 9 }
        },
        children: [
          {
            name: 'constructor',
            kind: 9, // Constructor
            range: {
              start: { line: 6, character: 2 },
              end: { line: 8, character: 3 }
            },
            selectionRange: {
              start: { line: 6, character: 2 },
              end: { line: 6, character: 13 }
            },
            children: []
          },
          {
            name: 'testMethod',
            kind: 6, // Method
            range: {
              start: { line: 10, character: 2 },
              end: { line: 12, character: 3 }
            },
            selectionRange: {
              start: { line: 10, character: 2 },
              end: { line: 10, character: 12 }
            },
            children: []
          }
        ]
      },
      {
        name: 'testFunction',
        kind: 12, // Function
        range: {
          start: { line: 22, character: 0 },
          end: { line: 24, character: 1 }
        },
        selectionRange: {
          start: { line: 22, character: 0 },
          end: { line: 22, character: 13 }
        },
        children: []
      }
    ];

    // Mock webview panel
    mockWebviewPanel = {
      webview: {
        html: '',
        onDidReceiveMessage: sandbox.stub().returns({ dispose: sandbox.stub() }),
        postMessage: sandbox.stub().resolves()
      },
      onDidDispose: sandbox.stub().returns({ dispose: sandbox.stub() }),
      reveal: sandbox.stub(),
      dispose: sandbox.stub()
    };

    // Mock VS Code APIs
    mockVscode = {
      window: {
        createWebviewPanel: sandbox.stub().returns(mockWebviewPanel),
        showTextDocument: sandbox.stub(),
        activeTextEditor: {
          document: {
            lineAt: sandbox.stub().returns({ range: { start: { line: 0 } } }),
            uri: { fsPath: '/path/to/file.js' }
          },
          revealRange: sandbox.stub(),
          selection: { active: { line: 0, character: 0 } }
        }
      },
      ViewColumn: {
        Beside: 2
      },
      Position: function(line, character) {
        return { line, character };
      },
      Range: function(startLine, startChar, endLine, endChar) {
        return {
          start: { line: startLine, character: startChar },
          end: { line: endLine, character: endChar }
        };
      },
      SymbolKind: {
        File: 0,
        Module: 1,
        Namespace: 2,
        Package: 3,
        Class: 5,
        Method: 6,
        Property: 7,
        Field: 8,
        Constructor: 9,
        Function: 12,
        Variable: 13,
        Interface: 8
      }
    };

    // Create mock global vscode object
    global.vscode = mockVscode;

    // Create webview instance
    webview = new CodeOverviewWebview();
  });

  afterEach(() => {
    sandbox.restore();
    delete global.vscode;
  });

  describe('show', () => {
    it('should create a webview panel with correct properties', async () => {
      await webview.show(mockSymbols, 'javascript');

      expect(mockVscode.window.createWebviewPanel.calledOnce).to.be.true;
      expect(mockVscode.window.createWebviewPanel.args[0][0]).to.equal('codeOverview');
      expect(mockVscode.window.createWebviewPanel.args[0][1]).to.equal('Code Overview');
      expect(mockVscode.window.createWebviewPanel.args[0][2]).to.equal(mockVscode.ViewColumn.Beside);
    });

    it('should set HTML content in the webview panel', async () => {
      await webview.show(mockSymbols, 'javascript');

      expect(mockWebviewPanel.webview.html).to.be.a('string');
      expect(mockWebviewPanel.webview.html).to.include('<html>');
      expect(mockWebviewPanel.webview.html).to.include('<body>');
      expect(mockWebviewPanel.webview.html).to.include('Code Overview');
      expect(mockWebviewPanel.webview.html).to.include('TestClass');
      expect(mockWebviewPanel.webview.html).to.include('testMethod');
      expect(mockWebviewPanel.webview.html).to.include('testFunction');
    });

    it('should register message handling for webview panel', async () => {
      await webview.show(mockSymbols, 'javascript');

      expect(mockWebviewPanel.webview.onDidReceiveMessage.calledOnce).to.be.true;
    });
  });

  describe('registerWebviewMessageHandling', () => {
    it('should set up a message handler for jump commands', () => {
      webview.registerWebviewMessageHandling(mockWebviewPanel);

      // Verify the handler is registered
      expect(mockWebviewPanel.webview.onDidReceiveMessage.calledOnce).to.be.true;

      // Simulate receiving a message
      const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.args[0][0];
      messageHandler({ command: 'jump', line: 10 });

      // Verify jumpToLine was called
      expect(mockVscode.window.activeTextEditor.revealRange.calledOnce).to.be.true;
    });

    it('should handle unknown commands gracefully', () => {
      webview.registerWebviewMessageHandling(mockWebviewPanel);

      // Get the message handler
      const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.args[0][0];

      // Should not throw when receiving an unknown command
      expect(() => messageHandler({ command: 'unknown' })).to.not.throw();
    });
  });

  describe('jumpToLine', () => {
    it('should reveal the specified line in the active editor', () => {
      webview.jumpToLine(10);

      expect(mockVscode.window.activeTextEditor.revealRange.calledOnce).to.be.true;

      // Check that the range starts at the specified line
      const range = mockVscode.window.activeTextEditor.revealRange.args[0][0];
      expect(range.start.line).to.equal(10);
    });

    it('should handle case when there is no active editor', () => {
      // Set active editor to null
      mockVscode.window.activeTextEditor = null;

      // Should not throw
      expect(() => webview.jumpToLine(10)).to.not.throw();
    });
  });

  describe('getWebviewContent', () => {
    it('should generate complete HTML document with symbols', () => {
      const html = webview.getWebviewContent(mockSymbols, 'javascript');

      expect(html).to.include('<!DOCTYPE html>');
      expect(html).to.include('<html>');
      expect(html).to.include('<head>');
      expect(html).to.include('<style>');
      expect(html).to.include('<body>');
      expect(html).to.include('<h1>Code Overview</h1>');
      expect(html).to.include('<script>');
      expect(html).to.include('TestClass');
      expect(html).to.include('testMethod');
      expect(html).to.include('testFunction');
    });

    it('should include language information in the content', () => {
      const html = webview.getWebviewContent(mockSymbols, 'javascript');

      expect(html).to.include('javascript');
    });

    it('should handle empty symbols array', () => {
      const html = webview.getWebviewContent([], 'javascript');

      expect(html).to.include('<!DOCTYPE html>');
      expect(html).to.include('<html>');
      expect(html).to.include('<body>');
      expect(html).to.include('<h1>Code Overview</h1>');
      expect(html).to.include('No symbols found');
    });
  });

  describe('getSymbolsHtml', () => {
    it('should generate HTML list for symbols with proper indentation', () => {
      const html = webview.getSymbolsHtml(mockSymbols, 0);

      expect(html).to.include('<ul>');
      expect(html).to.include('</ul>');
      expect(html).to.include('<li>');
      expect(html).to.include('TestClass');
      expect(html).to.include('testMethod');
      expect(html).to.include('testFunction');
    });

    it('should represent symbol hierarchy with nested lists', () => {
      const html = webview.getSymbolsHtml(mockSymbols, 0);

      // Class should contain a nested list for its children
      const classIndex = html.indexOf('TestClass');
      const methodIndex = html.indexOf('testMethod');

      expect(classIndex).to.be.lessThan(methodIndex);

      // There should be a <ul> between the class and its method
      const ulIndex = html.indexOf('<ul>', classIndex);
      expect(ulIndex).to.be.lessThan(methodIndex);
    });

    it('should add appropriate CSS classes based on symbol kind', () => {
      const html = webview.getSymbolsHtml(mockSymbols, 0);

      expect(html).to.include('class-symbol'); // For TestClass
      expect(html).to.include('method-symbol'); // For testMethod
      expect(html).to.include('function-symbol'); // For testFunction
    });

    it('should handle empty symbols array', () => {
      const html = webview.getSymbolsHtml([], 0);

      expect(html).to.equal('<div>No symbols found</div>');
    });
  });

  describe('getStyles', () => {
    it('should return CSS styles as a string', () => {
      const styles = webview.getStyles();

      expect(styles).to.be.a('string');
      expect(styles).to.include('body {');
      expect(styles).to.include('font-family');
      expect(styles).to.include('ul {');
      expect(styles).to.include('li {');
      expect(styles).to.include('.class-symbol {');
      expect(styles).to.include('.method-symbol {');
      expect(styles).to.include('.function-symbol {');
    });
  });

  describe('getClientScript', () => {
    it('should return JavaScript code as a string', () => {
      const script = webview.getClientScript();

      expect(script).to.be.a('string');
      expect(script).to.include('function jumpToLine');
      expect(script).to.include('vscode.postMessage');
      expect(script).to.include('command: "jump"');
    });

    it('should include code to make list items clickable', () => {
      const script = webview.getClientScript();

      expect(script).to.include('addEventListener');
      expect(script).to.include('click');
      expect(script).to.include('jumpToLine');
    });
  });
});
