import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { ConfigDetectionError } from '../../errors/ConfigDetectionError';
import { ConfigValidationError } from '../../errors/ConfigValidationError';
import { RollupConfigDetector } from '../RollupConfigDetector';

jest.mock('glob');
jest.mock('fs');
jest.mock('path');

describe('RollupConfigDetector', () => {
    let detector: RollupConfigDetector;
    let mockLogger: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        detector = new RollupConfigDetector(mockLogger);
        (fs.existsSync as jest.Mock).mockReset();
        (fs.readFileSync as jest.Mock).mockReset();
        (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    });

    describe('detectConfigs', () => {
        it('should throw ConfigValidationError if workspace path does not exist', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            const workspacePath = '/path/to/workspace';

            await expect(detector.detectConfigs(workspacePath)).rejects.toThrow(ConfigValidationError);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should find rollup config files in workspace', async () => {
            const workspacePath = '/path/to/workspace';
            const expectedConfigs = [
                'rollup.config.js',
                'rollup.config.prod.js'
            ];

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (glob as any).mockImplementation((pattern: string, options: any, callback: Function) => {
                callback(null, expectedConfigs);
            });
            (path.resolve as jest.Mock).mockImplementation((base, file) => `${base}/${file}`);

            const configs = await detector.detectConfigs(workspacePath);

            expect(configs).toEqual([
                '/path/to/workspace/rollup.config.js',
                '/path/to/workspace/rollup.config.prod.js'
            ]);
            expect(mockLogger.debug).toHaveBeenCalledWith(`Found ${expectedConfigs.length} rollup config files`);
        });

        it('should handle glob errors', async () => {
            const workspacePath = '/path/to/workspace';
            const mockError = new Error('Failed to read directory');

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (glob as any).mockImplementation((pattern: string, options: any, callback: Function) => {
                callback(mockError, null);
            });

            await expect(detector.detectConfigs(workspacePath)).rejects.toThrow(mockError);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should merge configs from multiple patterns', async () => {
            const workspacePath = '/path/to/workspace';
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            // Simulate finding different config files with different patterns
            (glob as any).mockImplementation((pattern: string, options: any, callback: Function) => {
                if (pattern.includes('*.config.js')) {
                    callback(null, ['rollup.config.js']);
                } else if (pattern.includes('*.config.ts')) {
                    callback(null, ['rollup.config.ts']);
                } else {
                    callback(null, []);
                }
            });
            (path.resolve as jest.Mock).mockImplementation((base, file) => `${base}/${file}`);

            const configs = await detector.detectConfigs(workspacePath);

            expect(configs).toHaveLength(2);
            expect(configs).toContain('/path/to/workspace/rollup.config.js');
            expect(configs).toContain('/path/to/workspace/rollup.config.ts');
        });

        it('should deduplicate config files', async () => {
            const workspacePath = '/path/to/workspace';
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            // Simulate finding the same config file with different patterns
            (glob as any).mockImplementation((pattern: string, options: any, callback: Function) => {
                callback(null, ['rollup.config.js']);
            });
            (path.resolve as jest.Mock).mockImplementation((base, file) => `${base}/${file}`);

            const configs = await detector.detectConfigs(workspacePath);

            expect(configs).toHaveLength(1);
            expect(configs[0]).toBe('/path/to/workspace/rollup.config.js');
        });

        it('should detect rollup config files', async () => {
            const workspacePath = '/workspace';
            const mockMatches = ['rollup.config.js', 'rollup.config.prod.js'];

            (glob.sync as jest.Mock).mockReturnValue(mockMatches);
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));

            const configs = await detector.detectConfigs(workspacePath);

            expect(configs).toEqual([
                '/workspace/rollup.config.js',
                '/workspace/rollup.config.prod.js'
            ]);
            expect(mockLogger.debug).toHaveBeenCalledWith('Found 2 rollup config files');
        });

        it('should handle when no config files are found', async () => {
            const workspacePath = '/workspace';

            (glob.sync as jest.Mock).mockReturnValue([]);
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const configs = await detector.detectConfigs(workspacePath);

            expect(configs).toEqual([]);
            expect(mockLogger.debug).toHaveBeenCalledWith('Found 0 rollup config files');
        });

        it('should throw ConfigValidationError for invalid workspace path', async () => {
            const workspacePath = '/invalid/workspace';

            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await expect(detector.detectConfigs(workspacePath)).rejects.toThrow(ConfigValidationError);
            expect(mockLogger.error).toHaveBeenCalledWith('Invalid workspace path:', workspacePath);
        });

        it('should detect TypeScript config files', async () => {
            const workspacePath = '/workspace';
            const mockMatches = ['rollup.config.ts'];

            (glob.sync as jest.Mock).mockReturnValue(mockMatches);
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));

            const configs = await detector.detectConfigs(workspacePath);

            expect(configs).toEqual(['/workspace/rollup.config.ts']);
        });

        it('should detect ES module config files', async () => {
            const workspacePath = '/workspace';
            const mockMatches = ['rollup.config.mjs'];

            (glob.sync as jest.Mock).mockReturnValue(mockMatches);
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));

            const configs = await detector.detectConfigs(workspacePath);

            expect(configs).toEqual(['/workspace/rollup.config.mjs']);
        });

        it('should deduplicate config files found by multiple patterns', async () => {
            const workspacePath = '/workspace';
            const mockMatches1 = ['rollup.config.js'];
            const mockMatches2 = ['rollup.config.js', 'rollup.prod.config.js'];

            (glob.sync as jest.Mock)
                .mockReturnValueOnce(mockMatches1)
                .mockReturnValueOnce(mockMatches2);
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));

            const configs = await detector.detectConfigs(workspacePath);

            expect(configs).toEqual([
                '/workspace/rollup.config.js',
                '/workspace/rollup.prod.config.js'
            ]);
            expect(mockLogger.debug).toHaveBeenCalledWith('Found 2 rollup config files');
        });

        it('should handle glob errors', async () => {
            const workspacePath = '/workspace';

            (glob.sync as jest.Mock).mockImplementation(() => {
                throw new Error('Glob error');
            });
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            await expect(detector.detectConfigs(workspacePath)).rejects.toThrow('Failed to detect rollup configurations: Glob error');
            expect(mockLogger.error).toHaveBeenCalledWith('Error searching for rollup configs:', expect.any(Error));
        });

        it('should validate that found files exist', async () => {
            const workspacePath = '/workspace';
            const mockMatches = ['rollup.config.js', 'non.existent.config.js'];

            (glob.sync as jest.Mock).mockReturnValue(mockMatches);
            (fs.existsSync as jest.Mock)
                .mockReturnValueOnce(true)  // workspace path
                .mockReturnValueOnce(true)  // rollup.config.js
                .mockReturnValueOnce(false); // non.existent.config.js
            (path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));

            const configs = await detector.detectConfigs(workspacePath);

            expect(configs).toEqual(['/workspace/rollup.config.js']);
            expect(mockLogger.warn).toHaveBeenCalledWith(
                'Config file not found:',
                '/workspace/non.existent.config.js'
            );
        });

        it('should detect various Rollup config file patterns', async () => {
            (fs.existsSync as jest.Mock)
                .mockImplementation(path => [
                    'rollup.config.js',
                    'rollup.config.mjs',
                    'rollup.config.ts'
                ].some(file => path.endsWith(file)));

            const configs = await detector.detectConfigs('/workspace');

            expect(configs).toHaveLength(3);
            expect(configs).toContain('/workspace/rollup.config.js');
            expect(configs).toContain('/workspace/rollup.config.mjs');
            expect(configs).toContain('/workspace/rollup.config.ts');
        });

        it('should handle missing workspace path', async () => {
            await expect(detector.detectConfigs('')).rejects.toThrow(ConfigDetectionError);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle invalid workspace path', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            await expect(detector.detectConfigs('/nonexistent')).rejects.toThrow(ConfigDetectionError);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle filesystem errors during detection', async () => {
            (fs.existsSync as jest.Mock).mockImplementation(() => {
                throw new Error('File system error');
            });

            await expect(detector.detectConfigs('/workspace')).rejects.toThrow(ConfigDetectionError);
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('validateConfig', () => {
        it('should return true for valid rollup config file', () => {
            const configPath = '/path/to/rollup.config.js';
            const content = `
                export default {
                    input: 'src/index.js',
                    output: {
                        file: 'dist/bundle.js',
                        format: 'cjs'
                    }
                }
            `;

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(content);

            expect(detector.validateConfig(configPath)).toBe(true);
        });

        it('should return false for invalid rollup config file', () => {
            const configPath = '/path/to/rollup.config.js';
            const content = `
                export default {
                    // Missing required fields
                }
            `;

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(content);

            expect(detector.validateConfig(configPath)).toBe(false);
        });

        it('should return false if file does not exist', () => {
            const configPath = '/path/to/rollup.config.js';
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            expect(detector.validateConfig(configPath)).toBe(false);
        });

        it('should handle syntax errors in config file', () => {
            const configPath = '/path/to/rollup.config.js';
            const content = 'invalid javascript content';

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(content);

            expect(detector.validateConfig(configPath)).toBe(false);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should validate a correct Rollup config file', async () => {
            const validContent = `
                export default {
                    input: 'src/index.js',
                    output: {
                        file: 'dist/bundle.js',
                        format: 'es'
                    }
                };
            `;
            (fs.readFileSync as jest.Mock).mockReturnValue(validContent);

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(true);
        });

        it('should handle missing input field', async () => {
            const invalidContent = `
                export default {
                    output: {
                        file: 'dist/bundle.js',
                        format: 'es'
                    }
                };
            `;
            (fs.readFileSync as jest.Mock).mockReturnValue(invalidContent);

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalled();
        });

        it('should handle missing output field', async () => {
            const invalidContent = `
                export default {
                    input: 'src/index.js'
                };
            `;
            (fs.readFileSync as jest.Mock).mockReturnValue(invalidContent);

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalled();
        });

        it('should handle malformed config files', async () => {
            const invalidContent = 'this is not valid JavaScript';
            (fs.readFileSync as jest.Mock).mockReturnValue(invalidContent);

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle filesystem errors during validation', async () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() => {
                throw new Error('File system error');
            });

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle configs with multiple outputs', async () => {
            const validContent = `
                export default {
                    input: 'src/index.js',
                    output: [
                        {
                            file: 'dist/bundle.es.js',
                            format: 'es'
                        },
                        {
                            file: 'dist/bundle.cjs.js',
                            format: 'cjs'
                        }
                    ]
                };
            `;
            (fs.readFileSync as jest.Mock).mockReturnValue(validContent);

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(true);
        });

        it('should handle configs with code splitting', async () => {
            const validContent = `
                export default {
                    input: {
                        main: 'src/index.js',
                        vendor: 'src/vendor.js'
                    },
                    output: {
                        dir: 'dist',
                        format: 'es',
                        chunkFileNames: '[name]-[hash].js'
                    }
                };
            `;
            (fs.readFileSync as jest.Mock).mockReturnValue(validContent);

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(true);
        });
    });

    describe('error handling', () => {
        it('should handle syntax errors in config files', async () => {
            const invalidContent = `
                export default {
                    input: 'src/index.js',
                    output: {
                        file: 'dist/bundle.js'
                        format: 'es'  // missing comma
                    }
                };
            `;
            (fs.readFileSync as jest.Mock).mockReturnValue(invalidContent);

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle empty config files', async () => {
            (fs.readFileSync as jest.Mock).mockReturnValue('');

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle null/undefined config files', async () => {
            (fs.readFileSync as jest.Mock).mockReturnValue(null);

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle permission errors', async () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() => {
                const error = new Error('EACCES: permission denied');
                (error as any).code = 'EACCES';
                throw error;
            });

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should handle non-existent files', async () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() => {
                const error = new Error('ENOENT: no such file or directory');
                (error as any).code = 'ENOENT';
                throw error;
            });

            const result = await detector.validateConfig('/workspace/rollup.config.js');
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    let detector: RollupConfigDetector;
    const mockWorkspacePath = '/path/to/workspace';
    const commonConfigFiles = [
        'rollup.config.js',
        'rollup.config.ts',
        'rollup.config.mjs',
        'rollup.config.cjs',
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        detector = new RollupConfigDetector();

        // Default mock implementation for path.join
        (path.join as jest.Mock).mockImplementation((dir, file) => `${dir}/${file}`);

        // Default mock for fs.promises.readdir
        (fs.promises.readdir as jest.Mock).mockResolvedValue([
            'package.json',
            'rollup.config.js',
            'src',
            'dist',
        ]);

        // Default mock for fs.existsSync
        (fs.existsSync as jest.Mock).mockReturnValue(true);
    });

    describe('detectConfig', () => {
        it('should detect rollup.config.js in workspace root', async () => {
            const result = await detector.detectConfig(mockWorkspacePath);

            expect(result).toBe(`${mockWorkspacePath}/rollup.config.js`);
            expect(fs.promises.readdir).toHaveBeenCalledWith(mockWorkspacePath);
            expect(fs.existsSync).toHaveBeenCalledWith(`${mockWorkspacePath}/rollup.config.js`);
        });

        it('should return null if no config files are found', async () => {
            (fs.promises.readdir as jest.Mock).mockResolvedValue(['package.json', 'src', 'dist']);
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = await detector.detectConfig(mockWorkspacePath);

            expect(result).toBeNull();
        });

        it('should prioritize .js config over other formats', async () => {
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                'package.json',
                'rollup.config.js',
                'rollup.config.ts',
                'src',
                'dist',
            ]);

            const result = await detector.detectConfig(mockWorkspacePath);

            expect(result).toBe(`${mockWorkspacePath}/rollup.config.js`);
        });

        it('should detect TypeScript config if JS not present', async () => {
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                'package.json',
                'rollup.config.ts',
                'src',
                'dist',
            ]);
            (fs.existsSync as jest.Mock).mockImplementation((path) => path.endsWith('rollup.config.ts'));

            const result = await detector.detectConfig(mockWorkspacePath);

            expect(result).toBe(`${mockWorkspacePath}/rollup.config.ts`);
        });
    });

    describe('findPotentialConfigFiles', () => {
        it('should find all potential rollup config files in workspace', async () => {
            (fs.promises.readdir as jest.Mock).mockResolvedValue([
                'package.json',
                'rollup.config.js',
                'rollup.config.mjs',
                'rollup.config.ts',
                'src',
                'dist',
            ]);

            const result = await detector.findPotentialConfigFiles(mockWorkspacePath);

            expect(result).toHaveLength(3);
            expect(result).toContain(`${mockWorkspacePath}/rollup.config.js`);
            expect(result).toContain(`${mockWorkspacePath}/rollup.config.mjs`);
            expect(result).toContain(`${mockWorkspacePath}/rollup.config.ts`);
        });

        it('should return empty array if no potential files found', async () => {
            (fs.promises.readdir as jest.Mock).mockResolvedValue(['package.json', 'src', 'dist']);

            const result = await detector.findPotentialConfigFiles(mockWorkspacePath);

            expect(result).toEqual([]);
        });

        it('should handle errors during directory reading', async () => {
            (fs.promises.readdir as jest.Mock).mockRejectedValue(new Error('Permission denied'));

            await expect(detector.findPotentialConfigFiles(mockWorkspacePath))
                .rejects
                .toThrow(ConfigDetectionError);
        });
    });

    describe('checkPackageJsonForRollup', () => {
        it('should detect rollup in dependencies', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
                dependencies: {
                    "rollup": "^2.70.0"
                }
            }));

            const result = await detector.checkPackageJsonForRollup(mockWorkspacePath);

            expect(result).toBeTruthy();
        });

        it('should detect rollup in devDependencies', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
                devDependencies: {
                    "rollup": "^2.70.0"
                }
            }));

            const result = await detector.checkPackageJsonForRollup(mockWorkspacePath);

            expect(result).toBeTruthy();
        });

        it('should return false if rollup not in dependencies', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
                dependencies: {
                    "webpack": "^5.70.0"
                },
                devDependencies: {
                    "babel": "^7.0.0"
                }
            }));

            const result = await detector.checkPackageJsonForRollup(mockWorkspacePath);

            expect(result).toBeFalsy();
        });

        it('should handle missing package.json', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = await detector.checkPackageJsonForRollup(mockWorkspacePath);

            expect(result).toBeFalsy();
        });
    });

    describe('validateConfigPath', () => {
        it('should validate existing config path', () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const result = detector.validateConfigPath(`${mockWorkspacePath}/rollup.config.js`);

            expect(result).toBeTruthy();
        });

        it('should return false for non-existent config path', () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = detector.validateConfigPath(`${mockWorkspacePath}/rollup.config.js`);

            expect(result).toBeFalsy();
        });
    });
});
