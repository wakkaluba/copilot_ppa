import * as fs from 'fs';
import * as path from 'path';
import { AnalysisError } from '../../errors/AnalysisError';
import { ConfigValidationError } from '../../errors/ConfigValidationError';
import { RollupConfigAnalyzer } from '../RollupConfigAnalyzer';

// Mock the fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    access: jest.fn(),
  },
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock('path');

describe('RollupConfigAnalyzer', () => {
    let analyzer: RollupConfigAnalyzer;
    let mockLogger: any;
    const mockConfig = {
        input: 'src/index.js',
        output: {
          file: 'dist/bundle.js',
          format: 'cjs',
        },
        plugins: [
          { name: 'node-resolve' },
          { name: 'commonjs' },
        ],
      };

      const mockConfigPath = '/path/to/rollup.config.js';

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        analyzer = new RollupConfigAnalyzer(mockLogger);
        (fs.readFileSync as jest.Mock).mockReset();
        (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
        analyzer = new RollupConfigAnalyzer();

        // Mock fs.readFileSync
        (fs.readFileSync as jest.Mock).mockReturnValue(
          `module.exports = ${JSON.stringify(mockConfig)}`
        );

        // Mock fs.existsSync
        (fs.existsSync as jest.Mock).mockReturnValue(true);
    });

    describe('analyze', () => {
        it('should throw ConfigValidationError if file does not exist', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            const configPath = '/path/to/rollup.config.js';

            await expect(analyzer.analyze(configPath)).rejects.toThrow(ConfigValidationError);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should parse a basic rollup config file', async () => {
            const configPath = '/path/to/rollup.config.js';
            const mockConfig = `
                export default {
                    input: 'src/index.js',
                    output: {
                        file: 'dist/bundle.js',
                        format: 'cjs'
                    },
                    plugins: []
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

            const analysis = await analyzer.analyze(configPath);

            expect(analysis.input).toEqual(['src/index.js']);
            expect(analysis.output).toEqual([{
                file: 'dist/bundle.js',
                format: 'cjs'
            }]);
            expect(analysis.plugins).toEqual([]);
            expect(analysis.content).toBe(mockConfig);
        });

        it('should handle array output configuration', async () => {
            const configPath = '/path/to/rollup.config.js';
            const mockConfig = `
                export default {
                    input: 'src/index.js',
                    output: [
                        {
                            file: 'dist/bundle.cjs.js',
                            format: 'cjs'
                        },
                        {
                            file: 'dist/bundle.esm.js',
                            format: 'es'
                        }
                    ],
                    plugins: []
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

            const analysis = await analyzer.analyze(configPath);

            expect(analysis.output).toEqual([
                {
                    file: 'dist/bundle.cjs.js',
                    format: 'cjs'
                },
                {
                    file: 'dist/bundle.esm.js',
                    format: 'es'
                }
            ]);
        });

        it('should handle multiple input files', async () => {
            const configPath = '/path/to/rollup.config.js';
            const mockConfig = `
                export default {
                    input: {
                        main: 'src/index.js',
                        worker: 'src/worker.js'
                    },
                    output: {
                        dir: 'dist',
                        format: 'es'
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

            const analysis = await analyzer.analyze(configPath);

            expect(analysis.input).toEqual(['src/index.js', 'src/worker.js']);
            expect(analysis.output).toEqual([{
                dir: 'dist',
                format: 'es'
            }]);
        });

        it('should extract plugin information', async () => {
            const configPath = '/path/to/rollup.config.js';
            const mockConfig = `
                import typescript from '@rollup/plugin-typescript';
                import resolve from '@rollup/plugin-node-resolve';
                import commonjs from '@rollup/plugin-commonjs';

                export default {
                    input: 'src/index.ts',
                    output: { file: 'dist/bundle.js', format: 'cjs' },
                    plugins: [
                        typescript(),
                        resolve(),
                        commonjs()
                    ]
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

            const analysis = await analyzer.analyze(configPath);

            expect(analysis.plugins).toEqual([
                { name: 'typescript' },
                { name: 'resolve' },
                { name: 'commonjs' }
            ]);
        });

        it('should handle plugin configuration objects', async () => {
            const configPath = '/path/to/rollup.config.js';
            const mockConfig = `
                export default {
                    input: 'src/index.js',
                    output: { file: 'dist/bundle.js', format: 'cjs' },
                    plugins: [
                        typescript({
                            tsconfig: './tsconfig.json',
                            sourceMap: true
                        }),
                        resolve({
                            browser: true
                        })
                    ]
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

            const analysis = await analyzer.analyze(configPath);

            expect(analysis.plugins).toEqual([
                {
                    name: 'typescript',
                    options: {
                        tsconfig: './tsconfig.json',
                        sourceMap: true
                    }
                },
                {
                    name: 'resolve',
                    options: {
                        browser: true
                    }
                }
            ]);
        });

        it('should handle external dependencies', async () => {
            const configPath = '/path/to/rollup.config.js';
            const mockConfig = `
                export default {
                    input: 'src/index.js',
                    external: ['react', 'react-dom'],
                    output: {
                        file: 'dist/bundle.js',
                        format: 'es'
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

            const analysis = await analyzer.analyze(configPath);
            expect(analysis.external).toEqual(['react', 'react-dom']);
        });

        it('should handle sourcemap configuration', async () => {
            const configPath = '/path/to/rollup.config.js';
            const mockConfig = `
                export default {
                    input: 'src/index.js',
                    output: {
                        file: 'dist/bundle.js',
                        format: 'es',
                        sourcemap: true
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

            const analysis = await analyzer.analyze(configPath);
            expect(analysis.output[0].sourcemap).toBe(true);
        });

        it('should handle malformed config files', async () => {
            const configPath = '/path/to/rollup.config.js';
            const mockConfig = 'this is not valid JavaScript';
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

            await expect(analyzer.analyze(configPath)).rejects.toThrow();
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle empty config files', async () => {
            const configPath = '/path/to/rollup.config.js';
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue('');

            await expect(analyzer.analyze(configPath)).rejects.toThrow();
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle complex plugin patterns', async () => {
            const configPath = '/path/to/rollup.config.js';
            const mockConfig = `
                import { babel } from '@rollup/plugin-babel';
                import { terser } from 'rollup-plugin-terser';

                const production = process.env.NODE_ENV === 'production';

                export default {
                    input: 'src/index.js',
                    plugins: [
                        babel({
                            presets: ['@babel/preset-env']
                        }),
                        production && terser()
                    ].filter(Boolean),
                    output: {
                        file: 'dist/bundle.js',
                        format: 'es'
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

            const analysis = await analyzer.analyze(configPath);
            expect(analysis.plugins).toEqual([
                {
                    name: 'babel',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },
                {
                    name: 'terser',
                    conditional: true
                }
            ]);
        });
    });

    describe('analyzeConfig', () => {
        it('should analyze a valid rollup config file', async () => {
          const result = await analyzer.analyzeConfig(mockConfigPath);

          expect(result).toBeDefined();
          expect(result.input).toEqual(mockConfig.input);
          expect(result.output).toEqual(mockConfig.output);
          expect(result.plugins).toHaveLength(2);
          expect(fs.readFileSync).toHaveBeenCalledWith(mockConfigPath, 'utf-8');
        });

        it('should throw AnalysisError if config file does not exist', async () => {
          (fs.existsSync as jest.Mock).mockReturnValue(false);

          await expect(analyzer.analyzeConfig(mockConfigPath))
            .rejects
            .toThrow(AnalysisError);
        });

        it('should handle errors when parsing config file', async () => {
          (fs.readFileSync as jest.Mock).mockReturnValue('invalid javascript code');

          await expect(analyzer.analyzeConfig(mockConfigPath))
            .rejects
            .toThrow(AnalysisError);
        });
      });

      describe('getPlugins', () => {
        it('should extract plugins from a config', async () => {
          const result = await analyzer.analyzeConfig(mockConfigPath);
          const plugins = analyzer.getPlugins(result);

          expect(plugins).toHaveLength(2);
          expect(plugins[0].name).toEqual('node-resolve');
          expect(plugins[1].name).toEqual('commonjs');
        });

        it('should return empty array if no plugins in config', async () => {
          const configWithoutPlugins = { ...mockConfig, plugins: undefined };
          (fs.readFileSync as jest.Mock).mockReturnValue(
            `module.exports = ${JSON.stringify(configWithoutPlugins)}`
          );

          const result = await analyzer.analyzeConfig(mockConfigPath);
          const plugins = analyzer.getPlugins(result);

          expect(plugins).toEqual([]);
        });
      });

      describe('getOutputConfig', () => {
        it('should extract output config as an object', async () => {
          const result = await analyzer.analyzeConfig(mockConfigPath);
          const output = analyzer.getOutputConfig(result);

          expect(output).toEqual(mockConfig.output);
        });

        it('should handle array output configuration', async () => {
          const configWithArrayOutput = {
            ...mockConfig,
            output: [
              { file: 'dist/bundle.cjs.js', format: 'cjs' },
              { file: 'dist/bundle.esm.js', format: 'esm' }
            ]
          };

          (fs.readFileSync as jest.Mock).mockReturnValue(
            `module.exports = ${JSON.stringify(configWithArrayOutput)}`
          );

          const result = await analyzer.analyzeConfig(mockConfigPath);
          const output = analyzer.getOutputConfig(result);

          expect(Array.isArray(output)).toBeTruthy();
          expect(output).toHaveLength(2);
          expect(output[0].format).toEqual('cjs');
          expect(output[1].format).toEqual('esm');
        });

        it('should return null if no output config present', async () => {
          const configWithoutOutput = { ...mockConfig, output: undefined };
          (fs.readFileSync as jest.Mock).mockReturnValue(
            `module.exports = ${JSON.stringify(configWithoutOutput)}`
          );

          const result = await analyzer.analyzeConfig(mockConfigPath);
          const output = analyzer.getOutputConfig(result);

          expect(output).toBeNull();
        });
      });

      describe('findOptimizationOpportunities', () => {
        it('should identify optimization opportunities in config', async () => {
          const result = await analyzer.analyzeConfig(mockConfigPath);
          const opportunities = await analyzer.findOptimizationOpportunities(result);

          expect(opportunities).toBeDefined();
          expect(Array.isArray(opportunities)).toBeTruthy();
        });

        it('should suggest terser plugin if not present', async () => {
          const result = await analyzer.analyzeConfig(mockConfigPath);
          const opportunities = await analyzer.findOptimizationOpportunities(result);

          const terserSuggestion = opportunities.find(opp =>
            opp.description.includes('terser') || opp.type.includes('minification')
          );

          expect(terserSuggestion).toBeDefined();
        });
      });

      describe('validateConfig', () => {
        it('should validate a correct config without errors', async () => {
          const result = await analyzer.analyzeConfig(mockConfigPath);
          const validationResult = analyzer.validateConfig(result);

          expect(validationResult.valid).toBeTruthy();
          expect(validationResult.errors).toHaveLength(0);
        });

        it('should detect missing input in config', async () => {
          const configWithoutInput = { ...mockConfig, input: undefined };
          (fs.readFileSync as jest.Mock).mockReturnValue(
            `module.exports = ${JSON.stringify(configWithoutInput)}`
          );

          const result = await analyzer.analyzeConfig(mockConfigPath);
          const validationResult = analyzer.validateConfig(result);

          expect(validationResult.valid).toBeFalsy();
          expect(validationResult.errors.length).toBeGreaterThan(0);
          expect(validationResult.errors[0]).toContain('input');
        });
      });
});
