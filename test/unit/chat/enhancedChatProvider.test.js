const { expect } = require('chai');
const sinon = require('sinon');
const { EnhancedChatProvider } = require('../../../src/chat/enhancedChatProvider');

describe('EnhancedChatProvider - JavaScript', () => {
  let provider;
  let mockContext;
  let mockContextManager;
  let mockLLMProvider;
  let mockWebview;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create mock dependencies
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: sandbox.stub().returns([]),
        update: sandbox.stub().resolves()
      }
    };

    mockContextManager = {
      getContext: sandbox.stub().returns({
        files: ['file1.js', 'file2.js'],
        selectedText: 'selected code'
      }),
      updateContext: sandbox.stub()
    };

    mockLLMProvider = {
      isConnected: sandbox.stub().returns(true),
      generateResponse: sandbox.stub().resolves('AI response'),
      generateStreamingResponse: sandbox.stub().returns({
        on: sandbox.stub().callsFake((event, callback) => {
          if (event === 'data') {
            callback('Streaming response chunk');
          }
          if (event === 'end') {
            callback();
          }
          return { on: sandbox.stub() };
        })
      })
    };

    mockWebview = {
      postMessage: sandbox.stub().resolves(true),
      onDidReceiveMessage: sandbox.stub()
    };

    // Create provider instance
    provider = new EnhancedChatProvider(mockContext, mockContextManager, mockLLMProvider);
    provider.setWebview(mockWebview);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize correctly with dependencies', () => {
      expect(provider).to.be.instanceOf(EnhancedChatProvider);
      expect(provider.context).to.equal(mockContext);
      expect(provider.contextManager).to.equal(mockContextManager);
      expect(provider.llmProvider).to.equal(mockLLMProvider);
    });

    it('should initialize with empty messages array', () => {
      expect(provider.messages).to.be.an('array').that.is.empty;
    });
  });

  describe('setWebview', () => {
    it('should set the webview and register message handler', () => {
      const newWebview = {
        postMessage: sandbox.stub(),
        onDidReceiveMessage: sandbox.stub()
      };

      provider.setWebview(newWebview);
      expect(provider.webview).to.equal(newWebview);
      expect(newWebview.onDidReceiveMessage.called).to.be.true;
    });
  });

  describe('renderChatInterface', () => {
    it('should call sendMessagesToWebview and updateConnectionStatus', () => {
      sandbox.stub(provider, 'sendMessagesToWebview');
      sandbox.stub(provider, 'updateConnectionStatus');

      provider.renderChatInterface();

      expect(provider.sendMessagesToWebview.calledOnce).to.be.true;
      expect(provider.updateConnectionStatus.calledOnce).to.be.true;
    });
  });

  describe('sendMessagesToWebview', () => {
    it('should post messages to the webview', () => {
      provider.messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ];

      provider.sendMessagesToWebview();

      expect(mockWebview.postMessage.calledOnce).to.be.true;
      expect(mockWebview.postMessage.firstCall.args[0].command).to.equal('setMessages');
      expect(mockWebview.postMessage.firstCall.args[0].messages).to.deep.equal(provider.messages);
    });
  });

  describe('updateConnectionStatus', () => {
    it('should post connection status to the webview when connected', () => {
      provider.updateConnectionStatus();

      expect(mockWebview.postMessage.calledOnce).to.be.true;
      expect(mockWebview.postMessage.firstCall.args[0].command).to.equal('updateConnectionStatus');
      expect(mockWebview.postMessage.firstCall.args[0].connected).to.be.true;
    });

    it('should post disconnected status when LLM provider is not connected', () => {
      mockLLMProvider.isConnected.returns(false);

      provider.updateConnectionStatus();

      expect(mockWebview.postMessage.calledOnce).to.be.true;
      expect(mockWebview.postMessage.firstCall.args[0].connected).to.be.false;
    });
  });

  describe('handleUserMessage', () => {
    it('should add user message to messages array and generate response', async () => {
      sandbox.stub(provider, 'generateStreamingResponse').resolves('AI response');
      sandbox.stub(provider, 'sendMessagesToWebview');

      await provider.handleUserMessage('Hello AI');

      expect(provider.messages).to.have.lengthOf(2);
      expect(provider.messages[0]).to.deep.include({ role: 'user', content: 'Hello AI' });
      expect(provider.generateStreamingResponse.calledOnce).to.be.true;
      expect(provider.sendMessagesToWebview.called).to.be.true;
    });

    it('should handle errors during response generation', async () => {
      const error = new Error('Generation failed');
      sandbox.stub(provider, 'generateStreamingResponse').rejects(error);
      sandbox.stub(provider, 'handleError');

      await provider.handleUserMessage('Hello AI');

      expect(provider.handleError.calledWith(error)).to.be.true;
    });
  });

  describe('generateStreamingResponse', () => {
    it('should generate streaming response from LLM provider', async () => {
      const userMessage = { role: 'user', content: 'Hello' };
      sandbox.stub(provider, 'updateStreamingContent');

      await provider.generateStreamingResponse(userMessage);

      expect(mockLLMProvider.generateStreamingResponse.calledOnce).to.be.true;
      expect(provider.updateStreamingContent.called).to.be.true;
    });

    it('should handle offline mode when LLM provider is not connected', async () => {
      mockLLMProvider.isConnected.returns(false);
      sandbox.stub(provider, 'handleOfflineMode');

      const userMessage = { role: 'user', content: 'Hello' };
      await provider.generateStreamingResponse(userMessage);

      expect(provider.handleOfflineMode.calledOnce).to.be.true;
    });
  });

  describe('handleOfflineMode', () => {
    it('should add offline response message and cache user message', () => {
      sandbox.stub(provider, 'sendMessagesToWebview');
      const message = { role: 'user', content: 'Hello offline' };

      provider.handleOfflineMode(message);

      expect(provider.messages).to.have.lengthOf(1);
      expect(provider.messages[0].role).to.equal('assistant');
      expect(provider.messages[0].content).to.include('offline');
      expect(provider.sendMessagesToWebview.calledOnce).to.be.true;
    });
  });

  describe('handleError', () => {
    it('should add error message and update status', () => {
      sandbox.stub(provider, 'updateStatus');
      sandbox.stub(provider, 'sendMessagesToWebview');

      provider.handleError(new Error('Test error'));

      expect(provider.messages).to.have.lengthOf(1);
      expect(provider.messages[0].role).to.equal('system');
      expect(provider.messages[0].content).to.include('error');
      expect(provider.updateStatus.calledWith('error')).to.be.true;
      expect(provider.sendMessagesToWebview.calledOnce).to.be.true;
    });

    it('should retry on connection error after wait', async () => {
      const retryError = new Error('Connection reset');
      retryError.code = 'ECONNRESET';

      sandbox.stub(provider, 'waitBeforeRetry').resolves();
      sandbox.stub(provider, 'updateStatus');
      sandbox.stub(provider, 'renderChatInterface');

      await provider.handleError(retryError);

      expect(provider.waitBeforeRetry.calledOnce).to.be.true;
      expect(provider.renderChatInterface.calledOnce).to.be.true;
    });
  });

  describe('waitBeforeRetry', () => {
    it('should wait for the specified retry delay', async () => {
      const clock = sandbox.useFakeTimers();
      let resolved = false;

      const waitPromise = provider.waitBeforeRetry(1).then(() => {
        resolved = true;
      });

      expect(resolved).to.be.false;
      clock.tick(2000); // Default delay is 1000ms * retryCount
      await waitPromise;
      expect(resolved).to.be.true;
    });
  });

  describe('updateStreamingContent', () => {
    it('should post streaming content to the webview', () => {
      provider.updateStreamingContent('New content');

      expect(mockWebview.postMessage.calledOnce).to.be.true;
      expect(mockWebview.postMessage.firstCall.args[0].command).to.equal('updateStreamingContent');
      expect(mockWebview.postMessage.firstCall.args[0].content).to.equal('New content');
    });
  });

  describe('syncOfflineMessages', () => {
    it('should process cached offline messages when reconnecting', async () => {
      provider.offlineMessages = [
        { role: 'user', content: 'Offline message 1' },
        { role: 'user', content: 'Offline message 2' }
      ];

      sandbox.stub(provider, 'generateStreamingResponse').resolves();

      await provider.syncOfflineMessages();

      expect(provider.generateStreamingResponse.callCount).to.equal(2);
      expect(provider.offlineMessages).to.be.empty;
    });
  });

  describe('updateStatus', () => {
    it('should post status update to the webview', () => {
      provider.updateStatus('loading');

      expect(mockWebview.postMessage.calledOnce).to.be.true;
      expect(mockWebview.postMessage.firstCall.args[0].command).to.equal('updateStatus');
      expect(mockWebview.postMessage.firstCall.args[0].status).to.equal('loading');
    });
  });

  describe('createCodeSnippet', () => {
    it('should create a properly formatted code snippet', () => {
      const code = 'const x = 10;';
      const language = 'javascript';

      const snippet = provider.createCodeSnippet(code, language);

      expect(snippet).to.include('```javascript');
      expect(snippet).to.include(code);
      expect(snippet).to.include('```');
    });

    it('should handle snippets without specified language', () => {
      const code = 'const x = 10;';

      const snippet = provider.createCodeSnippet(code);

      expect(snippet).to.include('```');
      expect(snippet).to.include(code);
      expect(snippet).to.include('```');
    });
  });

  describe('clearHistory', () => {
    it('should clear messages and update webview', () => {
      provider.messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ];

      sandbox.stub(provider, 'sendMessagesToWebview');

      provider.clearHistory();

      expect(provider.messages).to.be.empty;
      expect(provider.sendMessagesToWebview.calledOnce).to.be.true;
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      const disposable = { dispose: sandbox.stub() };
      provider.disposables = [disposable];

      provider.dispose();

      expect(disposable.dispose.calledOnce).to.be.true;
    });
  });
});
