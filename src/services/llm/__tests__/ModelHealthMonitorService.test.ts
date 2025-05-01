import { HealthCheckResult } from '../interfaces';
import { ModelHealthMonitorService } from '../services/ModelHealthMonitorService';
import { LLMProvider } from '../types';

describe('ModelHealthMonitorService', () => {
    let monitor: ModelHealthMonitorService;
    let mockProvider: jest.Mocked<LLMProvider>;

    beforeEach(() => {
        mockProvider = {
            getName: jest.fn().mockReturnValue('test-provider'),
            isAvailable: jest.fn().mockResolvedValue(true),
            getConfig: jest.fn().mockReturnValue({
                name: 'test-provider',
                healthCheck: { interval: 1000 }
            })
        } as unknown as jest.Mocked<LLMProvider>;

        monitor = new ModelHealthMonitorService();

        // Clear all intervals after each test
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('monitoring lifecycle', () => {
        it('should start monitoring model health', () => {
            const modelId = 'test-model';
            monitor.startMonitoring(modelId, mockProvider);

            // @ts-ignore - accessing private field for testing
            expect(monitor['monitors'].has(modelId)).toBe(true);
        });

        it('should stop monitoring model health', () => {
            const modelId = 'test-model';
            monitor.startMonitoring(modelId, mockProvider);
            monitor.stopMonitoring(modelId);

            // @ts-ignore - accessing private field for testing
            expect(monitor['monitors'].has(modelId)).toBe(false);
        });

        it('should not start duplicate monitors', () => {
            const modelId = 'test-model';
            monitor.startMonitoring(modelId, mockProvider);
            monitor.startMonitoring(modelId, mockProvider);

            // @ts-ignore - accessing private field for testing
            expect(monitor['monitors'].size).toBe(1);
        });
    });

    describe('health checks', () => {
        it('should perform periodic health checks', async () => {
            const modelId = 'test-model';
            monitor.startMonitoring(modelId, mockProvider);

            // Fast forward time to trigger health check
            jest.advanceTimersByTime(1000);
            await Promise.resolve(); // Let promises resolve

            expect(mockProvider.isAvailable).toHaveBeenCalled();
        });

        it('should emit healthy event on successful check', async () => {
            const modelId = 'test-model';
            const healthyListener = jest.fn();
            monitor.on('modelHealthy', healthyListener);

            monitor.startMonitoring(modelId, mockProvider);
            jest.advanceTimersByTime(1000);
            await Promise.resolve();

            expect(healthyListener).toHaveBeenCalledWith(modelId, expect.any(HealthCheckResult));
        });

        it('should emit unhealthy event on failed check', async () => {
            const modelId = 'test-model';
            mockProvider.isAvailable.mockRejectedValue(new Error('Health check failed'));

            const unhealthyListener = jest.fn();
            monitor.on('modelUnhealthy', unhealthyListener);

            monitor.startMonitoring(modelId, mockProvider);
            jest.advanceTimersByTime(1000);
            await Promise.resolve();

            expect(unhealthyListener).toHaveBeenCalledWith(
                modelId,
                expect.any(Error)
            );
        });

        it('should track health check metrics', async () => {
            const modelId = 'test-model';
            monitor.startMonitoring(modelId, mockProvider);

            // Simulate multiple health checks
            for (let i = 0; i < 3; i++) {
                jest.advanceTimersByTime(1000);
                await Promise.resolve();
            }

            const metrics = monitor.getMetrics(modelId);
            expect(metrics).toEqual(expect.objectContaining({
                checksPerformed: 3,
                successfulChecks: 3,
                failedChecks: 0,
                averageLatency: expect.any(Number),
                lastCheckTimestamp: expect.any(Date)
            }));
        });

        it('should handle varying health check latencies', async () => {
            const modelId = 'test-model';
            let checkCount = 0;
            mockProvider.isAvailable.mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, checkCount++ * 100));
                return true;
            });

            monitor.startMonitoring(modelId, mockProvider);

            // Simulate checks with different latencies
            for (let i = 0; i < 3; i++) {
                jest.advanceTimersByTime(1000);
                await Promise.resolve();
            }

            const metrics = monitor.getMetrics(modelId);
            expect(metrics.averageLatency).toBeGreaterThan(0);
        });
    });

    describe('error handling', () => {
        it('should handle provider errors gracefully', async () => {
            const modelId = 'test-model';
            const error = new Error('Provider error');
            mockProvider.isAvailable.mockRejectedValue(error);

            const errorListener = jest.fn();
            monitor.on('error', errorListener);

            monitor.startMonitoring(modelId, mockProvider);
            jest.advanceTimersByTime(1000);
            await Promise.resolve();

            expect(errorListener).toHaveBeenCalledWith(modelId, error);
        });

        it('should continue monitoring after errors', async () => {
            const modelId = 'test-model';
            mockProvider.isAvailable
                .mockRejectedValueOnce(new Error('Temporary error'))
                .mockResolvedValue(true);

            monitor.startMonitoring(modelId, mockProvider);

            // First check fails
            jest.advanceTimersByTime(1000);
            await Promise.resolve();

            // Second check succeeds
            jest.advanceTimersByTime(1000);
            await Promise.resolve();

            const metrics = monitor.getMetrics(modelId);
            expect(metrics.successfulChecks).toBe(1);
            expect(metrics.failedChecks).toBe(1);
        });
    });

    describe('cleanup', () => {
        it('should clean up all monitors on dispose', () => {
            const modelId1 = 'test-model-1';
            const modelId2 = 'test-model-2';

            monitor.startMonitoring(modelId1, mockProvider);
            monitor.startMonitoring(modelId2, mockProvider);

            monitor.dispose();

            // @ts-ignore - accessing private field for testing
            expect(monitor['monitors'].size).toBe(0);
        });

        it('should stop health checks when disposed', async () => {
            const modelId = 'test-model';
            monitor.startMonitoring(modelId, mockProvider);
            monitor.dispose();

            jest.advanceTimersByTime(2000);
            await Promise.resolve();

            // No more health checks should occur after dispose
            expect(mockProvider.isAvailable).not.toHaveBeenCalled();
        });

        it('should remove all event listeners on dispose', () => {
            const listener = jest.fn();
            monitor.on('modelHealthy', listener);
            monitor.on('modelUnhealthy', listener);
            monitor.on('error', listener);

            monitor.dispose();

            // @ts-ignore - accessing EventEmitter internals for testing
            expect(monitor.listenerCount('modelHealthy')).toBe(0);
            expect(monitor.listenerCount('modelUnhealthy')).toBe(0);
            expect(monitor.listenerCount('error')).toBe(0);
        });
    });
});
