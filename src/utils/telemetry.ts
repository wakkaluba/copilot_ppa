import * as vscode from 'vscode';
import { ITelemetryService } from '../services/interfaces';

export class TelemetryService implements ITelemetryService {
    private readonly _reporter: vscode.TelemetryLogger;

    constructor() {
        this._reporter = vscode.env.createTelemetryLogger({
            sendEventData: async (eventName: string, data?: Record<string, any>) => {
                console.log(`[Telemetry] Event: ${eventName}`, data);
            },
            sendErrorData: async (error: Error, data?: Record<string, any>) => {
                console.error(`[Telemetry] Error: ${error.message}`, data);
            }
        });
    }

    async initialize(): Promise<void> {
        return Promise.resolve();
    }

    trackEvent(eventName: string, properties?: { [key: string]: string }): void {
        this._reporter.logUsage(eventName, properties);
    }

    trackError(error: Error, properties?: { [key: string]: string }): void {
        this._reporter.logError(error, properties);
    }

    dispose(): void {
        this._reporter.dispose();
    }
}