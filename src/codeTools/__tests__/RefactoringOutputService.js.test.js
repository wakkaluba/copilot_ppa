const vscode = require('vscode');
const { RefactoringOutputService } = require('../services/RefactoringOutputService');

// Mock VS Code APIs
jest.mock('vscode', () => {
    const mockOutputChannel = {
        appendLine: jest.fn(),
        clear: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
    };

    return {
        window: {
            createOutputChannel: jest.fn().mockReturnValue(mockOutputChannel)
        }
    };
});

describe('RefactoringOutputService', () => {
    let service;
    let mockOutputChannel;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Get reference to the mock output channel
        mockOutputChannel = vscode.window.createOutputChannel.mock.results[0]?.value ||
                          vscode.window.createOutputChannel.mockReturnValue({
                              appendLine: jest.fn(),
                              clear: jest.fn(),
                              show: jest.fn(),
                              hide: jest.fn(),
                              dispose: jest.fn()
                          });

        // Create a new instance of the service for each test
        service = new RefactoringOutputService();
    });

    describe('constructor', () => {
        it('should create an output channel with the correct name', () => {
            expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('Code Refactoring');
        });
    });

    describe('startOperation', () => {
        it('should clear the output channel and show it with a timestamped message', () => {
            // Mock Date to ensure consistent test results
            const originalDate = global.Date;
            const mockDate = new Date('2025-05-04T12:00:00Z');
            global.Date = jest.fn(() => mockDate);
            global.Date.toLocaleString = originalDate.toLocaleString;

            // Call the method
            service.startOperation('Starting refactoring operation');

            // Verify output channel was cleared and shown
            expect(mockOutputChannel.clear).toHaveBeenCalledTimes(1);
            expect(mockOutputChannel.show).toHaveBeenCalledTimes(1);

            // Verify message was appended with timestamp
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                expect.stringContaining('Starting refactoring operation')
            );
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                expect.stringMatching(/\[\d{1,2}\/\d{1,2}\/\d{4}.*\] Starting refactoring operation/)
            );

            // Restore original Date
            global.Date = originalDate;
        });
    });

    describe('logSuccess', () => {
        it('should append a success message with checkmark', () => {
            // Call the method
            service.logSuccess('Operation completed successfully');

            // Verify message was appended with checkmark
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('✅ Operation completed successfully');
        });
    });

    describe('logError', () => {
        it('should append an error message with X mark', () => {
            // Call the method
            service.logError('Operation failed');

            // Verify message was appended with X mark
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Operation failed');
        });

        it('should include error message if Error object is provided', () => {
            // Create an error object
            const error = new Error('Something went wrong');

            // Call the method with error
            service.logError('Operation failed', error);

            // Verify error message was included
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Operation failed');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('   Something went wrong');
        });

        it('should include stack trace if available in Error object', () => {
            // Create an error object with stack trace
            const error = new Error('Something went wrong');
            error.stack = 'Error: Something went wrong\n    at Test.testFunction (/test/file.js:10:15)';

            // Call the method with error
            service.logError('Operation failed', error);

            // Verify stack trace was included
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Operation failed');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('   Something went wrong');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '   Error: Something went wrong\n    at Test.testFunction (/test/file.js:10:15)'
            );
        });

        it('should handle non-Error objects', () => {
            // Call the method with a string error
            service.logError('Operation failed', 'Custom error message');

            // Verify string error was included
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Operation failed');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('   Custom error message');

            // Call the method with an object error
            service.logError('Another failure', { reason: 'Invalid configuration' });

            // Verify object error was stringified
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Another failure');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                expect.stringContaining('[object Object]')
            );
        });
    });
});
