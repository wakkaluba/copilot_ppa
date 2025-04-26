/**
 * Example of how to update test files to use the new helper
 */
import { getVSCodeMock, createMockExtensionContext } from '../testHelpers';

// Instead of: import * as vscode from 'vscode';
// Use the helper function to get the mock:
const vscode = getVSCodeMock();

describe('Example Test', () => {
    let mockContext: ReturnType<typeof createMockExtensionContext>;
    
    beforeEach(() => {
        // Create a mock context
        mockContext = createMockExtensionContext();
    });
    
    test('Example test with VSCode mock', () => {
        // Use the mock as if it were the real vscode module
        expect(vscode.window.showInformationMessage).toBeDefined();
        
        // Test your code that uses vscode APIs
        vscode.window.showInformationMessage('Test message');
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Test message');
    });
});
