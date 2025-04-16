import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { assert } from 'chai';
import axios from 'axios';
import { LLMModelService } from '../../../src/llm/modelService';
import { HardwareSpecs } from '../../../src/llm/types';

// Hardware specification types for LLM compatibility checking
export interface HardwareSpecs {
  gpu: {
    available: boolean;
    name?: string;
    vram?: number;
    cudaSupport?: boolean;
  };
  ram: {
    total: number;
    free: number;
  };
  cpu: {
    cores: number;
    model?: string;
  };
}

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
    
    // Fix the withProgress stub to properly handle progress reporting and promise resolution
    withProgressStub = sandbox.stub(vscode.window, 'withProgress').callsFake(async (options, callback) => {
      const progress = { 
        report: sandbox.stub()
      };
      const token = new vscode.CancellationTokenSource().token;
      try {
        return await callback(progress, token);
      } catch (error) {
        console.error('Error in withProgress:', error);
        throw error;
      }
    });
    
    showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves({ title: 'OK' } as vscode.MessageItem);
    showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage').resolves({ title: 'OK' } as vscode.MessageItem);
    showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage').resolves({ title: 'OK' } as vscode.MessageItem);
    
    // Mock webview panel with complete properties and event emitters
    const webviewMessageHandler = new vscode.EventEmitter<any>();
    const onDidDisposeEmitter = new vscode.EventEmitter<void>();
    const onDidChangeViewStateEmitter = new vscode.EventEmitter<vscode.WebviewPanelOnDidChangeViewStateEvent>();
    
    // Fix the webview panel mock creation
    createWebviewPanelStub = sandbox.stub(vscode.window, 'createWebviewPanel').returns({
      viewType: 'modelCompatibility',
      title: 'Model Compatibility',
      webview: {
        html: '',
        onDidReceiveMessage: webviewMessageHandler.event,
        postMessage: sandbox.stub().resolves(true),
        asWebviewUri: (uri: vscode.Uri) => uri,
        options: { enableScripts: true },
        cspSource: ''
      },
      dispose: () => {},
      onDidDispose: onDidDisposeEmitter.event,
      onDidChangeViewState: onDidChangeViewStateEmitter.event,
      reveal: sandbox.stub(),
      visible: true,
      active: true,
      options: {},
      viewColumn: vscode.ViewColumn.One
    } as vscode.WebviewPanel);

    // Mock quick pick to support different return values per test
    showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick').callsFake((items) => {
      // Return first item if items is an array
      if (Array.isArray(items) && items.length > 0) {
        return Promise.resolve(items[0]);
      }
      // Default response
      return Promise.resolve({
        label: 'Test Model',
        detail: 'Recommended model for testing',
        description: '4GB'
      });
    });
    
    // Ensure axios.get returns a properly structured response
    axiosGetStub = sandbox.stub(axios, 'get').callsFake((url) => {
      if (url === 'http://localhost:11434/api/tags') {
        return Promise.resolve({
          data: {
            models: [
              { name: 'llama2', modified_at: '2023-07-25T14:33:40Z', size: 3791730298 }
            ]
          }
        });
      }
      return Promise.reject(new Error(`Unmocked URL: ${url}`));
    });
    
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
      },
      secrets: {
        get: (key: string) => Promise.resolve(undefined),
        store: (key: string, value: string) => Promise.resolve(),
        delete: (key: string) => Promise.resolve(),
        onDidChange: new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event
      },
      environmentVariableCollection: {
        persistent: true,
        description: undefined,
        replace: (variable: string, value: string) => {},
        append: (variable: string, value: string) => {},
        prepend: (variable: string, value: string) => {},
        get: (variable: string): vscode.EnvironmentVariableMutator | undefined => undefined,
        forEach: (callback: (variable: string, mutator: vscode.EnvironmentVariableMutator, collection: vscode.EnvironmentVariableCollection) => any, thisArg?: any) => {},
        delete: (variable: string) => {},
        clear: () => {},
        getScoped: (scope: vscode.EnvironmentVariableScope): vscode.EnvironmentVariableCollection => ({
          persistent: true,
          description: undefined,
          replace: () => {},
          append: () => {},
          prepend: () => {},
          get: () => undefined,
          forEach: () => {},
          delete: () => {},
          clear: () => {},
          [Symbol.iterator]: function* () { yield* []; }
        }),
        [Symbol.iterator]: function* () { yield* []; }
      } as vscode.GlobalEnvironmentVariableCollection,
      extension: {
        id: 'test-extension',
        extensionUri: vscode.Uri.parse('file:///test/path'),
        extensionPath: '/test/path',
        isActive: true,
        packageJSON: {},
        exports: undefined,
        activate: () => Promise.resolve(),
        extensionKind: vscode.ExtensionKind.Workspace
      },
      languageModelAccessInformation: {
        onDidChange: new vscode.EventEmitter<void>().event,
        canSendRequest: (chat: vscode.LanguageModelChat) => true
      }
    };

    // Mock internal methods on the prototype to apply to all instances
    sandbox.stub(LLMModelService.prototype, 'getHardwareSpecs').resolves({
      gpu: { available: true, name: 'Test GPU', vram: 4096, cudaSupport: true },
      ram: { total: 16384, free: 8192 },
      cpu: { cores: 8, model: 'Test CPU' }
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should initialize correctly', async () => {
    // Create the service with a properly mocked context
    const modelService = new LLMModelService(mockContext);
    
    // Directly await initialization rather than using setTimeout
    await (modelService as any).initPromise;
    
    assert(createStatusBarItemStub.called, 'Should create status bar item');
    assert(createOutputChannelStub.calledWith('LLM Models'), 'Should create output channel');
    assert(registerCommandStub.calledWith('copilot-ppa.getModelRecommendations'), 'Should register getModelRecommendations command');
    assert(registerCommandStub.calledWith('copilot-ppa.checkCudaSupport'), 'Should register checkCudaSupport command');
    assert(registerCommandStub.calledWith('copilot-ppa.checkModelCompatibility'), 'Should register checkModelCompatibility command');
    assert(mockStatusBarItem.show.called, 'Should show status bar item');
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
      
      // Mock the methods that we don't want to test directly
      (modelService as any).getHardwareSpecs = sandbox.stub().resolves(mockHardwareSpecs);
      (modelService as any).getOllamaModels = sandbox.stub().resolves([]);
      (modelService as any).getLMStudioModels = sandbox.stub().resolves([]);
      (modelService as any).getDefaultRecommendations = sandbox.stub().returns([
        { label: 'Default Model', description: '4GB', detail: 'Test model' }
      ]);

      // Stub the Ollama API call specifically
      axiosGetStub.withArgs('http://localhost:11434/api/tags').resolves({
        data: {
          models: [
            { name: 'llama2', modified_at: '2023-07-25T14:33:40Z', size: 3791730298 }
          ]
        }
      });
    });
    
    it('should handle successful Ollama model list', async () => {
      // Mock successful Ollama response with models
      const mockOllamaModels = [
        { label: 'llama2', description: '4GB', detail: 'A language model' },
        { label: 'mistral', description: '4GB', detail: 'Another language model' }
      ];
      
      // Make getOllamaModels return the mock models
      (modelService as any).getOllamaModels = sandbox.stub().resolves(mockOllamaModels);
      
      await (modelService as any).getModelRecommendations();
      
      assert(withProgressStub.called, 'Should display progress');
      assert(showQuickPickStub.called, 'Should show quick pick with models');
      
      // Verify that the quick pick was called with an array that includes our models
      const quickPickArgs = showQuickPickStub.firstCall.args[0];
      assert(Array.isArray(quickPickArgs), 'Quick pick should receive an array');
    });
    
    it('should handle when no models are available', async () => {
      // Force empty arrays for all model sources
      (modelService as any).getOllamaModels = sandbox.stub().resolves([]);
      (modelService as any).getLMStudioModels = sandbox.stub().resolves([]);
      
      // Mock the default recommendations
      const defaultRecommendations = [
        { label: 'Default Model', description: '4GB', detail: 'Recommended model' }
      ];
      (modelService as any).getDefaultRecommendations = sandbox.stub().returns(defaultRecommendations);
      
      await (modelService as any).getModelRecommendations();
      
      assert(withProgressStub.called, 'Should display progress');
      assert(showQuickPickStub.called, 'Should show quick pick with recommendations');
      const quickPickArgs = showQuickPickStub.firstCall.args[0];
      assert(Array.isArray(quickPickArgs), 'Quick pick should receive an array');
      assert.deepStrictEqual(quickPickArgs, defaultRecommendations, 'Should show default recommendations');
    });
    
    it('should handle errors gracefully', async () => {
      // Force an error during recommendations process
      (modelService as any).getOllamaModels = sandbox.stub().throws(new Error('Test error'));
      
      await (modelService as any).getModelRecommendations();
      
      assert(showErrorMessageStub.called, 'Should show error message');
    });

    it('should generate recommendations based on hardware specs', async () => {
      // Return the default recommendations directly
      const defaultRecommendations = [
        { label: 'Model 7B', description: '4GB', detail: 'Small model' },
        { label: 'Model 13B', description: '8GB', detail: 'Medium model' }
      ];
      (modelService as any).getDefaultRecommendations = sandbox.stub().returns(defaultRecommendations);
      
      await (modelService as any).getModelRecommendations();
      
      assert(withProgressStub.called, 'Should display progress');
      assert(showQuickPickStub.called, 'Should show quick pick with recommendations');
      
      // Verify default recommendations are shown
      const quickPickArgs = showQuickPickStub.firstCall.args[0];
      assert(Array.isArray(quickPickArgs), 'Quick pick should receive an array');
      assert.deepStrictEqual(quickPickArgs, defaultRecommendations, 'Should show hardware-based recommendations');
    });

    it('should handle Ollama API failure gracefully', async () => {
      // Mock a failed API response
      (modelService as any).getOllamaModels = sandbox.stub().rejects(new Error('Connection refused'));
      
      await (modelService as any).getModelRecommendations();
      
      assert(withProgressStub.called, 'Should display progress');
      assert(showQuickPickStub.called, 'Should show quick pick with default models');
      assert(mockOutputChannel.appendLine.calledWith(sinon.match(/Error getting Ollama models/)), 
        'Should log the error');
    });

    it('should filter models based on hardware compatibility', async () => {
      // Mock hardware with limited VRAM
      const limitedHardware = {
        ...mockHardwareSpecs,
        gpu: { ...mockHardwareSpecs.gpu, vram: 2048 }
      };
      (modelService as any).getHardwareSpecs = sandbox.stub().resolves(limitedHardware);
      
      // Mock larger models and smaller models
      const mockModels = [
        { label: 'small-model', description: '2GB', detail: 'Compatible model' },
        { label: 'large-model', description: '8GB', detail: 'Incompatible model' }
      ];
      (modelService as any).getOllamaModels = sandbox.stub().resolves(mockModels);
      
      await (modelService as any).getModelRecommendations();
      
      // Verify that showQuickPick was called with filtered models
      assert(showQuickPickStub.calledWith(
        sinon.match.array.deepEquals([
          { label: 'small-model', description: '2GB', detail: 'Compatible model' }
        ])
      ), 'Should filter out incompatible models');
    });
  });

  describe('checkCudaSupport', () => {
    let modelService: LLMModelService;
    
    beforeEach(() => {
      modelService = new LLMModelService(mockContext);
    });
    
    it('should show success message when CUDA is available', async () => {
      // Mock hardware specs with CUDA support
      const specWithCuda = {
        gpu: {
          available: true,
          name: 'Test GPU',
          vram: 4096,
          cudaSupport: true
        },
        ram: { total: 16384, free: 8192 },
        cpu: { cores: 8, model: 'Test CPU' }
      };
      
      (modelService as any).getHardwareSpecs = sandbox.stub().resolves(specWithCuda);
      
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

    it('should show information message when CUDA is supported', async () => {
      // Mock GPU with CUDA support
      (modelService as any).getHardwareSpecs = sandbox.stub().resolves({
        gpu: { available: true, name: 'NVIDIA GPU', vram: 4096, cudaSupport: true },
        ram: { total: 16384, free: 8192 },
        cpu: { cores: 8, model: 'Test CPU' }
      });
      
      await (modelService as any).checkCudaSupport();
      
      assert(showInformationMessageStub.calledWith(
        sinon.match(/CUDA is supported/)
      ), 'Should show message confirming CUDA support');
    });
    
    it('should show warning message when CUDA is not supported', async () => {
      // Mock GPU without CUDA support
      (modelService as any).getHardwareSpecs = sandbox.stub().resolves({
        gpu: { available: true, name: 'AMD GPU', vram: 4096, cudaSupport: false },
        ram: { total: 16384, free: 8192 },
        cpu: { cores: 8, model: 'Test CPU' }
      });
      
      await (modelService as any).checkCudaSupport();
      
      assert(showWarningMessageStub.calledWith(
        sinon.match(/CUDA is not supported/)
      ), 'Should show warning about missing CUDA support');
    });
  });

  describe('checkModelCompatibility', () => {
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
      
      // Mock the model size estimation method
      (modelService as any).getModelSizeEstimation = sandbox.stub().returns({
        vram: 4000,
        ram: 8000,
        recommendedVram: 6000,
        recommendedRam: 16000
      });
    });
    
    it('should show compatibility message for suitable model', async () => {
      // Mock hardware specs with good specs
      (modelService as any).getHardwareSpecs = sandbox.stub().resolves({
        gpu: {
          available: true,
          name: 'Test GPU',
          vram: 8192,
          cudaSupport: true
        },
        ram: { total: 32768, free: 16384 },
        cpu: { cores: 12 }
      });
      
      // Mock configuration to return specific values
      mockConfig.get.withArgs('provider', sinon.match.any).returns('ollama');
      mockConfig.get.withArgs('modelId', sinon.match.any).returns('llama2');
      
      await (modelService as any).checkModelCompatibility();
      
      assert(showInformationMessageStub.called, 'Should show information message');
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

    it('should handle errors during compatibility check', async () => {
      const modelService = new LLMModelService(mockContext);
      
      // Force an error during hardware detection
      (modelService as any).getHardwareSpecs = sinon.stub().rejects(new Error('Hardware detection failed'));
      
      await (modelService as any).checkModelCompatibility();
      
      assert(showErrorMessageStub.calledWith(sinon.match(/Error checking model compatibility/)), 
        'Should show error message when compatibility check fails');
    });

    it('should show compatibility information for installed models', async () => {
      // Mock installed models
      (modelService as any).getOllamaModels = sandbox.stub().resolves([
        { label: 'llama2', description: '4GB', detail: 'A language model' }
      ]);
      
      // Mock hardware specs
      (modelService as any).getHardwareSpecs = sandbox.stub().resolves(mockHardwareSpecs);
      
      await (modelService as any).checkModelCompatibility();
      
      // Verify that a webview panel is created to display compatibility info
      assert(createWebviewPanelStub.called, 'Should create webview panel for compatibility info');
    });
    
    it('should handle no installed models scenario', async () => {
      // Mock no installed models
      (modelService as any).getOllamaModels = sandbox.stub().resolves([]);
      (modelService as any).getLMStudioModels = sandbox.stub().resolves([]);
      
      await (modelService as any).checkModelCompatibility();
      
      assert(showInformationMessageStub.calledWith(
        sinon.match(/No models installed/)
      ), 'Should show message about no installed models');
    });
  });

  describe('getHardwareSpecs', () => {
    let modelService: LLMModelService;
    let execStub: sinon.SinonStub;
    
    beforeEach(() => {
      modelService = new LLMModelService(mockContext);
      
      // Create a stub for child_process.exec that works
      execStub = sandbox.stub();
      const childProcess = require('child_process');
      if (childProcess.exec) {
        execStub = sandbox.stub(childProcess, 'exec');
      }
    });
    
    afterEach(() => {
      if (execStub.restore) {
        execStub.restore();
      }
    });
    
    it('should handle errors gracefully', async () => {
      // Make sure execStub is properly set up
      if (execStub.callsFake) {
        execStub.callsFake((cmd: string, callback: Function) => {
          callback(new Error('Mock error'), '', 'Command failed');
        });
      }
      
      const specs = await (modelService as any).getHardwareSpecs();
      
      // Even with errors, it should return an object with default values
      assert(specs, 'Should return a specs object');
      assert(specs.gpu, 'Should have gpu object');
      assert(specs.ram, 'Should have ram object');
      assert(specs.cpu, 'Should have cpu object');
    });
  });

  describe('getOllamaModels', () => {
    let modelService: LLMModelService;
    
    beforeEach(() => {
      modelService = new LLMModelService(mockContext);
    });
    
    it('should correctly parse Ollama API response', async () => {
      // Setup mock response
      axiosGetStub.withArgs('http://localhost:11434/api/tags').resolves({
        data: {
          models: [
            { name: 'llama2', modified_at: '2023-07-25T14:33:40Z', size: 3791730298 },
            { name: 'mistral', modified_at: '2023-08-15T10:22:15Z', size: 4815162342 }
          ]
        }
      });
      
      const models = await (modelService as any).getOllamaModels();
      
      assert.strictEqual(models.length, 2, 'Should return two models');
      assert.strictEqual(models[0].label, 'llama2', 'First model should be llama2');
      assert.strictEqual(models[1].label, 'mistral', 'Second model should be mistral');
    });
    
    it('should handle connection errors', async () => {
      // Setup mock error response
      axiosGetStub.withArgs('http://localhost:11434/api/tags').rejects(new Error('Connection refused'));
      
      const models = await (modelService as any).getOllamaModels();
      
      assert.deepStrictEqual(models, [], 'Should return empty array on error');
      assert(mockOutputChannel.appendLine.calledWith(sinon.match(/Error/)), 'Should log the error');
    });
  });
  
  describe('updateStatusBarItem', () => {
    let modelService: LLMModelService;
    
    beforeEach(() => {
      modelService = new LLMModelService(mockContext);
    });
    
    it('should update status bar with active model', async () => {
      // Wait for initialization
      await (modelService as any).initPromise;
      
      // Call the method with a model name
      await (modelService as any).updateStatusBarItem('llama2');
      
      assert(mockStatusBarItem.text.includes('llama2'), 'Status bar should show model name');
      assert(mockStatusBarItem.show.called, 'Status bar should be shown');
    });
    
    it('should handle no active model', async () => {
      // Wait for initialization
      await (modelService as any).initPromise;
      
      // Call the method with no model
      await (modelService as any).updateStatusBarItem();
      
      assert(mockStatusBarItem.text.includes('No Model'), 'Status bar should show No Model');
      assert(mockStatusBarItem.show.called, 'Status bar should be shown');
    });
  });
});