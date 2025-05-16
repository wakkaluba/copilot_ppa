import { LoggerService } from '../../../../src/services/vectordb/LoggerService';
import { VectorDatabaseManager } from '../../../../src/services/vectordb/manager';

describe('VectorDatabaseManager', () => {
  let manager: VectorDatabaseManager;
  let mockLogger: LoggerService;
  let mockProvider1: any;
  let mockProvider2: any;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as LoggerService;

    mockProvider1 = { constructor: { name: 'Provider1' } };
    mockProvider2 = { constructor: { name: 'Provider2' } };

    manager = new VectorDatabaseManager(mockLogger);
  });

  describe('Provider Management', () => {
    test('should register providers', () => {
      manager.registerProvider(mockProvider1);
      manager.registerProvider(mockProvider2);
      const providers = manager.getProviders();
      expect(providers).toContain(mockProvider1);
      expect(providers).toContain(mockProvider2);
    });

    test('should get provider by name', () => {
      manager.registerProvider(mockProvider1);
      manager.registerProvider(mockProvider2);
      expect(manager.getProvider('Provider1')).toBe(mockProvider1);
      expect(manager.getProvider('Provider2')).toBe(mockProvider2);
      expect(manager.getProvider('Nonexistent')).toBeUndefined();
    });
  });

  describe('Active Provider', () => {
    test('should set and get active provider', () => {
      manager.registerProvider(mockProvider1);
      manager.setActiveProvider('Provider1');
      expect(manager.getActiveProvider()).toBe(mockProvider1);
      expect(manager.isProviderEnabled()).toBe(true);
    });

    test('should not set active provider if not found', () => {
      manager.setActiveProvider('Nonexistent');
      expect(manager.getActiveProvider()).toBeNull();
      expect(manager.isProviderEnabled()).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Provider Nonexistent not found.'));
    });
  });

  describe('isProviderEnabled', () => {
    test('should reflect enabled state after setting active provider', () => {
      expect(manager.isProviderEnabled()).toBe(false);
      manager.registerProvider(mockProvider1);
      manager.setActiveProvider('Provider1');
      expect(manager.isProviderEnabled()).toBe(true);
    });
  });
});
