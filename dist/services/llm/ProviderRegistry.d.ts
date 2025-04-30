import { EventEmitter } from 'events';
import { ProviderStatus, ProviderCapabilities } from './interfaces';
/**
 * Provider registration information
 */
interface ProviderInfo {
    id: string;
    name: string;
    version: string;
    capabilities: ProviderCapabilities;
    status: ProviderStatus;
    priority: number;
    metadata: Record<string, unknown>;
}
/**
 * Provider registration options
 */
interface ProviderRegistrationOptions {
    name: string;
    version: string;
    capabilities: ProviderCapabilities;
    priority?: number;
    metadata?: Record<string, unknown>;
}
/**
 * Manages LLM provider registration and discovery
 */
export declare class ProviderRegistry extends EventEmitter {
    private static instance;
    private providers;
    private priorityQueue;
    private constructor();
    static getInstance(): ProviderRegistry;
    /**
     * Register a new provider
     */
    registerProvider(providerId: string, options: ProviderRegistrationOptions): void;
    /**
     * Update provider status
     */
    updateProviderStatus(providerId: string, status: ProviderStatus): void;
    /**
     * Get provider information
     */
    getProviderInfo(providerId: string): ProviderInfo | undefined;
    /**
     * Get all registered providers
     */
    getAllProviders(): ProviderInfo[];
    /**
     * Get providers with specific capabilities
     */
    getProvidersWithCapability(capability: keyof ProviderCapabilities): ProviderInfo[];
    /**
     * Get next available provider by priority
     */
    getNextAvailableProvider(): ProviderInfo | undefined;
    /**
     * Update provider priority
     */
    updateProviderPriority(providerId: string, priority: number): void;
    /**
     * Update provider metadata
     */
    updateProviderMetadata(providerId: string, metadata: Record<string, unknown>): void;
    /**
     * Update provider capabilities
     */
    updateProviderCapabilities(providerId: string, capabilities: Partial<ProviderCapabilities>): void;
    /**
     * Unregister a provider
     */
    unregisterProvider(providerId: string): void;
    private updatePriorityQueue;
    dispose(): void;
}
export {};
