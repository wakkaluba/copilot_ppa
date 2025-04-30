export declare class TrustManager {
    private static instance;
    private logger;
    private constructor();
    static getInstance(): TrustManager;
    isWorkspaceTrusted(): boolean;
    requestWorkspaceTrust(): Promise<boolean>;
    requireTrust(message?: string): Promise<boolean>;
}
