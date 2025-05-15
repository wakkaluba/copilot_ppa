export class AsyncOptimizer {
  static getInstance() { return new AsyncOptimizer(); }
  setConfig(_: any) {}
  getStats() { return { optimizedCount: 0 }; }
  dispose() {}
}
