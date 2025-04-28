import * as vscode from 'vscode';
import { FilePreferencesService } from '../../../../src/services/conversation/services/FilePreferencesService';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

// Mock the VS Code API
jest.mock('vscode', () => ({
  ExtensionContext: jest.fn().mockImplementation(() => ({
    globalState: {
      get: jest.fn().mockReturnValue(null),
      update: jest.fn().mockResolvedValue(undefined)
    }
  }))
}));

describe('FilePreferences', () => {
  let preferences: FilePreferencesService;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    mockContext = {
      globalState: {
        get: jest.fn().mockReturnValue(null),
        update: jest.fn().mockResolvedValue(undefined)
      }
    } as unknown as vscode.ExtensionContext;

    preferences = new FilePreferencesService(mockContext);
    // Initialize the service
    return preferences.initialize();
  });

  test('should track file extensions properly', async () => {
    // Track file extensions
    preferences.trackFileExtension('js');
    preferences.trackFileExtension('js');
    preferences.trackFileExtension('ts');
    
    // Check most frequent extensions
    const frequent = preferences.getMostFrequentExtensions();
    expect(frequent).toContain('.js');
    expect(frequent).toContain('.ts');
    expect(frequent.indexOf('.js')).toBeLessThan(frequent.indexOf('.ts'));
    
    // Check if extension is preferred
    expect(preferences.isPreferredExtension('js')).toBe(true);
    expect(preferences.isPreferredExtension('unknown')).toBe(false);
    
    // Check storage update was called
    expect(mockContext.globalState.update).toHaveBeenCalled();
  });

  test('should handle extension prefixes properly', async () => {
    preferences.trackFileExtension('.html');
    preferences.trackFileExtension('css');
    
    expect(preferences.isPreferredExtension('.html')).toBe(true);
    expect(preferences.isPreferredExtension('html')).toBe(true);
    expect(preferences.isPreferredExtension('.css')).toBe(true);
    expect(preferences.isPreferredExtension('css')).toBe(true);
  });

  test('should clear preferences', async () => {
    preferences.trackFileExtension('js');
    await preferences.clearPreferences();
    
    expect(preferences.isPreferredExtension('js')).toBe(false);
    expect(mockContext.globalState.update).toHaveBeenCalledWith(
      'filePreferences',
      '{}'
    );
  });

  test('should load preferences from storage', async () => {
    const storedPrefs = JSON.stringify({
      '.js': 5,
      '.ts': 3
    });
    
    mockContext.globalState.get = jest.fn().mockReturnValue(storedPrefs);
    
    // Create new instance that loads from storage
    const newPreferences = new FilePreferencesService(mockContext);
    await newPreferences.initialize();
    
    expect(newPreferences.isPreferredExtension('js')).toBe(true);
    expect(newPreferences.isPreferredExtension('ts')).toBe(true);
    
    const frequent = newPreferences.getMostFrequentExtensions();
    expect(frequent[0]).toBe('.js');
    expect(frequent[1]).toBe('.ts');
  });
});