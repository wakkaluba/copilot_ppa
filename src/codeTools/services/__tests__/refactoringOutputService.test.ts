import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { RefactoringOutputService } from '../RefactoringOutputService';

describe('RefactoringOutputService', () => {
    let service: RefactoringOutputService;
    let outputChannelMock: any;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the VS Code OutputChannel
        outputChannelMock = {
            clear: sandbox.stub(),
            appendLine: sandbox.stub(),
            show: sandbox.stub(),
            dispose: sandbox.stub()
        };

        // Mock the VS Code window.createOutputChannel method
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannelMock);

        // Create a new instance of the service
        service = new RefactoringOutputService();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should create an output channel with the correct name', () => {
            expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('Code Refactoring');
        });
    });

    describe('startOperation', () => {
        it('should clear the output channel', () => {
            service.startOperation('Starting refactoring');
            expect(outputChannelMock.clear).toHaveBeenCalled();
        });

        it('should append the operation message with timestamp', () => {
            // Mock Date to ensure consistent testing
            const mockDate = new Date('2025-01-01T12:00:00Z');
            const dateStub = sandbox.stub(global, 'Date').returns(mockDate);

            service.startOperation('Starting refactoring');

            // Check that the message contains the date string and the message
            expect(outputChannelMock.appendLine.calledWith(
                sinon.match(/\[\d{1,2}\/\d{1,2}\/\d{4}.*\] Starting refactoring/)
            )).toBe(true);

            dateStub.restore();
        });

        it('should show the output channel', () => {
            service.startOperation('Starting refactoring');
            expect(outputChannelMock.show).toHaveBeenCalled();
        });
    });

    describe('logInfo', () => {
        it('should append an info message with ℹ️ symbol', () => {
            service.logInfo('Processing file');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('ℹ️ Processing file');
        });

        it('should append indented details when provided as string', () => {
            service.logInfo('Processing file', 'src/example.ts');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('ℹ️ Processing file');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   src/example.ts');
        });

        it('should handle details as array of strings', () => {
            service.logInfo('Processing files', ['src/example.ts', 'src/helper.ts']);
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('ℹ️ Processing files');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   src/example.ts');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   src/helper.ts');
        });

        it('should handle details as object', () => {
            service.logInfo('File processed', { name: 'example.ts', size: '1.2KB' });
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('ℹ️ File processed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('  Details:');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('    name: example.ts');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('    size: 1.2KB');
        });

        it('should not log details when none provided', () => {
            service.logInfo('Processing file');
            expect(outputChannelMock.appendLine.callCount).toBe(1);
        });
    });

    describe('logWarning', () => {
        it('should append a warning message with ⚠️ symbol', () => {
            service.logWarning('Found potential issues');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('⚠️ Found potential issues');
        });

        it('should append indented details when provided as string', () => {
            service.logWarning('Found potential issues', 'Unused variable detected');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('⚠️ Found potential issues');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   Unused variable detected');
        });

        it('should handle details as array of strings', () => {
            service.logWarning('Found potential issues', ['Unused variable', 'Magic number']);
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('⚠️ Found potential issues');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   Unused variable');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   Magic number');
        });

        it('should handle details as object', () => {
            service.logWarning('Performance issues', { file: 'main.ts', issues: 3 });
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('⚠️ Performance issues');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('  Details:');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('    file: main.ts');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('    issues: 3');
        });
    });

    describe('logSuccess', () => {
        it('should append a success message with ✅ symbol', () => {
            service.logSuccess('Refactoring completed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('✅ Refactoring completed');
        });

        it('should append indented details when provided as string', () => {
            service.logSuccess('Refactoring completed', '3 files modified');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('✅ Refactoring completed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   3 files modified');
        });

        it('should handle details as array of strings', () => {
            service.logSuccess('Refactoring completed', ['3 files modified', '2 functions renamed']);
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('✅ Refactoring completed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   3 files modified');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   2 functions renamed');
        });

        it('should handle details as object', () => {
            service.logSuccess('Refactoring completed', { modified: 3, renamed: 2 });
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('✅ Refactoring completed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('  Details:');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('    modified: 3');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('    renamed: 2');
        });
    });

    describe('logError', () => {
        it('should append an error message with ❌ symbol', () => {
            service.logError('Refactoring failed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('❌ Refactoring failed');
        });

        it('should append error message when error is an Error object', () => {
            const error = new Error('Something went wrong');
            service.logError('Refactoring failed', error);

            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('❌ Refactoring failed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   Something went wrong');
        });

        it('should append error stack when available', () => {
            const error = new Error('Something went wrong');
            error.stack = 'Error: Something went wrong\n    at Test';
            service.logError('Refactoring failed', error);

            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('❌ Refactoring failed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   Something went wrong');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   Error: Something went wrong\n    at Test');
        });

        it('should handle string errors', () => {
            service.logError('Refactoring failed', 'Just a string error');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('❌ Refactoring failed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   Just a string error');
        });

        it('should handle errors with toString method', () => {
            const customError = {
                toString: () => 'Custom error with code PARSING_ERROR'
            };
            service.logError('Refactoring failed', customError);

            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('❌ Refactoring failed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   Custom error with code PARSING_ERROR');
        });

        it('should handle object errors without toString method', () => {
            service.logError('Refactoring failed', { customField: 'value' });
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('❌ Refactoring failed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   {"customField":"value"}');
        });
    });

    describe('logOperation', () => {
        it('should append an operation message with [Operation] prefix', () => {
            service.logOperation('Processing files');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('[Operation] Processing files');
        });
    });

    describe('appendLine', () => {
        it('should append a line to the output channel', () => {
            service.appendLine('Custom message');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('Custom message');
        });

        it('should handle empty strings', () => {
            service.appendLine('');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('');
        });
    });

    describe('dispose', () => {
        it('should dispose the output channel', () => {
            service.dispose();
            expect(outputChannelMock.dispose).toHaveBeenCalled();
        });
    });
});
