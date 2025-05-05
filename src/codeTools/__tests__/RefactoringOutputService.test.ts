import * as vscode from 'vscode';
import { RefactoringOutputService } from '../services/RefactoringOutputService';

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
    let service: RefactoringOutputService;
    let mockOutputChannel: any;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Get reference to the mock output channel
        mockOutputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0]?.value ||
                           (vscode.window.createOutputChannel as jest.Mock).mockReturnValue({
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

        it('should create only one output channel when multiple instances are created', () => {
            // Create additional instances
            const service2 = new RefactoringOutputService();
            const service3 = new RefactoringOutputService();

            // Verify createOutputChannel was called the correct number of times
            // Once in beforeEach and once for each new instance
            expect(vscode.window.createOutputChannel).toHaveBeenCalledTimes(3);
            expect(vscode.window.createOutputChannel).toHaveBeenNthCalledWith(1, 'Code Refactoring');
            expect(vscode.window.createOutputChannel).toHaveBeenNthCalledWith(2, 'Code Refactoring');
            expect(vscode.window.createOutputChannel).toHaveBeenNthCalledWith(3, 'Code Refactoring');
        });
    });

    describe('startOperation', () => {
        it('should clear the output channel and show it with a timestamped message', () => {
            // Mock Date to ensure consistent test results
            const originalDate = global.Date;
            const mockDate = new Date('2025-05-04T12:00:00Z');
            global.Date = jest.fn(() => mockDate) as any;
            (global.Date as any).toLocaleString = originalDate.toLocaleString;

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

        it('should handle empty message', () => {
            service.startOperation('');

            expect(mockOutputChannel.clear).toHaveBeenCalledTimes(1);
            expect(mockOutputChannel.show).toHaveBeenCalledTimes(1);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                expect.stringMatching(/\[\d{1,2}\/\d{1,2}\/\d{4}.*\] /)
            );
        });

        it('should handle very long messages', () => {
            const longMessage = 'This is a very long message that exceeds the typical length of a log message. '.repeat(10);
            service.startOperation(longMessage);

            expect(mockOutputChannel.clear).toHaveBeenCalledTimes(1);
            expect(mockOutputChannel.show).toHaveBeenCalledTimes(1);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                expect.stringContaining(longMessage)
            );
        });
    });

    describe('logSuccess', () => {
        it('should append a success message with checkmark', () => {
            // Call the method
            service.logSuccess('Operation completed successfully');

            // Verify message was appended with checkmark
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('✅ Operation completed successfully');
        });

        it('should handle empty message', () => {
            service.logSuccess('');

            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('✅ ');
        });

        it('should handle special characters in message', () => {
            const messageWithSpecialChars = 'Operation completed with <special> "characters" & symbols!';
            service.logSuccess(messageWithSpecialChars);

            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(`✅ ${messageWithSpecialChars}`);
        });

        it('should handle multiple calls in sequence', () => {
            service.logSuccess('First success');
            service.logSuccess('Second success');
            service.logSuccess('Third success');

            expect(mockOutputChannel.appendLine).toHaveBeenCalledTimes(3);
            expect(mockOutputChannel.appendLine).toHaveBeenNthCalledWith(1, '✅ First success');
            expect(mockOutputChannel.appendLine).toHaveBeenNthCalledWith(2, '✅ Second success');
            expect(mockOutputChannel.appendLine).toHaveBeenNthCalledWith(3, '✅ Third success');
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
            error.stack = 'Error: Something went wrong\n    at Test.testFunction (/test/file.ts:10:15)';

            // Call the method with error
            service.logError('Operation failed', error);

            // Verify stack trace was included
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Operation failed');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('   Something went wrong');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                '   Error: Something went wrong\n    at Test.testFunction (/test/file.ts:10:15)'
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

        it('should handle null and undefined error objects', () => {
            service.logError('Failed with null', null);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Failed with null');
            // No additional lines should be appended since error is null

            service.logError('Failed with undefined', undefined);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Failed with undefined');
            // No additional lines should be appended since error is undefined
        });

        it('should handle numeric error values', () => {
            service.logError('Numeric error', 404);

            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Numeric error');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('   404');
        });

        it('should handle deeply nested error objects', () => {
            const complexError = {
                code: 500,
                details: {
                    reason: 'Server error',
                    context: {
                        request: '/api/refactor',
                        timestamp: '2025-05-04T12:00:00Z'
                    }
                }
            };

            service.logError('Complex error object', complexError);

            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Complex error object');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                expect.stringContaining('[object Object]')
            );
        });

        it('should handle errors with custom properties', () => {
            interface CustomError extends Error {
                code: string;
                details: string;
            }

            const customError = new Error('Custom error') as CustomError;
            customError.code = 'INVALID_OPERATION';
            customError.details = 'Additional error details';

            service.logError('Error with custom properties', customError);

            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Error with custom properties');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('   Custom error');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Error: Custom error'));
        });
    });

    describe('integration tests', () => {
        it('should properly chain multiple operation steps', () => {
            // Start an operation
            service.startOperation('Starting complex refactoring');

            // Log a few success messages
            service.logSuccess('Step 1 completed');
            service.logSuccess('Step 2 completed');

            // Log an error
            service.logError('Step 3 failed', new Error('Unexpected token'));

            // Continue with more success messages
            service.logSuccess('Step 4 completed (recovery)');

            // Verify the sequence of calls
            expect(mockOutputChannel.clear).toHaveBeenCalledTimes(1);
            expect(mockOutputChannel.show).toHaveBeenCalledTimes(1);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Starting complex refactoring'));
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('✅ Step 1 completed');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('✅ Step 2 completed');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Step 3 failed');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('   Unexpected token');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('✅ Step 4 completed (recovery)');
        });

        it('should handle operation lifecycle with various error types', () => {
            // Start an operation
            service.startOperation('Comprehensive refactoring operation');

            // Log success messages
            service.logSuccess('File analysis complete');

            // Log different types of errors
            service.logError('String error encountered', 'Invalid syntax');
            service.logError('Number error encountered', 404);
            service.logError('Error object encountered', new Error('Parse error'));
            service.logError('Complex error encountered', { type: 'ValidationError', code: 1001 });

            // Log final success
            service.logSuccess('Operation completed with warnings');

            // Verify all expected messages were logged
            expect(mockOutputChannel.clear).toHaveBeenCalledTimes(1);
            expect(mockOutputChannel.show).toHaveBeenCalledTimes(1);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Comprehensive refactoring operation'));
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('✅ File analysis complete');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ String error encountered');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('   Invalid syntax');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Number error encountered');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('   404');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Error object encountered');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('   Parse error');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('❌ Complex error encountered');
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[object Object]'));
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('✅ Operation completed with warnings');
        });
    });
});
