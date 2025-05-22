import { ILLMModelInfo } from '../../../llm/types';
import { ProviderError } from '../errors';
import { ProviderConfig } from '../validators/ProviderConfigValidator';

export enum ProviderState {
  Unknown = 'unknown',
  Registered = 'registered',
  Initializing = 'initializing',
  Active = 'active',
  Inactive = 'inactive',
  Deactivating = 'deactivating',
}

export interface IProvider {
  id: string;
  name: string;
  description?: string;
  providerType: string;
  modelInfo?: ILLMModelInfo;
  state: ProviderState;
  config: ProviderConfig;
  error?: ProviderError;
}

export function setProviderState(provider: IProvider, state: ProviderState): void {
  provider.state = state;
}

export function setProviderError(provider: IProvider, error: ProviderError): void {
  provider.error = error;
}

export function getId(provider: IProvider): string {
  return provider.id;
}

export interface IHealthCheckResult {
  isHealthy: boolean;
  latency: number;
  timestamp: number;
  error?: Error;
}

export class BaseLLMProvider {
  protected id: string;
  protected name: string;
  protected config: ProviderConfig;
  protected state: ProviderState = ProviderState.Unknown;
  protected error?: ProviderError;

  constructor(id: string, name: string, config: ProviderConfig) {
    this.id = id;
    this.name = name;
    this.config = config;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getState(): ProviderState {
    return this.state;
  }

  public setProviderState(state: ProviderState): void {
    this.state = state;
  }

  public setProviderError(error: Error): void {
    this.error = error as ProviderError;
  }
}
