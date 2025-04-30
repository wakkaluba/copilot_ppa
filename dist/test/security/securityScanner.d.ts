export declare class SecurityScanner {
    private keyCache;
    private readonly MAX_CACHE_SIZE;
    constructor();
    checkFilePermissions(): Promise<{
        success: boolean;
    }>;
    checkDataEncryption(data: string): Promise<string>;
    private getOrCreateKey;
    checkAPIEndpoints(): Promise<{
        usesHTTPS: boolean;
        hasAuthentication: boolean;
    }>;
    validateInput(input: string): Promise<{
        hasSecurityRisks: boolean;
    }>;
    checkResourceAccess(): Promise<{
        hasProperIsolation: boolean;
    }>;
    dispose(): void;
}
