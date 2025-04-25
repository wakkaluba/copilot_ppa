import { ModelScalingService } from '../../../src/llm/services/ModelScalingService';
import { ModelScalingMetricsService, ScalingMetrics } from '../../../src/llm/services/ModelScalingMetricsService';
import { ModelScalingDashboardService } from '../../../src/llm/services/ModelScalingDashboardService';
import { ILogger } from '../../../src/utils/logger';
import { ModelScalingPolicy, ScalingDecision, ScalingRule } from '../../../src/llm/services/ModelScalingPolicy';
import { ModelDeploymentService } from '../../../src/llm/services/ModelDeploymentService';
import { ModelMetricsService } from '../../../src/llm/services/ModelMetricsService';
import { ModelHealthMonitorV2 } from '../../../src/llm/services/ModelHealthMonitorV2';

jest.mock('vscode');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/llm/services/ModelMetricsService');
jest.mock('../../../src/llm/services/ModelHealthMonitorV2');
jest.mock('../../../src/llm/services/ModelScalingPolicy');
jest.mock('../../../src/llm/services/ModelDeploymentService');

describe('Model Scaling System', () => {
    let scalingService: ModelScalingService;
    let metricsService: ModelScalingMetricsService;
    let mockLogger: jest.Mocked<ILogger>;
    let mockScalingPolicy: jest.Mocked<ModelScalingPolicy>;
    let mockDeploymentService: jest.Mocked<ModelDeploymentService>;

    beforeEach(() => {
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        } as jest.Mocked<ILogger>;

        mockScalingPolicy = {
            evaluateScalingDecision: jest.fn().mockResolvedValue({
                action: 'no_action',
                reason: 'Current capacity is sufficient',
                modelId: 'test-model',
                timestamp: Date.now(),
                metrics: {} as ScalingMetrics,
                rule: undefined,
                replicas: undefined,
                resources: undefined
            }),
            on: jest.fn(),
            removeAllListeners: jest.fn(),
            getScalingRules: jest.fn(),
            setScalingRules: jest.fn(),
            getRecentDecisions: jest.fn(),
            dispose: jest.fn()
        } as unknown as jest.Mocked<ModelScalingPolicy>;

        mockDeploymentService = {
            listDeployments: jest.fn().mockResolvedValue([
                { id: 'deployment-1', modelId: 'test-model', config: { replicas: 3 } }
            ]),
            updateDeployment: jest.fn().mockResolvedValue(undefined),
            getDeployment: jest.fn().mockResolvedValue({ 
                id: 'deployment-1', 
                modelId: 'test-model', 
                config: { replicas: 3 } 
            }),
            createDeployment: jest.fn(),
            deleteDeployment: jest.fn(),
            scaleDeployment: jest.fn().mockResolvedValue(undefined)
        } as unknown as jest.Mocked<ModelDeploymentService>;
        
        // Add missing scaleModelDeployment method to the mock
        mockDeploymentService.scaleModelDeployment = jest.fn().mockResolvedValue(undefined);

        metricsService = new ModelScalingMetricsService(
            mockLogger
        );

        const dashboardService = new ModelScalingDashboardService(
            mockLogger, 
            metricsService
        );

        scalingService = new ModelScalingService(
            mockLogger,
            metricsService as unknown as ModelScalingMetricsService,
            mockScalingPolicy,
            mockDeploymentService,
            dashboardService
        );
    });

    describe('Scaling Strategy Tests', () => {
        test('should scale up when load exceeds threshold', async () => {
            // Setup high load scenario
            await metricsService.updateMetrics('test-model', {
                timestamp: Date.now(),
                performance: {
                    responseTime: 500,
                    throughput: 50,
                    errorRate: 0.01,
                    requestRate: 100
                },
                resources: {
                    cpu: 85,
                    memory: 90,
                    gpu: 95,
                    networkIO: 70
                },
                scaling: {
                    currentNodes: 3,
                    activeConnections: 80,
                    queueLength: 40
                },
                availability: {
                    uptime: 7200000,
                    successRate: 0.99,
                    degradedPeriods: 0
                }
            });

            // Configure mock for scale up scenario
            const mockScalingDecision: ScalingDecision = {
                action: 'scale_up',
                reason: 'High CPU and memory utilization',
                modelId: 'test-model',
                timestamp: Date.now(),
                metrics: {} as ScalingMetrics,
                rule: undefined,
                replicas: 1,
                resources: undefined
            };
            
            mockScalingPolicy.evaluateScalingDecision.mockResolvedValue(mockScalingDecision);

            const result = await scalingService.scaleModel('test-model', 4, 'Test scaling up');
            
            expect(result.action).toBe('scale_up');
            expect(result.targetReplicas).toBe(4);
            expect(mockDeploymentService.scaleModelDeployment).toHaveBeenCalledWith('test-model', 4);
        });

        test('should scale down when load is low', async () => {
            // Setup low load scenario
            await metricsService.updateMetrics('test-model', {
                timestamp: Date.now(),
                performance: {
                    responseTime: 100,
                    throughput: 20,
                    errorRate: 0.001,
                    requestRate: 10
                },
                resources: {
                    cpu: 15,
                    memory: 20,
                    gpu: 10,
                    networkIO: 5
                },
                scaling: {
                    currentNodes: 3,
                    activeConnections: 5,
                    queueLength: 0
                },
                availability: {
                    uptime: 7200000,
                    successRate: 1.0,
                    degradedPeriods: 0
                }
            });

            // Configure mock for scale down scenario
            const mockScalingDecision: ScalingDecision = {
                action: 'scale_down',
                reason: 'Low resource utilization',
                modelId: 'test-model',
                timestamp: Date.now(),
                metrics: {} as ScalingMetrics,
                rule: undefined,
                replicas: 1,
                resources: undefined
            };
            
            mockScalingPolicy.evaluateScalingDecision.mockResolvedValue(mockScalingDecision);

            const result = await scalingService.scaleModel('test-model', 2, 'Test scaling down');
            
            expect(result.action).toBe('scale_down');
            expect(result.targetReplicas).toBe(2);
            expect(mockDeploymentService.scaleModelDeployment).toHaveBeenCalledWith('test-model', 2);
        });
    });

    describe('Resource Management Tests', () => {
        test('should handle deployment with resource constraints', async () => {
            const modelId = 'resource-constrained-model';
            
            // Setup metrics with resource constraints
            await metricsService.updateMetrics(modelId, {
                timestamp: Date.now(),
                performance: {
                    responseTime: 300,
                    throughput: 25,
                    errorRate: 0.02,
                    requestRate: 50
                },
                resources: {
                    cpu: 95,
                    memory: 88,
                    gpu: 45,
                    networkIO: 60
                },
                scaling: {
                    currentNodes: 2,
                    activeConnections: 40,
                    queueLength: 15
                },
                availability: {
                    uptime: 3600000,
                    successRate: 0.97,
                    degradedPeriods: 2
                }
            });
            
            // Mock that the deployment service will report resource constraints
            mockDeploymentService.getDeployment.mockResolvedValue({
                id: 'deployment-constrained',
                modelId: modelId,
                replicas: 2,
                resources: {
                    cpu: '2',
                    memory: '4Gi'
                }
            });
            
            const result = await scalingService.scaleModel(modelId, 4);
            
            expect(result).toBeDefined();
            expect(mockDeploymentService.scaleModelDeployment).toHaveBeenCalledWith(modelId, 4);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
