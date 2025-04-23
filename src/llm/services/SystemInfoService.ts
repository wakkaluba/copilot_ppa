import * as os from 'os';
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SystemInfo {
    totalMemoryGB: number;
    freeDiskSpaceGB: number;
    cpuCores: number;
    cudaAvailable: boolean;
    cudaVersion: string | null;
}

export class SystemInfoService implements vscode.Disposable {
    private cachedInfo: SystemInfo | null = null;
    private readonly outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('System Info');
    }

    public async getSystemInfo(): Promise<SystemInfo> {
        if (this.cachedInfo) {
            return this.cachedInfo;
        }

        try {
            const totalMemoryGB = Math.floor(os.totalmem() / (1024 * 1024 * 1024));
            const freeDiskSpaceGB = await this.getFreeDiskSpace();
            const cudaInfo = await this.getCUDAInfo();

            this.cachedInfo = {
                totalMemoryGB,
                freeDiskSpaceGB,
                cpuCores: os.cpus().length,
                cudaAvailable: cudaInfo.available,
                cudaVersion: cudaInfo.version
            };

            this.outputChannel.appendLine(`System info collected: ${JSON.stringify(this.cachedInfo, null, 2)}`);
            return this.cachedInfo;
        } catch (error) {
            this.outputChannel.appendLine(`Error collecting system info: ${error}`);
            throw error;
        }
    }

    private async getFreeDiskSpace(): Promise<number> {
        try {
            if (process.platform === 'win32') {
                const { stdout } = await execAsync('wmic logicaldisk get freespace,caption');
                const lines = stdout.trim().split('\n').slice(1);
                const totalFreeSpace = lines.reduce((acc, line) => {
                    const parts = line.trim().split(/\s+/);
                    const freeSpace = parts[1];
                    return acc + (freeSpace ? parseInt(freeSpace, 10) : 0);
                }, 0);
                return Math.round(totalFreeSpace / (1024 * 1024 * 1024)); // Convert to GB
            } else {
                const { stdout } = await execAsync('df -k /');
                const lines = stdout.split('\n');
                if (lines.length < 2) {
                    return 50; // Fallback
                }
                const parts = lines[1].split(/\s+/);
                const free = parts[3];
                return Math.round((free ? parseInt(free, 10) : 0) / (1024 * 1024)); // Convert KB to GB
            }
        } catch {
            // Fallback to a reasonable default
            return 50; // Assume 50GB free space
        }
    }

    private async getCUDAInfo(): Promise<{ available: boolean; version: string | null }> {
        try {
            if (process.platform === 'win32') {
                const { stdout } = await execAsync('nvidia-smi --query-gpu=driver_version --format=csv,noheader');
                return { available: true, version: stdout.trim() };
            } else if (process.platform === 'linux') {
                const { stdout } = await execAsync('nvidia-smi --query-gpu=driver_version --format=csv,noheader');
                return { available: true, version: stdout.trim() };
            } else if (process.platform === 'darwin') {
                // macOS doesn't support CUDA
                return { available: false, version: null };
            }
        } catch {
            // nvidia-smi not available or failed
            return { available: false, version: null };
        }
        return { available: false, version: null };
    }

    public clearCache(): void {
        this.cachedInfo = null;
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.cachedInfo = null;
    }
}