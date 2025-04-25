import * as assert from 'assert';
import * as sinon from 'sinon';
import { createMockConversationHistory, createMockExtensionContext } from '../helpers/mockHelpers';
import { ResourceManager } from '../../services/resourceManager';
import { ConversationHistory } from '../../services/ConversationHistory';

describe('Resource Management', () => {
    let resourceManager: ResourceManager;
    let historyMock: sinon.SinonStubbedInstance<ConversationHistory>;
    let mockContext: any;
    let sandbox: sinon.SinonSandbox;
    
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockContext = createMockExtensionContext();
        historyMock = createMockConversationHistory();
        
        // Create a fresh instance for each test
        resourceManager = new ResourceManager(mockContext, historyMock);
    });
    
    afterEach(() => {
        sandbox.restore();
    });

    it('should track memory usage', async () => {
        const initialMemory = resourceManager.getCurrentMemoryUsage();
        assert.ok(initialMemory.total > 0);
        assert.ok(initialMemory.used > 0);
        assert.ok(initialMemory.free > 0);
        assert.ok(initialMemory.percentUsed > 0);
    });

    it('should track CPU usage', async () => {
        const initialCpu = await resourceManager.getCurrentCpuUsage();
        assert.ok(initialCpu.systemPercent >= 0);
        assert.ok(initialCpu.processPercent >= 0);
    });

    it('should identify high memory usage', async () => {
        // Mock a high memory usage scenario
        sandbox.stub(resourceManager, 'getCurrentMemoryUsage').returns({
            total: 8000, // 8GB
            used: 7200,  // 7.2GB (90%)
            free: 800,   // 0.8GB
            percentUsed: 90
        });
        
        const memoryStatus = resourceManager.checkMemoryStatus();
        
        assert.strictEqual(memoryStatus.status, 'warning');
        assert.ok(memoryStatus.message.includes('high'));
    });

    it('should identify critical CPU usage', async () => {
        // Mock a high CPU usage scenario
        sandbox.stub(resourceManager, 'getCurrentCpuUsage').resolves({
            systemPercent: 85,
            processPercent: 75
        });
        
        const cpuStatus = await resourceManager.checkCpuStatus();
        
        assert.strictEqual(cpuStatus.status, 'critical');
        assert.ok(cpuStatus.message.includes('critical'));
    });

    it('should optimize memory usage when needed', async () => {
        // Create some test data in memory
        for (let i = 0; i < 10; i++) {
            await historyMock.createConversation(`Conversation ${i}`);
        }
        
        // Mock memory pressure
        sandbox.stub(resourceManager, 'isUnderMemoryPressure').returns(true);
        
        // Call optimize
        const optimizationResult = await resourceManager.optimizeMemoryUsage();
        
        assert.strictEqual(optimizationResult.optimized, true);
        assert.ok(optimizationResult.freedMemory > 0);
    });

    it('should schedule resource checks', async () => {
        const checkSpy = sandbox.spy(resourceManager, 'checkResourceStatus');
        
        // Start resource monitoring
        resourceManager.startMonitoring(1000); // Check every second
        
        // Wait for at least one check
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Stop monitoring
        resourceManager.stopMonitoring();
        
        assert.ok(checkSpy.called, 'checkResourceStatus should be called at least once');
    });

    it('should handle resource allocation for large operations', async () => {
        // Request resources for a large operation
        const allocationResult = await resourceManager.allocateResourcesForOperation({
            estimatedMemory: 500, // 500MB
            estimatedCpuLoad: 50, // 50%
            priority: 'high'
        });
        
        assert.strictEqual(allocationResult.allocated, true);
        assert.ok(allocationResult.availableMemory > 0);
        assert.ok(allocationResult.availableCpu > 0);
    });

    it('should deny resource allocation when system is under pressure', async () => {
        // Mock system under pressure
        sandbox.stub(resourceManager, 'isUnderMemoryPressure').returns(true);
        sandbox.stub(resourceManager, 'isUnderCpuPressure').resolves(true);
        
        // Request resources
        const allocationResult = await resourceManager.allocateResourcesForOperation({
            estimatedMemory: 1000, // 1GB
            estimatedCpuLoad: 70, // 70%
            priority: 'normal'
        });
        
        assert.strictEqual(allocationResult.allocated, false);
        assert.ok(allocationResult.reason.includes('pressure'));
    });
});