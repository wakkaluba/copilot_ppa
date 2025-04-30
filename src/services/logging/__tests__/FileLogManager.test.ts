import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { LogLevel } from '../../../types/logging';
import { FileLogManager } from '../FileLogManager';

jest.mock('fs');
jest.mock('path');
jest.mock('os');

describe('FileLogManager', () => {
    let fileManager: FileLogManager;
    let mockLogPath: string;

    beforeEach(() => {
        jest.clearAllMocks();
        fileManager = new FileLogManager();
        mockLogPath = '/mock/path/logs/test.log';

        // Mock filesystem functions
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        (fs.mkdirSync as jest.Mock).mockImplementation(() => undefined);
        (fs.createWriteStream as jest.Mock).mockReturnValue({
            write: jest.fn(),
            end: jest.fn(),
            on: jest.fn()
        });
        (fs.statSync as jest.Mock).mockReturnValue({ size: 0 });
        (path.join as jest.Mock).mockImplementation((...paths) => paths.join('/'));
        (path.dirname as jest.Mock).mockImplementation((p) => p.split('/').slice(0, -1).join('/'));
        (os.homedir as jest.Mock).mockReturnValue('/mock/home');
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

            (fs.mkdirSync as jest.Mock).mockImplementation(() => {
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
            (mockStream.write as jest.Mock).mockImplementation(() => {
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
            (fs.statSync as jest.Mock).mockReturnValue({ size: 6 * 1024 * 1024 }); // 6MB
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            fileManager.writeEntry({
                timestamp: new Date(),
                level: LogLevel.INFO,
                message: 'Test rotation'
            });

            expect(fs.renameSync).toHaveBeenCalled();
            expect(fs.createWriteStream).toHaveBeenCalledTimes(2); // Initial + after rotation
        });

        test('deletes oldest file when max files reached', () => {
            (fs.statSync as jest.Mock).mockReturnValue({ size: 6 * 1024 * 1024 });
            (fs.existsSync as jest.Mock)
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

            (fs.statSync as jest.Mock).mockReturnValue({ size: 6 * 1024 * 1024 });
            (fs.renameSync as jest.Mock).mockImplementation(() => {
                throw new Error('Rotation failed');
            });

            fileManager.writeEntry({
                timestamp: new Date(),
                level: LogLevel.INFO,
                message: 'Test rotation error'
            });

            expect(errorHandler).toHaveBeenCalled();
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

            // Verify event listeners are removed
            const errorHandler = jest.fn();
            fileManager.on('error', errorHandler);
            fileManager.emit('error', new Error('test'));
            expect(errorHandler).not.toHaveBeenCalled();
        });
    });
});
