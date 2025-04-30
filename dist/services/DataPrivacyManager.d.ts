export declare class DataPrivacyManager {
    private static instance;
    private workspaceManager;
    private storagePath;
    private encryptionKey;
    private constructor();
    static getInstance(): DataPrivacyManager;
    storeConversation(id: string, data: any): Promise<void>;
    loadConversation(id: string): Promise<any>;
    cleanSensitiveData(): Promise<void>;
    validateDataPrivacy(data: any): boolean;
    private getOrCreateEncryptionKey;
    private encrypt;
    private decrypt;
    private getExtensionPath;
}
