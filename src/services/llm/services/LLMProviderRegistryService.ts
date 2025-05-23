import { EventEmitter } from 'events';
import { ILLMProvider } from '../../../llm/llm-provider';

export class LLMProviderRegistryService extends EventEmitter {
  private providers = new Map<string, ILLMProvider>();

  public registerProvider(name: string, provider: ILLMProvider): void {
    this.providers.set(name, provider);
    provider.on('statusChanged', (status) => {
      this.emit('providerStatusChanged', { name, status });
    });
  }

  public getProvider(name: string): ILLMProvider | undefined {
    return this.providers.get(name);
  }

  public getProviders(): Map<string, ILLMProvider> {
    return this.providers;
  }
}
