"use strict";
/**
 * Custom Jest matchers for VS Code-specific assertions
 * These matchers make it easier to test VS Code extension functionality
 */
// Utility function to check if an object looks like a VS Code Uri
function isVsCodeUri(obj) {
    return obj &&
        typeof obj === 'object' &&
        typeof obj.fsPath === 'string' &&
        typeof obj.scheme === 'string';
}
// Utility function to check if an object looks like a VS Code Range
function isVsCodeRange(obj) {
    return obj &&
        typeof obj === 'object' &&
        obj.start && obj.end &&
        typeof obj.start.line === 'number' &&
        typeof obj.start.character === 'number' &&
        typeof obj.end.line === 'number' &&
        typeof obj.end.character === 'number';
}
// Utility function to check if an object looks like a VS Code Position
function isVsCodePosition(obj) {
    return obj &&
        typeof obj === 'object' &&
        typeof obj.line === 'number' &&
        typeof obj.character === 'number';
}
// Utility function to check if an object is a VS Code extension context
function isVsCodeExtensionContext(obj) {
    return obj &&
        typeof obj === 'object' &&
        Array.isArray(obj.subscriptions) &&
        obj.extensionPath && typeof obj.extensionPath === 'string';
}
// Custom matchers
const vscodeMatchers = {
    // Check if value is a VS Code URI
    toBeVsCodeUri(received) {
        const pass = isVsCodeUri(received);
        return {
            pass,
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be a VS Code URI`
        };
    },
    // Check if value is a VS Code Range
    toBeVsCodeRange(received) {
        const pass = isVsCodeRange(received);
        return {
            pass,
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be a VS Code Range`
        };
    },
    // Check if value is a VS Code Position
    toBeVsCodePosition(received) {
        const pass = isVsCodePosition(received);
        return {
            pass,
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be a VS Code Position`
        };
    },
    // Check if a status bar item is visible
    toBeVisibleStatusBarItem(received) {
        const pass = received &&
            typeof received === 'object' &&
            typeof received.show === 'function' &&
            !received.hide.mock.calls.length;
        return {
            pass,
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be a visible status bar item`
        };
    },
    // Check if a mock was called with VS Code extension context
    toHaveBeenCalledWithVsCodeContext(received) {
        const pass = received.mock.calls.some(call => isVsCodeExtensionContext(call[0]));
        return {
            pass,
            message: () => `expected ${received} ${pass ? 'not ' : ''}to have been called with a VS Code extension context`
        };
    },
    // Check if a tree item is a parent node (has children)
    toBeParentTreeItem(received) {
        const pass = received &&
            typeof received === 'object' &&
            [1, 2].includes(received.collapsibleState); // Collapsed or Expanded
        return {
            pass,
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be a parent tree item`
        };
    },
    // Check if a function registers VS Code commands
    toRegisterCommands(received) {
        const registerCommandMock = require('vscode').commands.registerCommand;
        const pass = registerCommandMock.mock.calls.length > 0;
        return {
            pass,
            message: () => `expected function ${pass ? 'not ' : ''}to register VS Code commands`
        };
    },
    // Check if an object is a VS Code webview
    toBeVsCodeWebview(received) {
        const pass = received &&
            typeof received === 'object' &&
            typeof received.html === 'string' &&
            typeof received.onDidReceiveMessage === 'function';
        return {
            pass,
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be a VS Code webview`
        };
    },
    // Check if a path points to an existing workspace file
    toBeWorkspaceFilePath(received) {
        const fs = require('fs');
        const workspace = require('vscode').workspace;
        let relativePath = received;
        if (workspace.workspaceFolders && workspace.workspaceFolders.length) {
            const workspaceRoot = workspace.workspaceFolders[0].uri.fsPath;
            if (!received.startsWith(workspaceRoot)) {
                relativePath = require('path').join(workspaceRoot, received);
            }
        }
        const pass = fs.existsSync(relativePath);
        return {
            pass,
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be an existing workspace file path`
        };
    }
};
// Add the matchers to Jest
if (typeof expect !== 'undefined') {
    expect.extend(vscodeMatchers);
}
module.exports = vscodeMatchers;
//# sourceMappingURL=vscode-matchers.js.map