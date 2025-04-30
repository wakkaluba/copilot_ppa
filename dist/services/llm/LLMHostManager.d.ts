import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ProviderConfig } from './validators/ProviderConfigValidator';
export interface Host {
    id: string;
    name: string;
    url: string;
    isAvailable: boolean;
    lastCheck: number;
    latency?: number;
    status: HostStatus;
    error?: string;
    apiVersion?: string;
    supportsStreaming: boolean;
}
export declare enum HostStatus {
    Unknown = "unknown",
    Available = "available",
    Unavailable = "unavailable",
    Error = "error"
}
export interface HostCheckResult {
    isAvailable: boolean;
    latency?: number;
    error?: string;
    apiVersion?: string;
    supportsStreaming?: boolean;
}
export declare class LLMHostManager extends EventEmitter implements vscode.Disposable {
    private hosts;
    private checkIntervals;
    private defaultCheckInterval;
    constructor();
    /**
     * Add a new LLM host
     * @param id Unique identifier for the host
     * @param name Display name for the host
     * @param url Base URL for the host's API
     * @returns The created host object
     */
    addHost(id: string, name: string, url: string): Host;
    /**
     * Add a host from provider configuration
     * @param config Provider configuration
     * @returns The created host object
     */
    addHostFromConfig(config: ProviderConfig): Host;
    /**
     * Get a host by ID
     * @param id Host ID
     * @returns The host object or undefined if not found
     */
    getHost(id: string): Host | undefined;
    /**
     * Get all registered hosts
     * @returns Array of all hosts
     */
    getAllHosts(): Host[];
    /**
     * Remove a host
     * @param id Host ID to remove
     * @returns True if the host was removed
     */
    removeHost(id: string): boolean;
    /**
     * Check if a host is available
     * @param id Host ID to check
     * @returns Promise resolving to the check result
     */
    checkHost(id: string): Promise<HostCheckResult>;
    /**
     * Start periodic checking of a host
     * @param id Host ID to check
     * @param intervalMs Interval in milliseconds between checks
     */
    startHostCheck(id: string, intervalMs?: number): void;
    /**
     * Stop periodic checking of a host
     * @param id Host ID to stop checking
     */
    stopHostCheck(id: string): void;
    /**
     * Update a host's configuration
     * @param id Host ID to update
     * @param updates Partial host updates
     * @returns The updated host
     */
    updateHost(id: string, updates: Partial<Host>): Host;
    /**
     * Get all available hosts
     * @returns Array of available hosts
     */
    getAvailableHosts(): Host[];
    /**
     * Set the default check interval for all hosts
     * @param intervalMs Interval in milliseconds
     */
    setDefaultCheckInterval(intervalMs: number): void;
    /**
     * Start checking all hosts
     */
    startCheckingAllHosts(): void;
    /**
     * Stop checking all hosts
     */
    stopCheckingAllHosts(): void;
    private simulateHostCheck;
    private updateHostStatus;
    dispose(): void;
}
