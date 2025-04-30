import { ITelemetryService } from '../services/interfaces';
export declare class TelemetryService implements ITelemetryService {
    private readonly _reporter;
    constructor();
    initialize(): Promise<void>;
    trackEvent(eventName: string, properties?: {
        [key: string]: string;
    }): void;
    trackError(error: Error, properties?: {
        [key: string]: string;
    }): void;
    dispose(): void;
}
