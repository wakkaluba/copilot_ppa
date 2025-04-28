import * as vscode from 'vscode';
import { Logger } from '../../src/logging/logger';
import { LogLevel } from '../../src/logging/ILogger';

describe('Logger', () => {
    let logger: Logger;
    let mockOutputChannel: any;

    beforeEach(() => {
        mockOutputChannel = {
            appendLine: jest.fn(),
            append: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        };
        
        // Mock the vscode.window.createOutputChannel
        jest.spyOn(vscode.window, 'createOutputChannel').mockReturnValue(mockOutputChannel as any);
        
        logger = new Logger('Test Logger');
    });

    test('should log messages with correct level', () => {
        logger.info('Info message');
        expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[INFO] Info message'));
        
        logger.debug('Debug message');
        expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[DEBUG] Debug message'));
        
        logger.warn('Warning message');
        expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[WARN] Warning message'));
        
        logger.error('Error message');
        expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[ERROR] Error message'));
    });

    test('should respect log level settings', () => {
        // Set log level to Warning - this should suppress Debug and Info messages
        logger.setLogLevel(LogLevel.Warning);
        
        logger.debug('Debug message');
        logger.info('Info message');
        logger.warn('Warning message');
        logger.error('Error message');
        
        // Should not log debug and info messages
        expect(mockOutputChannel.appendLine).not.toHaveBeenCalledWith(expect.stringContaining('[DEBUG] Debug message'));
        expect(mockOutputChannel.appendLine).not.toHaveBeenCalledWith(expect.stringContaining('[INFO] Info message'));
        
        // Should log warn and error messages
        expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[WARN] Warning message'));
        expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[ERROR] Error message'));
    });
    
    test('should log additional arguments', () => {
        const error = new Error('Test error');
        const obj = { key: 'value' };
        
        logger.error('Error with details', error, obj);
        
        // Check that the message was logged
        expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('[ERROR] Error with details'));
        
        // Check that the error and object were logged (in separate calls)
        // We're not checking the exact string format as it may vary, just that they were logged
        expect(mockOutputChannel.appendLine).toHaveBeenCalledTimes(3);
    });
    
    test('should dispose output channel on dispose', () => {
        logger.dispose();
        expect(mockOutputChannel.dispose).toHaveBeenCalled();
    });
});
