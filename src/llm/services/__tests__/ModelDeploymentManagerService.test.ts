import { Logger } from '../../../utils/logger';
import { ModelDeploymentManagerService } from '../ModelDeploymentManagerService';
import { ModelDeploymentService } from '../ModelDeploymentService';
import { ModelVersioningService } from '../ModelVersioningService';

jest.mock('../ModelVersioningService');
jest.mock('../ModelDeploymentService');
jest.mock('../../../utils/logger');

describe('ModelDeploymentManagerService', () => {
    let manager: ModelDeploymentManagerService;
    let mockLogger: jest.Mocked<Logger>;
    let mockVersioningService: jest.Mocked<ModelVersioningService>;
    let mockDeploymentService: jest.Mocked<ModelDeploymentService>;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            log: jest.fn(),
            show: jest.fn(),
            clear: jest.fn(),
            setLogLevel: jest.fn(),
            dispose: jest.fn()
        } as unknown as jest.Mocked<Logger>;

        mockVersioningService = {
            verifyVersion: jest.fn().mockResolvedValue(true)
        } as unknown as jest.Mocked<ModelVersioningService>;

        mockDeploymentService = {
            createDeployment: jest.fn().mockResolvedValue('test-deployment-id'),
            getDeployment: jest.fn(),
            updateDeployment: jest.fn(),
            deleteDeployment: jest.fn(),
            listDeployments: jest.fn(),
            on: jest.fn(),
            emit: jest.fn()
        } as unknown as jest.Mocked<ModelDeploymentService>;

        manager = new ModelDeploymentManagerService(
            mockLogger,
            mockVersioningService,
            mockDeploymentService
        );
    });

    describe('createDeployment', () => {
        const mockOptions = {
            modelId: 'test-model',
            version: '1.0.0',
            environmentId: 'test-env',
            config: {
                replicas: 1,
                resources: {
                    cpu: '1',
                    memory: '2Gi'
                }
            },
            metadata: {
                name: 'Test Deployment'
            }
        };

        it('verifies model version before creating deployment', async () => {
            await manager.createDeployment(mockOptions);

            expect(mockVersioningService.verifyVersion).toHaveBeenCalledWith(
                mockOptions.modelId,
                mockOptions.version
            );
        });

        it('creates deployment with default config when not provided', async () => {
            await manager.createDeployment({
                modelId: 'test-model',
                version: '1.0.0',
                environmentId: 'test-env'
            });

            expect(mockDeploymentService.createDeployment).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: {
                        replicas: 1,
                        resources: {
                            cpu: '1',
                            memory: '2Gi'
                        }
                    }
                })
            );
        });

        it('emits deployment.created event', async () => {
            const listener = jest.fn();
            manager.on('deployment.created', listener);

            const deploymentId = await manager.createDeployment(mockOptions);

            expect(listener).toHaveBeenCalledWith({
                deploymentId,
                modelId: mockOptions.modelId,
                environment: mockOptions.environmentId
            });
        });

        it('throws error when version verification fails', async () => {
            mockVersioningService.verifyVersion.mockRejectedValue(
                new Error('Invalid version')
            );

            await expect(manager.createDeployment(mockOptions)).rejects.toThrow('Invalid version');
        });
    });

    describe('getDeployment', () => {
        const mockDeployment = {
            id: 'test-deployment',
            status: 'running'
        };

        beforeEach(() => {
            mockDeploymentService.getDeployment.mockResolvedValue(mockDeployment);
        });

        it('retrieves deployment details', async () => {
            const deployment = await manager.getDeployment('test-deployment');

            expect(deployment).toEqual(mockDeployment);
            expect(mockDeploymentService.getDeployment).toHaveBeenCalledWith('test-deployment');
        });

        it('throws error when deployment not found', async () => {
            mockDeploymentService.getDeployment.mockResolvedValue(null);

            await expect(manager.getDeployment('non-existent')).rejects.toThrow(
                'Deployment non-existent not found'
            );
        });
    });

    describe('updateDeployment', () => {
        const deploymentId = 'test-deployment';
        const metadata = { name: 'Updated Test' };

        it('updates deployment metadata', async () => {
            await manager.updateDeployment(deploymentId, metadata);

            expect(mockDeploymentService.updateDeployment).toHaveBeenCalledWith(
                deploymentId,
                { metadata }
            );
        });

        it('emits deployment.updated event', async () => {
            const listener = jest.fn();
            manager.on('deployment.updated', listener);

            await manager.updateDeployment(deploymentId, metadata);

            expect(listener).toHaveBeenCalledWith({
                deploymentId,
                metadata
            });
        });

        it('handles update errors', async () => {
            mockDeploymentService.updateDeployment.mockRejectedValue(
                new Error('Update failed')
            );

            await expect(manager.updateDeployment(deploymentId, metadata)).rejects.toThrow(
                'Update failed'
            );
        });
    });

    describe('deleteDeployment', () => {
        const deploymentId = 'test-deployment';

        it('deletes deployment', async () => {
            await manager.deleteDeployment(deploymentId);

            expect(mockDeploymentService.deleteDeployment).toHaveBeenCalledWith(deploymentId);
        });

        it('emits deployment.deleted event', async () => {
            const listener = jest.fn();
            manager.on('deployment.deleted', listener);

            await manager.deleteDeployment(deploymentId);

            expect(listener).toHaveBeenCalledWith({ deploymentId });
        });

        it('handles deletion errors', async () => {
            mockDeploymentService.deleteDeployment.mockRejectedValue(
                new Error('Deletion failed')
            );

            await expect(manager.deleteDeployment(deploymentId)).rejects.toThrow(
                'Deletion failed'
            );
        });
    });

    describe('listDeployments', () => {
        const mockDeployments = [
            { id: 'deploy-1', modelId: 'model-1' },
            { id: 'deploy-2', modelId: 'model-2' }
        ];

        beforeEach(() => {
            mockDeploymentService.listDeployments.mockResolvedValue(mockDeployments);
        });

        it('lists all deployments when no model ID provided', async () => {
            const deployments = await manager.listDeployments();

            expect(deployments).toEqual(mockDeployments);
            expect(mockDeploymentService.listDeployments).toHaveBeenCalledWith(undefined);
        });

        it('filters deployments by model ID', async () => {
            await manager.listDeployments('model-1');

            expect(mockDeploymentService.listDeployments).toHaveBeenCalledWith('model-1');
        });
    });

    describe('getDeploymentStatus', () => {
        beforeEach(() => {
            mockDeploymentService.getDeployment.mockResolvedValue({
                id: 'test-deployment',
                status: 'running'
            });
        });

        it('returns deployment status', async () => {
            const status = await manager.getDeploymentStatus('test-deployment');

            expect(status).toBe('running');
        });

        it('throws error when deployment not found', async () => {
            mockDeploymentService.getDeployment.mockResolvedValue(null);

            await expect(manager.getDeploymentStatus('non-existent')).rejects.toThrow(
                'Deployment non-existent not found'
            );
        });
    });

    describe('restartDeployment', () => {
        const deploymentId = 'test-deployment';

        beforeEach(() => {
            mockDeploymentService.getDeployment.mockResolvedValue({
                id: deploymentId,
                status: 'running'
            });
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('updates deployment status to restarting', async () => {
            await manager.restartDeployment(deploymentId);

            expect(mockDeploymentService.updateDeployment).toHaveBeenCalledWith(
                deploymentId,
                { status: 'restarting' }
            );
        });

        it('emits deployment.restarting event', async () => {
            const listener = jest.fn();
            manager.on('deployment.restarting', listener);

            await manager.restartDeployment(deploymentId);

            expect(listener).toHaveBeenCalledWith({ deploymentId });
        });

        it('completes restart after delay', async () => {
            await manager.restartDeployment(deploymentId);

            jest.advanceTimersByTime(2000);

            expect(mockDeploymentService.updateDeployment).toHaveBeenCalledWith(
                deploymentId,
                expect.objectContaining({
                    status: 'running'
                })
            );
        });
    });

    describe('scaleDeployment', () => {
        const deploymentId = 'test-deployment';

        it('updates deployment replicas', async () => {
            await manager.scaleDeployment(deploymentId, 3);

            expect(mockDeploymentService.updateDeployment).toHaveBeenCalledWith(
                deploymentId,
                {
                    config: { replicas: 3 }
                }
            );
        });

        it('emits deployment.scaled event', async () => {
            const listener = jest.fn();
            manager.on('deployment.scaled', listener);

            await manager.scaleDeployment(deploymentId, 3);

            expect(listener).toHaveBeenCalledWith({
                deploymentId,
                replicas: 3
            });
        });
    });

    describe('updateResources', () => {
        const deploymentId = 'test-deployment';
        const resources = {
            cpu: '2',
            memory: '4Gi',
            gpu: '1'
        };

        it('updates deployment resources', async () => {
            await manager.updateResources(deploymentId, resources);

            expect(mockDeploymentService.updateDeployment).toHaveBeenCalledWith(
                deploymentId,
                {
                    config: { resources }
                }
            );
        });

        it('emits deployment.resourcesUpdated event', async () => {
            const listener = jest.fn();
            manager.on('deployment.resourcesUpdated', listener);

            await manager.updateResources(deploymentId, resources);

            expect(listener).toHaveBeenCalledWith({
                deploymentId,
                resources
            });
        });
    });

    describe('dispose', () => {
        it('clears deployments', () => {
            manager.dispose();

            expect(manager.listDeployments()).resolves.toHaveLength(0);
        });

        it('removes event listeners', () => {
            const listener = jest.fn();
            manager.on('deployment.created', listener);

            manager.dispose();

            manager.emit('deployment.created', {});
            expect(listener).not.toHaveBeenCalled();
        });

        it('logs disposal', () => {
            manager.dispose();

            expect(mockLogger.info).toHaveBeenCalledWith(
                'ModelDeploymentManagerService disposed'
            );
        });
    });
});
