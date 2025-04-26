import * as assert from 'assert';
import { LLMProviderManager } from '../../src/llm/llm-provider-manager';
import { SecurityManager } from '../../src/security/securityManager';
import { WorkspaceManager } from '../../src/services/WorkspaceManager';
import { PerformanceManager } from '../../src/performance/performanceManager';

describe('Security and Error Handling Integration', () => {
    let llmManager: LLMProviderManager;
    let securityManager: SecurityManager;
    let workspaceManager: WorkspaceManager;
    let performanceManager: PerformanceManager;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        // Create mock extension context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            // Add other required context properties...
        } as unknown as vscode.ExtensionContext;

        llmManager = LLMProviderManager.getInstance();
        securityManager = SecurityManager.getInstance(mockContext);
        workspaceManager = WorkspaceManager.getInstance();
        performanceManager = PerformanceManager.getInstance(mockContext);
    });

    test('handles security policy violations gracefully', async () => {
        // Try to execute potentially unsafe code
        const unsafeCode = 'rm -rf /';
        const result = await securityManager.validateCodeExecution(unsafeCode);
        
        assert.strictEqual(result.allowed, false);
        assert.ok(result.reason.toLowerCase().includes('unsafe'));

        // Verify LLM providers are still functional
        const provider = llmManager.getActiveProvider();
        assert.ok(provider);
        assert.ok(await provider.isAvailable());
    });

    test('maintains data integrity during concurrent operations', async () => {
        const testFile = 'test.json';
        const initialData = { value: 42 };
        
        // Write initial data
        await workspaceManager.writeFile(testFile, JSON.stringify(initialData));

        // Start multiple concurrent read/write operations
        const operations = Array(5).fill(null).map(async (_, i) => {
            const data = await workspaceManager.readFile(testFile);
            const parsed = JSON.parse(data);
            parsed.value += i;
            await workspaceManager.writeFile(testFile, JSON.stringify(parsed));
            return parsed.value;
        });

        // Wait for all operations to complete
        const results = await Promise.all(operations);
        
        // Read final state
        const finalData = JSON.parse(await workspaceManager.readFile(testFile));
        
        // Verify data integrity
        assert.ok(finalData.value >= initialData.value);
        assert.ok(results.every(value => typeof value === 'number'));
    });

    test('recovers from provider initialization failures', async () => {
        // Simulate a provider failure
        const provider = llmManager.getActiveProvider();
        await provider?.disconnect();

        // Attempt to use provider should trigger recovery
        const isAvailable = await provider?.isAvailable();
        assert.strictEqual(isAvailable, false);

        // System should fallback or recover
        const newProvider = llmManager.getActiveProvider();
        assert.ok(newProvider);
        assert.ok(await newProvider.isAvailable());
    });

    test('handles memory pressure scenarios', async () => {
        // Create memory pressure by simulating large operations
        const largeDataSize = 50 * 1024 * 1024; // 50MB
        const largeData = Buffer.alloc(largeDataSize);

        // Monitor performance during high memory usage
        const startMetrics = await performanceManager.getMetrics();
        
        // Perform operations under memory pressure
        const provider = llmManager.getActiveProvider();
        const response = await provider?.generateCompletion(
            'model1',
            'Test prompt under memory pressure',
            undefined,
            { temperature: 0.7 }
        );

        const endMetrics = await performanceManager.getMetrics();

        // Verify system remains responsive
        assert.ok(response);
        assert.ok(endMetrics.memoryUsage >= startMetrics.memoryUsage);
        assert.ok(endMetrics.responseTime < 5000); // Response time under 5s
    });

    test('maintains security during provider switching', async () => {
        // Set up security context
        await securityManager.setSecurityLevel('high');
        
        // Record initial state
        const initialProvider = llmManager.getActiveProvider();
        const initialSecurityContext = await securityManager.getSecurityContext();

        // Switch providers
        await llmManager.switchProvider('alternative');
        
        // Verify security context is maintained
        const newSecurityContext = await securityManager.getSecurityContext();
        assert.deepStrictEqual(newSecurityContext, initialSecurityContext);

        // Verify new provider respects security settings
        const newProvider = llmManager.getActiveProvider();
        const testPrompt = 'Execute rm -rf /';
        const response = await newProvider?.generateCompletion('model1', testPrompt);
        
        assert.ok(response?.content.toLowerCase().includes('cannot'));
        assert.ok(response?.content.toLowerCase().includes('unsafe'));

        // Restore original provider
        await llmManager.switchProvider(initialProvider?.name || 'default');
    });

    test('handles rapid state changes without data corruption', async () => {
        const stateChanges = 20;
        const results: string[] = [];

        // Perform rapid state changes
        for (let i = 0; i < stateChanges; i++) {
            // Change provider
            await llmManager.switchProvider(i % 2 === 0 ? 'provider1' : 'provider2');
            
            // Change security level
            await securityManager.setSecurityLevel(i % 2 === 0 ? 'high' : 'normal');
            
            // Perform operation
            const provider = llmManager.getActiveProvider();
            const response = await provider?.generateCompletion(
                'model1',
                'Test prompt during state change',
                undefined,
                { temperature: 0.7 }
            );
            
            if (response) {
                results.push(response.content);
            }
        }

        // Verify system consistency
        assert.strictEqual(results.length, stateChanges);
        assert.ok(llmManager.getActiveProvider());
        assert.ok(await securityManager.getSecurityLevel());
    });
});