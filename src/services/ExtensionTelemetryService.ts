import { injectable } from 'inversify';
import * as vscode from 'vscode';

interface ExtensionAccessEvent {
    extensionId: string;
    timestamp: number;
    granted: boolean;
    reason?: string;
}

interface ExtensionConfigEvent {
    extensionId: string;
    timestamp: number;
    section: string;
    successful: boolean;
    error?: string;
}

interface ExtensionInstallEvent {
    extensionId: string;
    timestamp: number;
    successful: boolean;
    error?: string;
}

@injectable()
export class ExtensionTelemetryService {
    private readonly accessEvents: ExtensionAccessEvent[] = [];
    private readonly configEvents: ExtensionConfigEvent[] = [];
    private readonly installEvents: ExtensionInstallEvent[] = [];
    private readonly storageKey = 'extension-telemetry';
    private readonly maxEvents = 100;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.loadFromStorage();
    }

    /**
     * Record an extension access attempt
     */
    public recordAccessAttempt(extensionId: string, granted: boolean, reason?: string): void {
        const event: ExtensionAccessEvent = {
            extensionId,
            timestamp: Date.now(),
            granted,
            reason
        };

        this.accessEvents.unshift(event);
        if (this.accessEvents.length > this.maxEvents) {
            this.accessEvents.pop();
        }

        this.persistToStorage();
    }

    /**
     * Record a configuration change attempt
     */
    public recordConfigChange(extensionId: string, section: string, successful: boolean, error?: string): void {
        const event: ExtensionConfigEvent = {
            extensionId,
            timestamp: Date.now(),
            section,
            successful,
            error
        };

        this.configEvents.unshift(event);
        if (this.configEvents.length > this.maxEvents) {
            this.configEvents.pop();
        }

        this.persistToStorage();
    }

    /**
     * Record an extension installation attempt
     */
    public recordInstallation(extensionId: string, successful: boolean, error?: string): void {
        const event: ExtensionInstallEvent = {
            extensionId,
            timestamp: Date.now(),
            successful,
            error
        };

        this.installEvents.unshift(event);
        if (this.installEvents.length > this.maxEvents) {
            this.installEvents.pop();
        }

        this.persistToStorage();
    }

    /**
     * Get access history for an extension
     */
    public getAccessHistory(extensionId: string): ExtensionAccessEvent[] {
        return this.accessEvents.filter(event => event.extensionId === extensionId);
    }

    /**
     * Get configuration history for an extension
     */
    public getConfigHistory(extensionId: string): ExtensionConfigEvent[] {
        return this.configEvents.filter(event => event.extensionId === extensionId);
    }

    /**
     * Get installation history for an extension
     */
    public getInstallHistory(extensionId: string): ExtensionInstallEvent[] {
        return this.installEvents.filter(event => event.extensionId === extensionId);
    }

    /**
     * Check if an extension has had suspicious activity
     */
    public hasSuspiciousActivity(extensionId: string): boolean {
        const now = Date.now();
        const recentTimeWindow = 1000 * 60 * 60; // 1 hour

        // Get recent events
        const recentAccess = this.accessEvents
            .filter(e => e.extensionId === extensionId && now - e.timestamp < recentTimeWindow);
        const recentConfig = this.configEvents
            .filter(e => e.extensionId === extensionId && now - e.timestamp < recentTimeWindow);

        // Check for suspicious patterns
        const tooManyAccessAttempts = recentAccess.length > 10;
        const tooManyFailedAccess = recentAccess.filter(e => !e.granted).length > 5;
        const tooManyConfigChanges = recentConfig.length > 20;
        const tooManyFailedConfigs = recentConfig.filter(e => !e.successful).length > 10;

        return tooManyAccessAttempts || tooManyFailedAccess || tooManyConfigChanges || tooManyFailedConfigs;
    }

    private loadFromStorage(): void {
        const data = this.context.globalState.get<{
            access: ExtensionAccessEvent[];
            config: ExtensionConfigEvent[];
            install: ExtensionInstallEvent[];
        }>(this.storageKey);

        if (data) {
            this.accessEvents.push(...data.access);
            this.configEvents.push(...data.config);
            this.installEvents.push(...data.install);
        }
    }

    private async persistToStorage(): Promise<void> {
        const data = {
            access: this.accessEvents,
            config: this.configEvents,
            install: this.installEvents
        };

        try {
            await this.context.globalState.update(this.storageKey, data);
        } catch (error: unknown) {
            console.error('Failed to persist extension telemetry:', error instanceof Error ? error.message : String(error));
        }
    }
}
