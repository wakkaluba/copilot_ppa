"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const agent_1 = require("../../agent/agent");
const performanceMonitor_1 = require("./performanceMonitor");
suite('Performance Test Suite', () => {
    let agent;
    let monitor;
    suiteSetup(() => {
        agent = new agent_1.Agent();
        monitor = new performanceMonitor_1.PerformanceMonitor();
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
//# sourceMappingURL=performance.test.js.map