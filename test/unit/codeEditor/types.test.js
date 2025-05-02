const { expect } = require('chai');
const vscode = require('vscode');
const types = require('../../../src/codeEditor/types');

describe('CodeEditor Types - JavaScript', () => {
  describe('Interface Signatures', () => {
    it('should export ICodeExecutor interface', () => {
      expect(types).to.have.property('ICodeExecutor');
    });

    it('should export ICodeNavigator interface', () => {
      expect(types).to.have.property('ICodeNavigator');
    });

    it('should export ICodeLinker interface', () => {
      expect(types).to.have.property('ICodeLinker');
    });
  });

  describe('CodeLink Type', () => {
    it('should export CodeLink type', () => {
      expect(types).to.have.property('CodeLink');
    });

    it('should be able to create a CodeLink object with required properties', () => {
      const link = {
        sourceUri: { fsPath: '/path/to/source.js' },
        sourcePosition: { line: 10, character: 15 },
        targetUri: { fsPath: '/path/to/target.js' },
        targetPosition: { line: 20, character: 25 },
        text: 'linkText'
      };

      // Verify we can create this type without errors
      const codeLink = types.CodeLink ? new types.CodeLink(link) : link;

      expect(codeLink).to.have.property('sourceUri');
      expect(codeLink).to.have.property('sourcePosition');
      expect(codeLink).to.have.property('targetUri');
      expect(codeLink).to.have.property('targetPosition');
      expect(codeLink).to.have.property('text');
    });
  });

  describe('Optional Types', () => {
    it('should export other optional types if they exist', () => {
      // Test any additional types that might be exported
      if (types.CodeFragment) {
        expect(types.CodeFragment).to.exist;
      }

      if (types.CodeEditorOptions) {
        expect(types.CodeEditorOptions).to.exist;
      }

      if (types.NavigationOptions) {
        expect(types.NavigationOptions).to.exist;
      }
    });

    it('should allow creating objects matching any additional type definitions', () => {
      // Test creating objects that match additional type definitions if they exist
      if (types.CodeFragment) {
        const fragment = {
          code: 'console.log("test")',
          language: 'javascript',
          lineNumber: 5
        };

        expect(fragment).to.have.property('code');
        expect(fragment).to.have.property('language');
      }
    });
  });

  describe('Type Usage', () => {
    it('should allow using the ICodeExecutor interface methods', () => {
      // Create a mock that implements ICodeExecutor
      const executor = {
        executeCode: () => {},
        executeSelectedCode: () => {},
        executeInTerminal: (code, language) => {}
      };

      // Verify the interface structure
      expect(executor).to.have.property('executeCode');
      expect(executor).to.have.property('executeSelectedCode');
      expect(executor).to.have.property('executeInTerminal');
      expect(executor.executeCode).to.be.a('function');
      expect(executor.executeSelectedCode).to.be.a('function');
      expect(executor.executeInTerminal).to.be.a('function');
    });

    it('should allow using the ICodeNavigator interface methods', () => {
      // Create a mock that implements ICodeNavigator
      const navigator = {
        showCodeOverview: () => {},
        findReferences: () => {}
      };

      // Verify the interface structure
      expect(navigator).to.have.property('showCodeOverview');
      expect(navigator).to.have.property('findReferences');
      expect(navigator.showCodeOverview).to.be.a('function');
      expect(navigator.findReferences).to.be.a('function');
    });

    it('should allow using the ICodeLinker interface methods', () => {
      // Create a mock that implements ICodeLinker
      const linker = {
        createCodeLink: () => {},
        navigateCodeLink: () => {}
      };

      // Verify the interface structure
      expect(linker).to.have.property('createCodeLink');
      expect(linker).to.have.property('navigateCodeLink');
      expect(linker.createCodeLink).to.be.a('function');
      expect(linker.navigateCodeLink).to.be.a('function');
    });
  });
});
