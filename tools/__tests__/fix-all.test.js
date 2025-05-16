// Jest test scaffold for tools/fix-all.js
const runFixAll = require('../fix-all');
const child_process = require('child_process');

describe('fix-all utility', () => {
  let execSyncSpy;
  let logSpy;
  let errorSpy;
  let exitSpy;

  beforeEach(() => {
    execSyncSpy = jest.spyOn(child_process, 'execSync').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should run all fix scripts in the correct order', () => {
    runFixAll();
    expect(execSyncSpy).toHaveBeenCalledTimes(5);
    expect(execSyncSpy).toHaveBeenNthCalledWith(1, 'node tools/fix-casing.js', { stdio: 'inherit' });
    expect(execSyncSpy).toHaveBeenNthCalledWith(2, 'node tools/fix-imports.js', { stdio: 'inherit' });
    expect(execSyncSpy).toHaveBeenNthCalledWith(3, 'node tools/fix-timestamp-errors.js', { stdio: 'inherit' });
    expect(execSyncSpy).toHaveBeenNthCalledWith(4, 'node tools/fix-uri-errors.js', { stdio: 'inherit' });
    expect(execSyncSpy).toHaveBeenNthCalledWith(5, 'node tools/fix-type-errors.js', { stdio: 'inherit' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Starting comprehensive fix script'));
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('should handle errors and exit process', () => {
    execSyncSpy.mockImplementationOnce(() => { throw new Error('fail!'); });
    runFixAll();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Fix process failed: fail!'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
