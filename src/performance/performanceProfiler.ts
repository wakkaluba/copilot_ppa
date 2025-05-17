export class PerformanceProfiler {
  static getInstance(_: any) {
    return new PerformanceProfiler();
  }
  setEnabled(_: boolean) {}
  startOperation(_: string) {}
  endOperation(_: string) {}
  getStats(_: string) {
    return { length: 0, metadata: {} };
  }
}
