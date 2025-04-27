"use strict";
/**
 * Mock interface factory utilities
 *
 * This file contains factory functions to create mock implementations of the various
 * interfaces used throughout the Copilot PPA extension. These mocks are useful for testing
 * components that depend on these interfaces without having to rely on the actual implementations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockLLMProvider = createMockLLMProvider;
exports.createMockStatusBarItem = createMockStatusBarItem;
exports.createMockConnectionStatusService = createMockConnectionStatusService;
var vscode = require("vscode");
var MockLLMProvider_1 = require("../../__testUtils__/MockLLMProvider");
/**
 * Creates a mock LLMProvider with custom overrides
 */
function createMockLLMProvider(overrides) {
    var mockProvider = new MockLLMProvider_1.MockLLMProvider();
    if (overrides) {
        // Apply all overrides to the mock provider
        Object.entries(overrides).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (typeof value === 'function') {
                // For function properties, replace them with the override
                mockProvider[key] = value;
            }
            else {
                // For non-function properties, add them or override the existing ones
                mockProvider[key] = value;
            }
        });
    }
    return mockProvider;
}
/**
 * Creates a mock status bar item
 */
function createMockStatusBarItem() {
    return {
        id: 'mock-status-bar',
        name: 'Mock Status Bar',
        tooltip: '',
        text: '',
        command: undefined,
        color: undefined,
        backgroundColor: undefined,
        alignment: vscode.StatusBarAlignment.Left,
        priority: 0,
        accessibilityInformation: { label: 'Mock Status', role: 'Status' },
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
    };
}
/**
 * Creates a mock connection status service
 */
function createMockConnectionStatusService() {
    return {
        setState: jest.fn(),
        showNotification: jest.fn(),
        state: 0, // ConnectionState.Disconnected
        activeModelName: '',
        providerName: '',
        onDidChangeState: jest.fn(),
        dispose: jest.fn(),
    };
}
