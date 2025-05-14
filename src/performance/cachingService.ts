export class CachingService {
  static getInstance() { return new CachingService(); }
  setMaxCacheSize(_: number) {}
  getCacheStats() { return { hits: 0, misses: 0, evictions: 0 }; }
  dispose() {}
}
