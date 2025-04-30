import * as cp from 'child_process';
import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { CommandExecutorService } from '../services/testRunner/services/CommandExecutorService';

jest.mock('child_process');

describe('CommandExecutorService', () => {
  let service: CommandExecutorService;
  let mockOutputChannel: vscode.OutputChannel;
  let mockChildProcess: EventEmitter;

  beforeEach(() => {
    mockOutputChannel = {
      appendLine: jest.fn(),
      append: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn(),
      clear: jest.fn(),
      hide: jest.fn(),
      name: 'Test Output'
    };

    mockChildProcess = new EventEmitter();
    mockChildProcess.stdout = new EventEmitter();
    mockChildProcess.stderr = new EventEmitter();
    (cp.spawn as jest.Mock).mockReturnValue(mockChildProcess);

    service = new CommandExecutorService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should execute command successfully', async () => {
      const commandPromise = service.execute('test command', '/test/path', mockOutputChannel);

      mockChildProcess.emit('spawn');
      mockChildProcess.stdout.emit('data', Buffer.from('test output'));
      mockChildProcess.stderr.emit('data', Buffer.from('test error'));
      mockChildProcess.emit('close', 0);

      const result = await commandPromise;
      expect(result.success).toBe(true);
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('test output'));
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('test error'));
    });

    it('should handle command failure', async () => {
      const commandPromise = service.execute('failing command', '/test/path', mockOutputChannel);

      mockChildProcess.emit('spawn');
      mockChildProcess.stderr.emit('data', Buffer.from('command failed'));
      mockChildProcess.emit('close', 1);

      const result = await commandPromise;
      expect(result.success).toBe(false);
      expect(result.message).toContain('failed');
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('command failed'));
    });

    it('should handle spawn errors', async () => {
      (cp.spawn as jest.Mock).mockImplementation(() => {
        throw new Error('spawn error');
      });

      const result = await service.execute('invalid command', '/test/path', mockOutputChannel);
      expect(result.success).toBe(false);
      expect(result.message).toContain('spawn error');
    });

    it('should handle empty command', async () => {
      const result = await service.execute('', '/test/path', mockOutputChannel);
      expect(result.success).toBe(false);
      expect(result.message).toContain('empty');
    });

    it('should handle process termination', async () => {
      const commandPromise = service.execute('terminating command', '/test/path', mockOutputChannel);

      mockChildProcess.emit('spawn');
      mockChildProcess.emit('error', new Error('process terminated'));

      const result = await commandPromise;
      expect(result.success).toBe(false);
      expect(result.message).toContain('terminated');
    });

    it('should capture all output types', async () => {
      const commandPromise = service.execute('verbose command', '/test/path', mockOutputChannel);

      mockChildProcess.emit('spawn');
      mockChildProcess.stdout.emit('data', Buffer.from('info message\n'));
      mockChildProcess.stderr.emit('data', Buffer.from('warning message\n'));
      mockChildProcess.stdout.emit('data', Buffer.from('success message\n'));
      mockChildProcess.emit('close', 0);

      const result = await commandPromise;
      expect(result.success).toBe(true);
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('info message'));
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('warning message'));
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('success message'));
    });
  });
});
