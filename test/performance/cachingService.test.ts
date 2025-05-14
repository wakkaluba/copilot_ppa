import { CachingService } from '../../src/performance/cachingService';

describe('CachingService', () => {
  let service: CachingService;
  beforeEach(() => {
    service = CachingService.getInstance();
  });

  it('should return cache stats', () => {
    expect(service.getCacheStats()).toEqual({ hits: 0, misses: 0, evictions: 0 });
  });

  it('should allow setting max cache size', () => {
    expect(() => service.setMaxCacheSize(50)).not.toThrow();
  });

  it('should dispose without error', () => {
    expect(() => service.dispose()).not.toThrow();
  });
});
