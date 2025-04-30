import * as vscode from 'vscode';
export interface SystemInfo {
    totalMemoryGB: number;
    freeDiskSpaceGB: number;
    cpuCores: number;
    cudaAvailable: boolean;
    cudaVersion: string | null;
}
export declare class SystemInfoService implements vscode.Disposable {
    private cachedInfo;
    private readonly outputChannel;
    constructor();
    getSystemInfo(): Promise<SystemInfo>;
    private getFreeDiskSpace;
    private getCUDAInfo;
    clearCache(): void;
    dispose(): void;
}
