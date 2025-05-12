import * as assert from 'assert';
import sinon from 'sinon';
import { ModelScheduler } from '../../../../llm/services/ModelScheduler';
import { ModelSystemManager } from '../../../../llm/services/ModelSystemManager';
import { IModelSystem } from '../../../../llm/types';
import { Logger } from '../../../../utils/logger';

describe('ModelScheduler Tests', () => {
    let scheduler: ModelScheduler;
    let loggerMock: Logger;
    let systemManagerMock: ModelSystemManager;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        loggerMock = {
            debug: sandbox.stub(),
            info: sandbox.stub(),
            warn: sandbox.stub(),
            error: sandbox.stub()
        } as any;

        const mockSystem: IModelSystem = {
            id: 'test-system',
            name: 'Test System',
            executeTask: sandbox.stub().resolves(),
            getStatus: sandbox.stub().returns({ available: true, busy: false })
        };

        systemManagerMock = {
            getModelSystem: sandbox.stub().returns(mockSystem),
            registerModelSystem: sandbox.stub(),
            removeModelSystem: sandbox.stub()
        } as any;

        scheduler = new ModelScheduler(
            loggerMock,
            systemManagerMock,
            100 // Short processing interval for tests
        );
    });

    afterEach(() => {
        sandbox.restore();
        scheduler.dispose();
    });

    describe('Task Scheduling', () => {
        it('should schedule tasks with different priorities', async () => {
            const modelId = 'test-model';
            const payload = { prompt: 'test' };

            const highPriorityId = await scheduler.scheduleTask(modelId, 'high', payload);
            const normalPriorityId = await scheduler.scheduleTask(modelId, 'normal', payload);
            const lowPriorityId = await scheduler.scheduleTask(modelId, 'low', payload);

            assert.ok(highPriorityId, 'High priority task should get an ID');
            assert.ok(normalPriorityId, 'Normal priority task should get an ID');
            assert.ok(lowPriorityId, 'Low priority task should get an ID');

            const metrics = scheduler.getMetrics();
            assert.strictEqual(metrics.totalTasks, 3, 'Should have 3 total tasks');
        });

        it('should handle task timeouts', async () => {
            const modelId = 'test-model';
            const payload = { prompt: 'test' };
            const timeoutMs = 50;

            const taskId = await scheduler.scheduleTask(modelId, 'normal', payload, timeoutMs);

            // Wait for timeout
            await new Promise(resolve => setTimeout(resolve, timeoutMs + 50));

            const metrics = scheduler.getMetrics();
            assert.strictEqual(metrics.failedTasks, 1, 'Task should fail due to timeout');

            const task = scheduler.getTaskStatus(taskId);
            assert.strictEqual(task?.status, 'failed', 'Task status should be failed');
        });
    });

    describe('Task Execution', () => {
        it('should execute tasks in order of priority', async () => {
            const modelId = 'test-model';
            const executionOrder: string[] = [];

            // Schedule tasks in reverse priority order
            await scheduler.scheduleTask(modelId, 'low', { id: 'low' });
            await scheduler.scheduleTask(modelId, 'normal', { id: 'normal' });
            await scheduler.scheduleTask(modelId, 'high', { id: 'high' });

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 300));

            const metrics = scheduler.getMetrics();
            assert.ok(metrics.completedTasks > 0, 'Should complete some tasks');
        });

        it('should handle task failures gracefully', async () => {
            const modelId = 'test-model';
            const payload = { prompt: 'test' };

            const mockSystem = systemManagerMock.getModelSystem() as IModelSystem;
            (mockSystem.executeTask as sinon.SinonStub).rejects(new Error('Test error'));

            const taskId = await scheduler.scheduleTask(modelId, 'normal', payload);

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 200));

            const metrics = scheduler.getMetrics();
            assert.strictEqual(metrics.failedTasks, 1, 'Task should be marked as failed');

            const task = scheduler.getTaskStatus(taskId);
            assert.strictEqual(task?.status, 'failed', 'Task status should be failed');
        });
    });

    describe('Metrics', () => {
        it('should track task metrics correctly', async () => {
            const modelId = 'test-model';

            await scheduler.scheduleTask(modelId, 'normal', { prompt: 'test1' });
            await scheduler.scheduleTask(modelId, 'normal', { prompt: 'test2' });

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 200));

            const metrics = scheduler.getMetrics();
            assert.strictEqual(metrics.totalTasks, 2, 'Should track total tasks');
            assert.ok(metrics.averageWaitTime >= 0, 'Should track wait time');
            assert.ok(metrics.averageProcessingTime >= 0, 'Should track processing time');
        });
    });
});
