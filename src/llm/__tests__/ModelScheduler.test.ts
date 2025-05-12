import * as assert from 'assert';
import { ModelScheduler } from '../services/ModelScheduler';
import { ModelSystemManager } from '../services/ModelSystemManager';
import { ILogger } from '../types';

describe('ModelScheduler', () => {
    let scheduler: ModelScheduler;
    let mockLogger: ILogger;
    let mockSystemManager: ModelSystemManager;

    beforeEach(() => {
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        mockSystemManager = {
            // Add required mock implementations
            getSystemMetrics: jest.fn(),
            optimizeResources: jest.fn()
        } as any;

        scheduler = new ModelScheduler(mockLogger, mockSystemManager);
    });

    afterEach(() => {
        scheduler.dispose();
        jest.clearAllMocks();
    });

    describe('Task Scheduling', () => {
        it('should schedule a task with default priority', async () => {
            const taskId = await scheduler.scheduleTask('model1', 'normal', { data: 'test' });
            assert.ok(taskId);

            const status = scheduler.getTaskStatus(taskId);
            assert.strictEqual(status?.status, 'pending');
            assert.strictEqual(status?.priority, 'normal');
        });

        it('should schedule tasks with different priorities', async () => {
            const highPriorityTask = await scheduler.scheduleTask('model1', 'high', { data: 'high' });
            const normalPriorityTask = await scheduler.scheduleTask('model1', 'normal', { data: 'normal' });
            const lowPriorityTask = await scheduler.scheduleTask('model1', 'low', { data: 'low' });

            assert.ok(highPriorityTask);
            assert.ok(normalPriorityTask);
            assert.ok(lowPriorityTask);
        });

        it('should handle task timeouts', async () => {
            const taskId = await scheduler.scheduleTask('model1', 'normal', { data: 'test' }, 100);
            await new Promise(resolve => setTimeout(resolve, 150));

            const status = scheduler.getTaskStatus(taskId);
            assert.strictEqual(status?.status, 'failed');
        });
    });

    describe('Task Execution', () => {
        it('should process tasks up to max concurrent limit', async () => {
            const tasks = await Promise.all([
                scheduler.scheduleTask('model1', 'normal', { data: '1' }),
                scheduler.scheduleTask('model1', 'normal', { data: '2' }),
                scheduler.scheduleTask('model1', 'normal', { data: '3' }),
                scheduler.scheduleTask('model1', 'normal', { data: '4' })
            ]);

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 100));

            const activeTasks = tasks.map(id => scheduler.getTaskStatus(id))
                .filter(task => task?.status === 'running');

            assert.ok(activeTasks.length <= 3); // maxConcurrentTasks is 3
        });

        it('should update metrics after task completion', async () => {
            await scheduler.scheduleTask('model1', 'normal', { data: 'test' });

            // Wait for task to complete
            await new Promise(resolve => setTimeout(resolve, 1100));

            const metrics = scheduler.getMetrics();
            assert.strictEqual(metrics.totalTasks, 1);
            assert.strictEqual(metrics.completedTasks, 1);
            assert.ok(metrics.averageProcessingTime > 0);
        });
    });

    describe('Error Handling', () => {
        it('should handle task failures', async () => {
            // Mock runTask to throw an error
            jest.spyOn(scheduler as any, 'runTask').mockRejectedValueOnce(new Error('Task failed'));

            const taskId = await scheduler.scheduleTask('model1', 'normal', { data: 'test' });

            // Wait for task to fail
            await new Promise(resolve => setTimeout(resolve, 100));

            const status = scheduler.getTaskStatus(taskId);
            assert.strictEqual(status?.status, 'failed');

            const metrics = scheduler.getMetrics();
            assert.strictEqual(metrics.failedTasks, 1);
        });
    });

    describe('Cleanup', () => {
        it('should clean up resources on dispose', () => {
            scheduler.dispose();

            const metrics = scheduler.getMetrics();
            assert.strictEqual(metrics.totalTasks, 0);
            assert.strictEqual(metrics.completedTasks, 0);
            assert.strictEqual(metrics.failedTasks, 0);
        });
    });
});
