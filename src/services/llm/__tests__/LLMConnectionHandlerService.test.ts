import { LLMConnectionError, LLMConnectionErrorCode } from '../errors';
import { LLMConnectionHandlerService } from '../services/LLMConnectionHandlerService';
import { ConnectionState, ILLMConnectionProvider, LLMProvider } from '../types';

describe('LLMConnectionHandlerService', () => {
    let handler: LLMConnectionHandlerService;
    let mockProvider: jest.Mocked<LLMProvider>;
    let mockConnection: jest.Mocked<ILLMConnectionProvider>;

    beforeEach(() => {
        mockProvider = {
            getName: jest.fn().mockReturnValue('test-provider'),
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            isAvailable: jest.fn().mockResolvedValue(true),
            getConfig: jest.fn().mockReturnValue({ name: 'test-provider' })
        } as unknown as jest.Mocked<LLMProvider>;

        mockConnection = {
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            getModelInfo: jest.fn().mockResolvedValue({ name: 'test-model' })
        } as unknown as jest.Mocked<ILLMConnectionProvider>;

        handler = new LLMConnectionHandlerService({
            maxRetries: 3,
            initialRetryDelay: 100,
            maxRetryDelay: 1000,
            connectionTimeout: 1000
        });
    });

    describe('connection lifecycle', () => {
        it('should initialize in disconnected state', () => {
            expect(handler.currentState).toBe(ConnectionState.DISCONNECTED);
            expect(handler.activeProvider).toBeNull();
        });

        it('should set active provider', async () => {
            const providerChangedListener = jest.fn();
            handler.on('providerChanged', providerChangedListener);

            await handler.setActiveProvider(mockProvider);

            expect(handler.activeProvider).toBe(mockProvider);
            expect(handler.activeProviderName).toBe('test-provider');
            expect(providerChangedListener).toHaveBeenCalledWith(mockProvider);
        });

        it('should establish connection with provider', async () => {
            await handler.setActiveProvider(mockProvider);

            const stateChangeListener = jest.fn();
            handler.on('stateChanged', stateChangeListener);

            await handler.connect(mockConnection);

            expect(mockConnection.connect).toHaveBeenCalledWith(
                expect.objectContaining({ provider: mockProvider })
            );
            expect(handler.currentState).toBe(ConnectionState.CONNECTED);
            expect(stateChangeListener).toHaveBeenCalledWith(ConnectionState.CONNECTED);
        });

        it('should handle disconnect', async () => {
            await handler.setActiveProvider(mockProvider);
            await handler.connect(mockConnection);

            const disconnectListener = jest.fn();
            handler.on('disconnected', disconnectListener);

            await handler.disconnect();

            expect(mockConnection.disconnect).toHaveBeenCalled();
            expect(handler.currentState).toBe(ConnectionState.DISCONNECTED);
            expect(disconnectListener).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should throw error when connecting without provider', async () => {
            await expect(handler.connect(mockConnection))
                .rejects
                .toThrow(new LLMConnectionError(
                    LLMConnectionErrorCode.ProviderNotFound,
                    'No active provider set'
                ));
        });

        it('should handle connection errors', async () => {
            const error = new Error('Connection failed');
            mockConnection.connect.mockRejectedValueOnce(error);

            await handler.setActiveProvider(mockProvider);

            const errorListener = jest.fn();
            handler.on('error', errorListener);

            await expect(handler.connect(mockConnection)).rejects.toThrow(error);

            expect(handler.currentState).toBe(ConnectionState.ERROR);
            expect(handler.lastError).toBe(error);
            expect(errorListener).toHaveBeenCalledWith(error);
        });

        it('should retry connection on failure if configured', async () => {
            const handler = new LLMConnectionHandlerService({
                maxRetries: 2,
                initialRetryDelay: 100,
                reconnectOnError: true
            });

            const error = new Error('Connection failed');
            mockConnection.connect
                .mockRejectedValueOnce(error)
                .mockResolvedValueOnce(undefined);

            await handler.setActiveProvider(mockProvider);
            await handler.connect(mockConnection);

            expect(mockConnection.connect).toHaveBeenCalledTimes(2);
            expect(handler.currentState).toBe(ConnectionState.CONNECTED);
        });
    });

    describe('connection status', () => {
        it('should return correct connection status', async () => {
            await handler.setActiveProvider(mockProvider);
            await handler.connect(mockConnection);

            const status = await handler.getConnectionStatus();
            expect(status).toEqual({
                state: ConnectionState.CONNECTED,
                provider: 'test-provider',
                modelInfo: { name: 'test-model' },
                error: undefined
            });
        });

        it('should update status on state changes', async () => {
            const statusListener = jest.fn();
            handler.on('statusChanged', statusListener);

            await handler.setActiveProvider(mockProvider);
            await handler.connect(mockConnection);
            await handler.disconnect();

            expect(statusListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    state: ConnectionState.DISCONNECTED
                })
            );
        });
    });

    describe('cleanup', () => {
        it('should clean up resources on disposal', async () => {
            await handler.setActiveProvider(mockProvider);
            await handler.connect(mockConnection);

            const removeAllListenersSpy = jest.spyOn(handler, 'removeAllListeners');

            await handler.dispose();

            expect(mockConnection.disconnect).toHaveBeenCalled();
            expect(removeAllListenersSpy).toHaveBeenCalled();
            expect(handler.currentState).toBe(ConnectionState.DISCONNECTED);
        });
    });
});
