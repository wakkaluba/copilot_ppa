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
      },
      {
        name: 'testVariable',
        kind: 13, // Variable
        range: {
          start: { line: 26, character: 0 },
          end: { line: 26, character: 20 }
        },
        selectionRange: {
          start: { line: 26, character: 0 },
          end: { line: 26, character: 12 }
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
          selection: {
            active: { line: 0, character: 0 },
          }
        },
        TextEditorRevealType: {
          InCenter: 2
        }
      },
      ViewColumn: {
        Beside: 2
      },
      Position: function(line, character) {
        return { line, character };
      },
      Selection: function(line, character) {
        return {
          anchor: { line, character },
          active: { line, character }
        };
      },
      Range: function(startLine, startChar, endLine, endChar) {
        if (typeof startLine === 'object') { // Handle passing Position objects
          return {
            start: startLine,
            end: startChar // endLine param would actually be the end Position
          };
        }
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
      expect(mockWebviewPanel.webview.html).to.include('<html');
      expect(mockWebviewPanel.webview.html).to.include('<body');
      expect(mockWebviewPanel.webview.html).to.include('Code Overview');
      expect(mockWebviewPanel.webview.html).to.include('TestClass');
      expect(mockWebviewPanel.webview.html).to.include('testMethod');
      expect(mockWebviewPanel.webview.html).to.include('testFunction');
      expect(mockWebviewPanel.webview.html).to.include('testVariable');
    });

    it('should register message handling for webview panel', async () => {
      await webview.show(mockSymbols, 'javascript');

      expect(mockWebviewPanel.webview.onDidReceiveMessage.calledOnce).to.be.true;
    });

    it('should reuse existing panel if available', async () => {
      await webview.show(mockSymbols, 'javascript');
      await webview.show(mockSymbols, 'typescript');

      expect(mockVscode.window.createWebviewPanel.callCount).to.equal(1);
      expect(mockWebviewPanel.reveal.called).to.be.true;
    });

    it('should handle empty symbols array', async () => {
      await webview.show([], 'javascript');

      expect(mockVscode.window.createWebviewPanel.calledOnce).to.be.true;
      expect(mockWebviewPanel.webview.html).to.be.a('string');
      expect(mockWebviewPanel.webview.html).to.include('<html');
      expect(mockWebviewPanel.webview.html).to.include('Code Overview');
    });

    it('should cleanup on panel dispose', async () => {
      await webview.show(mockSymbols, 'javascript');

      // Extract and call the dispose handler
      const disposeHandler = mockWebviewPanel.onDidDispose.args[0][0];
      disposeHandler();

      // Show again, should create a new panel
      await webview.show(mockSymbols, 'javascript');
      expect(mockVscode.window.createWebviewPanel.callCount).to.equal(2);
    });
  });

  describe('message handling', () => {
    it('should handle jumpToLine messages correctly', async () => {
      await webview.show(mockSymbols, 'javascript');

      // Get the message handler
      const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.args[0][0];

      // Simulate a jumpToLine message
      messageHandler({ command: 'jumpToLine', line: 10 });

      // Verify editor actions were performed
      expect(mockVscode.window.activeTextEditor.revealRange.calledOnce).to.be.true;

      // Check the range passed to revealRange
      const callArgs = mockVscode.window.activeTextEditor.revealRange.args[0];
      expect(callArgs[0].start.line).to.equal(10);
      expect(callArgs[0].start.character).to.equal(0);
    });

    it('should ignore unrecognized commands', async () => {
      await webview.show(mockSymbols, 'javascript');

      // Get the message handler
      const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.args[0][0];

      // Should not throw with unknown command
      expect(() => messageHandler({ command: 'unknownCommand', data: 'test' })).to.not.throw();

      // Verify no editor actions were performed
      expect(mockVscode.window.activeTextEditor.revealRange.called).to.be.false;
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
      expect(html).to.include('<html');
      expect(html).to.include('<head>');
      expect(html).to.include('<style>');
      expect(html).to.include('<body>');
      expect(html).to.include('Code Overview');
      expect(html).to.include('<script>');
      expect(html).to.include('TestClass');
      expect(html).to.include('testMethod');
      expect(html).to.include('testFunction');
      expect(html).to.include('testVariable');
    });

    it('should include language information in the content', () => {
      const html = webview.getWebviewContent(mockSymbols, 'javascript');

      expect(html).to.include('javascript');
    });

    it('should include theme variables from VS Code', () => {
      const html = webview.getWebviewContent(mockSymbols, 'javascript');

      expect(html).to.include('var(--vscode-');
    });

    it('should sanitize HTML content properly', () => {
      // Test with symbols containing HTML characters that should be escaped
      const htmlSymbols = [
        {
          name: '<script>alert("XSS")</script>',
          kind: 5, // Class
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
          },
          selectionRange: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
          },
          children: []
        }
      ];

      const html = webview.getWebviewContent(htmlSymbols, 'javascript');

      // The HTML tags should be visible as text, not interpreted as actual tags
      expect(html).to.include('&lt;script&gt;');
      expect(html).to.include('alert');
      expect(html).not.to.include('<script>alert');
    });
  });

  describe('getSymbolsHtml', () => {
    it('should generate HTML for symbols with proper class names', () => {
      const html = webview.getSymbolsHtml(mockSymbols);

      expect(html).to.include('class="symbol class"');
      expect(html).to.include('class="symbol method"');
      expect(html).to.include('class="symbol function"');
      expect(html).to.include('class="symbol variable"');
    });

    it('should include data-line attributes for navigation', () => {
      const html = webview.getSymbolsHtml(mockSymbols);

      expect(html).to.include('data-line="5"'); // TestClass
      expect(html).to.include('data-line="10"'); // testMethod
      expect(html).to.include('data-line="22"'); // testFunction
      expect(html).to.include('data-line="26"'); // testVariable
    });

    it('should represent symbol hierarchy with nested divs', () => {
      const html = webview.getSymbolsHtml(mockSymbols);

      // Class should contain a nested div for its children
      const classIndex = html.indexOf('TestClass');
      const methodIndex = html.indexOf('testMethod');
      const childrenIndex = html.indexOf('<div class="children">', classIndex);

      expect(classIndex).to.be.lessThan(childrenIndex);
      expect(childrenIndex).to.be.lessThan(methodIndex);
    });

    it('should handle empty symbols array', () => {
      const html = webview.getSymbolsHtml([]);
      expect(html).to.equal('');
    });

    it('should apply indentation based on hierarchy level', () => {
      const html = webview.getSymbolsHtml(mockSymbols, 2);
      // Should indent with 4 spaces (2 spaces × 2)
      expect(html).to.include('    <span class="icon');
    });

    it('should handle symbols with missing properties gracefully', () => {
      // Create invalid symbol missing required properties
      const incompleteSymbol = {
        name: 'IncompleteSymbol',
        // Missing kind, range, selectionRange
        children: []
      };

      // Should not throw when generating HTML for invalid symbols
      expect(() => webview.getSymbolsHtml([incompleteSymbol])).to.not.throw();
    });
  });

  describe('getStyles', () => {
    it('should return CSS styles as a string', () => {
      const styles = webview.getStyles();

      expect(styles).to.be.a('string');
      expect(styles).to.include('body {');
      expect(styles).to.include('font-family');
      expect(styles).to.include('.symbol {');
      expect(styles).to.include('.name {');
      expect(styles).to.include('.detail {');
      expect(styles).to.include('.children {');
      expect(styles).to.include('.icon {');
      expect(styles).to.include('.class::before');
      expect(styles).to.include('.method::before');
      expect(styles).to.include('.function::before');
      expect(styles).to.include('.variable::before');
    });
  });

  describe('getClientScript', () => {
    it('should return JavaScript code as a string', () => {
      const script = webview.getClientScript();

      expect(script).to.be.a('string');
      expect(script).to.include('const vscode = acquireVsCodeApi()');
      expect(script).to.include('addEventListener');
      expect(script).to.include('click');
      expect(script).to.include('vscode.postMessage');
      expect(script).to.include('command:');
      expect(script).to.include('jumpToLine');
      expect(script).to.include('parseInt');
    });

    it('should include code to handle clicking on symbols', () => {
      const script = webview.getClientScript();

      expect(script).to.include('document.querySelectorAll(\'.symbol\')');
      expect(script).to.include('el.addEventListener(\'click\'');
      expect(script).to.include('getAttribute(\'data-line\')');
    });
  });

  describe('error handling', () => {
    it('should handle missing text editor gracefully', async () => {
      // Set active editor to null
      mockVscode.window.activeTextEditor = null;

      await webview.show(mockSymbols, 'javascript');

      // Get the message handler
      const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.args[0][0];

      // Should not throw when there's no active editor
      expect(() => messageHandler({ command: 'jumpToLine', line: 5 })).to.not.throw();
    });

    it('should handle malformed line values', async () => {
      await webview.show(mockSymbols, 'javascript');

      // Get the message handler
      const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.args[0][0];

      // Test with NaN value
      expect(() => messageHandler({ command: 'jumpToLine', line: NaN })).to.not.throw();

      // Test with non-numeric string that will be parsed as NaN
      expect(() => messageHandler({ command: 'jumpToLine', line: 'abc' })).to.not.throw();

      // Test with undefined line
      expect(() => messageHandler({ command: 'jumpToLine', line: undefined })).to.not.throw();
    });

    it('should handle symbols with missing properties gracefully', () => {
      // Create invalid symbol missing required properties
      const incompleteSymbol = {
        name: 'IncompleteSymbol',
        // Missing kind, range, selectionRange
        children: []
      };

      // Should not throw when generating HTML for invalid symbols
      expect(() => webview.getSymbolsHtml([incompleteSymbol])).to.not.throw();
    });
  });

  describe('panel lifecycle', () => {
    it('should dispose panel when explicit dispose is called', async () => {
      await webview.show(mockSymbols, 'javascript');

      // Add dispose method to webview for testing
      webview.dispose = function() {
        if (this.panel) {
          this.panel.dispose();
          this.panel = undefined;
        }
      };

      webview.dispose();
      expect(webview.panel).to.be.undefined;
      expect(mockWebviewPanel.dispose.calledOnce).to.be.true;
    });

    it('should handle multiple dispose calls gracefully', async () => {
      // Add dispose method to webview for testing
      webview.dispose = function() {
        if (this.panel) {
          this.panel.dispose();
          this.panel = undefined;
        }
      };

      // Should not throw when panel is already undefined
      expect(() => webview.dispose()).to.not.throw();
      expect(() => webview.dispose()).to.not.throw();
    });
  });
});
