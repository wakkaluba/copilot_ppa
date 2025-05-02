const { expect } = require('chai');
const sinon = require('sinon');
const vscode = require('vscode');
const { CodeOverviewWebview } = require('../../../../src/codeEditor/webviews/codeOverviewWebview');

describe('CodeOverviewWebview - JavaScript', () => {
  let webview;
  let sandbox;
  let mockPanel;
  let mockWebviewView;
  let mockSymbols;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create mock panel and webview objects
    mockWebviewView = {
      html: '',
      onDidReceiveMessage: sandbox.stub().callsFake(callback => {
        mockWebviewView.messageCallback = callback;
        return { dispose: sandbox.stub() };
      }),
      postMessage: sandbox.stub().resolves(true)
    };

    mockPanel = {
      webview: mockWebviewView,
      dispose: sandbox.stub(),
      onDidDispose: sandbox.stub().returns({ dispose: sandbox.stub() }),
      reveal: sandbox.stub()
    };

    // Mock VS Code API
    sandbox.stub(vscode.window, 'createWebviewPanel').returns(mockPanel);
    sandbox.stub(vscode.window, 'showTextDocument').resolves();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();

    // Mock symbols for testing
    mockSymbols = [
      {
        name: 'TestClass',
        kind: vscode.SymbolKind.Class,
        range: new vscode.Range(0, 0, 10, 0),
        selectionRange: new vscode.Range(0, 0, 0, 9),
        children: [
          {
            name: 'testMethod',
            kind: vscode.SymbolKind.Method,
            range: new vscode.Range(2, 0, 4, 0),
            selectionRange: new vscode.Range(2, 0, 2, 10),
            children: []
          }
        ]
      }
    ];

    // Create webview instance
    webview = new CodeOverviewWebview();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('show', () => {
    it('should create a webview panel and set its html content', async () => {
      await webview.show(mockSymbols, 'javascript');

      expect(vscode.window.createWebviewPanel.calledOnce).to.be.true;
      expect(mockPanel.webview.html).to.be.a('string');
      expect(mockPanel.webview.html.length).to.be.greaterThan(0);
      expect(mockPanel.webview.html).to.include('TestClass');
      expect(mockPanel.webview.html).to.include('testMethod');
    });

    it('should handle empty symbols', async () => {
      await webview.show([], 'javascript');

      expect(vscode.window.createWebviewPanel.calledOnce).to.be.true;
      expect(mockPanel.webview.html).to.be.a('string');
      expect(mockPanel.webview.html.length).to.be.greaterThan(0);
      expect(mockPanel.webview.html).to.include('No symbols found');
    });

    it('should register webview message handling', async () => {
      await webview.show(mockSymbols, 'javascript');

      expect(mockPanel.webview.onDidReceiveMessage.calledOnce).to.be.true;
    });

    it('should handle errors during panel creation', async () => {
      vscode.window.createWebviewPanel.throws(new Error('Failed to create webview'));

      await webview.show(mockSymbols, 'javascript');

      expect(vscode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('registerWebviewMessageHandling', () => {
    it('should register a message handler for jump commands', () => {
      webview.registerWebviewMessageHandling(mockPanel);

      expect(mockPanel.webview.onDidReceiveMessage.calledOnce).to.be.true;

      // Simulate a message from the webview
      const jumpSpy = sandbox.spy(webview, 'jumpToLine');
      mockWebviewView.messageCallback({ command: 'jump', line: 5 });

      expect(jumpSpy.calledWith(5)).to.be.true;
    });

    it('should ignore unknown commands', () => {
      webview.registerWebviewMessageHandling(mockPanel);

      const jumpSpy = sandbox.spy(webview, 'jumpToLine');
      mockWebviewView.messageCallback({ command: 'unknown', data: 'test' });

      expect(jumpSpy.called).to.be.false;
    });
  });

  describe('jumpToLine', () => {
    it('should reveal the specified line in the active editor', async () => {
      const mockEditor = {
        revealRange: sandbox.stub(),
        document: {
          lineAt: sandbox.stub().returns({
            range: new vscode.Range(5, 0, 5, 10)
          })
        }
      };

      sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);

      await webview.jumpToLine(5);

      expect(mockEditor.document.lineAt.calledWith(5)).to.be.true;
      expect(mockEditor.revealRange.calledOnce).to.be.true;
    });

    it('should handle errors during jump', async () => {
      sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);

      await webview.jumpToLine(5);

      expect(vscode.window.showErrorMessage.calledOnce).to.be.true;
    });
  });

  describe('getWebviewContent', () => {
    it('should generate HTML content for the webview', () => {
      const content = webview.getWebviewContent(mockSymbols, 'javascript');

      expect(content).to.be.a('string');
      expect(content).to.include('<!DOCTYPE html>');
      expect(content).to.include('<html>');
      expect(content).to.include('</html>');
      expect(content).to.include('TestClass');
      expect(content).to.include('testMethod');
      expect(content).to.include('<style>');
      expect(content).to.include('<script>');
    });

    it('should include language-specific styling', () => {
      const content = webview.getWebviewContent(mockSymbols, 'javascript');

      expect(content).to.include('javascript');
    });
  });

  describe('getSymbolsHtml', () => {
    it('should generate HTML for symbol hierarchy', () => {
      const html = webview.getSymbolsHtml(mockSymbols, 0);

      expect(html).to.be.a('string');
      expect(html).to.include('TestClass');
      expect(html).to.include('testMethod');
      expect(html).to.include('data-line');
    });

    it('should handle empty symbols', () => {
      const html = webview.getSymbolsHtml([], 0);

      expect(html).to.be.a('string');
      expect(html).to.include('No symbols found');
    });

    it('should apply indentation for nested symbols', () => {
      const html = webview.getSymbolsHtml(mockSymbols, 0);

      // Check that the child method has more indentation than the parent class
      const classIndex = html.indexOf('TestClass');
      const methodIndex = html.indexOf('testMethod');

      expect(classIndex).to.be.lessThan(methodIndex);

      // The child method should have more indentation
      const classLine = html.substring(html.lastIndexOf('<li', classIndex), html.indexOf('</li>', classIndex) + 5);
      const methodLine = html.substring(html.lastIndexOf('<li', methodIndex), html.indexOf('</li>', methodIndex) + 5);

      expect(methodLine.indexOf('<li')).to.be.greaterThan(classLine.indexOf('<li'));
    });
  });

  describe('getStyles', () => {
    it('should return CSS styles as a string', () => {
      const styles = webview.getStyles();

      expect(styles).to.be.a('string');
      expect(styles).to.include('body');
      expect(styles).to.include('ul');
      expect(styles).to.include('li');
      expect(styles).to.include('color');
    });
  });

  describe('getClientScript', () => {
    it('should return JavaScript code as a string', () => {
      const script = webview.getClientScript();

      expect(script).to.be.a('string');
      expect(script).to.include('function');
      expect(script).to.include('document');
      expect(script).to.include('addEventListener');
      expect(script).to.include('vscode');
      expect(script).to.include('postMessage');
    });

    it('should include code for handling symbol clicks', () => {
      const script = webview.getClientScript();

      expect(script).to.include('click');
      expect(script).to.include('data-line');
      expect(script).to.include('jump');
    });
  });
});
