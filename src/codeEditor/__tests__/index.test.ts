/**
 * Test entry point for code editor components
 * This file ensures that all code editor component tests are properly included in coverage reports
 */

// Import all code editor tests
import './codeEditorManager.test';
import './types.test';
import './webviews/index.test';

describe('Code Editor Test Suite', () => {
    it('should include all code editor component tests in coverage reports', () => {
        // This is just a placeholder test to ensure the suite is executed
        // The actual tests are in the imported files
        expect(true).toBe(true);
    });
});
