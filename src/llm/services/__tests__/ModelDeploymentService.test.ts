import { Logger } from '../../../utils/logger';
import { ModelDeploymentService } from '../ModelDeploymentService';

jest.mock('../../../utils/logger');

// Set global Jest timeout to handle async tests
jest.setTimeout(30000);

describe('ModelDeploymentService', () => {
    let deploymentService: ModelDeploymentService;
    let mockLogger: jest.Mocked<Logger>;

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

        deploymentService = new ModelDeploymentService(mockLogger);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
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

        it('creates a new deployment successfully', async () => {
            // Clear previous calls
            mockLogger.info.mockClear();

            const deploymentId = await deploymentService.createDeployment(mockOptions);
            expect(deploymentId).toMatch(/^deploy-\d+-\d+$/);

            // Verify that the second call to info contains the expected strings
            expect(mockLogger.info.mock.calls[0][0]).toContain('Created deployment');
            expect(mockLogger.info.mock.calls[0][0]).toContain(mockOptions.modelId);
        });

        it('simulates deployment completion after delay', async () => {
            // Clear timers and set up completion listener before creating deployment
            jest.clearAllTimers();

            let resolved = false;
            const completionPromise = new Promise<void>((resolve) => {
                deploymentService.once('deployment.ready', ({ deploymentId: readyId, modelId }) => {
                    expect(readyId).toMatch(/^deploy-\d+-\d+$/);
                    expect(modelId).toBe(mockOptions.modelId);
                    resolved = true;
                    resolve();
                });
            });

            // Create deployment after setting up listener
            const deploymentId = await deploymentService.createDeployment(mockOptions);

            // Fast-forward time to trigger completion
            jest.advanceTimersByTime(1500);

            // Wait for completion promise and verify it resolved
            await completionPromise;
            expect(resolved).toBe(true);
        });

        it('emits deployment.created event', async () => {
            const eventListener = jest.fn();
            deploymentService.on('deployment.created', eventListener);

            await deploymentService.createDeployment(mockOptions);

            expect(eventListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    deployment: expect.objectContaining({
                        modelId: mockOptions.modelId,
                        version: mockOptions.version,
                        status: 'deploying'
                    })
                })
            );
        });
    });

    describe('getDeployment', () => {
        let deploymentId: string;

        beforeEach(async () => {
            deploymentId = await deploymentService.createDeployment({
                modelId: 'test-model',
                version: '1.0.0',
                environmentId: 'test-env'
            });
        });

        it('returns deployment details', async () => {
            const deployment = await deploymentService.getDeployment(deploymentId);

            expect(deployment).toBeTruthy();
            expect(deployment.id).toBe(deploymentId);
            expect(deployment.modelId).toBe('test-model');
            expect(deployment.status).toBe('deploying');
        });

        it('returns null for non-existent deployment', async () => {
            const deployment = await deploymentService.getDeployment('non-existent');
            expect(deployment).toBeNull();
        });

        it('returns a copy of deployment data', async () => {
            const deployment = await deploymentService.getDeployment(deploymentId);
            deployment.status = 'modified';

            const deploymentAfter = await deploymentService.getDeployment(deploymentId);
            expect(deploymentAfter.status).toBe('deploying');
        });
    });

    describe('listDeployments', () => {
        beforeEach(async () => {
            await deploymentService.createDeployment({
                modelId: 'model-1',
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
            await deploymentService.createDeployment({
                modelId: 'model-2',
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
            await deploymentService.createDeployment({
                modelId: 'model-1',
                version: '2.0.0',
                environmentId: 'env-2',
                config: {
                    replicas: 1,
                    resources: {
                        cpu: '1',
                        memory: '2Gi'
                    }
                }
            });
        });

        it('lists all deployments when no filter provided', async () => {
            const deployments = await deploymentService.listDeployments();
            expect(deployments).toHaveLength(3);
        });

        it('filters deployments by model ID', async () => {
            const deployments = await deploymentService.listDeployments('model-1');
            expect(deployments).toHaveLength(2);
            expect(deployments.every(d => d.modelId === 'model-1')).toBe(true);
        });
    });

    describe('updateDeployment', () => {
        let deploymentId: string;

        beforeEach(async () => {
            deploymentId = await deploymentService.createDeployment({
                modelId: 'test-model',
                version: '1.0.0',
                environmentId: 'test-env',
                config: {
                    replicas: 1,
                    resources: {
                        cpu: '1',
                        memory: '2Gi'
                    }
                }
            });
        });

        it('updates deployment configuration', async () => {
            await deploymentService.updateDeployment(deploymentId, {
                config: {
                    replicas: 2,
                    resources: {
                        cpu: '2',
                        memory: '4Gi'
                    }
                }
            });

            const deployment = await deploymentService.getDeployment(deploymentId);
            expect(deployment.config.replicas).toBe(2);
            expect(deployment.config.resources.cpu).toBe('2');
            expect(deployment.config.resources.memory).toBe('4Gi');
        });

        it('updates deployment metadata', async () => {
            const metadata = { name: 'Updated Test', tags: ['test'] };
            await deploymentService.updateDeployment(deploymentId, { metadata });

            const deployment = await deploymentService.getDeployment(deploymentId);
            expect(deployment.metadata).toEqual(metadata);
        });

        it('updates deployment status', async () => {
            await deploymentService.updateDeployment(deploymentId, { status: 'running' });

            const deployment = await deploymentService.getDeployment(deploymentId);
            expect(deployment.status).toBe('running');
        });

        it('emits deployment.updated event', async () => {
            const eventListener = jest.fn();
            deploymentService.on('deployment.updated', eventListener);

            const updates = { status: 'running' };
            await deploymentService.updateDeployment(deploymentId, updates);

            expect(eventListener).toHaveBeenCalledWith({
                deploymentId,
                updates
            });
        });

        it('throws error for non-existent deployment', async () => {
            await expect(
                deploymentService.updateDeployment('non-existent', { status: 'running' })
            ).rejects.toThrow('Deployment non-existent not found');
        });
    });

    describe('deleteDeployment', () => {
        let deploymentId: string;

        beforeEach(async () => {
            deploymentId = await deploymentService.createDeployment({
                modelId: 'test-model',
                version: '1.0.0',
                environmentId: 'test-env',
                config: {
                    replicas: 1,
                    resources: {
                        cpu: '1',
                        memory: '2Gi'
                    }
                }
            });
        });

        it('deletes deployment successfully', async () => {
            await deploymentService.deleteDeployment(deploymentId);

            const deployment = await deploymentService.getDeployment(deploymentId);
            expect(deployment).toBeNull();
        });

        it('emits deployment.deleted event', async () => {
            const eventListener = jest.fn();
            deploymentService.on('deployment.deleted', eventListener);

            await deploymentService.deleteDeployment(deploymentId);

            expect(eventListener).toHaveBeenCalledWith({
                deploymentId,
                modelId: 'test-model'
            });
        });

        it('throws error for non-existent deployment', async () => {
            await expect(
                deploymentService.deleteDeployment('non-existent')
            ).rejects.toThrow('Deployment non-existent not found');
        });
    });

    describe('dispose', () => {
        beforeEach(async () => {
            await deploymentService.createDeployment({
                modelId: 'test-model',
                version: '1.0.0',
                environmentId: 'test-env',
                config: {
                    replicas: 1,
                    resources: {
                        cpu: '1',
                        memory: '2Gi'
                    }
                }
            });
        });

        it('clears all deployments', () => {
            deploymentService.dispose();
            expect(deploymentService.listDeployments()).resolves.toHaveLength(0);
        });

        it('removes all event listeners', () => {
            const eventListener = jest.fn();
            deploymentService.on('deployment.created', eventListener);

            deploymentService.dispose();

            // Event should not be emitted after dispose
            deploymentService.emit('deployment.created', {});
            expect(eventListener).not.toHaveBeenCalled();
        });

        it('logs disposal', () => {
            deploymentService.dispose();
            expect(mockLogger.info).toHaveBeenCalledWith('ModelDeploymentService disposed');
        });
    });
});
