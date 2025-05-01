import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMProvider } from '../llm-provider';
import {
    IProviderCapabilities,
    IProviderStatus,
    ProviderState
} from '../types';

export interface IProviderRegistration {
    id: string;
    provider: ILLMProvider;
    status: IProviderStatus;
    capabilities?: IProviderCapabilities;
}

export interface IProviderInitOptions {
    timeout?: number;
    retryAttempts?: number;
    validateCapabilities?: boolean;
}

@injectable()
export class LLMProviderManager extends EventEmitter {
    private readonly providers = new Map<string, IProviderRegistration>();
    private readonly defaultTimeout = 30000; // 30 seconds

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
    }

    public async registerProvider(
        provider: ILLMProvider,
        options: IProviderInitOptions = {}
    ): Promise<void> {
        try {
            if (this.providers.has(provider.id)) {
                throw new Error(`Provider ${provider.id} is already registered`);
            }

            const registration: IProviderRegistration = {
                id: provider.id,
                provider,
                status: {
                    state: ProviderState.Registered
                }
            };

            this.providers.set(provider.id, registration);
            await this.initializeProvider(provider.id, options);

            this.emit('providerRegistered', { providerId: provider.id });
        } catch (error) {
            this.handleError(`Failed to register provider ${provider.id}`, error as Error);
            throw error;
        }
    }

    private async initializeProvider(
        providerId: string,
        options: IProviderInitOptions
    ): Promise<void> {
        const registration = this.getProviderRegistration(providerId);
        registration.status.state = ProviderState.Initializing;

        try {
            const timeout = options.timeout || this.defaultTimeout;
            const provider = registration.provider;

            // Initialize with timeout
            await Promise.race([
                provider.connect(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Provider initialization timed out')), timeout)
                )
            ]);

            if (options.validateCapabilities) {
                registration.capabilities = await provider.getCapabilities();
            }

            registration.status.state = ProviderState.Active;
            this.emit('providerInitialized', { providerId });
        } catch (error) {
            registration.status = {
                state: ProviderState.Error,
                error: error as Error
            };
            throw error;
        }
    }

    public async getProvider(providerId: string): Promise<ILLMProvider> {
        const registration = this.getProviderRegistration(providerId);
        return registration.provider;
    }

    public async getProviderStatus(providerId: string): Promise<IProviderStatus> {
        const registration = this.getProviderRegistration(providerId);
        return { ...registration.status };
    }

    public getRegisteredProviders(): string[] {
        return Array.from(this.providers.keys());
    }

    public async deactivateProvider(providerId: string): Promise<void> {
        try {
            const registration = this.getProviderRegistration(providerId);
            registration.status.state = ProviderState.Deactivating;

            await registration.provider.disconnect();

            registration.status.state = ProviderState.Inactive;
            this.emit('providerDeactivated', { providerId });
        } catch (error) {
            this.handleError(`Failed to deactivate provider ${providerId}`, error as Error);
            throw error;
        }
    }

    public async unregisterProvider(providerId: string): Promise<void> {
        try {
            const registration = this.getProviderRegistration(providerId);

            if (registration.status.state === ProviderState.Active) {
                await this.deactivateProvider(providerId);
            }

            this.providers.delete(providerId);
            this.emit('providerUnregistered', { providerId });
        } catch (error) {
            this.handleError(`Failed to unregister provider ${providerId}`, error as Error);
            throw error;
        }
    }

    private getProviderRegistration(providerId: string): IProviderRegistration {
        const registration = this.providers.get(providerId);
        if (!registration) {
            throw new Error(`Provider ${providerId} not found`);
        }
        return registration;
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[LLMProviderManager]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        // Deactivate all providers
        Promise.all(
            Array.from(this.providers.keys()).map(id =>
                this.deactivateProvider(id).catch(error =>
                    this.logger.error(`Failed to deactivate provider ${id}`, error)
                )
            )
        ).finally(() => {
            this.providers.clear();
            this.removeAllListeners();
        });
    }
}
