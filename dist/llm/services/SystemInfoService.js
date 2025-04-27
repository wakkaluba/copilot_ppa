"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemInfoService = void 0;
const os = __importStar(require("os"));
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class SystemInfoService {
    constructor() {
        this.cachedInfo = null;
        this.outputChannel = vscode.window.createOutputChannel('System Info');
    }
    async getSystemInfo() {
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
        }
        catch (error) {
            this.outputChannel.appendLine(`Error collecting system info: ${error}`);
            throw error;
        }
    }
    async getFreeDiskSpace() {
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
            }
            else {
                const { stdout } = await execAsync('df -k /');
                const lines = stdout.split('\n');
                if (lines.length < 2) {
                    return 50; // Fallback
                }
                const parts = lines[1].split(/\s+/);
                const free = parts[3];
                return Math.round((free ? parseInt(free, 10) : 0) / (1024 * 1024)); // Convert KB to GB
            }
        }
        catch {
            // Fallback to a reasonable default
            return 50; // Assume 50GB free space
        }
    }
    async getCUDAInfo() {
        try {
            if (process.platform === 'win32') {
                const { stdout } = await execAsync('nvidia-smi --query-gpu=driver_version --format=csv,noheader');
                return { available: true, version: stdout.trim() };
            }
            else if (process.platform === 'linux') {
                const { stdout } = await execAsync('nvidia-smi --query-gpu=driver_version --format=csv,noheader');
                return { available: true, version: stdout.trim() };
            }
            else if (process.platform === 'darwin') {
                // macOS doesn't support CUDA
                return { available: false, version: null };
            }
        }
        catch {
            // nvidia-smi not available or failed
            return { available: false, version: null };
        }
        return { available: false, version: null };
    }
    clearCache() {
        this.cachedInfo = null;
    }
    dispose() {
        this.outputChannel.dispose();
        this.cachedInfo = null;
    }
}
exports.SystemInfoService = SystemInfoService;
//# sourceMappingURL=SystemInfoService.js.map