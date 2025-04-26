import { EventEmitter } from 'events';

export interface PanelState {
    isAccessEnabled: boolean;
    lastProvider?: string;
    lastCreatedRepo?: string;
    errorMessage?: string;
}

export class RepositoryPanelStateService {
    private state: PanelState = {
        isAccessEnabled: false,
        errorMessage: undefined
    };
    private readonly eventEmitter = new EventEmitter();

    public getAccessState(): boolean {
        return this.state.isAccessEnabled;
    }

    public setAccessEnabled(enabled: boolean): void {
        this.state.isAccessEnabled = enabled;
        this.eventEmitter.emit('stateChanged', this.state);
    }

    public setLastProvider(provider: string): void {
        this.state.lastProvider = provider;
        this.eventEmitter.emit('stateChanged', this.state);
    }

    public setLastCreatedRepo(repoUrl: string): void {
        this.state.lastCreatedRepo = repoUrl;
        this.eventEmitter.emit('stateChanged', this.state);
    }

    public setErrorMessage(message?: string): void {
        this.state.errorMessage = message;
        this.eventEmitter.emit('stateChanged', this.state);
    }

    public getState(): PanelState {
        return { ...this.state };
    }

    public onStateChanged(listener: (state: PanelState) => void): void {
        this.eventEmitter.on('stateChanged', listener);
    }

    public clearState(): void {
        this.state = {
            isAccessEnabled: false,
            errorMessage: undefined
        };
        this.eventEmitter.emit('stateChanged', this.state);
    }
}