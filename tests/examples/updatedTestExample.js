"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Example of how to update test files to use the new helper
 */
var testHelpers_1 = require("../testHelpers");
// Instead of: import * as vscode from 'vscode';
// Use the helper function to get the mock:
var vscode = (0, testHelpers_1.getVSCodeMock)();
describe('Example Test', function () {
    var mockContext;
    beforeEach(function () {
        // Create a mock context
        mockContext = (0, testHelpers_1.createMockExtensionContext)();
    });
    test('Example test with VSCode mock', function () {
        // Use the mock as if it were the real vscode module
        expect(vscode.window.showInformationMessage).toBeDefined();
        // Test your code that uses vscode APIs
        vscode.window.showInformationMessage('Test message');
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Test message');
    });
});
