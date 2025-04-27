export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    agentMessageBackground: string;
    agentMessageForeground: string;
    userMessageBackground: string;
    userMessageForeground: string;
    systemMessage: string;
    error: string;
    success: string;
    border: string;
    buttonBackground: string;
    buttonForeground: string;
    buttonHoverBackground: string;
    inputBackground: string;
    inputForeground: string;
    inputBorder: string;
}

export interface FontSettings {
    family: string;
    sizeInPixels: number;
    lineHeight: number;
    weight: number;
    headingWeight: number;
    useMonospaceForCode: boolean;
}

export interface UILayoutOptions {
    chatInputPosition: 'top' | 'bottom';
    showTimestamps: boolean;
    showAvatars: boolean;
    compactMode: boolean;
    expandCodeBlocks: boolean;
    wordWrap: boolean;
}

export interface ITheme {
    id: string;
    name: string;
    type: 'light' | 'dark';
    isBuiltIn: boolean;
    colors: ThemeColors;
    font: FontSettings;
}

// For backward compatibility, create a type alias
export type Theme = ITheme;
