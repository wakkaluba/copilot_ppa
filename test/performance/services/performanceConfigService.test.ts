import { PerformanceConfigService } from '../../../src/performance/services/performanceConfigService';

describe('PerformanceConfigService', () => {
  let configService: PerformanceConfigService;

  beforeEach(() => {
    configService = new PerformanceConfigService();
  });

  describe('initialize', () => {
    it('should resolve without error', async () => {
      await expect(configService.initialize()).resolves.toBeUndefined();
    });
  });

  describe('isProfilingEnabled', () => {
    it('should return false by default', () => {
      expect(configService.isProfilingEnabled()).toBe(false);
    });
  });

  describe('isBottleneckDetectionEnabled', () => {
    it('should return false by default', () => {
      expect(configService.isBottleneckDetectionEnabled()).toBe(false);
    });
  });

  describe('getCachingOptions', () => {
    it('should return default caching options', () => {
      expect(configService.getCachingOptions()).toEqual({ maxSize: 100 });
    });
  });

  describe('getAsyncOptions', () => {
    it('should return default async options', () => {
      expect(configService.getAsyncOptions()).toEqual({});
    });
  });
});
