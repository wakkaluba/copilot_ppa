import * as vscode from 'vscode';
import { CodeLink, ICodeExecutor, ICodeLinker, ICodeNavigator } from '../types';

// Mock VS Code types
jest.mock('vscode', () => ({
  Uri: {
    file: jest.fn((path) => ({ fsPath: path }))
  }
}));

describe('Code Editor Types', () => {
  describe('ICodeExecutor interface', () => {
    it('should define the expected methods', () => {
      // Create a mock implementation of ICodeExecutor
      const mockExecutor: ICodeExecutor = {
        executeSelectedCode: jest.fn().mockResolvedValue(undefined)
      };

      // Verify the interface structure
      expect(mockExecutor).toBeDefined();
      expect(typeof mockExecutor.executeSelectedCode).toBe('function');

      // Test the method can be called
      mockExecutor.executeSelectedCode();
      expect(mockExecutor.executeSelectedCode).toHaveBeenCalled();
    });
  });

  describe('ICodeNavigator interface', () => {
    it('should define the expected methods', () => {
      // Create a mock implementation of ICodeNavigator
      const mockNavigator: ICodeNavigator = {
        showCodeOverview: jest.fn().mockResolvedValue(undefined),
        findReferences: jest.fn().mockResolvedValue(undefined)
      };

      // Verify the interface structure
      expect(mockNavigator).toBeDefined();
      expect(typeof mockNavigator.showCodeOverview).toBe('function');
      expect(typeof mockNavigator.findReferences).toBe('function');

      // Test the methods can be called
      mockNavigator.showCodeOverview();
      expect(mockNavigator.showCodeOverview).toHaveBeenCalled();

      mockNavigator.findReferences();
      expect(mockNavigator.findReferences).toHaveBeenCalled();
    });
  });

  describe('ICodeLinker interface', () => {
    it('should define the expected methods', () => {
      // Create a mock implementation of ICodeLinker
      const mockLinker: ICodeLinker = {
        createCodeLink: jest.fn().mockResolvedValue(undefined),
        navigateCodeLink: jest.fn().mockResolvedValue(undefined)
      };

      // Verify the interface structure
      expect(mockLinker).toBeDefined();
      expect(typeof mockLinker.createCodeLink).toBe('function');
      expect(typeof mockLinker.navigateCodeLink).toBe('function');

      // Test the methods can be called
      mockLinker.createCodeLink();
      expect(mockLinker.createCodeLink).toHaveBeenCalled();

      mockLinker.navigateCodeLink();
      expect(mockLinker.navigateCodeLink).toHaveBeenCalled();
    });
  });

  describe('CodeLink type', () => {
    it('should have the correct structure', () => {
      // Create a valid CodeLink object
      const codeLink: CodeLink = {
        source: {
          uri: 'file:///path/to/source.ts',
          position: {
            line: 42,
            character: 10
          },
          text: 'someFunction'
        },
        target: {
          uri: 'file:///path/to/target.ts',
          position: {
            line: 100,
            character: 5
          }
        }
      };

      // Verify the structure
      expect(codeLink).toBeDefined();
      expect(codeLink.source).toBeDefined();
      expect(codeLink.source.uri).toBeDefined();
      expect(codeLink.source.position).toBeDefined();
      expect(codeLink.source.position.line).toBe(42);
      expect(codeLink.source.position.character).toBe(10);
      expect(codeLink.source.text).toBe('someFunction');

      expect(codeLink.target).toBeDefined();
      expect(codeLink.target.uri).toBeDefined();
      expect(codeLink.target.position).toBeDefined();
      expect(codeLink.target.position.line).toBe(100);
      expect(codeLink.target.position.character).toBe(5);
    });

    it('should allow target without position', () => {
      // Create a CodeLink with optional target.position omitted
      const codeLink: CodeLink = {
        source: {
          uri: 'file:///path/to/source.ts',
          position: {
            line: 42,
            character: 10
          },
          text: 'someFunction'
        },
        target: {
          uri: 'file:///path/to/target.ts'
          // position is optional and omitted here
        }
      };

      // Verify the structure
      expect(codeLink).toBeDefined();
      expect(codeLink.source).toBeDefined();
      expect(codeLink.target).toBeDefined();
      expect(codeLink.target.uri).toBeDefined();
      expect(codeLink.target.position).toBeUndefined();
    });

    it('should be compatible with VS Code URI', () => {
      const uri = vscode.Uri.file('/path/to/file.ts');

      // Create a CodeLink using VS Code Uri
      const codeLink: CodeLink = {
        source: {
          uri: uri.fsPath,
          position: {
            line: 1,
            character: 1
          },
          text: 'code'
        },
        target: {
          uri: uri.fsPath,
          position: {
            line: 2,
            character: 2
          }
        }
      };

      expect(codeLink).toBeDefined();
      expect(codeLink.source.uri).toBe('/path/to/file.ts');
      expect(codeLink.target.uri).toBe('/path/to/file.ts');
    });
  });

  describe('Interface implementations', () => {
    it('should allow implementing multiple interfaces', () => {
      // Create a class that implements multiple interfaces
      class CodeService implements ICodeExecutor, ICodeNavigator, ICodeLinker {
        async executeSelectedCode(): Promise<void> {
          return Promise.resolve();
        }

        async showCodeOverview(): Promise<void> {
          return Promise.resolve();
        }

        async findReferences(): Promise<void> {
          return Promise.resolve();
        }

        async createCodeLink(): Promise<void> {
          return Promise.resolve();
        }

        async navigateCodeLink(): Promise<void> {
          return Promise.resolve();
        }
      }

      const service = new CodeService();

      // Verify the service implements all interfaces
      expect(service).toBeDefined();
      expect(typeof service.executeSelectedCode).toBe('function');
      expect(typeof service.showCodeOverview).toBe('function');
      expect(typeof service.findReferences).toBe('function');
      expect(typeof service.createCodeLink).toBe('function');
      expect(typeof service.navigateCodeLink).toBe('function');
    });
  });
});
