import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { ProviderError } from './errors';
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

export enum HostStatus {
    Unknown = 'unknown',
    Available = 'available',
    Unavailable = 'unavailable',
    Error = 'error'
}

export interface HostCheckResult {
    isAvailable: boolean;
    latency?: number;
    error?: string;
    apiVersion?: string;
    supportsStreaming?: boolean;
}

export class LLMHostManager extends EventEmitter implements vscode.Disposable {
    private hosts: Map<string, Host> = new Map();
    private checkIntervals: Map<string, NodeJS.Timer> = new Map();
    private defaultCheckInterval: number = 60000; // 1 minute

    constructor() {
        super();
    }

    /**
     * Add a new LLM host
     * @param id Unique identifier for the host
     * @param name Display name for the host
     * @param url Base URL for the host's API
     * @returns The created host object
     */
    addHost(id: string, name: string, url: string): Host {
        if (this.hosts.has(id)) {
            throw new ProviderError(`Host with ID ${id} already exists`, id);
        }

        const host: Host = {
            id,
            name,
            url,
            isAvailable: false,
            lastCheck: 0,
            status: HostStatus.Unknown,
            supportsStreaming: false
        };

        this.hosts.set(id, host);
        this.emit('hostAdded', host);

        return host;
    }

    /**
     * Add a host from provider configuration
     * @param config Provider configuration
     * @returns The created host object
     */
    addHostFromConfig(config: ProviderConfig): Host {
        return this.addHost(config.id, config.name, config.apiEndpoint);
    }

    /**
     * Get a host by ID
     * @param id Host ID
     * @returns The host object or undefined if not found
     */
    getHost(id: string): Host | undefined {
        return this.hosts.get(id);
    }

    /**
     * Get all registered hosts
     * @returns Array of all hosts
     */
    getAllHosts(): Host[] {
        return Array.from(this.hosts.values());
    }

    /**
     * Remove a host
     * @param id Host ID to remove
     * @returns True if the host was removed
     */
    removeHost(id: string): boolean {
        if (!this.hosts.has(id)) {
            return false;
        }

        // Stop any active check interval
        this.stopHostCheck(id);

        const host = this.hosts.get(id)!;
        this.hosts.delete(id);

        this.emit('hostRemoved', host);
        return true;
    }

    /**
     * Check if a host is available
     * @param id Host ID to check
     * @returns Promise resolving to the check result
     */
    async checkHost(id: string): Promise<HostCheckResult> {
        const host = this.hosts.get(id);
        if (!host) {
            throw new ProviderError(`Host with ID ${id} not found`, id);
        }

        const startTime = Date.now();
        let result: HostCheckResult = {
            isAvailable: false
        };

        try {
            // This would typically be an API call to check the host
            // For now, we'll simulate the check
            const isAvailable = await this.simulateHostCheck(host.url);
            const endTime = Date.now();

            result = {
                isAvailable,
                latency: endTime - startTime,
                apiVersion: "1.0", // This would come from the actual API response
                supportsStreaming: true // This would be determined from the API response
            };
        } catch (error) {
            result.isAvailable = false;
            result.error = error instanceof Error ? error.message : String(error);
        }

        // Update the host status
        this.updateHostStatus(id, result);

        return result;
    }

    /**
     * Start periodic checking of a host
     * @param id Host ID to check
     * @param intervalMs Interval in milliseconds between checks
     */
    startHostCheck(id: string, intervalMs: number = this.defaultCheckInterval): void {
        if (!this.hosts.has(id)) {
            throw new ProviderError(`Host with ID ${id} not found`, id);
        }

        // Clear any existing interval
        this.stopHostCheck(id);

        // Set up a new check interval
        const timer = setInterval(() => {
            this.checkHost(id).catch(error => {
                console.error(`Error checking host ${id}:`, error);
            });
        }, intervalMs);

        this.checkIntervals.set(id, timer);

        // Run an immediate check
        this.checkHost(id).catch(error => {
            console.error(`Error checking host ${id}:`, error);
        });
    }

    /**
     * Stop periodic checking of a host
     * @param id Host ID to stop checking
     */
    stopHostCheck(id: string): void {
        const interval = this.checkIntervals.get(id);
        if (interval) {
            clearInterval(interval);
            this.checkIntervals.delete(id);
        }
    }

    /**
     * Update a host's configuration
     * @param id Host ID to update
     * @param updates Partial host updates
     * @returns The updated host
     */
    updateHost(id: string, updates: Partial<Host>): Host {
        const host = this.hosts.get(id);
        if (!host) {
            throw new ProviderError(`Host with ID ${id} not found`, id);
        }

        // Don't allow changing the ID
        const { id: _, ...validUpdates } = updates;

        const updatedHost = {
            ...host,
            ...validUpdates
        };

        this.hosts.set(id, updatedHost);
        this.emit('hostUpdated', updatedHost);

        return updatedHost;
    }

    /**
     * Get all available hosts
     * @returns Array of available hosts
     */
    getAvailableHosts(): Host[] {
        return Array.from(this.hosts.values()).filter(host => host.isAvailable);
    }

    /**
     * Set the default check interval for all hosts
     * @param intervalMs Interval in milliseconds
     */
    setDefaultCheckInterval(intervalMs: number): void {
        if (intervalMs < 5000) {
            throw new ProviderError('Check interval must be at least 5000ms (5 seconds)', '');
        }

        this.defaultCheckInterval = intervalMs;
    }

    /**
     * Start checking all hosts
     */
    startCheckingAllHosts(): void {
        for (const host of this.hosts.keys()) {
            this.startHostCheck(host);
        }
    }

    /**
     * Stop checking all hosts
     */
    stopCheckingAllHosts(): void {
        for (const interval of this.checkIntervals.values()) {
            clearInterval(interval);
        }
        this.checkIntervals.clear();
    }

    private async simulateHostCheck(url: string): Promise<boolean> {
        // In a real implementation, this would make an actual HTTP request to check the host
        // For testing purposes, we'll simulate a success with occasional failures
        return new Promise((resolve) => {
            setTimeout(() => {
                // 90% success rate
                const isAvailable = Math.random() < 0.9;
                resolve(isAvailable);
            }, Math.random() * 100 + 50); // Random delay between 50-150ms
        });
    }

    private updateHostStatus(id: string, result: HostCheckResult): void {
        const host = this.hosts.get(id);
        if (!host) {
            return;
        }

        const previousStatus = host.status;
        const previousAvailability = host.isAvailable;

        // Update the host with check results
        host.isAvailable = result.isAvailable;
        host.lastCheck = Date.now();

        if (result.latency !== undefined) {
            host.latency = result.latency;
        }

        if (result.apiVersion !== undefined) {
            host.apiVersion = result.apiVersion;
        }

        if (result.supportsStreaming !== undefined) {
            host.supportsStreaming = result.supportsStreaming;
        }

        if (result.isAvailable) {
            host.status = HostStatus.Available;
            host.error = undefined;
        } else {
            host.status = result.error ? HostStatus.Error : HostStatus.Unavailable;
            host.error = result.error;
        }

        // Emit status change events if needed
        if (previousStatus !== host.status) {
            this.emit('hostStatusChanged', host);
        }

        if (previousAvailability !== host.isAvailable) {
            this.emit(host.isAvailable ? 'hostBecameAvailable' : 'hostBecameUnavailable', host);
        }
    }

    dispose(): void {
        this.stopCheckingAllHosts();
        this.removeAllListeners();
    }
}
