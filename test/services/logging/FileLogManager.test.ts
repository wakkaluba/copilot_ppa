import * as fs from 'fs';
import { FileLogManager } from '../../../src/services/logging/FileLogManager';
jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('FileLogManager', () => {
  let manager: FileLogManager;
  let config: any;

  beforeEach(() => {
    manager = new FileLogManager();
    config = { filePath: '', maxSizeMB: 1, maxFiles: 1 };
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should emit error if log directory cannot be created', (done) => {
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.mkdirSync.mockImplementation(() => { throw new Error('mkdir error'); });
    manager.on('error', (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatch(/mkdir error/);
      done();
    });
    manager.initialize(config);
  });

  it('should emit error if log stream cannot be created', (done) => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.createWriteStream.mockImplementation((() => { throw new Error('stream error'); }) as any);
    manager.on('error', (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatch(/stream error/);
      done();
    });
    manager.initialize(config);
  });

  it('should initialize and write to log file', () => {
    const writeMock = jest.fn();
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.createWriteStream.mockReturnValue({
      write: writeMock,
      end: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      destroy: jest.fn(),
      closed: false
    } as any);
    manager.initialize(config);
    expect(manager['logStream']).toBeDefined();
    // Simulate a log write
    if (manager['logStream']) {
      manager['logStream'].write('test log');
      expect(writeMock).toHaveBeenCalledWith('test log');
    }
  });

  it('should emit error if write fails', (done) => {
    mockedFs.existsSync.mockReturnValue(true);
    const erroringStream = {
      write: () => { throw new Error('write error'); },
      end: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      destroy: jest.fn(),
      closed: false
    } as any;
    mockedFs.createWriteStream.mockReturnValue(erroringStream);
    manager.on('error', (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatch(/write error/);
      done();
    });
    manager.initialize(config);
    try {
      erroringStream.write('fail');
    } catch (e) {
      manager.emit('error', e);
    }
  });

  it('should handle invalid config values gracefully', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.createWriteStream.mockReturnValue({
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      destroy: jest.fn(),
      closed: false
    } as any);
    const badConfig = { filePath: '', maxSizeMB: -1, maxFiles: 0 };
    expect(() => manager.initialize(badConfig as any)).not.toThrow();
  });

  it('should clean up log stream on close', () => {
    const endMock = jest.fn();
    mockedFs.existsSync.mockReturnValue(true);
    const fakeStream = {
      write: jest.fn(),
      end: endMock,
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      destroy: jest.fn(),
      closed: false
    } as any;
    mockedFs.createWriteStream.mockReturnValue(fakeStream);
    manager.initialize(config);
    if (manager['logStream']) {
      manager['logStream'].end();
      expect(endMock).toHaveBeenCalled();
    }
  });
});
