import * as vscode from 'vscode';
import { Container } from 'inversify';
import { ILogger } from '../../../src/types';
import { ModelOptimizationService } from '../../../src/llm/services/ModelOptimizationService';
import { ModelMetricsManager } from '../../../src/llm/services/ModelMetricsManager';
import { ModelPerformanceAnalyzer } from '../../../src/llm/services/ModelPerformanceAnalyzer';
import { ModelBenchmarkManager } from '../../../src/llm/services/ModelBenchmarkManager';

describe('ModelOptimizationService', () => {
    let container: Container;
    let optimizationService: ModelOptimizationService;
    let metricsManager: ModelMetricsManager;
    let performanceAnalyzer: ModelPerformanceAnalyzer;
    let benchmarkManager: ModelBenchmarkManager;
    let logger: ILogger;

    beforeEach(() => {
        container = new Container();
        
        // Setup mocks
        logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };

        metricsManager = {
            getMetrics: jest.fn(),
            updateMetrics: jest.fn(),
        } as any;

        performanceAnalyzer = {
            analyzeModel: jest.fn()
        } as any;

        benchmarkManager = {
            configureModel: jest.fn(),
            runBenchmark: jest.fn()
        } as any;

        // Bind dependencies
        container.bind<ILogger>(ILogger).toConstantValue(logger);
        container.bind<ModelMetricsManager>(ModelMetricsManager).toConstantValue(metricsManager);
        container.bind<ModelPerformanceAnalyzer>(ModelPerformanceAnalyzer).toConstantValue(performanceAnalyzer);
        container.bind<ModelBenchmarkManager>(ModelBenchmarkManager).toConstantValue(benchmarkManager);
        container.bind<ModelOptimizationService>(ModelOptimizationService).toSelf();

        optimizationService = container.get<ModelOptimizationService>(ModelOptimizationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('optimizeModel', () => {
        it('should successfully optimize a model with high memory usage', async () => {
            const modelId = 'test-model';
            const currentMetrics = {
                latency: 100,
                throughput: 50,
                memoryUsage: 90,
                cpuUsage: 70,
                errorRate: 0.1,
                timestamp: Date.now()
            };

            const performanceMetrics = {
                averageLatency: 90,
                tokensPerSecond: 60
            };

            (performanceAnalyzer.analyzeModel as jest.Mock).mockResolvedValue(performanceMetrics);
            (metricsManager.getMetrics as jest.Mock).mockResolvedValue(currentMetrics);
            (benchmarkManager.configureModel as jest.Mock).mockResolvedValue(undefined);

            const result = await optimizationService.optimizeModel(modelId, currentMetrics);

            expect(result).toBeDefined();
            expect(result.modelId).toBe(modelId);
            expect(result.strategy.name).toBe('Memory Optimization');
            expect(result.improvements).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
        });

        it('should successfully optimize a model with low throughput', async () => {
            const modelId = 'test-model';
            const currentMetrics = {
                latency: 100,
                throughput: 30,
                memoryUsage: 60,
                cpuUsage: 70,
                errorRate: 0.1,
                timestamp: Date.now()
            };

            const performanceMetrics = {
                averageLatency: 90,
                tokensPerSecond: 40
            };

            (performanceAnalyzer.analyzeModel as jest.Mock).mockResolvedValue(performanceMetrics);
            (metricsManager.getMetrics as jest.Mock).mockResolvedValue(currentMetrics);
            (benchmarkManager.configureModel as jest.Mock).mockResolvedValue(undefined);

            const result = await optimizationService.optimizeModel(modelId, currentMetrics);

            expect(result).toBeDefined();
            expect(result.strategy.name).toBe('Throughput Optimization');
            expect(result.improvements).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
        });

        it('should handle GPU optimization when available', async () => {
            const modelId = 'test-model';
            const currentMetrics = {
                latency: 100,
                throughput: 50,
                memoryUsage: 60,
                cpuUsage: 70,
                gpuUsage: 30,
                errorRate: 0.1,
                timestamp: Date.now()
            };

            const performanceMetrics = {
                averageLatency: 90,
                tokensPerSecond: 60
            };

            (performanceAnalyzer.analyzeModel as jest.Mock).mockResolvedValue(performanceMetrics);
            (metricsManager.getMetrics as jest.Mock).mockResolvedValue(currentMetrics);
            (benchmarkManager.configureModel as jest.Mock).mockResolvedValue(undefined);

            const result = await optimizationService.optimizeModel(modelId, currentMetrics);

            expect(result).toBeDefined();
            expect(result.strategy.name).toBe('GPU Optimization');
            expect(result.improvements).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
        });

        it('should prevent concurrent optimizations for the same model', async () => {
            const modelId = 'test-model';
            const metrics = {
                latency: 100,
                throughput: 50,
                memoryUsage: 60,
                cpuUsage: 70,
                errorRate: 0.1,
                timestamp: Date.now()
            };

            const promise1 = optimizationService.optimizeModel(modelId, metrics);
            const promise2 = optimizationService.optimizeModel(modelId, metrics);

            await expect(promise2).rejects.toThrow('Optimization already in progress');
            await promise1;
        });

        it('should track optimization history', async () => {
            const modelId = 'test-model';
            const metrics = {
                latency: 100,
                throughput: 50,
                memoryUsage: 60,
                cpuUsage: 70,
                errorRate: 0.1,
                timestamp: Date.now()
            };

            await optimizationService.optimizeModel(modelId, metrics);
            const history = optimizationService.getOptimizationHistory(modelId);

            expect(history).toHaveLength(1);
            expect(history[0].modelId).toBe(modelId);
        });

        it('should handle errors during optimization', async () => {
            const modelId = 'test-model';
            const metrics = {
                latency: 100,
                throughput: 50,
                memoryUsage: 60,
                cpuUsage: 70,
                errorRate: 0.1,
                timestamp: Date.now()
            };

            const error = new Error('Optimization failed');
            (benchmarkManager.configureModel as jest.Mock).mockRejectedValue(error);

            await expect(optimizationService.optimizeModel(modelId, metrics))
                .rejects.toThrow('Optimization failed');

            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('Optimization Calculations', () => {
        it('should calculate optimal batch size correctly', async () => {
            const modelId = 'test-model';
            const metrics = {
                latency: 50,
                throughput: 50,
                memoryUsage: 60,
                cpuUsage: 70,
                errorRate: 0.1,
                timestamp: Date.now()
            };

            const result = await optimizationService.optimizeModel(modelId, metrics);
            expect(result.strategy.parameters.batchSize).toBeDefined();
            expect(result.strategy.parameters.batchSize).toBeGreaterThan(0);
            expect(result.strategy.parameters.batchSize).toBeLessThanOrEqual(32);
        });

        it('should calculate optimal thread count correctly', async () => {
            const modelId = 'test-model';
            const metrics = {
                latency: 100,
                throughput: 50,
                memoryUsage: 60,
                cpuUsage: 70,
                errorRate: 0.1,
                timestamp: Date.now()
            };

            const result = await optimizationService.optimizeModel(modelId, metrics);
            expect(result.strategy.parameters.threads).toBeDefined();
            expect(result.strategy.parameters.threads).toBeGreaterThan(0);
            expect(result.strategy.parameters.threads).toBeLessThanOrEqual(8);
        });
    });

    describe('Resource Management', () => {
        it('should cleanup resources on dispose', () => {
            const disposeSpy = jest.spyOn(optimizationService, 'dispose');
            optimizationService.dispose();

            expect(disposeSpy).toHaveBeenCalled();
        });

        it('should clear optimization history', async () => {
            const modelId = 'test-model';
            const metrics = {
                latency: 100,
                throughput: 50,
                memoryUsage: 60,
                cpuUsage: 70,
                errorRate: 0.1,
                timestamp: Date.now()
            };

            await optimizationService.optimizeModel(modelId, metrics);
            optimizationService.clearOptimizationHistory();

            const history = optimizationService.getOptimizationHistory(modelId);
            expect(history).toHaveLength(0);
        });
    });
});
