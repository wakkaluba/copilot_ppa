import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import axios from 'axios';
import { LLMModelService, HardwareSpecs } from '../../../src/llm/modelService';

describe('LLMModelService Tests', () => {
  let sandbox: sinon.SinonSandbox;
  let mockContext: vscode.ExtensionContext;
  let createStatusBarItemStub: sinon.SinonStub;
  let createOutputChannelStub: sinon.SinonStub;
  let registerCommandStub: sinon.SinonStub;
  let axiosGetStub: sinon.SinonStub;
  let mockStatusBarItem: any;
  let mockOutputChannel: any;
  let mockConfig: any;
  let getConfigurationStub: sinon.SinonStub;
  let withProgressStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;
  let showWarningMessageStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;
  let createWebviewPanelStub: sinon.SinonStub;
  let showQuickPickStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Mock status bar item
    mockStatusBarItem = {
      text: '',
      tooltip: '',
      command: '',
      show: sandbox.stub(),
      hide: sandbox.stub(),
      dispose: sandbox.stub()
    };
    
    // Mock output channel
    mockOutputChannel = {
      appendLine: sandbox.stub(),
      clear: sandbox.stub(),
      show: sandbox.stub(),
      dispose: sandbox.stub()
    };
    
    // Mock config
    mockConfig = {
      get: sandbox.stub().callsFake((key, defaultValue) => defaultValue)
    };
    
    // Mock VS Code APIs
    createStatusBarItemStub = sandbox.stub(vscode.window, 'createStatusBarItem').returns(mockStatusBarItem);
    createOutputChannelStub = sandbox.stub(vscode.window, 'createOutputChannel').returns(mockOutputChannel);
    registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand').returns({ dispose: sandbox.stub() });
    getConfigurationStub = sandbox.stub(vscode.workspace, 'getConfiguration').returns(mockConfig);
    
    // Fix the withProgress stub to properly include the promise resolution
    withProgressStub = sandbox.stub(vscode.window, 'withProgress').callsFake(async (options, callback) => {
      const progress = { report: sandbox.stub() };
      return callback(progress);
    });
    
    showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves('OK');
    showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage').resolves('OK');
    showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage').resolves('OK');
    
    // Mock webview panel with complete properties
    createWebviewPanelStub = sandbox.stub(vscode.window, 'createWebviewPanel').returns({
      webview: {
        html: '',
        onDidReceiveMessage: sandbox.stub(),
        postMessage: sandbox.stub().resolves(true),
        asWebviewUri: sandbox.stub().returns(vscode.Uri.parse('https://mock-webview'))
      },
      onDidDispose: sandbox.stub(),
      onDidChangeViewState: sandbox.stub(),
      reveal: sandbox.stub(),
      dispose: sandbox.stub()
    });

    // Mock quick pick to support different return values per test
    showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
    
    // Default to returning a selection
    showQuickPickStub.resolves({
      label: 'Test Model',
      detail: 'Recommended model for testing',
      description: '4GB'
    });
    
    // Mock axios with better configurability
    axiosGetStub = sandbox.stub(axios, 'get');
    
    // Mock extension context
    mockContext = {
      subscriptions: [],
      extensionPath: '/test/path',
      extensionUri: vscode.Uri.parse('file:///test/path'),
      storageUri: vscode.Uri.parse('file:///test/storage'),
      globalStorageUri: vscode.Uri.parse('file:///test/globalStorage'),
      logUri: vscode.Uri.parse('file:///test/log'),
      asAbsolutePath: (p: string) => `/test/path/${p}`,
      storagePath: '/test/storagePath',
      globalStoragePath: '/test/globalStoragePath',
      logPath: '/test/logPath',
      extensionMode: vscode.ExtensionMode.Development,
      globalState: {
        keys: () => [],
        get: (key: string) => undefined,
        update: (key: string, value: any) => Promise.resolve(),
        setKeysForSync: (keys: string[]) => {}
      },
      workspaceState: {
        keys: () => [],
        get: (key: string) => undefined,
        update: (key: string, value: any) => Promise.resolve()
      }
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should initialize correctly', () => {
    const modelService = new LLMModelService(mockContext);
    
    assert(createStatusBarItemStub.calledOnce, 'Should create status bar item');
    assert(createOutputChannelStub.calledWith('LLM Models'), 'Should create output channel');
    assert(registerCommandStub.calledWith('copilot-ppa.getModelRecommendations'), 'Should register getModelRecommendations command');
    assert(registerCommandStub.calledWith('copilot-ppa.checkCudaSupport'), 'Should register checkCudaSupport command');
    assert(registerCommandStub.calledWith('copilot-ppa.checkModelCompatibility'), 'Should register checkModelCompatibility command');
    assert(mockStatusBarItem.show.calledOnce, 'Should show status bar item');
  });

  describe('getModelRecommendations', () => {
    let modelService: LLMModelService;
    const mockHardwareSpecs: HardwareSpecs = {
      gpu: {
        available: true,
        name: 'Test GPU',
        vram: 4096,
        cudaSupport: true
      },
      ram: {
        total: 16384,
        free: 8192
      },
      cpu: {
        cores: 8,
        model: 'Test CPU'
      }
    };
    
    beforeEach(() => {
      modelService = new LLMModelService(mockContext);
      
      // Mock getHardwareSpecs
      (modelService as any).getHardwareSpecs = sinon.stub().resolves(mockHardwareSpecs);
    });
    
    it('should handle successful Ollama model list', async () => {
      // Mock successful Ollama response with models
      const mockOllamaResponse = {
        status: 200,
        data: {
          models: [
            { name: 'llama2', modified_at: '2023-07-25T14:33:40Z', size: 3791730298 },
            { name: 'mistral', modified_at: '2023-10-10T12:15:23Z', size: 4126384733 }
          ]
        }
      };
      
      axiosGetStub.withArgs(sinon.match(/api\/tags/)).resolves(mockOllamaResponse);
      axiosGetStub.withArgs(sinon.match(/v1\/models/)).rejects(new Error('Connection failed'));
      
      await (modelService as any).getModelRecommendations();
      
      assert(withProgressStub.calledOnce, 'Should display progress');
      assert(axiosGetStub.calledWith(sinon.match(/api\/tags/)), 'Should call Ollama API');
      assert(showQuickPickStub.calledOnce, 'Should show quick pick with models');
    });
    
    it('should handle when no models are available', async () => {
      // Mock failed responses from both providers
      axiosGetStub.withArgs(sinon.match(/api\/tags/)).rejects(new Error('Connection failed'));
      axiosGetStub.withArgs(sinon.match(/v1\/models/)).rejects(new Error('Connection failed'));
      
      // Mock the getDefaultRecommendations to return something
      (modelService as any).getDefaultRecommendations = sinon.stub().returns([
        { label: 'Default Model', description: '4GB', detail: 'Recommended model when no providers are available' }
      ]);
      
      await (modelService as any).getModelRecommendations();
      
      // The service should provide default recommendations even when no models are available
      assert(withProgressStub.calledOnce, 'Should display progress');
      assert(showQuickPickStub.calledOnce, 'Should show quick pick with recommendations');
    });
    
    it('should handle errors gracefully', async () => {
      // Force an error during recommendations process
      (modelService as any).getOllamaModels = sinon.stub().throws(new Error('Test error'));
      
      await (modelService as any).getModelRecommendations();
      
      assert(showErrorMessageStub.calledWith(sinon.match(/Error getting model recommendations/)), 'Should show error message');
      assert(mockOutputChannel.appendLine.calledWith(sinon.match(/Error in getModelRecommendations/)), 'Should log error');
    });
  });

  describe('checkCudaSupport', () => {
    it('should show success message when CUDA is available', async () => {
      const modelService = new LLMModelService(mockContext);
      
      // Mock hardware specs with CUDA
      (modelService as any).getHardwareSpecs = sinon.stub().resolves({
        gpu: {
          available: true,
          name: 'Test GPU',
          vram: 4096,
          cudaSupport: true
        },
        ram: { total: 16384, free: 8192 },
        cpu: { cores: 8, model: 'Test CPU' }
      });
      
      await (modelService as any).checkCudaSupport();
      
      assert(showInformationMessageStub.calledWith(sinon.match(/CUDA support detected/)), 'Should show CUDA detected message');
    });
    
    it('should show warning when GPU is available but no CUDA', async () => {
      const modelService = new LLMModelService(mockContext);
      
      // Mock hardware specs with GPU but no CUDA
      (modelService as any).getHardwareSpecs = sinon.stub().resolves({
        gpu: {
          available: true,
          name: 'Test GPU',
          vram: 4096,
          cudaSupport: false
        },
        ram: { total: 16384, free: 8192 },
        cpu: { cores: 8 }
      });
      
      await (modelService as any).checkCudaSupport();
      
      assert(showInformationMessageStub.calledWith(sinon.match(/GPU detected, but CUDA support not available/)), 'Should show GPU without CUDA message');
    });
    
    it('should show warning when no GPU is available', async () => {
      const modelService = new LLMModelService(mockContext);
      
      // Mock hardware specs without GPU
      (modelService as any).getHardwareSpecs = sinon.stub().resolves({
        gpu: {
          available: false
        },
        ram: { total: 16384, free: 8192 },
        cpu: { cores: 8 }
      });
      
      await (modelService as any).checkCudaSupport();
      
      assert(showWarningMessageStub.calledWith(sinon.match(/No GPU with CUDA support detected/)), 'Should show no GPU message');
    });
  });

  describe('checkModelCompatibility', () => {
    it('should show compatibility message for suitable model', async () => {
      const modelService = new LLMModelService(mockContext);
      
      // Mock hardware specs with good specs
      (modelService as any).getHardwareSpecs = sinon.stub().resolves({
        gpu: {
          available: true,
          name: 'Test GPU',
          vram: 8192,
          cudaSupport: true
        },
        ram: { total: 32768, free: 16384 },
        cpu: { cores: 12 }
      });
      
      // Mock configuration for small model
      mockConfig.get.withArgs('provider', 'ollama').returns('ollama');
      mockConfig.get.withArgs('modelId', 'llama2').returns('llama2');
      
      await (modelService as any).checkModelCompatibility();
      
      assert(showInformationMessageStub.calledWith(sinon.match(/is compatible with your system/)), 'Should show compatibility message');
    });
    
    it('should show warning for large model with insufficient RAM', async () => {
      const modelService = new LLMModelService(mockContext);
      
      // Mock hardware specs with limited RAM
      (modelService as any).getHardwareSpecs = sinon.stub().resolves({
        gpu: {
          available: true,
          name: 'Test GPU',
          vram: 8192,
          cudaSupport: true
        },
        ram: { total: 8192, free: 4096 },
        cpu: { cores: 8 }
      });
      
      // Mock configuration for large model
      mockConfig.get.withArgs('provider', 'ollama').returns('ollama');
      mockConfig.get.withArgs('modelId', 'llama2').returns('llama2-13b');
      
      await (modelService as any).checkModelCompatibility();
      
      assert(showWarningMessageStub.calledWith(sinon.match(/may be too large for your system/)), 'Should show warning for large model');
    });
  });
});