import { ITheme } from '../interfaces';

export const defaultThemes: ITheme[] = [
    {
        id: 'default',
        name: 'Default Light',
        type: 'light',
        isBuiltIn: true,
        colors: {
            primary: '#0078d4',
            secondary: '#106ebe',
            background: '#ffffff',
            foreground: '#323130',
            agentMessageBackground: '#f5f5f5',
            agentMessageForeground: '#323130',
            userMessageBackground: '#e6f2fa',
            userMessageForeground: '#323130',
            systemMessage: '#797775',
            error: '#a4262c',
            success: '#107c10',
            border: '#edebe9',
            buttonBackground: '#0078d4',
            buttonForeground: '#ffffff',
            buttonHoverBackground: '#106ebe',
            inputBackground: '#ffffff',
            inputForeground: '#323130',
            inputBorder: '#8a8886'
        },
        font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            sizeInPixels: 14,
            lineHeight: 1.5,
            weight: 400,
            headingWeight: 600,
            useMonospaceForCode: true
        }
    },
    {
        id: 'dark',
        name: 'Default Dark',
        type: 'dark',
        isBuiltIn: true,
        colors: {
            primary: '#2ea7ff',
            secondary: '#5fb2ec',
            background: '#1e1e1e',
            foreground: '#cccccc',
            agentMessageBackground: '#2d2d2d',
            agentMessageForeground: '#cccccc',
            userMessageBackground: '#0e3766',
            userMessageForeground: '#ffffff',
            systemMessage: '#a0a0a0',
            error: '#f48771',
            success: '#89d185',
            border: '#3c3c3c',
            buttonBackground: '#2ea7ff',
            buttonForeground: '#ffffff',
            buttonHoverBackground: '#5fb2ec',
            inputBackground: '#3c3c3c',
            inputForeground: '#cccccc',
            inputBorder: '#6b6b6b'
        },
        font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            sizeInPixels: 14,
            lineHeight: 1.5,
            weight: 400,
            headingWeight: 600,
            useMonospaceForCode: true
        }
    },
    {
        id: 'high-contrast',
        name: 'High Contrast',
        type: 'dark',
        isBuiltIn: true,
        colors: {
            primary: '#ffff00',
            secondary: '#ffffff',
            background: '#000000',
            foreground: '#ffffff',
            agentMessageBackground: '#2d2d2d',
            agentMessageForeground: '#ffffff',
            userMessageBackground: '#444444',
            userMessageForeground: '#ffffff',
            systemMessage: '#d4d4d4',
            error: '#f14c4c',
            success: '#4cd653',
            border: '#6b6b6b',
            buttonBackground: '#444444',
            buttonForeground: '#ffffff',
            buttonHoverBackground: '#666666',
            inputBackground: '#2d2d2d',
            inputForeground: '#ffffff',
            inputBorder: '#ffffff'
        },
        font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            sizeInPixels: 16,
            lineHeight: 1.6,
            weight: 400,
            headingWeight: 700,
            useMonospaceForCode: true
        }
    }
];