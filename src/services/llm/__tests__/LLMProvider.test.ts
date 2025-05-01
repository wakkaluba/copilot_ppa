import { BaseLLMProvider } from '../BaseLLMProvider';
import { ConnectionState, ProviderConfig } from '../types';

class TestLLMProvider extends BaseLLMProvider {
    constructor(config: ProviderConfig) {
        super(config);
    }

    async connect(): Promise<void> {
        this.connectionState = ConnectionState.CONNECTED;
        this.emit('connected');
    }

    async disconnect(): Promise<void> {
        this.connectionState = ConnectionState.DISCONNECTED;
        this.emit('disconnected');
    }

    async isAvailable(): Promise<boolean> {
        return this.connectionState === ConnectionState.CONNECTED;
    }

    getName(): string {
        return this.config.name;
    }
}

describe('LLMProvider', () => {
    let provider: TestLLMProvider;
    const mockConfig: ProviderConfig = {
        name: 'test-provider',
        apiEndpoint: 'http://localhost:11434',
        defaultModel: 'test-model',
        id: 'test-id'
    };

    beforeEach(() => {
        provider = new TestLLMProvider(mockConfig);
    });

    describe('connection management', () => {
        it('should initialize in disconnected state', () => {
            expect(provider.getConnectionState()).toBe(ConnectionState.DISCONNECTED);
        });

        it('should connect successfully', async () => {
            const connectListener = jest.fn();
            provider.on('connected', connectListener);

            await provider.connect();

            expect(provider.getConnectionState()).toBe(ConnectionState.CONNECTED);
            expect(connectListener).toHaveBeenCalled();
        });

        it('should disconnect successfully', async () => {
            const disconnectListener = jest.fn();
            provider.on('disconnected', disconnectListener);

            await provider.connect();
            await provider.disconnect();

            expect(provider.getConnectionState()).toBe(ConnectionState.DISCONNECTED);
            expect(disconnectListener).toHaveBeenCalled();
        });

        it('should report availability correctly', async () => {
            expect(await provider.isAvailable()).toBe(false);

            await provider.connect();
            expect(await provider.isAvailable()).toBe(true);

            await provider.disconnect();
            expect(await provider.isAvailable()).toBe(false);
        });
    });

    describe('configuration', () => {
        it('should store and return config correctly', () => {
            expect(provider.getConfig()).toEqual(mockConfig);
        });

        it('should return correct name', () => {
            expect(provider.getName()).toBe(mockConfig.name);
        });

        it('should update config', () => {
            const newConfig = { ...mockConfig, name: 'updated-name' };
            provider.updateConfig(newConfig);
            expect(provider.getConfig()).toEqual(newConfig);
        });
    });

    describe('error handling', () => {
        it('should handle connection errors', async () => {
            const errorProvider = new TestLLMProvider(mockConfig);
            const mockError = new Error('Connection failed');

            // Override connect to simulate error
            jest.spyOn(errorProvider as any, 'connect').mockRejectedValue(mockError);

            const errorListener = jest.fn();
            errorProvider.on('error', errorListener);

            await expect(errorProvider.connect()).rejects.toThrow(mockError);
            expect(errorListener).toHaveBeenCalledWith(mockError);
            expect(errorProvider.getConnectionState()).toBe(ConnectionState.ERROR);
        });
    });

    describe('event handling', () => {
        it('should emit state change events', async () => {
            const stateChangeListener = jest.fn();
            provider.on('stateChanged', stateChangeListener);

            await provider.connect();
            expect(stateChangeListener).toHaveBeenCalledWith(ConnectionState.CONNECTED);

            await provider.disconnect();
            expect(stateChangeListener).toHaveBeenCalledWith(ConnectionState.DISCONNECTED);
        });

        it('should clean up event listeners on disposal', () => {
            const listener = jest.fn();
            provider.on('stateChanged', listener);

            provider.dispose();

            // @ts-ignore - accessing EventEmitter internals for testing
            expect(provider.listenerCount('stateChanged')).toBe(0);
        });
    });
});
