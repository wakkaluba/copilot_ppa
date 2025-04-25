import * as vscode from 'vscode';
import { ModelScalingService } from '../../src/llm/services/ModelScalingService';
import { ModelOptimizer } from '../../src/llm/services/ModelOptimizer';
import { ModelDeploymentManagerService } from '../../src/llm/services/ModelDeploymentManagerService';
import { ModelScalingMetricsService } from '../../src/llm/services/ModelScalingMetricsService';
import { ModelScalingPolicy } from '../../src/llm/services/ModelScalingPolicy';
import { ModelDeploymentService } from '../../src/llm/services/ModelDeploymentService';
import { ModelScalingDashboardService } from '../../src/llm/services/ModelScalingDashboardService';
import { ModelVersioningService } from '../../src/llm/services/ModelVersioningService';
import { ILogger } from '../../src/utils/logger';
import { ModelPerformanceMetrics } from '../../src/llm/types';

jest.mock('vscode');
jest.mock('../../src/utils/logger');
jest.mock('../../src/llm/services/ModelScalingMetricsService');
jest.mock('../../src/llm/services/ModelScalingPolicy');
jest.mock('../../src/llm/services/ModelDeploymentService');
jest.mock('../../src/llm/services/ModelScalingDashboardService');
jest.mock('../../src/llm/services/ModelVersioningService');

describe('LLM Model Integration', () => {
    let scalingService: ModelScalingService;
    let optimizerService: ModelOptimizer;
    let deploymentService: ModelDeploymentManagerService;
    let metricsService: jest.Mocked<ModelScalingMetricsService>;
    let scalingPolicy: jest.Mocked<ModelScalingPolicy>;
    let modelDeploymentService: jest.Mocked<ModelDeploymentService>;
    let dashboardService: jest.Mocked<ModelScalingDashboardService>;
    let versioningService: jest.Mocked<ModelVersioningService>;
    let mockLogger: jest.Mocked<ILogger>;

    beforeEach(() => {
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        };

        metricsService = {
            getLatestMetrics: jest.fn().mockResolvedValue(new Map()),
            on: jest.fn(),
            emit: jest.fn(),
            dispose: jest.fn(),
            removeAllListeners: jest.fn(),
        } as any;
        
        scalingPolicy = {
            evaluateScalingDecision: jest.fn().mockReturnValue({
                modelId: 'test-model',
                action: 'scale_up',
                reason: 'Test scaling',
                timestamp: Date.now()
            }),
            dispose: jest.fn(),
        } as any;
        
        modelDeploymentService = {
            getModelDeployment: jest.fn().mockResolvedValue({
                id: 'deployment-1',
                replicas: 1
            }),
            scaleModelDeployment: jest.fn().mockResolvedValue(undefined),
        } as any;
        
        dashboardService = {
            updateModelMetrics: jest.fn(),
            addScalingEvent: jest.fn(),
        } as any;
        
        versioningService = {
            verifyVersion: jest.fn().mockResolvedValue(true)
        } as any;
        
        const defaultPerformanceMetrics: ModelPerformanceMetrics = {
            averageResponseTime: 200,
            tokenThroughput: 50,
            errorRate: 0.01,
            totalRequests: 100,
            totalTokens: 5000,
            lastUsed: new Date()
        };

        optimizerService = new ModelOptimizer(mockLogger);
        
        scalingService = new ModelScalingService(
            mockLogger,
            metricsService,
            scalingPolicy,
            modelDeploymentService,
            dashboardService
        );
        
        deploymentService = new ModelDeploymentManagerService(
            mockLogger,
            versioningService,
            modelDeploymentService
        );
    });

    describe('End-to-End Workflow Tests', () => {
        test('should handle complete model lifecycle', async () => {
            // Test model deployment
            const deploymentId = await deploymentService.createDeployment({
                modelId: 'test-model',
                version: '1.0.0',
                environmentId: 'env-1',
                config: {
                    replicas: 1,
                    resources: {
                        cpu: '1',
                        memory: '2Gi'
                    }
                }
            });

            expect(deploymentId).toBeDefined();

            // Test optimization
            const defaultMetrics: ModelPerformanceMetrics = {
                averageResponseTime: 200,
                tokenThroughput: 50,
                errorRate: 0.01,
                totalRequests: 100,
                totalTokens: 5000,
                lastUsed: new Date()
            };
            
            const optimizationResult = await optimizerService.optimizeModel('test-model', defaultMetrics);

            expect(optimizationResult).toBeDefined();

            // Test scaling
            const scalingResult = await scalingService.scaleModel('test-model', 2, 'Test scaling');

            expect(scalingResult).toBeDefined();
            expect(scalingResult.targetReplicas).toBe(2);
        });
    });

    describe('System Coordination Tests', () => {
        test('should coordinate optimization and scaling', async () => {
            // Set up initial deployment
            const deploymentId = await deploymentService.createDeployment({
                modelId: 'test-model',
                version: '1.0.0',
                environmentId: 'env-1',
                config: { replicas: 1 }
            });

            const defaultMetrics: ModelPerformanceMetrics = {
                averageResponseTime: 200,
                tokenThroughput: 50,
                errorRate: 0.01,
                totalRequests: 100,
                totalTokens: 5000,
                lastUsed: new Date()
            };
            
            // Optimize and then scale based on optimization results
            const optimizationResult = await optimizerService.optimizeModel('test-model', defaultMetrics);
            expect(optimizationResult).toBeDefined();

            const recommendedReplicas = 2;
            const scalingResult = await scalingService.scaleModel('test-model', recommendedReplicas, 'Based on optimization');

            expect(scalingResult).toBeDefined();
            expect(scalingResult.targetReplicas).toBe(recommendedReplicas);
        });

        test('should handle concurrent operations', async () => {
            const deploymentId = await deploymentService.createDeployment({
                modelId: 'test-model',
                version: '1.0.0',
                environmentId: 'env-1',
                config: { replicas: 1 }
            });
            
            const defaultMetrics: ModelPerformanceMetrics = {
                averageResponseTime: 200,
                tokenThroughput: 50,
                errorRate: 0.01,
                totalRequests: 100,
                totalTokens: 5000,
                lastUsed: new Date()
            };

            // Run multiple operations concurrently
            const operations = [
                optimizerService.optimizeModel('test-model', defaultMetrics),
                scalingService.scaleModel('test-model', 2, 'Concurrent test'),
                deploymentService.updateDeployment(deploymentId, {
                    description: 'Updated deployment'
                })
            ];

            const results = await Promise.all(operations);
            expect(results.length).toBe(3);
        });
    });

    describe('Error Handling and Recovery', () => {
        test('should recover from optimization failures', async () => {
            const mockOptimizationError = new Error('Optimization failed');
            jest.spyOn(optimizerService as any, 'analyzeModel')
                .mockRejectedValueOnce(mockOptimizationError);

            const defaultMetrics: ModelPerformanceMetrics = {
                averageResponseTime: 200,
                tokenThroughput: 50,
                errorRate: 0.01,
                totalRequests: 100,
                totalTokens: 5000,
                lastUsed: new Date()
            };
            
            try {
                await optimizerService.optimizeModel('test-model', defaultMetrics);
            } catch (error) {
                expect(error).toBeDefined();
                expect(mockLogger.error).toHaveBeenCalled();
            }
        });

        test('should handle scaling failures gracefully', async () => {
            const deploymentId = await deploymentService.createDeployment({
                modelId: 'test-model',
                version: '1.0.0',
                environmentId: 'env-1',
                config: { replicas: 1 }
            });

            // Force a scaling error
            modelDeploymentService.scaleModelDeployment.mockRejectedValueOnce(new Error('Scaling failed'));

            try {
                await scalingService.scaleModel('test-model', 2, 'Test with error');
            } catch (error) {
                expect(error).toBeDefined();
                expect(mockLogger.error).toHaveBeenCalled();
            }
        });
    });

    describe('Performance and Resource Management', () => {
        test('should track resource usage across operations', async () => {
            const deployment = await deploymentService.createDeployment({
                modelId: 'test-model',
                version: '1.0.0',
                environmentId: 'env-1',
                config: {
                    replicas: 1,
                    resources: {
                        cpu: '1',
                        memory: '2Gi'
                    }
                }
            });

            // Set up mock metrics updates
            const resourceMetrics: any[] = [];
            
            // Mock metricsUpdate event
            scalingService.on('scaling.started', (data: any) => {
                resourceMetrics.push({
                    cpu: '50%',
                    memory: '1.5Gi'
                });
            });

            const defaultMetrics: ModelPerformanceMetrics = {
                averageResponseTime: 200,
                tokenThroughput: 50,
                errorRate: 0.01,
                totalRequests: 100,
                totalTokens: 5000,
                lastUsed: new Date()
            };
            
            // Run operations
            await optimizerService.optimizeModel('test-model', defaultMetrics);
            await scalingService.scaleModel('test-model', 2, 'Resource test');
            
            // Force a metrics event for testing
            scalingService.emit('scaling.started', { 
                operation: {
                    modelId: 'test-model',
                    metrics: {
                        resources: {
                            cpu: 50,
                            memory: 70
                        }
                    }
                }
            });

            expect(resourceMetrics.length).toBeGreaterThan(0);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        optimizerService.dispose();
        scalingService.dispose();
        deploymentService.dispose();
    });
});
