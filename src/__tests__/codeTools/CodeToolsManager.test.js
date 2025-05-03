const vscode = require('vscode');
const { CodeToolsManager } = require('../../codeTools/codeToolsManager');
const { LinterIntegration } = require('../../codeTools/linterIntegration');
const { ComplexityAnalyzer } = require('../../codeTools/complexityAnalyzer');
const { RefactoringTools } = require('../../codeTools/refactoringTools');
const { DocumentationGenerator } = require('../../codeTools/documentationGenerator');

// Mock the dependencies
jest.mock('vscode', () => ({
  commands: {
    registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() })
  },
  ExtensionContext: jest.fn()
}));

jest.mock('../../codeTools/linterIntegration', () => ({
  LinterIntegration: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    runLinter: jest.fn(),
    dispose: jest.fn()
  }))
}));

jest.mock('../../codeTools/complexityAnalyzer', () => ({
  ComplexityAnalyzer: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    analyzeFile: jest.fn(),
    dispose: jest.fn()
  }))
}));

jest.mock('../../codeTools/refactoringTools', () => ({
  RefactoringTools: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    simplifyCode: jest.fn(),
    removeUnusedCode: jest.fn(),
    dispose: jest.fn()
  }))
}));

jest.mock('../../codeTools/documentationGenerator', () => ({
  DocumentationGenerator: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    generateDocs: jest.fn(),
    dispose: jest.fn()
  }))
}));

describe('CodeToolsManager', () => {
  let codeToolsManager;
  let mockContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = {
      subscriptions: [],
    };
    codeToolsManager = new CodeToolsManager(mockContext);
  });

  describe('constructor', () => {
    it('should create instances of all required services', () => {
      expect(LinterIntegration).toHaveBeenCalled();
      expect(ComplexityAnalyzer).toHaveBeenCalled();
      expect(RefactoringTools).toHaveBeenCalled();
      expect(DocumentationGenerator).toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('should initialize all services', async () => {
      await codeToolsManager.initialize();

      const linterIntegrationInstance = LinterIntegration.mock.results[0].value;
      const complexityAnalyzerInstance = ComplexityAnalyzer.mock.results[0].value;
      const refactoringToolsInstance = RefactoringTools.mock.results[0].value;
      const documentationGeneratorInstance = DocumentationGenerator.mock.results[0].value;

      expect(linterIntegrationInstance.initialize).toHaveBeenCalled();
      expect(complexityAnalyzerInstance.initialize).toHaveBeenCalled();
      expect(refactoringToolsInstance.initialize).toHaveBeenCalled();
      expect(documentationGeneratorInstance.initialize).toHaveBeenCalled();
    });

    it('should register commands', async () => {
      await codeToolsManager.initialize();

      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(5);
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'local-llm-agent.runLinter',
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'local-llm-agent.analyzeComplexity',
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'local-llm-agent.simplifyCode',
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'local-llm-agent.removeUnusedCode',
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'local-llm-agent.generateDocs',
        expect.any(Function)
      );
    });

    it('should add command registrations to context subscriptions', async () => {
      const mockDisposable = { dispose: jest.fn() };
      vscode.commands.registerCommand.mockReturnValue(mockDisposable);

      await codeToolsManager.initialize();

      expect(mockContext.subscriptions.length).toBe(5);
      expect(mockContext.subscriptions).toContain(mockDisposable);
    });
  });

  describe('command execution', () => {
    it('should execute runLinter command correctly', async () => {
      await codeToolsManager.initialize();

      const linterIntegrationInstance = LinterIntegration.mock.results[0].value;

      // Extract the callback function passed to registerCommand
      const runLinterCallback = vscode.commands.registerCommand.mock.calls.find(
        call => call[0] === 'local-llm-agent.runLinter'
      )[1];

      runLinterCallback();

      expect(linterIntegrationInstance.runLinter).toHaveBeenCalled();
    });

    it('should execute analyzeComplexity command correctly', async () => {
      await codeToolsManager.initialize();

      const complexityAnalyzerInstance = ComplexityAnalyzer.mock.results[0].value;

      const analyzeComplexityCallback = vscode.commands.registerCommand.mock.calls.find(
        call => call[0] === 'local-llm-agent.analyzeComplexity'
      )[1];

      analyzeComplexityCallback();

      expect(complexityAnalyzerInstance.analyzeFile).toHaveBeenCalled();
    });

    it('should execute simplifyCode command correctly', async () => {
      await codeToolsManager.initialize();

      const refactoringToolsInstance = RefactoringTools.mock.results[0].value;

      const simplifyCodeCallback = vscode.commands.registerCommand.mock.calls.find(
        call => call[0] === 'local-llm-agent.simplifyCode'
      )[1];

      simplifyCodeCallback();

      expect(refactoringToolsInstance.simplifyCode).toHaveBeenCalled();
    });

    it('should execute removeUnusedCode command correctly', async () => {
      await codeToolsManager.initialize();

      const refactoringToolsInstance = RefactoringTools.mock.results[0].value;

      const removeUnusedCodeCallback = vscode.commands.registerCommand.mock.calls.find(
        call => call[0] === 'local-llm-agent.removeUnusedCode'
      )[1];

      removeUnusedCodeCallback();

      expect(refactoringToolsInstance.removeUnusedCode).toHaveBeenCalled();
    });

    it('should execute generateDocs command correctly', async () => {
      await codeToolsManager.initialize();

      const documentationGeneratorInstance = DocumentationGenerator.mock.results[0].value;

      const generateDocsCallback = vscode.commands.registerCommand.mock.calls.find(
        call => call[0] === 'local-llm-agent.generateDocs'
      )[1];

      generateDocsCallback();

      expect(documentationGeneratorInstance.generateDocs).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should dispose all services', () => {
      codeToolsManager.dispose();

      const linterIntegrationInstance = LinterIntegration.mock.results[0].value;
      const complexityAnalyzerInstance = ComplexityAnalyzer.mock.results[0].value;
      const refactoringToolsInstance = RefactoringTools.mock.results[0].value;
      const documentationGeneratorInstance = DocumentationGenerator.mock.results[0].value;

      expect(linterIntegrationInstance.dispose).toHaveBeenCalled();
      expect(complexityAnalyzerInstance.dispose).toHaveBeenCalled();
      expect(refactoringToolsInstance.dispose).toHaveBeenCalled();
      expect(documentationGeneratorInstance.dispose).toHaveBeenCalled();
    });
  });
});
