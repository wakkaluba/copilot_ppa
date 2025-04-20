import * as vscode from 'vscode';
import { FilePreferences } from '../../../../src/services/conversation/FilePreferences';

describe('FilePreferences', () => {
    let mockContext: vscode.ExtensionContext;
    let filePreferences: FilePreferences;
    let storedPreferences: any;

    beforeEach(() => {
        storedPreferences = {};
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            globalState: {
                get: jest.fn().mockImplementation(() => storedPreferences),
                update: jest.fn().mockImplementation((key, value) => {
                    storedPreferences = value;
                    return Promise.resolve();
                }),
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
            },
        } as unknown as vscode.ExtensionContext;

        filePreferences = new FilePreferences(mockContext);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with empty state when no stored data', async () => {
            await filePreferences.initialize();
            expect(filePreferences.getRecentExtensions(5)).toHaveLength(0);
            expect(filePreferences.getRecentDirectories(5)).toHaveLength(0);
            expect(filePreferences.getNamingPatterns()).toHaveLength(0);
        });

        it('should load stored preferences on initialization', async () => {
            storedPreferences = {
                recentExtensions: ['ts', 'js'],
                recentDirectories: ['src/components'],
                namingPatterns: ['test.component.ts']
            };

            await filePreferences.initialize();
            expect(filePreferences.getRecentExtensions(5)).toEqual(['ts', 'js']);
            expect(filePreferences.getRecentDirectories(5)).toEqual(['src/components']);
            expect(filePreferences.getNamingPatterns()).toEqual(['test.component.ts']);
        });

        it('should handle initialization errors', async () => {
            (mockContext.globalState.get as jest.Mock).mockImplementation(() => {
                throw new Error('Storage error');
            });

            await expect(filePreferences.initialize()).rejects.toThrow('Failed to initialize file preferences: Storage error');
        });
    });

    describe('extension management', () => {
        beforeEach(async () => {
            await filePreferences.initialize();
        });

        it('should add and get recent extensions', () => {
            filePreferences.addRecentExtension('tsx');
            filePreferences.addRecentExtension('jsx');
            expect(filePreferences.getRecentExtensions(5)).toContain('tsx');
            expect(filePreferences.getRecentExtensions(5)).toContain('jsx');
        });

        it('should move recently used extension to front', () => {
            filePreferences.addRecentExtension('ts');
            filePreferences.addRecentExtension('js');
            filePreferences.addRecentExtension('ts'); // Use ts again
            
            const extensions = filePreferences.getRecentExtensions(5);
            expect(extensions[0]).toBe('ts');
        });

        it('should limit number of stored extensions', () => {
            // Add more than max allowed extensions
            for (let i = 0; i < 15; i++) {
                filePreferences.addRecentExtension(`ext${i}`);
            }

            expect(filePreferences.getRecentExtensions(15)).toHaveLength(10); // Max is 10
        });
    });

    describe('directory management', () => {
        beforeEach(async () => {
            await filePreferences.initialize();
        });

        it('should add and get recent directories', () => {
            filePreferences.addRecentDirectory('src/utils');
            filePreferences.addRecentDirectory('src/components');
            expect(filePreferences.getRecentDirectories(5)).toContain('src/utils');
            expect(filePreferences.getRecentDirectories(5)).toContain('src/components');
        });

        it('should move recently used directory to front', () => {
            filePreferences.addRecentDirectory('src/models');
            filePreferences.addRecentDirectory('src/views');
            filePreferences.addRecentDirectory('src/models'); // Use models again
            
            const directories = filePreferences.getRecentDirectories(5);
            expect(directories[0]).toBe('src/models');
        });

        it('should limit number of stored directories', () => {
            // Add more than max allowed directories
            for (let i = 0; i < 10; i++) {
                filePreferences.addRecentDirectory(`dir${i}`);
            }

            expect(filePreferences.getRecentDirectories(10)).toHaveLength(5); // Max is 5
        });
    });

    describe('naming pattern management', () => {
        beforeEach(async () => {
            await filePreferences.initialize();
        });

        it('should add and get naming patterns', () => {
            filePreferences.addNamingPattern('*.service.ts');
            filePreferences.addNamingPattern('*.component.tsx');
            expect(filePreferences.getNamingPatterns()).toContain('*.service.ts');
            expect(filePreferences.getNamingPatterns()).toContain('*.component.tsx');
        });

        it('should not add duplicate patterns', () => {
            filePreferences.addNamingPattern('*.test.ts');
            filePreferences.addNamingPattern('*.test.ts');
            expect(filePreferences.getNamingPatterns()).toHaveLength(1);
        });

        it('should limit number of stored patterns', () => {
            // Add more than max allowed patterns
            for (let i = 0; i < 10; i++) {
                filePreferences.addNamingPattern(`pattern${i}`);
            }

            expect(filePreferences.getNamingPatterns()).toHaveLength(5); // Max is 5
        });
    });

    describe('preference clearing', () => {
        beforeEach(async () => {
            await filePreferences.initialize();
            filePreferences.addRecentExtension('ts');
            filePreferences.addRecentDirectory('src/components');
            filePreferences.addNamingPattern('*.component.ts');
        });

        it('should clear all preferences', async () => {
            await filePreferences.clearPreferences();
            expect(filePreferences.getRecentExtensions(5)).toHaveLength(0);
            expect(filePreferences.getRecentDirectories(5)).toHaveLength(0);
            expect(filePreferences.getNamingPatterns()).toHaveLength(0);
        });

        it('should handle errors during clearing', async () => {
            (mockContext.globalState.update as jest.Mock).mockRejectedValue(new Error('Clear error'));
            await expect(filePreferences.clearPreferences()).rejects.toThrow('Failed to clear file preferences: Clear error');
        });
    });

    describe('storage error handling', () => {
        beforeEach(async () => {
            await filePreferences.initialize();
        });

        it('should handle storage errors when adding extensions', () => {
            (mockContext.globalState.update as jest.Mock).mockRejectedValue(new Error('Storage error'));
            filePreferences.addRecentExtension('ts');
            // Error should be caught and logged
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });

        it('should handle storage errors when adding directories', () => {
            (mockContext.globalState.update as jest.Mock).mockRejectedValue(new Error('Storage error'));
            filePreferences.addRecentDirectory('src/utils');
            // Error should be caught and logged
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });

        it('should handle storage errors when adding naming patterns', () => {
            (mockContext.globalState.update as jest.Mock).mockRejectedValue(new Error('Storage error'));
            filePreferences.addNamingPattern('*.test.ts');
            // Error should be caught and logged
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });
    });
});