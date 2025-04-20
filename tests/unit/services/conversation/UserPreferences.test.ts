import * as vscode from 'vscode';
import { UserPreferences } from '../../../../src/services/conversation/UserPreferences';

describe('UserPreferences', () => {
    let mockContext: vscode.ExtensionContext;
    let userPreferences: UserPreferences;
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

        userPreferences = new UserPreferences(mockContext);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with empty state when no stored data', async () => {
            await userPreferences.initialize();
            expect(userPreferences.getPreferredLanguage()).toBeUndefined();
            expect(userPreferences.getPreferredFramework()).toBeUndefined();
        });

        it('should load stored preferences on initialization', async () => {
            storedPreferences = {
                preferredLanguage: 'typescript',
                preferredFramework: 'react',
                languageUsage: { typescript: 2, javascript: 1 }
            };

            await userPreferences.initialize();
            expect(userPreferences.getPreferredLanguage()).toBe('typescript');
            expect(userPreferences.getPreferredFramework()).toBe('react');
            expect(userPreferences.getFrequentLanguages(1)[0].language).toBe('typescript');
        });

        it('should handle initialization errors', async () => {
            (mockContext.globalState.get as jest.Mock).mockImplementation(() => {
                throw new Error('Storage error');
            });

            await expect(userPreferences.initialize()).rejects.toThrow('Failed to initialize user preferences: Storage error');
        });
    });

    describe('language preferences', () => {
        beforeEach(async () => {
            await userPreferences.initialize();
        });

        it('should set and get preferred language', () => {
            userPreferences.setPreferredLanguage('python');
            expect(userPreferences.getPreferredLanguage()).toBe('python');
        });

        it('should track language usage', () => {
            userPreferences.incrementLanguageUsage('javascript');
            userPreferences.incrementLanguageUsage('javascript');
            userPreferences.incrementLanguageUsage('typescript');

            const frequentLangs = userPreferences.getFrequentLanguages(2);
            expect(frequentLangs).toHaveLength(2);
            expect(frequentLangs[0].language).toBe('javascript');
            expect(frequentLangs[0].count).toBe(2);
            expect(frequentLangs[1].language).toBe('typescript');
            expect(frequentLangs[1].count).toBe(1);
        });

        it('should persist language preferences', () => {
            userPreferences.setPreferredLanguage('java');
            expect(mockContext.globalState.update).toHaveBeenCalledWith(
                'userProgrammingPreferences',
                expect.objectContaining({
                    preferredLanguage: 'java'
                })
            );
        });
    });

    describe('framework preferences', () => {
        beforeEach(async () => {
            await userPreferences.initialize();
        });

        it('should set and get preferred framework', () => {
            userPreferences.setPreferredFramework('angular');
            expect(userPreferences.getPreferredFramework()).toBe('angular');
        });

        it('should persist framework preferences', () => {
            userPreferences.setPreferredFramework('vue');
            expect(mockContext.globalState.update).toHaveBeenCalledWith(
                'userProgrammingPreferences',
                expect.objectContaining({
                    preferredFramework: 'vue'
                })
            );
        });
    });

    describe('preference clearing', () => {
        beforeEach(async () => {
            await userPreferences.initialize();
            userPreferences.setPreferredLanguage('typescript');
            userPreferences.setPreferredFramework('react');
            userPreferences.incrementLanguageUsage('typescript');
        });

        it('should clear all preferences', async () => {
            await userPreferences.clearPreferences();
            expect(userPreferences.getPreferredLanguage()).toBeUndefined();
            expect(userPreferences.getPreferredFramework()).toBeUndefined();
            expect(userPreferences.getFrequentLanguages(1)).toHaveLength(0);
        });

        it('should handle errors during clearing', async () => {
            (mockContext.globalState.update as jest.Mock).mockRejectedValue(new Error('Clear error'));
            await expect(userPreferences.clearPreferences()).rejects.toThrow('Failed to clear user preferences: Clear error');
        });
    });

    describe('storage error handling', () => {
        beforeEach(async () => {
            await userPreferences.initialize();
        });

        it('should handle storage errors when saving language preference', () => {
            (mockContext.globalState.update as jest.Mock).mockRejectedValue(new Error('Storage error'));
            userPreferences.setPreferredLanguage('rust');
            // Error should be caught and logged
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });

        it('should handle storage errors when saving framework preference', () => {
            (mockContext.globalState.update as jest.Mock).mockRejectedValue(new Error('Storage error'));
            userPreferences.setPreferredFramework('svelte');
            // Error should be caught and logged
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });

        it('should handle storage errors when incrementing language usage', () => {
            (mockContext.globalState.update as jest.Mock).mockRejectedValue(new Error('Storage error'));
            userPreferences.incrementLanguageUsage('go');
            // Error should be caught and logged
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });
    });
});