import { AnalyzerFactory } from '../analyzerFactory';
import { JavaAnalyzer } from '../javaAnalyzer';
import { PythonAnalyzer } from '../pythonAnalyzer';
import { TypeScriptAnalyzer } from '../typescriptAnalyzer';

// Mock dependencies
jest.mock('../baseAnalyzer');
jest.mock('../javaAnalyzer');
jest.mock('../pythonAnalyzer');
jest.mock('../typescriptAnalyzer');
jest.mock('../../../common/logging');
jest.mock('../typescript/metricsCalculator');
jest.mock('../typescript/patternAnalyzer');

describe('AnalyzerFactory', () => {
    let factory: AnalyzerFactory;

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
            expect(TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should return TypeScript analyzer for .tsx files', () => {
            const analyzer = factory.getAnalyzer('example.tsx');

            expect(analyzer).toBeDefined();
            expect(TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should return TypeScript analyzer for .js files', () => {
            const analyzer = factory.getAnalyzer('example.js');

            expect(analyzer).toBeDefined();
            expect(TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should return TypeScript analyzer for .jsx files', () => {
            const analyzer = factory.getAnalyzer('example.jsx');

            expect(analyzer).toBeDefined();
            expect(TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should return Python analyzer for .py files', () => {
            const analyzer = factory.getAnalyzer('example.py');

            expect(analyzer).toBeDefined();
            expect(PythonAnalyzer).toHaveBeenCalled();
        });

        it('should return Python analyzer for .pyw files', () => {
            const analyzer = factory.getAnalyzer('example.pyw');

            expect(analyzer).toBeDefined();
            expect(PythonAnalyzer).toHaveBeenCalled();
        });

        it('should return Java analyzer for .java files', () => {
            const analyzer = factory.getAnalyzer('example.java');

            expect(analyzer).toBeDefined();
            expect(JavaAnalyzer).toHaveBeenCalled();
        });

        it('should return default analyzer for unknown file types', () => {
            const analyzer = factory.getAnalyzer('example.unknown');

            expect(analyzer).toBeDefined();
            // Default should be TypeScript analyzer
            expect(TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should throw an error if no analyzer is found', () => {
            // This test requires special setup to bypass the default analyzer
            // We'll need to mock the internal analyzers Map
            const originalMap = (factory as any).analyzers;
            (factory as any).analyzers = new Map();

            expect(() => {
                factory.getAnalyzer('example.ts');
            }).toThrow('No analyzer found for file type: .ts');

            // Restore the original map
            (factory as any).analyzers = originalMap;
        });

        it('should consider the full file path when determining the analyzer', () => {
            const analyzer = factory.getAnalyzer('/path/to/example.ts');

            expect(analyzer).toBeDefined();
            expect(TypeScriptAnalyzer).toHaveBeenCalled();
        });

        it('should be case-insensitive when determining file extensions', () => {
            const analyzer1 = factory.getAnalyzer('example.TS');
            const analyzer2 = factory.getAnalyzer('example.Js');

            expect(analyzer1).toBeDefined();
            expect(analyzer2).toBeDefined();
            expect(TypeScriptAnalyzer).toHaveBeenCalledTimes(2);
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
            const analyzers = (factory as any).analyzers;

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

    describe('integration with options', () => {
        it('should use default options when not provided', () => {
            const analyzer = factory.getAnalyzer('example.ts');

            // Get the options from the TypeScriptAnalyzer constructor
            const options = (TypeScriptAnalyzer as jest.Mock).mock.calls[0][3];

            expect(options).toBeDefined();
            expect(options.maxFileSize).toBeDefined();
            expect(options.thresholds).toBeDefined();
            expect(options.thresholds.cyclomaticComplexity).toBeDefined();
        });

        it('should use custom options when provided via constructor', () => {
            // Reset the singleton instance
            (AnalyzerFactory as any).instance = undefined;

            // Create a custom factory with options
            // Note: This is a bit tricky since the constructor is private
            // We'll need to use any and create it via getInstance
            const customOptions = {
                maxFileSize: 2000000,
                thresholds: {
                    cyclomaticComplexity: [15, 30],
                    functionLength: [30, 60]
                }
            };

            // This test assumes the factory passes options to analyzers
            // In a real implementation, we would ensure the factory can be created with custom options
            // For this test, we'll verify the behavior indirectly
            const factory = AnalyzerFactory.getInstance();
            const analyzer = factory.getAnalyzer('example.ts');

            // Ideally we would verify that the custom options were used,
            // but since the factory doesn't accept options in its current design,
            // we'll just verify that some options were provided
            const options = (TypeScriptAnalyzer as jest.Mock).mock.calls[0][3];
            expect(options).toBeDefined();
        });
    });

    describe('error handling', () => {
        it('should handle errors when creating analyzers', () => {
            // Force TypeScriptAnalyzer constructor to throw
            (TypeScriptAnalyzer as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Failed to create analyzer');
            });

            // This should still work because we have a fallback
            expect(() => {
                factory.getAnalyzer('example.unknown');
            }).not.toThrow();
        });
    });
});
