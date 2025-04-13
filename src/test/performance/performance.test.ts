import * as assert from 'assert';
import { Agent } from '../../agent/agent';
import { PerformanceMonitor } from './performanceMonitor';

suite('Performance Test Suite', () => {
    let agent: Agent;
    let monitor: PerformanceMonitor;

    suiteSetup(() => {
        agent = new Agent();
        monitor = new PerformanceMonitor();
    });

    test('LLM Response Time Test', async () => {
        const metrics = await monitor.measure(async () => {
            await agent.processRequest('Simple test query');
        });
        assert.ok(metrics.duration < 2000, 'Response time should be under 2 seconds');
    });

    test('Memory Usage Test', async () => {
        const metrics = await monitor.measureMemory(async () => {
            await agent.processRequest('Memory test query');
        });
        assert.ok(metrics.heapUsed < 100 * 1024 * 1024, 'Heap usage should be under 100MB');
    });

    test('Concurrent Requests Test', async () => {
        const requests = Array(5).fill('Test concurrent query');
        const startTime = Date.now();
        await Promise.all(requests.map(r => agent.processRequest(r)));
        const duration = Date.now() - startTime;
        assert.ok(duration < 10000, 'Concurrent requests should complete under 10 seconds');
    });

    test('Large File Processing Test', async () => {
        const largeCode = 'x'.repeat(100000);
        const metrics = await monitor.measure(async () => {
            await agent.processCode(largeCode);
        });
        assert.ok(metrics.duration < 5000, 'Large file processing should be under 5 seconds');
    });

    test('Cache Performance Test', async () => {
        const query = 'Cache test query';
        await agent.processRequest(query); // Warm up cache
        const metrics = await monitor.measure(async () => {
            await agent.processRequest(query);
        });
        assert.ok(metrics.duration < 500, 'Cached response should be under 500ms');
    });
});
