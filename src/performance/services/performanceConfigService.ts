export class PerformanceConfigService {
  async initialize() {}
  isProfilingEnabled() {
    return false;
  }
  isBottleneckDetectionEnabled() {
    return false;
  }
  getCachingOptions() {
    return { maxSize: 100 };
  }
  getAsyncOptions() {
    return {};
  }
}
