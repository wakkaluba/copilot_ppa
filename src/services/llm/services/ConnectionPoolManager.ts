import { EventEmitter } from 'events';
import { ILogger } from '../../../types';
import { LLMConnectionError } from '../errors';
import { LLMProvider } from '../llmProvider';
import { ProviderConfig } from '../validators/ProviderConfigValidator';

interface PoolConnection {
  provider: LLMProvider;
  inUse: boolean;
  lastUsed: number;
}

const fallbackLogger: ILogger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  critical: () => {},
};

/**
 * Manages a pool of LLMProvider connections for efficient reuse and resource management.
 */
export class ConnectionPoolManager extends EventEmitter {
  private pools = new Map<string, PoolConnection[]>();
  private maxPoolSize = 5;
  private idleTimeout = 5 * 60 * 1000; // 5 minutes
  private logger: ILogger;

  constructor(logger?: ILogger) {
    super();
    this.logger = logger || fallbackLogger;
    this.startIdleCleanup();
  }

  /**
   * Initializes a provider pool for the given providerId.
   * @param providerId The unique provider identifier.
   * @param config Provider configuration.
   */
  public async initializeProvider(providerId: string, config: ProviderConfig): Promise<void> {
    if (!this.pools.has(providerId)) {
      this.pools.set(providerId, []);
      this.logger.info(`Initialized provider pool: ${providerId}`);
    }
  }

  /**
   * Acquires a connection from the pool, or creates a new one if possible.
   * @param providerId The provider identifier.
   * @returns The acquired LLMProvider instance.
   * @throws LLMConnectionError if the provider is not initialized or pool is exhausted.
   */
  public async acquireConnection(providerId: string): Promise<LLMProvider> {
    const pool = this.pools.get(providerId);
    if (!pool) {
      this.logger.error(`Provider not initialized: ${providerId}`);
      throw new LLMConnectionError('NOT_INITIALIZED', 'Provider not initialized', { providerId });
    }

    // Try to find an available connection
    const availableConnection = pool.find((conn) => !conn.inUse);
    if (availableConnection) {
      availableConnection.inUse = true;
      availableConnection.lastUsed = Date.now();
      this.logger.info(`Reusing existing connection: ${providerId}`);
      return availableConnection.provider;
    }

    // Check if we can create a new connection
    if (pool.length < this.maxPoolSize) {
      const provider = pool[0]?.provider;
      if (!provider) {
        this.logger.error(`No provider template available: ${providerId}`);
        throw new LLMConnectionError('NO_PROVIDER_TEMPLATE', 'No provider template available', {
          providerId,
        });
      }
      // Shallow clone for demonstration; real implementation may require deep clone or factory
      const newProvider = { ...provider } as LLMProvider;
      const connection: PoolConnection = {
        provider: newProvider,
        inUse: true,
        lastUsed: Date.now(),
      };
      pool.push(connection);
      this.logger.info(`Created new provider connection: ${providerId}`);
      return newProvider;
    }

    this.logger.error(`Connection pool exhausted: ${providerId}`);
    throw new LLMConnectionError('POOL_EXHAUSTED', 'Connection pool exhausted', { providerId });
  }

  /**
   * Releases a connection back to the pool.
   * @param providerId The provider identifier.
   * @param provider The LLMProvider instance to release.
   */
  public async releaseConnection(providerId: string, provider: LLMProvider): Promise<void> {
    const pool = this.pools.get(providerId);
    if (!pool) {
      this.logger.warn(`Attempted to release connection for uninitialized provider: ${providerId}`);
      return;
    }
    const connection = pool.find((conn) => conn.provider === provider);
    if (connection) {
      connection.inUse = false;
      connection.lastUsed = Date.now();
      this.logger.info(`Released connection: ${providerId}`);
    } else {
      this.logger.warn(`Attempted to release unknown connection: ${providerId}`);
    }
  }

  /**
   * Starts periodic cleanup of idle connections.
   */
  private startIdleCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [providerId, pool] of this.pools) {
        const activeConnections = pool.filter((conn) => {
          const isIdle = !conn.inUse && now - conn.lastUsed > this.idleTimeout;
          if (isIdle) {
            // No dispose method on LLMProvider interface; just log
            this.logger.info(`Idle connection would be disposed: ${providerId}`);
          }
          return !isIdle;
        });
        if (activeConnections.length !== pool.length) {
          this.pools.set(providerId, activeConnections);
        }
      }
    }, this.idleTimeout);
  }

  /**
   * Disposes all connections and clears the pool.
   */
  public async dispose(): Promise<void> {
    for (const pool of this.pools.values()) {
      for (const conn of pool) {
        try {
          await conn.provider.disconnect?.();
        } catch (err) {
          this.logger.error(
            `Error disconnecting provider: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
        // No dispose method on LLMProvider interface
      }
    }
    this.pools.clear();
    this.removeAllListeners();
    this.logger.info('Disposed all connections and cleared pool');
  }
}
