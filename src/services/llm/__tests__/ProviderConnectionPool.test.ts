import { ProviderConnectionPool } from '../connection/ProviderConnectionPool';
import { LLMProvider } from '../types';

describe('ProviderConnectionPool', () => {
    let pool: ProviderConnectionPool;
    let mockProvider: jest.Mocked<LLMProvider>;

    beforeEach(() => {
        mockProvider = {
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            isAvailable: jest.fn().mockResolvedValue(true)
        } as unknown as jest.Mocked<LLMProvider>;

        pool = new ProviderConnectionPool(3); // maxSize = 3
    });

    describe('connection acquisition', () => {
        it('should acquire new connection when pool is empty', async () => {
            // Mock the createConnection method
            // @ts-ignore - accessing private method for testing
            jest.spyOn(pool as any, 'createConnection').mockResolvedValue(mockProvider);

            const acquired = await pool.acquire();
            expect(acquired).toBe(mockProvider);
            // @ts-ignore - accessing private field for testing
            expect(pool['connections'].length).toBe(1);
            // @ts-ignore - accessing private field for testing
            expect(pool['connections'][0].isActive).toBe(true);
        });

        it('should reuse available connection', async () => {
            // @ts-ignore - accessing private method for testing
            jest.spyOn(pool as any, 'createConnection').mockResolvedValue(mockProvider);

            const first = await pool.acquire();
            await pool.release(first);
            const second = await pool.acquire();

            expect(second).toBe(first);
            // @ts-ignore - accessing private method for testing
            expect(pool['createConnection']).toHaveBeenCalledTimes(1);
        });

        it('should wait for connection when pool is full', async () => {
            // @ts-ignore - accessing private method for testing
            jest.spyOn(pool as any, 'createConnection').mockResolvedValue(mockProvider);

            // Fill the pool
            const connections = await Promise.all([
                pool.acquire(),
                pool.acquire(),
                pool.acquire()
            ]);

            // Try to acquire another connection
            const acquirePromise = pool.acquire();

            // Release a connection after a delay
            setTimeout(() => {
                pool.release(connections[0]);
            }, 100);

            const acquired = await acquirePromise;
            expect(acquired).toBe(connections[0]);
        });
    });

    describe('connection release', () => {
        it('should mark connection as inactive on release', async () => {
            // @ts-ignore - accessing private method for testing
            jest.spyOn(pool as any, 'createConnection').mockResolvedValue(mockProvider);

            const connection = await pool.acquire();
            await pool.release(connection);

            // @ts-ignore - accessing private field for testing
            const pooledConnection = pool['connections'].find(c => c.provider === connection);
            expect(pooledConnection?.isActive).toBe(false);
        });

        it('should update lastUsed timestamp on release', async () => {
            // @ts-ignore - accessing private method for testing
            jest.spyOn(pool as any, 'createConnection').mockResolvedValue(mockProvider);

            const connection = await pool.acquire();
            const before = Date.now();
            await pool.release(connection);
            const after = Date.now();

            // @ts-ignore - accessing private field for testing
            const pooledConnection = pool['connections'].find(c => c.provider === connection);
            expect(pooledConnection?.lastUsed).toBeGreaterThanOrEqual(before);
            expect(pooledConnection?.lastUsed).toBeLessThanOrEqual(after);
        });
    });

    describe('health checks', () => {
        it('should return health status for all connections', async () => {
            // @ts-ignore - accessing private method for testing
            jest.spyOn(pool as any, 'createConnection').mockResolvedValue(mockProvider);

            await pool.acquire();
            await pool.acquire();

            const health = await pool.checkHealth();
            expect(health).toEqual({
                isHealthy: true,
                latency: expect.any(Number),
                timestamp: expect.any(Date),
                details: {
                    totalConnections: 2,
                    healthyConnections: 2,
                    results: expect.any(Array)
                }
            });
        });

        it('should handle failed health checks', async () => {
            mockProvider.isAvailable.mockRejectedValue(new Error('Health check failed'));
            // @ts-ignore - accessing private method for testing
            jest.spyOn(pool as any, 'createConnection').mockResolvedValue(mockProvider);

            await pool.acquire();
            const health = await pool.checkHealth();

            expect(health.isHealthy).toBe(false);
            expect(health.details.healthyConnections).toBe(0);
        });
    });

    describe('cleanup', () => {
        it('should disconnect all connections on dispose', async () => {
            // @ts-ignore - accessing private method for testing
            jest.spyOn(pool as any, 'createConnection').mockResolvedValue(mockProvider);

            await pool.acquire();
            await pool.acquire();

            await pool.dispose();

            expect(mockProvider.disconnect).toHaveBeenCalledTimes(2);
            // @ts-ignore - accessing private field for testing
            expect(pool['connections']).toHaveLength(0);
        });

        it('should handle disconnect errors gracefully', async () => {
            mockProvider.disconnect.mockRejectedValue(new Error('Disconnect failed'));
            // @ts-ignore - accessing private method for testing
            jest.spyOn(pool as any, 'createConnection').mockResolvedValue(mockProvider);

            await pool.acquire();
            await expect(pool.dispose()).resolves.not.toThrow();
        });
    });
});
