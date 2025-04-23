import { Event } from 'vscode';

/**
 * Theme definition interface
 */
export interface ITheme {
    /**
     * Unique ID for the theme
     */
    id: string;
    
    /**
     * Display name for the theme
     */
    name: string;
    
    /**
     * Theme type (light, dark, high-contrast)
     */
    type: 'light' | 'dark' | 'high-contrast';
    
    /**
     * Whether this is a built-in theme
     */
    isBuiltIn: boolean;
    
    /**
     * Color variables for the theme
     */
    colors: IThemeColors;
    
    /**
     * Font settings
     */
    font: IFontSettings;
}

/**
 * Theme colors definition
 */
export interface IThemeColors {
    /**
     * Primary color for actions, buttons, etc.
     */
    primary: string;
    
    /**
     * Secondary color for less emphasized elements
     */
    secondary: string;
    
    /**
     * Background color for main panels
     */
    background: string;
    
    /**
     * Foreground color for text
     */
    foreground: string;
    
    /**
     * Background color for the agent's messages
     */
    agentMessageBackground: string;
    
    /**
     * Text color for the agent's messages
     */
    agentMessageForeground: string;
    
    /**
     * Background color for the user's messages
     */
    userMessageBackground: string;
    
    /**
     * Text color for the user's messages
     */
    userMessageForeground: string;
    
    /**
     * Color for system messages and notifications
     */
    systemMessage: string;
    
    /**
     * Color for errors and warnings
     */
    error: string;
    
    /**
     * Color for success messages
     */
    success: string;
    
    /**
     * Border color
     */
    border: string;
    
    /**
     * Button background color
     */
    buttonBackground: string;
    
    /**
     * Button foreground color
     */
    buttonForeground: string;
    
    /**
     * Button hover background color
     */
    buttonHoverBackground: string;
    
    /**
     * Input background color
     */
    inputBackground: string;
    
    /**
     * Input foreground color
     */
    inputForeground: string;
    
    /**
     * Input border color
     */
    inputBorder: string;
}

/**
 * Font settings for the UI
 */
export interface IFontSettings {
    /**
     * Font family
     */
    family: string;
    
    /**
     * Base font size in pixels
     */
    sizeInPixels: number;
    
    /**
     * Line height as a multiplier
     */
    lineHeight: number;
    
    /**
     * Font weight for normal text
     */
    weight: string | number;
    
    /**
     * Font weight for headings
     */
    headingWeight: string | number;
    
    /**
     * Use monospace font for code blocks
     */
    useMonospaceForCode: boolean;
}

/**
 * UI layout options
 */
export interface IUILayoutOptions {
    /**
     * Position of the chat input field
     */
    chatInputPosition: 'bottom' | 'top';
    
    /**
     * Show timestamps on messages
     */
    showTimestamps: boolean;
    
    /**
     * Show avatar icons for messages
     */
    showAvatars: boolean;
    
    /**
     * Compact mode for messages
     */
    compactMode: boolean;
    
    /**
     * Expand code blocks by default
     */
    expandCodeBlocks: boolean;
    
    /**
     * Wrap long lines in chat
     */
    wordWrap: boolean;
}

/**
 * Theme change event
 */
export interface IThemeChangeEvent {
    theme: ITheme;
    previous?: ITheme;
}

/**
 * UI options change event
 */
export interface IUIOptionsChangeEvent {
    options: IUILayoutOptions;
    previous?: IUILayoutOptions;
}

export interface IThemeService {
    readonly onThemeChanged: Event<IThemeChangeEvent>;
    readonly onUIOptionsChanged: Event<IUIOptionsChangeEvent>;
    getThemes(): ITheme[];
    getTheme(id: string): ITheme | undefined;
    getActiveTheme(): ITheme;
    setActiveTheme(id: string): boolean;
    getUILayoutOptions(): IUILayoutOptions;
    updateUILayoutOptions(options: Partial<IUILayoutOptions>): IUILayoutOptions;
    getThemeCSS(): string;
    getUILayoutCSS(): string;
}