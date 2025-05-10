const path = require('path');
const { AnalyzerFactory } = require('../analyzerFactory');

// Mock dependencies
jest.mock('../baseAnalyzer');
jest.mock('../javaAnalyzer');
jest.mock('../pythonAnalyzer');
jest.mock('../typescriptAnalyzer');
jest.mock('../../../common/logging');
jest.mock('../typescript/metricsCalculator');
jest.mock('../typescript/patternAnalyzer');

describe('AnalyzerFactory (JS)', () => {
    let factory;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Get a fresh instance for each test
        factory = AnalyzerFactory.getInstance();
    });

    describe('getInstance', () => {
        it('should return the same instance when called multiple times', () => {
            const instance1 = AnalyzerFactory.getInstance();
            const instance2 = AnalyzerFactory.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe('getAnalyzer', () => {
        it('should return TypeScript analyzer for .ts files', () => {
            const analyzer = factory.getAnalyzer('example.ts');

            expect(analyzer).toBeDefined();
            expect(require('../typescriptAnalyzer').TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should return TypeScript analyzer for .tsx files', () => {
            const analyzer = factory.getAnalyzer('example.tsx');

            expect(analyzer).toBeDefined();
            expect(require('../typescriptAnalyzer').TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should return TypeScript analyzer for .js files', () => {
            const analyzer = factory.getAnalyzer('example.js');

            expect(analyzer).toBeDefined();
            expect(require('../typescriptAnalyzer').TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should return TypeScript analyzer for .jsx files', () => {
            const analyzer = factory.getAnalyzer('example.jsx');

            expect(analyzer).toBeDefined();
            expect(require('../typescriptAnalyzer').TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should return Python analyzer for .py files', () => {
            const analyzer = factory.getAnalyzer('example.py');

            expect(analyzer).toBeDefined();
            expect(require('../pythonAnalyzer').PythonAnalyzer).toHaveBeenCalled();
        });

        it('should return Python analyzer for .pyw files', () => {
            const analyzer = factory.getAnalyzer('example.pyw');

            expect(analyzer).toBeDefined();
            expect(require('../pythonAnalyzer').PythonAnalyzer).toHaveBeenCalled();
        });

        it('should return Java analyzer for .java files', () => {
            const analyzer = factory.getAnalyzer('example.java');

            expect(analyzer).toBeDefined();
            expect(require('../javaAnalyzer').JavaAnalyzer).toHaveBeenCalled();
        });

        it('should return default analyzer for unknown file types', () => {
            const analyzer = factory.getAnalyzer('example.unknown');

            expect(analyzer).toBeDefined();
            // Default should be TypeScript analyzer
            expect(require('../typescriptAnalyzer').TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should throw an error if no analyzer is found', () => {
            // This test requires special setup to bypass the default analyzer
            // We'll need to mock the internal analyzers Map
            const originalMap = factory.analyzers;
            factory.analyzers = new Map();

            expect(() => {
                factory.getAnalyzer('example.ts');
            }).toThrow('No analyzer found for file type: .ts');

            // Restore the original map
            factory.analyzers = originalMap;
        });

        it('should consider the full file path when determining the analyzer', () => {
            const analyzer = factory.getAnalyzer('/path/to/example.ts');

            expect(analyzer).toBeDefined();
            expect(require('../typescriptAnalyzer').TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should be case-insensitive when determining file extensions', () => {
            const analyzer1 = factory.getAnalyzer('example.TS');
            const analyzer2 = factory.getAnalyzer('example.Js');

            expect(analyzer1).toBeDefined();
            expect(analyzer2).toBeDefined();
            expect(require('../typescriptAnalyzer').TypeScriptAnalyzer).toHaveBeenCalledTimes(2);
        });
    });

    describe('getSupportedExtensions', () => {
        it('should return all supported file extensions', () => {
            const extensions = factory.getSupportedExtensions();

            expect(extensions).toContain('.ts');
            expect(extensions).toContain('.tsx');
            expect(extensions).toContain('.js');
            expect(extensions).toContain('.jsx');
            expect(extensions).toContain('.py');
            expect(extensions).toContain('.pyw');
            expect(extensions).toContain('.java');
            expect(extensions).not.toContain('.*'); // Exclude the default
        });
    });

    describe('hasAnalyzer', () => {
        it('should return true for supported languages', () => {
            expect(factory.hasAnalyzer('javascript')).toBe(true);
            expect(factory.hasAnalyzer('typescript')).toBe(true);
            expect(factory.hasAnalyzer('python')).toBe(true);
            expect(factory.hasAnalyzer('java')).toBe(true);
        });

        it('should return false for unsupported languages', () => {
            expect(factory.hasAnalyzer('ruby')).toBe(false);
            expect(factory.hasAnalyzer('c++')).toBe(false);
            expect(factory.hasAnalyzer('')).toBe(false);
        });
    });

    describe('registerDefaultAnalyzers', () => {
        it('should register analyzers for all supported file types', () => {
            // This is already tested indirectly by getAnalyzer tests
            // But we can test it more explicitly by inspecting the analyzers Map
            const analyzers = factory.analyzers;

            expect(analyzers.get('.ts')).toBeDefined();
            expect(analyzers.get('.tsx')).toBeDefined();
            expect(analyzers.get('.js')).toBeDefined();
            expect(analyzers.get('.jsx')).toBeDefined();
            expect(analyzers.get('.py')).toBeDefined();
            expect(analyzers.get('.pyw')).toBeDefined();
            expect(analyzers.get('.java')).toBeDefined();
            expect(analyzers.get('.*')).toBeDefined(); // Default analyzer
        });
    });

    describe('JavaScript-specific tests', () => {
        it('should handle dynamic property access', () => {
            // In JavaScript, properties can be accessed dynamically
            const extensions = ['ts', 'js', 'py', 'java'];

            extensions.forEach(ext => {
                const analyzer = factory.getAnalyzer(`example.${ext}`);
                expect(analyzer).toBeDefined();
            });
        });

        it('should handle optional chaining', () => {
            // Test JavaScript optional chaining feature
            const nullFactory = null;

            // This would throw in strict TypeScript
            const nullAnalyzer = nullFactory?.getAnalyzer('example.ts');

            expect(nullAnalyzer).toBeUndefined();
        });

        it('should work with JavaScript prototypal inheritance', () => {
            // Create a subclass using JavaScript prototypal inheritance
            function ExtendedFactory() {}
            ExtendedFactory.prototype = Object.create(AnalyzerFactory.getInstance());
            ExtendedFactory.prototype.constructor = ExtendedFactory;

            // Add a method
            ExtendedFactory.prototype.getLanguageForExtension = function(ext) {
                if (ext.startsWith('.ts') || ext.startsWith('.js')) return 'typescript/javascript';
                if (ext.startsWith('.py')) return 'python';
                if (ext.startsWith('.java')) return 'java';
                return 'unknown';
            };

            const extendedFactory = new ExtendedFactory();

            // Should inherit methods from AnalyzerFactory
            expect(extendedFactory.getSupportedExtensions).toBeDefined();
            expect(extendedFactory.getLanguageForExtension('.ts')).toBe('typescript/javascript');
        });
    });
});
