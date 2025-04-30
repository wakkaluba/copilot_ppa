export interface PanelState {
    isAccessEnabled: boolean;
    lastProvider?: string;
    lastCreatedRepo?: string;
    errorMessage?: string;
}
export declare class RepositoryPanelStateService {
    private state;
    private readonly eventEmitter;
    getAccessState(): boolean;
    setAccessEnabled(enabled: boolean): void;
    setLastProvider(provider: string): void;
    setLastCreatedRepo(repoUrl: string): void;
    setErrorMessage(message?: string): void;
    getState(): PanelState;
    onStateChanged(listener: (state: PanelState) => void): void;
    clearState(): void;
}
