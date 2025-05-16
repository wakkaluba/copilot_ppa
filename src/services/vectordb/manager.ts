// Restored from orphaned code. Updated for current workspace structure.
import { LoggerService } from './LoggerService';
import { ChromaClientService } from './services/ChromaClientService';
import { FaissProviderService } from './services/FaissProviderService';

export class VectorDatabaseManager {
    private providers: Map<string, any> = new Map();
    private activeProvider: any | null = null;
    private isEnabled = false;
    private logger: LoggerService;

    constructor(logger: LoggerService) {
        this.logger = logger;
        this.registerProvider(new ChromaClientService());
        this.registerProvider(new FaissProviderService());
    }

    public registerProvider(provider: any): void {
        this.providers.set(provider.constructor.name.toLowerCase(), provider);
    }

    public getProviders(): any[] {
        return Array.from(this.providers.values());
    }

    public getProvider(name: string): any | undefined {
        return this.providers.get(name.toLowerCase());
    }

    public getActiveProvider(): any | null {
        return this.activeProvider;
    }

    public setActiveProvider(name: string): void {
        const provider = this.getProvider(name);
        if (provider) {
            this.activeProvider = provider;
            this.isEnabled = true;
        } else {
            this.logger.error(`Provider ${name} not found.`);
        }
    }

    public isProviderEnabled(): boolean {
        return this.isEnabled;
    }
}
