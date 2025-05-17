import { injectable } from 'inversify';

@injectable()
export class ModelMetricsService {
  async getMetrics(modelId: string): Promise<any> {
    // Dummy implementation for coverage
    return { accuracy: 0.95, loss: 0.05 };
  }
}
