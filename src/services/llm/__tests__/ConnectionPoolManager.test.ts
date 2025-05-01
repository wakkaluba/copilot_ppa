import { ConnectionPoolManager } from '../ConnectionPoolManager';
import { LLMConnectionError } from '../errors';
import { ILLMConnectionProvider } from '../interfaces';

jest.mock('../ConnectionMetricsTracker');

describe('ConnectionPoolManager', () => {
    let manager: ConnectionPoolManager;

    beforeEach(() => {
        // Reset singleton instance before each test
        // @ts-ignore - accessing private static field for testing
        ConnectionPoolManager['instance'] = undefined;
        manager = ConnectionPoolManager.getInstance();
    });

    describe('getInstance', () => {
        it('should create a singleton instance', () => {
            const instance1 = ConnectionPoolManager.getInstance();
            const instance2 = ConnectionPoolManager.getInstance();
            expect(instance1).toBe(instance2);
        });

        it('should apply custom config when provided', () => {
            const customConfig = {
                maxSize: 10,
                minSize: 2,
                acquireTimeout: 5000
            };
            const manager = ConnectionPoolManager.getInstance(customConfig);
            // @ts-ignore - accessing private field for testing
            expect(manager['config']).toMatchObject(customConfig);
        });
    });

    describe('acquire', () => {
        it('should acquire a connection from the pool when available', async () => {
            const providerId = 'test-provider';
            const mockConnection = {} as ILLMConnectionProvider;
            // @ts-ignore - accessing private field for testing
            manager['pool'].set(providerId, [mockConnection]);

            const acquired = await manager.acquire(providerId);
            expect(acquired).toBe(mockConnection);
            // @ts-ignore - accessing private field for testing
            expect(manager['inUse'].get(providerId)?.has(mockConnection)).toBe(true);
        });

        it('should create a new connection when pool is empty and under maxSize', async () => {
            const providerId = 'test-provider';
            const mockConnection = {} as ILLMConnectionProvider;
            // Mock createConnection
            // @ts-ignore - accessing private method for testing
            jest.spyOn(manager as any, 'createConnection').mockResolvedValue(mockConnection);

            const acquired = await manager.acquire(providerId);
            expect(acquired).toBe(mockConnection);
            // @ts-ignore - accessing private field for testing
            expect(manager['inUse'].get(providerId)?.has(mockConnection)).toBe(true);
        });

        it('should wait for a connection when pool is at maxSize', async () => {
            const providerId = 'test-provider';
            const mockConnection = {} as ILLMConnectionProvider;
            // @ts-ignore - accessing private fields for testing
            manager['config'].maxSize = 1;
            // @ts-ignore - accessing private field for testing
            const inUseSet = new Set([mockConnection]);
            // @ts-ignore - accessing private field for testing
            manager['inUse'].set(providerId, inUseSet);

            // Mock timeout to test waiting behavior
            jest.useFakeTimers();
            const acquirePromise = manager.acquire(providerId);

            // Release the connection after a delay
            setTimeout(() => {
                manager.release(providerId, mockConnection);
            }, 1000);

            jest.advanceTimersByTime(1000);
            const acquired = await acquirePromise;
            expect(acquired).toBe(mockConnection);
        });

        it('should throw error when acquisition times out', async () => {
            const providerId = 'test-provider';
            const mockConnection = {} as ILLMConnectionProvider;
            // @ts-ignore - accessing private fields for testing
            manager['config'].maxSize = 1;
            manager['config'].acquireTimeout = 1000;
            // @ts-ignore - accessing private field for testing
            const inUseSet = new Set([mockConnection]);
            // @ts-ignore - accessing private field for testing
            manager['inUse'].set(providerId, inUseSet);

            jest.useFakeTimers();
            const acquirePromise = manager.acquire(providerId);
            jest.advanceTimersByTime(1000);

            await expect(acquirePromise).rejects.toThrow(LLMConnectionError);
        });
    });

    describe('release', () => {
        it('should release a connection back to the pool', () => {
            const providerId = 'test-provider';
            const mockConnection = {} as ILLMConnectionProvider;
            // @ts-ignore - accessing private field for testing
            const inUseSet = new Set([mockConnection]);
            // @ts-ignore - accessing private field for testing
            manager['inUse'].set(providerId, inUseSet);

            manager.release(providerId, mockConnection);
            // @ts-ignore - accessing private field for testing
            expect(manager['pool'].get(providerId)).toContain(mockConnection);
            // @ts-ignore - accessing private field for testing
            expect(manager['inUse'].get(providerId)?.has(mockConnection)).toBe(false);
        });

        it('should give connection to waiting client if any', async () => {
            const providerId = 'test-provider';
            const mockConnection = {} as ILLMConnectionProvider;
            // @ts-ignore - accessing private fields for testing
            manager['config'].maxSize = 1;
            // @ts-ignore - accessing private field for testing
            const inUseSet = new Set([mockConnection]);
            // @ts-ignore - accessing private field for testing
            manager['inUse'].set(providerId, inUseSet);

            // Start an acquisition that will wait
            const acquirePromise = manager.acquire(providerId);
            manager.release(providerId, mockConnection);

            const acquired = await acquirePromise;
            expect(acquired).toBe(mockConnection);
        });
    });

    describe('clear', () => {
        it('should clear all connections for a provider', async () => {
            const providerId = 'test-provider';
            const mockConnection = {
                disconnect: jest.fn().mockResolvedValue(undefined)
            } as unknown as ILLMConnectionProvider;
            // @ts-ignore - accessing private field for testing
            manager['pool'].set(providerId, [mockConnection]);
            // @ts-ignore - accessing private field for testing
            manager['inUse'].set(providerId, new Set([mockConnection]));

            await manager.clear(providerId);
            // @ts-ignore - accessing private field for testing
            expect(manager['pool'].has(providerId)).toBe(false);
            // @ts-ignore - accessing private field for testing
            expect(manager['inUse'].has(providerId)).toBe(false);
            expect(mockConnection.disconnect).toHaveBeenCalled();
        });
    });

    describe('getStats', () => {
        it('should return correct pool statistics', () => {
            const providerId = 'test-provider';
            const mockConnection = {} as ILLMConnectionProvider;
            // @ts-ignore - accessing private field for testing
            manager['pool'].set(providerId, [mockConnection]);
            // @ts-ignore - accessing private field for testing
            manager['inUse'].set(providerId, new Set([mockConnection]));

            const stats = manager.getStats(providerId);
            expect(stats).toEqual({
                available: 1,
                inUse: 1,
                waiting: 0,
                metrics: expect.any(Object)
            });
        });
    });

    describe('dispose', () => {
        it('should clean up all connections and remove listeners', async () => {
            const providerId = 'test-provider';
            const mockConnection = {
                disconnect: jest.fn().mockResolvedValue(undefined)
            } as unknown as ILLMConnectionProvider;
            // @ts-ignore - accessing private field for testing
            manager['pool'].set(providerId, [mockConnection]);

            const removeAllListenersSpy = jest.spyOn(manager, 'removeAllListeners');
            manager.dispose();

            expect(removeAllListenersSpy).toHaveBeenCalled();
            expect(mockConnection.disconnect).toHaveBeenCalled();
        });
    });
});
