/**
 * Tests for Theme-related interfaces
 */
import {
  Theme,
  ThemeColors,
  FontSettings,
  UILayoutOptions
} from '../../../../src/services/ui/themeManager';

describe('Theme interface', () => {
  it('should create a valid theme object', () => {
    const themeColors: ThemeColors = createMockThemeColors();
    const fontSettings: FontSettings = createMockFontSettings();

    const theme: Theme = {
      id: 'test-theme',
      name: 'Test Theme',
      type: 'light',
      isBuiltIn: false,
      colors: themeColors,
      font: fontSettings
    };

    expect(theme).toBeDefined();
    expect(theme.id).toBe('test-theme');
    expect(theme.name).toBe('Test Theme');
    expect(theme.isBuiltIn).toBe(false);
    expect(theme.colors).toEqual(themeColors);
    expect(theme.font).toEqual(fontSettings);
  });

  it('should create a built-in theme', () => {
    const theme: Theme = {
      id: 'dark',
      name: 'Dark Theme',
      type: 'dark',
      isBuiltIn: true,
      colors: createMockThemeColors(),
      font: createMockFontSettings()
    };

    expect(theme).toBeDefined();
    expect(theme.id).toBe('dark');
    expect(theme.isBuiltIn).toBe(true);
  });

  it('should accept a custom name', () => {
    const theme: Theme = {
      id: 'custom-theme-1234',
      name: 'My Custom Theme',
      type: 'light',
      isBuiltIn: false,
      colors: createMockThemeColors(),
      font: createMockFontSettings()
    };

    expect(theme).toBeDefined();
    expect(theme.name).toBe('My Custom Theme');
  });
});

describe('ThemeColors interface', () => {
  it('should create a valid theme colors object', () => {
    const colors: ThemeColors = {
      primary: '#007acc',
      secondary: '#6c757d',
      background: '#ffffff',
      foreground: '#333333',
      agentMessageBackground: '#f1f8ff',
      agentMessageForeground: '#333333',
      userMessageBackground: '#e9ecef',
      userMessageForeground: '#333333',
      systemMessage: '#6c757d',
      error: '#dc3545',
      success: '#28a745',
      border: '#dee2e6',
      buttonBackground: '#007acc',
      buttonForeground: '#ffffff',
      buttonHoverBackground: '#0069d9',
      inputBackground: '#ffffff',
      inputForeground: '#333333',
      inputBorder: '#ced4da'
    };

    expect(colors).toBeDefined();
    expect(colors.primary).toBe('#007acc');
    expect(colors.background).toBe('#ffffff');
    expect(colors.agentMessageBackground).toBe('#f1f8ff');
    expect(colors.userMessageBackground).toBe('#e9ecef');
    expect(colors.error).toBe('#dc3545');
  });

  it('should create a dark theme colors object', () => {
    const darkColors: ThemeColors = {
      primary: '#0098ff',
      secondary: '#abb2bf',
      background: '#282c34',
      foreground: '#abb2bf',
      agentMessageBackground: '#2c313c',
      agentMessageForeground: '#abb2bf',
      userMessageBackground: '#3b4048',
      userMessageForeground: '#abb2bf',
      systemMessage: '#7f848e',
      error: '#e06c75',
      success: '#98c379',
      border: '#3e4452',
      buttonBackground: '#3b4048',
      buttonForeground: '#abb2bf',
      buttonHoverBackground: '#4a5058',
      inputBackground: '#1e2227',
      inputForeground: '#abb2bf',
      inputBorder: '#3e4452'
    };

    expect(darkColors).toBeDefined();
    expect(darkColors.background).toBe('#282c34');
    expect(darkColors.foreground).toBe('#abb2bf');
  });

  it('should create a high contrast theme colors object', () => {
    const highContrastColors: ThemeColors = {
      primary: '#1aebff',
      secondary: '#ffffff',
      background: '#000000',
      foreground: '#ffffff',
      agentMessageBackground: '#1e1e1e',
      agentMessageForeground: '#ffffff',
      userMessageBackground: '#0e0e0e',
      userMessageForeground: '#ffffff',
      systemMessage: '#d4d4d4',
      error: '#f48771',
      success: '#89d185',
      border: '#6b6b6b',
      buttonBackground: '#1e1e1e',
      buttonForeground: '#ffffff',
      buttonHoverBackground: '#2e2e2e',
      inputBackground: '#000000',
      inputForeground: '#ffffff',
      inputBorder: '#6b6b6b'
    };

    expect(highContrastColors).toBeDefined();
    expect(highContrastColors.background).toBe('#000000');
    expect(highContrastColors.foreground).toBe('#ffffff');
  });
});

describe('FontSettings interface', () => {
  it('should create valid font settings object', () => {
    const fontSettings: FontSettings = {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      sizeInPixels: 14,
      lineHeight: 1.5,
      weight: 400,
      headingWeight: 700,
      useMonospaceForCode: true
    };

    expect(fontSettings).toBeDefined();
    expect(fontSettings.family).toContain('Segoe UI');
    expect(fontSettings.sizeInPixels).toBe(14);
    expect(fontSettings.lineHeight).toBe(1.5);
    expect(fontSettings.weight).toBe(400);
    expect(fontSettings.headingWeight).toBe(700);
    expect(fontSettings.useMonospaceForCode).toBe(true);
  });

  it('should accept string weight values', () => {
    const fontSettings: FontSettings = {
      family: 'Roboto, sans-serif',
      sizeInPixels: 16,
      lineHeight: 1.6,
      weight: 'normal',
      headingWeight: 'bold',
      useMonospaceForCode: true
    };

    expect(fontSettings).toBeDefined();
    expect(fontSettings.weight).toBe('normal');
    expect(fontSettings.headingWeight).toBe('bold');
  });

  it('should create larger font settings for accessibility', () => {
    const fontSettings: FontSettings = {
      family: 'Arial, sans-serif',
      sizeInPixels: 18,
      lineHeight: 1.8,
      weight: 500,
      headingWeight: 800,
      useMonospaceForCode: true
    };

    expect(fontSettings).toBeDefined();
    expect(fontSettings.sizeInPixels).toBe(18);
    expect(fontSettings.lineHeight).toBe(1.8);
    expect(fontSettings.weight).toBe(500);
  });
});

describe('UILayoutOptions interface', () => {
  it('should create valid UI layout options object', () => {
    const layoutOptions: UILayoutOptions = {
      chatInputPosition: 'bottom',
      showTimestamps: true,
      showAvatars: true,
      compactMode: false,
      expandCodeBlocks: true,
      wordWrap: true
    };

    expect(layoutOptions).toBeDefined();
    expect(layoutOptions.chatInputPosition).toBe('bottom');
    expect(layoutOptions.showTimestamps).toBe(true);
    expect(layoutOptions.showAvatars).toBe(true);
    expect(layoutOptions.compactMode).toBe(false);
    expect(layoutOptions.expandCodeBlocks).toBe(true);
    expect(layoutOptions.wordWrap).toBe(true);
  });

  it('should create UI layout options with input at top', () => {
    const layoutOptions: UILayoutOptions = {
      chatInputPosition: 'top',
      showTimestamps: false,
      showAvatars: true,
      compactMode: false,
      expandCodeBlocks: true,
      wordWrap: true
    };

    expect(layoutOptions).toBeDefined();
    expect(layoutOptions.chatInputPosition).toBe('top');
    expect(layoutOptions.showTimestamps).toBe(false);
  });

  it('should create compact layout options', () => {
    const layoutOptions: UILayoutOptions = {
      chatInputPosition: 'bottom',
      showTimestamps: false,
      showAvatars: false,
      compactMode: true,
      expandCodeBlocks: false,
      wordWrap: false
    };

    expect(layoutOptions).toBeDefined();
    expect(layoutOptions.compactMode).toBe(true);
    expect(layoutOptions.showAvatars).toBe(false);
    expect(layoutOptions.expandCodeBlocks).toBe(false);
    expect(layoutOptions.wordWrap).toBe(false);
  });
});

/**
 * Mock factory functions for theme-related interfaces
 */

export function createMockThemeColors(): ThemeColors {
  return {
    primary: '#007acc',
    secondary: '#6c757d',
    background: '#ffffff',
    foreground: '#333333',
    agentMessageBackground: '#f1f8ff',
    agentMessageForeground: '#333333',
    userMessageBackground: '#e9ecef',
    userMessageForeground: '#333333',
    systemMessage: '#6c757d',
    error: '#dc3545',
    success: '#28a745',
    border: '#dee2e6',
    buttonBackground: '#007acc',
    buttonForeground: '#ffffff',
    buttonHoverBackground: '#0069d9',
    inputBackground: '#ffffff',
    inputForeground: '#333333',
    inputBorder: '#ced4da'
  };
}

export function createMockFontSettings(): FontSettings {
  return {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    sizeInPixels: 14,
    lineHeight: 1.5,
    weight: 400,
    headingWeight: 700,
    useMonospaceForCode: true
  };
}

export function createMockTheme(overrides?: Partial<Theme>): Theme {
  const defaultTheme: Theme = {
    id: 'mock-theme',
    name: 'Mock Theme',
    type: 'light',
    isBuiltIn: false,
    colors: createMockThemeColors(),
    font: createMockFontSettings()
  };

  return { ...defaultTheme, ...overrides };
}

export function createMockUILayoutOptions(overrides?: Partial<UILayoutOptions>): UILayoutOptions {
  const defaultOptions: UILayoutOptions = {
    chatInputPosition: 'bottom',
    showTimestamps: true,
    showAvatars: true,
    compactMode: false,
    expandCodeBlocks: true,
    wordWrap: true
  };

  return { ...defaultOptions, ...overrides };
}