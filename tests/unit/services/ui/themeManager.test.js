"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var themeManager_1 = require("../../../../src/services/ui/themeManager");
jest.mock('vscode');
describe('ThemeManager', function () {
    var themeManager;
    var mockContext;
    var mockGlobalState;
    beforeEach(function () {
        mockGlobalState = {
            get: jest.fn(),
            update: jest.fn()
        };
        mockContext = {
            globalState: mockGlobalState,
            subscriptions: []
        };
        // Reset singleton instance between tests
        themeManager_1.ThemeManager.instance = undefined;
        themeManager = themeManager_1.ThemeManager.getInstance(mockContext);
    });
    describe('Theme Management', function () {
        test('should initialize with default themes', function () {
            var themes = themeManager.getThemes();
            expect(themes.length).toBeGreaterThan(0);
            expect(themes.some(function (t) { return t.id === 'default'; })).toBe(true);
            expect(themes.some(function (t) { return t.id === 'dark'; })).toBe(true);
            expect(themes.some(function (t) { return t.id === 'high-contrast'; })).toBe(true);
        });
        test('should get current theme', function () {
            var theme = themeManager.getActiveTheme();
            expect(theme).toBeDefined();
            expect(theme.id).toBeDefined();
            expect(theme.colors).toBeDefined();
            expect(theme.font).toBeDefined();
        });
        test('should create custom theme', function () {
            var customTheme = {
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
            themeManager.createCustomTheme('Custom Theme', 'default', __assign(__assign({}, customTheme.colors), customTheme.font));
            var themes = themeManager.getThemes();
            expect(themes.some(function (t) { return t.name === 'Custom Theme'; })).toBe(true);
            expect(mockGlobalState.update).toHaveBeenCalled();
        });
        test('should delete custom theme', function () {
            var customTheme = {
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
            var beforeDelete = themeManager.getThemes();
            expect(beforeDelete.some(function (t) { return t.name === 'Custom Theme 2'; })).toBe(true);
            themeManager.deleteCustomTheme('custom2');
            var afterDelete = themeManager.getThemes();
            expect(afterDelete.some(function (t) { return t.name === 'Custom Theme 2'; })).toBe(false);
            expect(mockGlobalState.update).toHaveBeenCalled();
        });
    });
    describe('CSS Generation', function () {
        test('should generate theme CSS variables', function () {
            var css = themeManager.getThemeCSS();
            expect(css).toContain('--copilot-primary');
            expect(css).toContain('--copilot-secondary');
            expect(css).toContain('--copilot-background');
            expect(css).toContain('--copilot-foreground');
            expect(css).toContain('--copilot-font-family');
            expect(css).toContain('--copilot-font-size');
        });
        test('should generate UI layout CSS', function () {
            var css = themeManager.getUILayoutCSS();
            expect(css).toContain('.copilot-container');
            expect(css).toContain('.copilot-message');
            expect(css).toContain('.copilot-timestamp');
            expect(css).toContain('.copilot-avatar');
            expect(css).toContain('.copilot-code-block');
        });
    });
    describe('UI Layout Options', function () {
        test('should get default UI layout options', function () {
            mockGlobalState.get.mockReturnValue(undefined);
            var options = themeManager.getUILayoutOptions();
            expect(options).toEqual({
                chatInputPosition: 'bottom',
                showTimestamps: true,
                showAvatars: true,
                compactMode: false,
                expandCodeBlocks: true,
                wordWrap: true
            });
        });
        test('should update UI layout options', function () {
            var updates = {
                chatInputPosition: 'top',
                showTimestamps: false,
                compactMode: true
            };
            themeManager.updateUILayoutOptions(updates);
            expect(mockGlobalState.update).toHaveBeenCalledWith('copilotPPA.uiLayoutOptions', expect.objectContaining(updates));
        });
    });
    describe('VS Code Theme Integration', function () {
        test('should handle VS Code theme changes', function () {
            var mockEmitter = new vscode.EventEmitter();
            vscode.window.onDidChangeActiveColorTheme.mockImplementation(function (callback) { return mockEmitter.event(callback); });
            var spy = jest.spyOn(themeManager, 'handleVSCodeThemeChange');
            mockEmitter.fire({});
            expect(spy).toHaveBeenCalled();
        });
    });
});
