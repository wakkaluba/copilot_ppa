const { expect } = require('chai');
const sinon = require('sinon');
const { EnhancedChatProvider } = require('../../../src/chat/enhancedChatProvider');

describe('EnhancedChatProvider - JavaScript', () => {
  let provider;
  let mockContext;
  let mockContextManager;
  let mockLLMProvider;
  let mockWebview;
  let clock;

  beforeEach(() => {
    // Setup fake timers for testing delays and timeouts
    clock = sinon.useFakeTimers();

    // Mock the VS Code window
    global.vscode = {
      window: {
        showErrorMessage: sinon.stub(),
        showInformationMessage: sinon.stub(),
        createOutputChannel: sinon.stub().returns({
          appendLine: sinon.stub(),
          show: sinon.stub(),
          clear: sinon.stub(),
          dispose: sinon.stub()
        })
      },
      ProgressLocation: {
        Notification: 1
      },
      Uri: {
        parse: sinon.stub().returns({
          fsPath: '/path/to/file'
        })
      },
      Position: function(line, character) {
        this.line = line;
        this.character = character;
      }
    };

    // Setup mock webview
    mockWebview = {
      onDidReceiveMessage: sinon.stub().callsFake((callback) => {
        mockWebview.messageCallback = callback;
        return { dispose: sinon.stub() };
      }),
      postMessage: sinon.stub().resolves(true),
      html: '',
      dispose: sinon.stub()
    };

    // Setup mock context and other dependencies
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: sinon.stub().returns([]),
        update: sinon.stub().resolves()
      }
    };

    mockContextManager = {
      getCurrentContext: sinon.stub().returns({
        selectedCode: 'console.log("Hello World");',
        selectedLanguage: 'javascript',
        currentFilePath: '/path/to/file.js'
      }),
      updateContext: sinon.stub()
    };

    mockLLMProvider = {
      isConnected: sinon.stub().returns(true),
      getStatus: sinon.stub().returns({ connected: true, status: 'online' }),
      generateChatResponse: sinon.stub().callsFake(async (promptText, callbacks) => {
        // Simulate streaming response
        await Promise.resolve();
        callbacks.onPartialResponse('Partial response');
        await Promise.resolve();
        callbacks.onCompletion('Final response');
        return 'Final response';
      }),
      getModelInfo: sinon.stub().returns({
        name: 'test-model',
        parameters: '7B',
        version: '1.0'
      })
    };

    // Create provider instance
    provider = new EnhancedChatProvider(mockContext, mockContextManager, mockLLMProvider);
  });

  afterEach(() => {
    // Restore timers
    clock.restore();
    sinon.restore();
    delete global.vscode;
  });

  describe('Initialization', () => {
    it('should initialize with provided dependencies', () => {
      expect(provider).to.be.instanceOf(EnhancedChatProvider);
    });

    it('should register with context subscriptions', () => {
      expect(mockContext.subscriptions).to.include.something.that.has.property('dispose');
    });
  });

  describe('Webview Integration', () => {
    it('should set webview and register message handler', () => {
      provider.setWebview(mockWebview);
      expect(mockWebview.onDidReceiveMessage.calledOnce).to.be.true;
    });

    it('should render chat interface', () => {
      provider.setWebview(mockWebview);
      provider.renderChatInterface();
      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'render',
        messages: sinon.match.array
      }))).to.be.true;
    });

    it('should send messages to webview', () => {
      provider.setWebview(mockWebview);
      provider.sendMessagesToWebview();
      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'messages',
        messages: sinon.match.array
      }))).to.be.true;
    });
  });

  describe('Connection Status', () => {
    it('should update connection status in webview', () => {
      provider.setWebview(mockWebview);
      provider.updateConnectionStatus();
      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'connectionStatus',
        status: { connected: true, status: 'online' }
      }))).to.be.true;
    });

    it('should handle offline mode gracefully', async () => {
      mockLLMProvider.isConnected.returns(false);
      mockLLMProvider.getStatus.returns({ connected: false, status: 'offline' });
      provider.setWebview(mockWebview);

      await provider.handleUserMessage('Hello');

      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'connectionStatus',
        status: { connected: false, status: 'offline' }
      }))).to.be.true;
    });
  });

  describe('Message Handling', () => {
    it('should handle user messages', async () => {
      provider.setWebview(mockWebview);
      await provider.handleUserMessage('Hello world');

      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'messages',
        messages: sinon.match.array
      }))).to.be.true;
    });

    it('should generate streaming responses', async () => {
      provider.setWebview(mockWebview);
      const response = provider.generateStreamingResponse('Hello world');

      // Advance timers to let the async operations complete
      await clock.runAllAsync();

      await response;
      expect(mockLLMProvider.generateChatResponse.calledOnce).to.be.true;
      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'updateStreamingContent',
        content: 'Partial response'
      }))).to.be.true;
    });

    it('should handle offline mode with stored message', async () => {
      mockLLMProvider.isConnected.returns(false);
      provider.setWebview(mockWebview);

      await provider.handleOfflineMode('Hello offline');

      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'messages',
        messages: sinon.match.array
      }))).to.be.true;

      // Verify the offline message is saved
      expect(mockContext.workspaceState.update.calledOnce).to.be.true;
    });

    it('should sync offline messages when coming back online', async () => {
      // Setup: first offline, then online
      mockLLMProvider.isConnected.onFirstCall().returns(false);
      mockLLMProvider.isConnected.onSecondCall().returns(true);
      mockLLMProvider.getStatus.onFirstCall().returns({ connected: false, status: 'offline' });
      mockLLMProvider.getStatus.onSecondCall().returns({ connected: true, status: 'online' });

      provider.setWebview(mockWebview);

      // Send a message while offline
      await provider.handleUserMessage('Hello offline');

      // Now simulate coming back online
      mockLLMProvider.isConnected.returns(true);
      mockLLMProvider.getStatus.returns({ connected: true, status: 'online' });

      await provider.syncOfflineMessages();
      await clock.runAllAsync();

      expect(mockLLMProvider.generateChatResponse.called).to.be.true;
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during streaming response', async () => {
      mockLLMProvider.generateChatResponse.rejects(new Error('Connection error'));
      provider.setWebview(mockWebview);

      const errorHandler = sinon.spy(provider, 'handleError');

      try {
        await provider.generateStreamingResponse('Hello with error');
        await clock.runAllAsync();
      } catch (error) {
        // Expected to throw
      }

      expect(errorHandler.called).to.be.true;
      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'messages',
        messages: sinon.match.array
      }))).to.be.true;
    });

    it('should implement retry with exponential backoff', async () => {
      mockLLMProvider.generateChatResponse.rejects(new Error('Connection error'));
      provider.setWebview(mockWebview);

      const waitSpy = sinon.spy(provider, 'waitBeforeRetry');

      try {
        await provider.generateStreamingResponse('Hello with retry');
        await clock.runAllAsync();
      } catch (error) {
        // Expected to throw
      }

      expect(waitSpy.called).to.be.true;
    });
  });

  describe('Content Streaming and Updates', () => {
    it('should update streaming content in webview', () => {
      provider.setWebview(mockWebview);
      provider.updateStreamingContent('New content');

      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'updateStreamingContent',
        content: 'New content'
      }))).to.be.true;
    });
  });

  describe('Status Updates', () => {
    it('should send status updates to webview', () => {
      provider.setWebview(mockWebview);
      provider.updateStatus('typing');

      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'status',
        status: 'typing'
      }))).to.be.true;
    });
  });

  describe('Code Snippet Handling', () => {
    it('should create formatted code snippets', () => {
      const code = 'console.log("Hello world");';
      const language = 'javascript';

      const snippet = provider.createCodeSnippet(code, language);

      expect(snippet).to.include('```javascript');
      expect(snippet).to.include(code);
      expect(snippet).to.include('```');
    });

    it('should handle code snippets with no language specified', () => {
      const code = 'print("Hello world")';

      const snippet = provider.createCodeSnippet(code);

      expect(snippet).to.include('```');
      expect(snippet).to.include(code);
    });
  });

  describe('History Management', () => {
    it('should clear chat history', () => {
      provider.setWebview(mockWebview);
      provider.clearHistory();

      expect(mockWebview.postMessage.calledWith(sinon.match({
        type: 'messages',
        messages: []
      }))).to.be.true;
    });
  });

  describe('Resource Management', () => {
    it('should dispose resources', () => {
      provider.setWebview(mockWebview);
      provider.dispose();

      expect(mockWebview.dispose.calledOnce).to.be.true;
    });
  });

  describe('Message Event Handling', () => {
    it('should handle message events from webview', async () => {
      provider.setWebview(mockWebview);

      const handleUserMessageSpy = sinon.spy(provider, 'handleUserMessage');

      // Simulate a message from the webview
      await mockWebview.messageCallback({
        type: 'userMessage',
        content: 'Hello from webview'
      });

      expect(handleUserMessageSpy.calledWith('Hello from webview')).to.be.true;
    });

    it('should handle clearHistory message from webview', () => {
      provider.setWebview(mockWebview);

      const clearHistorySpy = sinon.spy(provider, 'clearHistory');

      // Simulate a clearHistory message
      mockWebview.messageCallback({
        type: 'clearHistory'
      });

      expect(clearHistorySpy.calledOnce).to.be.true;
    });

    it('should handle unknown message types gracefully', () => {
      provider.setWebview(mockWebview);

      // Should not throw an error
      expect(() => mockWebview.messageCallback({
        type: 'unknownType',
        content: 'Unknown content'
      })).to.not.throw();
    });
  });
});
