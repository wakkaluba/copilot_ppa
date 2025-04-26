import * as vscode from 'vscode';
import * as assert from 'assert';
import { FilePreferences } from '../../../../src/services/conversation/FilePreferences';
import { createMockExtensionContext } from '../../../helpers/mockHelpers';

describe('FilePreferences', () => {
  let preferences: FilePreferences;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    mockContext = createMockExtensionContext();
    
    // Mock global state methods
    jest.spyOn(mockContext.globalState, 'get').mockImplementation((_key: string) => undefined);
    jest.spyOn(mockContext.globalState, 'update').mockImplementation((_key: string, _value: any) => Promise.resolve());
    
    preferences = new FilePreferences(mockContext);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should track file extensions properly', async () => {
    await preferences.trackFileExtension('.ts');
    
    const extensions = preferences.getRecentExtensions();
    expect(extensions.length).toBe(1);
    
    // Use safe property access to avoid undefined errors
    if (extensions.length > 0) {
      expect(extensions[0].extension).toBe('.ts');
      expect(extensions[0].count).toBe(1);
    }
  });
});