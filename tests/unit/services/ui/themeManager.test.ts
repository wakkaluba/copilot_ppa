import * as vscode from 'vscode';
import { ThemeManager, Theme, ThemeColors, FontSettings } from '../../../../src/services/ui/themeManager';

jest.mock('vscode');

describe('ThemeManager', () => {
    let themeManager: ThemeManager;
    let mockContext: vscode.ExtensionContext;
    let mockGlobalState: { get: jest.Mock; update: jest.Mock };

    beforeEach(() => {
        mockGlobalState = {
            get: jest.fn(),
            update: jest.fn()
        };

        mockContext = {
            globalState: mockGlobalState,
            subscriptions: []
        } as unknown as vscode.ExtensionContext;

        // Reset singleton instance between tests
        (ThemeManager as any).instance = undefined;

        themeManager = ThemeManager.getInstance(mockContext);
    });

    describe('Theme Management', () => {
        test('should initialize with default themes', () => {
            const themes = themeManager.getThemes();
            expect(themes.length).toBeGreaterThan(0);
            expect(themes.some(t => t.id === 'default')).toBe(true);
            expect(themes.some(t => t.id === 'dark')).toBe(true);
            expect(themes.some(t => t.id === 'high-contrast')).toBe(true);
        });

        test('should get current theme', () => {
            const theme = themeManager.getActiveTheme();
            expect(theme).toBeDefined();
            expect(theme.id).toBeDefined();
            expect(theme.colors).toBeDefined();
            expect(theme.font).toBeDefined();
        });

        test('should create custom theme', () => {
            const customTheme: Theme = {
                id: 'custom1',
                name: 'Custom Theme',
                type: 'light',
                isBuiltIn: false,
                colors: {
                    primary: '#ff0000',
                    secondary: '#00ff00',
                    background: '#ffffff',
                    foreground: '#000000',
                    agentMessageBackground: '#f0f0f0',
                    agentMessageForeground: '#000000',
                    userMessageBackground: '#e0e0e0',
                    userMessageForeground: '#000000',
                    systemMessage: '#808080',
                    error: '#ff0000',
                    success: '#00ff00',
                    border: '#c0c0c0',
                    buttonBackground: '#ff0000',
                    buttonForeground: '#ffffff',
                    buttonHoverBackground: '#cc0000',
                    inputBackground: '#ffffff',
                    inputForeground: '#000000',
                    inputBorder: '#c0c0c0'
                },
                font: {
                    family: 'Arial',
                    sizeInPixels: 14,
                    lineHeight: 1.5,
                    weight: 400,
                    headingWeight: 700,
                    useMonospaceForCode: true
                }
            };

            themeManager.createCustomTheme('Custom Theme', 'default', {
                ...customTheme.colors,
                ...customTheme.font
            });

            const themes = themeManager.getThemes();
            expect(themes.some(t => t.name === 'Custom Theme')).toBe(true);
            expect(mockGlobalState.update).toHaveBeenCalled();
        });

        test('should delete custom theme', () => {
            const customTheme: Theme = {
                id: 'custom2',
                name: 'Custom Theme 2',
                type: 'light',
                isBuiltIn: false,
                colors: {
                    primary: '#ff0000',
                    secondary: '#00ff00',
                    background: '#ffffff',
                    foreground: '#000000',
                    agentMessageBackground: '#f0f0f0',
                    agentMessageForeground: '#000000',
                    userMessageBackground: '#e0e0e0',
                    userMessageForeground: '#000000',
                    systemMessage: '#808080',
                    error: '#ff0000',
                    success: '#00ff00',
                    border: '#c0c0c0',
                    buttonBackground: '#ff0000',
                    buttonForeground: '#ffffff',
                    buttonHoverBackground: '#cc0000',
                    inputBackground: '#ffffff',
                    inputForeground: '#000000',
                    inputBorder: '#c0c0c0'
                },
                font: {
                    family: 'Arial',
                    sizeInPixels: 14,
                    lineHeight: 1.5,
                    weight: 400,
                    headingWeight: 700,
                    useMonospaceForCode: true
                }
            };

            themeManager.createCustomTheme('Custom Theme 2', 'default', {});
            const beforeDelete = themeManager.getThemes();
            expect(beforeDelete.some(t => t.name === 'Custom Theme 2')).toBe(true);

            themeManager.deleteCustomTheme('custom2');
            const afterDelete = themeManager.getThemes();
            expect(afterDelete.some(t => t.name === 'Custom Theme 2')).toBe(false);
            expect(mockGlobalState.update).toHaveBeenCalled();
        });
    });

    describe('CSS Generation', () => {
        test('should generate theme CSS variables', () => {
            const css = themeManager.getThemeCSS();
            expect(css).toContain('--copilot-primary');
            expect(css).toContain('--copilot-secondary');
            expect(css).toContain('--copilot-background');
            expect(css).toContain('--copilot-foreground');
            expect(css).toContain('--copilot-font-family');
            expect(css).toContain('--copilot-font-size');
        });

        test('should generate UI layout CSS', () => {
            const css = themeManager.getUILayoutCSS();
            expect(css).toContain('.copilot-container');
            expect(css).toContain('.copilot-message');
            expect(css).toContain('.copilot-timestamp');
            expect(css).toContain('.copilot-avatar');
            expect(css).toContain('.copilot-code-block');
        });
    });

    describe('UI Layout Options', () => {
        test('should get default UI layout options', () => {
            mockGlobalState.get.mockReturnValue(undefined);
            
            const options = themeManager.getUILayoutOptions();
            expect(options).toEqual({
                chatInputPosition: 'bottom',
                showTimestamps: true,
                showAvatars: true,
                compactMode: false,
                expandCodeBlocks: true,
                wordWrap: true
            });
        });

        test('should update UI layout options', () => {
            const updates: Partial<UILayoutOptions> = {
                chatInputPosition: 'top' as const,
                showTimestamps: false,
                compactMode: true
            };

            themeManager.updateUILayoutOptions(updates);
            
            expect(mockGlobalState.update).toHaveBeenCalledWith(
                'copilotPPA.uiLayoutOptions',
                expect.objectContaining(updates)
            );
        });
    });

    describe('VS Code Theme Integration', () => {
        test('should handle VS Code theme changes', () => {
            const mockEmitter = new vscode.EventEmitter<vscode.ColorTheme>();
            (vscode.window.onDidChangeActiveColorTheme as jest.Mock).mockImplementation(
                callback => mockEmitter.event(callback)
            );

            const spy = jest.spyOn(themeManager as any, 'handleVSCodeThemeChange');
            
            mockEmitter.fire({} as vscode.ColorTheme);
            
            expect(spy).toHaveBeenCalled();
        });
    });
});