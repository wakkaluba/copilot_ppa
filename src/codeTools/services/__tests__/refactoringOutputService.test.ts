// filepath: d:\___coding\tools\copilot_ppa\src\codeTools\services\__tests__\refactoringOutputService.test.ts
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

    describe('logSuccess', () => {
        it('should append a success message with checkmark', () => {
            service.logSuccess('Refactoring completed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('✅ Refactoring completed');
        });
    });

    describe('logError', () => {
        it('should append an error message with X mark', () => {
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
            service.logError('Refactoring failed', error);

            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('❌ Refactoring failed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   Something went wrong');

            // Check if stack was appended - cannot check exact stack as it's dynamic
            expect(outputChannelMock.appendLine.calledWith(
                sinon.match(/   Error: Something went wrong/)
            )).toBe(true);
        });

        it('should handle non-Error objects correctly', () => {
            service.logError('Refactoring failed', 'Just a string error');

            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('❌ Refactoring failed');
            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('   Just a string error');
        });

        it('should work without an error object', () => {
            service.logError('Refactoring failed');

            expect(outputChannelMock.appendLine).toHaveBeenCalledWith('❌ Refactoring failed');
            // No additional error details should be appended
            expect(outputChannelMock.appendLine.callCount).toBe(1);
        });
    });
});
