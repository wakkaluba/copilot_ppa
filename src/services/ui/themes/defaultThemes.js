"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultThemes = void 0;
/**
 * Built-in theme definitions
 */
exports.defaultThemes = new Map([
    ['default', {
            id: 'default',
            name: 'Default Light',
            isBuiltIn: true,
            colors: {
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
                buttonHoverBackground: '#005fa3',
                inputBackground: '#ffffff',
                inputForeground: '#333333',
                inputBorder: '#ced4da'
            },
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 14,
                lineHeight: 1.5,
                weight: 400,
                headingWeight: 700,
                useMonospaceForCode: true
            }
        }],
    ['dark', {
            id: 'dark',
            name: 'Default Dark',
            isBuiltIn: true,
            colors: {
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
                buttonBackground: '#0098ff',
                buttonForeground: '#ffffff',
                buttonHoverBackground: '#007acc',
                inputBackground: '#3b4048',
                inputForeground: '#abb2bf',
                inputBorder: '#4b5261'
            },
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 14,
                lineHeight: 1.5,
                weight: 400,
                headingWeight: 700,
                useMonospaceForCode: true
            }
        }],
    ['high-contrast', {
            id: 'high-contrast',
            name: 'High Contrast',
            isBuiltIn: true,
            colors: {
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
                buttonBackground: '#1aebff',
                buttonForeground: '#000000',
                buttonHoverBackground: '#00c4cc',
                inputBackground: '#0e0e0e',
                inputForeground: '#ffffff',
                inputBorder: '#3e3e3e'
            },
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 16,
                lineHeight: 1.6,
                weight: 500,
                headingWeight: 800,
                useMonospaceForCode: true
            }
        }]
]);
