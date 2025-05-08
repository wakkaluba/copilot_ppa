const fs = require('fs');
const os = require('os');
const path = require('path');
const { LogLevel } = require('../../../types/logging');
const { FileLogManager } = require('../FileLogManager');

jest.mock('fs');
jest.mock('path');
jest.mock('os');

describe('FileLogManager (JavaScript)', () => {
    let fileManager;
    let mockLogPath;

    beforeEach(() => {
        jest.clearAllMocks();
        fileManager = new FileLogManager();
        mockLogPath = '/mock/path/logs/test.log';

        // Mock filesystem functions
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => undefined);
        fs.createWriteStream.mockReturnValue({
            write: jest.fn(),
            end: jest.fn(),
            on: jest.fn()
        });
        fs.statSync.mockReturnValue({ size: 0 });
        path.join.mockImplementation((...paths) => paths.join('/'));
        path.dirname.mockImplementation((p) => p.split('/').slice(0, -1).join('/'));
        os.homedir.mockReturnValue('/mock/home');
    });

    describe('initialization', () => {
        test('initializes with default configuration', () => {
            fileManager.initialize({});
            expect(fileManager.isEnabled()).toBe(true);
            expect(fs.mkdirSync).toHaveBeenCalled();
            expect(fs.createWriteStream).toHaveBeenCalled();
        });

        test('creates log directory if it does not exist', () => {
            fileManager.initialize({ filePath: mockLogPath });
            expect(fs.mkdirSync).toHaveBeenCalledWith('/mock/path/logs', { recursive: true });
        });

        test('uses custom file path when provided', () => {
            fileManager.initialize({ filePath: mockLogPath });
            expect(fileManager.getCurrentPath()).toBe(mockLogPath);
        });

        test('handles initialization errors', () => {
            const errorHandler = jest.fn();
            fileManager.on('error', errorHandler);

            fs.mkdirSync.mockImplementation(() => {
                throw new Error('Failed to create directory');
            });

            fileManager.initialize({});
            expect(errorHandler).toHaveBeenCalled();
            expect(fileManager.isEnabled()).toBe(false);
            expect(fileManager.getCurrentPath()).toBeNull();
        });
    });

    describe('log writing', () => {
        beforeEach(() => {
            fileManager.initialize({ filePath: mockLogPath });
        });

        test('writes formatted log entries', () => {
            const mockStream = fs.createWriteStream(mockLogPath);
            const entry = {
                timestamp: new Date('2025-04-30T12:00:00Z'),
                level: LogLevel.INFO,
                message: 'Test message',
                context: { test: true }
            };

            fileManager.writeEntry(entry);

            expect(mockStream.write).toHaveBeenCalledWith(
                expect.stringContaining('[2025-04-30T12:00:00.000Z] [INFO ] Test message')
            );
        });

        test('handles write errors', () => {
            const errorHandler = jest.fn();
            fileManager.on('error', errorHandler);

            const mockStream = fs.createWriteStream(mockLogPath);
            mockStream.write.mockImplementation(() => {
                throw new Error('Write failed');
            });

            fileManager.writeEntry({
                timestamp: new Date(),
                level: LogLevel.ERROR,
                message: 'Test error'
            });

            expect(errorHandler).toHaveBeenCalled();
        });

        test('skips writing when disabled', () => {
            const mockStream = fs.createWriteStream(mockLogPath);
            fileManager.disable();

            fileManager.writeEntry({
                timestamp: new Date(),
                level: LogLevel.INFO,
                message: 'Test message'
            });

            expect(mockStream.write).not.toHaveBeenCalled();
        });

        test('includes context when available', () => {
            const mockStream = fs.createWriteStream(mockLogPath);
            const context = { userId: '12345', action: 'login' };

            fileManager.writeEntry({
                timestamp: new Date(),
                level: LogLevel.INFO,
                message: 'User action',
                context: context
            });

            expect(mockStream.write).toHaveBeenCalledWith(
                expect.stringContaining(JSON.stringify(context, null, 2))
            );
        });

        test('handles non-serializable context gracefully', () => {
            const mockStream = fs.createWriteStream(mockLogPath);

            // Create circular reference that can't be serialized
            const circular = {};
            circular.self = circular;

            fileManager.writeEntry({
                timestamp: new Date(),
                level: LogLevel.INFO,
                message: 'Problematic context',
                context: circular
            });

            expect(mockStream.write).toHaveBeenCalledWith(
                expect.stringContaining('Context: [Not serializable]')
            );
        });
    });

    describe('file rotation', () => {
        beforeEach(() => {
            fileManager.initialize({
                filePath: mockLogPath,
                maxSizeMB: 5,
                maxFiles: 3
            });
        });

        test('rotates files when size limit is reached', () => {
            fs.statSync.mockReturnValue({ size: 6 * 1024 * 1024 }); // 6MB
            fs.existsSync.mockReturnValue(true);

            fileManager.writeEntry({
                timestamp: new Date(),
                level: LogLevel.INFO,
                message: 'Test rotation'
            });

            expect(fs.renameSync).toHaveBeenCalled();
            expect(fs.createWriteStream).toHaveBeenCalledTimes(2); // Initial + after rotation
        });

        test('deletes oldest file when max files reached', () => {
            fs.statSync.mockReturnValue({ size: 6 * 1024 * 1024 });
            fs.existsSync
                .mockReturnValue(true)
                .mockReturnValueOnce(true) // Current file
                .mockReturnValueOnce(true) // .1
                .mockReturnValueOnce(true) // .2
                .mockReturnValueOnce(true); // .3

            fileManager.writeEntry({
                timestamp: new Date(),
                level: LogLevel.INFO,
                message: 'Test max files'
            });

            expect(fs.unlinkSync).toHaveBeenCalled();
        });

        test('handles rotation errors', () => {
            const errorHandler = jest.fn();
            fileManager.on('error', errorHandler);

            fs.statSync.mockReturnValue({ size: 6 * 1024 * 1024 });
            fs.renameSync.mockImplementation(() => {
                throw new Error('Rotation failed');
            });

            fileManager.writeEntry({
                timestamp: new Date(),
                level: LogLevel.INFO,
                message: 'Test rotation error'
            });

            expect(errorHandler).toHaveBeenCalled();
        });

        test('skips rotation for non-existent log file', () => {
            fs.existsSync.mockReturnValue(false);

            fileManager.writeEntry({
                timestamp: new Date(),
                level: LogLevel.INFO,
                message: 'Test non-existent file'
            });

            expect(fs.statSync).not.toHaveBeenCalled();
            expect(fs.renameSync).not.toHaveBeenCalled();
        });
    });

    describe('cleanup', () => {
        test('properly cleans up resources on disable', () => {
            fileManager.initialize({ filePath: mockLogPath });
            const mockStream = fs.createWriteStream(mockLogPath);

            fileManager.disable();

            expect(mockStream.end).toHaveBeenCalled();
            expect(fileManager.isEnabled()).toBe(false);
            expect(fileManager.getCurrentPath()).toBeNull();
        });

        test('properly disposes of resources', () => {
            fileManager.initialize({ filePath: mockLogPath });
            const mockStream = fs.createWriteStream(mockLogPath);

            fileManager.dispose();

            expect(mockStream.end).toHaveBeenCalled();
            expect(fileManager.isEnabled()).toBe(false);
            expect(fileManager.getCurrentPath()).toBeNull();
        });

        test('does nothing when disabling without initialization', () => {
            // Don't initialize
            fileManager.disable();
            expect(fileManager.isEnabled()).toBe(false);
        });
    });

    describe('utility functions', () => {
        test('formatLevel pads level string to fixed width', () => {
            // Access private method for testing
            const formatLevel = fileManager.formatLevel.bind(fileManager);

            expect(formatLevel('INFO')).toBe('INFO ');
            expect(formatLevel('WARNING')).toBe('WARNING');
            expect(formatLevel('ERR')).toBe('ERR  ');
        });

        test('emitError handles non-Error objects', () => {
            const errorHandler = jest.fn();
            fileManager.on('error', errorHandler);

            // Access private method for testing
            const emitError = fileManager.emitError.bind(fileManager);

            emitError('string error');
            expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
            expect(errorHandler.mock.calls[0][0].message).toBe('string error');

            emitError(404);
            expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
            expect(errorHandler.mock.calls[1][0].message).toBe('404');
        });
    });
});
