import * as vscode from 'vscode';
import { ModelScalingService } from '../../../src/llm/services/ModelScalingService';
import { ModelScalingMetricsService } from '../../../src/llm/services/ModelScalingMetricsService';
import { ModelScalingDashboardService } from '../../../src/llm/services/ModelScalingDashboardService';
import { ILogger } from '../../../src/utils/logger';

jest.mock('vscode');
jest.mock('../../../src/utils/logger');

describe('Model Scaling System', () => {
    let scalingService: ModelScalingService;
    let metricsService: ModelScalingMetricsService;
    let dashboardService: ModelScalingDashboardService;
    let mockLogger: jest.Mocked<ILogger>;

    beforeEach(() => {
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn()
        };

        metricsService = new ModelScalingMetricsService(mockLogger);
        scalingService = new ModelScalingService(mockLogger, metricsService);
        dashboardService = new ModelScalingDashboardService(mockLogger, metricsService);
    });

    describe('Scaling Strategy Tests', () => {
        test('should scale up when load exceeds threshold', async () => {
            // Setup high load scenario
            await metricsService.updateMetrics('test-model', {
                performance: {
                    responseTime: 500,
                    throughput: 50,
                    errorRate: 0.01
                },
                resources: {
                    cpu: 85,
                    memory: 90,
                    gpu: 95
                },
                scaling: {
                    currentNodes: 2,
                    activeConnections: 95,
                    queueLength: 50
                },
                availability: {
                    successRate: 0.98,
                    uptime: 3600000,
                    degradedPeriods: 1
                },
                timestamp: Date.now()
            });

            const result = await scalingService.evaluateScaling('test-model');
            expect(result.action).toBe('scale_up');
            expect(result.reason).toContain('high load');
            expect(result.recommendation.nodes).toBeGreaterThan(2);
        });

        test('should scale down during low utilization', async () => {
            // Setup low utilization scenario
            await metricsService.updateMetrics('test-model', {
                performance: {
                    responseTime: 100,
                    throughput: 10,
                    errorRate: 0
                },
                resources: {
                    cpu: 20,
                    memory: 30,
                    gpu: 25
                },
                scaling: {
                    currentNodes: 4,
                    activeConnections: 15,
                    queueLength: 0
                },
                availability: {
                    successRate: 1.0,
                    uptime: 3600000,
                    degradedPeriods: 0
                },
                timestamp: Date.now()
            });

            const result = await scalingService.evaluateScaling('test-model');
            expect(result.action).toBe('scale_down');
            expect(result.reason).toContain('low utilization');
            expect(result.recommendation.nodes).toBeLessThan(4);
        });
    });

    describe('Metrics Collection Tests', () => {
        test('should track performance metrics over time', async () => {
            const modelId = 'test-model';
            const metrics = {
                performance: {
                    responseTime: 200,
                    throughput: 30,
                    errorRate: 0.005
                },
                resources: {
                    cpu: 60,
                    memory: 70,
                    gpu: 65
                },
                scaling: {
                    currentNodes: 3,
                    activeConnections: 45,
                    queueLength: 10
                },
                availability: {
                    successRate: 0.995,
                    uptime: 7200000,
                    degradedPeriods: 0
                },
                timestamp: Date.now()
            };

            await metricsService.updateMetrics(modelId, metrics);
            const history = await metricsService.getMetricsHistory(modelId);

            expect(history).toHaveLength(1);
            expect(history[0]).toMatchObject(metrics);
        });

        test('should detect performance degradation', async () => {
            const modelId = 'test-model';
            
            // Initial good performance
            await metricsService.updateMetrics(modelId, {
                performance: { responseTime: 100, throughput: 40, errorRate: 0.001 },
                resources: { cpu: 50, memory: 60, gpu: 55 },
                scaling: { currentNodes: 2, activeConnections: 30, queueLength: 5 },
                availability: { successRate: 0.999, uptime: 3600000, degradedPeriods: 0 },
                timestamp: Date.now() - 5000
            });

            // Degraded performance
            await metricsService.updateMetrics(modelId, {
                performance: { responseTime: 400, throughput: 20, errorRate: 0.02 },
                resources: { cpu: 90, memory: 85, gpu: 95 },
                scaling: { currentNodes: 2, activeConnections: 80, queueLength: 40 },
                availability: { successRate: 0.95, uptime: 3605000, degradedPeriods: 1 },
                timestamp: Date.now()
            });

            const analysis = await metricsService.analyzePerformanceTrend(modelId);
            expect(analysis.degrading).toBe(true);
            expect(analysis.recommendations).toContain('Consider scaling up');
        });
    });

    describe('Dashboard Integration Tests', () => {
        test('should update dashboard with new metrics', async () => {
            const modelId = 'test-model';
            const showSpy = jest.spyOn(dashboardService, 'showDashboard');

            await dashboardService.showDashboard(modelId);
            expect(showSpy).toHaveBeenCalledWith(modelId);

            // Verify that the dashboard is updated when new metrics arrive
            const newMetrics = {
                performance: { responseTime: 150, throughput: 35, errorRate: 0.003 },
                resources: { cpu: 55, memory: 65, gpu: 60 },
                scaling: { currentNodes: 3, activeConnections: 40, queueLength: 8 },
                availability: { successRate: 0.997, uptime: 3600000, degradedPeriods: 0 },
                timestamp: Date.now()
            };

            await metricsService.updateMetrics(modelId, newMetrics);
            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Dashboard updated'),
                expect.any(Object)
            );
        });
    });

    describe('Error Handling Tests', () => {
        test('should handle metric collection errors gracefully', async () => {
            const modelId = 'error-test-model';
            
            // Simulate a metric collection error
            jest.spyOn(metricsService as any, 'collectMetrics')
                .mockRejectedValueOnce(new Error('Metric collection failed'));

            await metricsService.updateMetrics(modelId, {
                performance: { responseTime: 100, throughput: 30, errorRate: 0.001 },
                resources: { cpu: 50, memory: 60, gpu: 55 },
                scaling: { currentNodes: 2, activeConnections: 30, queueLength: 5 },
                availability: { successRate: 0.999, uptime: 3600000, degradedPeriods: 0 },
                timestamp: Date.now()
            });

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Failed to collect metrics'),
                expect.any(Object)
            );
        });

        test('should handle scaling operation failures', async () => {
            const modelId = 'error-test-model';
            
            // Simulate a scaling operation error
            jest.spyOn(scalingService as any, 'executeScaling')
                .mockRejectedValueOnce(new Error('Scaling operation failed'));

            const result = await scalingService.scaleModel(modelId, { targetNodes: 4 });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Scaling operation failed');
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        dashboardService.dispose();
    });
});
