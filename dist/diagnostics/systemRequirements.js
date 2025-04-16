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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemRequirementsChecker = void 0;
const vscode = __importStar(require("vscode"));
const os = __importStar(require("os"));
const child_process = __importStar(require("child_process"));
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process.exec);
/**
 * System requirements checker for the Copilot PPA extension
 */
class SystemRequirementsChecker {
    constructor(logger) {
        this._logger = logger;
        this._outputChannel = vscode.window.createOutputChannel('Copilot PPA System');
    }
    /**
     * Check if the system meets the minimum requirements for running LLMs
     */
    async checkSystemRequirements() {
        this._outputChannel.clear();
        this._outputChannel.show();
        this._outputChannel.appendLine('============================================');
        this._outputChannel.appendLine('  Copilot PPA System Requirements Check');
        this._outputChannel.appendLine('============================================\n');
        try {
            // Check CPU
            const cpuInfo = await this.getCpuInfo();
            const cpuMeetsRequirements = this.checkCpuRequirements(cpuInfo);
            // Check memory
            const memoryInfo = this.getMemoryInfo();
            const memoryMeetsRequirements = this.checkMemoryRequirements(memoryInfo);
            // Check disk space
            const diskInfo = await this.getDiskInfo();
            const diskMeetsRequirements = this.checkDiskRequirements(diskInfo);
            // Check GPU if available
            const gpuInfo = await this.getGpuInfo();
            const gpuAvailable = gpuInfo.available;
            // Display results
            this.displayResults({
                cpu: cpuInfo,
                cpuMeetsRequirements,
                memory: memoryInfo,
                memoryMeetsRequirements,
                disk: diskInfo,
                diskMeetsRequirements,
                gpu: gpuInfo
            });
            // Overall result
            const overallResult = cpuMeetsRequirements && memoryMeetsRequirements && diskMeetsRequirements;
            this._outputChannel.appendLine('\n============================================');
            this._outputChannel.appendLine(`OVERALL RESULT: ${overallResult ? 'PASSED ✓' : 'FAILED ✗'}`);
            if (!overallResult) {
                this._outputChannel.appendLine('\nPlease upgrade your system to meet the minimum requirements for optimal performance.');
                this._outputChannel.appendLine('Some LLM models may still work with reduced performance.');
            }
            this._outputChannel.appendLine('============================================');
            return overallResult;
        }
        catch (error) {
            this._logger.error('Error checking system requirements', error);
            this._outputChannel.appendLine(`\nError checking system requirements: ${error}`);
            return false;
        }
    }
    /**
     * Get CPU information
     */
    async getCpuInfo() {
        const cpus = os.cpus();
        const model = cpus[0].model.trim();
        const cores = this.getPhysicalCores();
        const threads = cpus.length;
        const clockSpeed = (cpus[0].speed / 1000).toFixed(2) + ' GHz';
        const architecture = os.arch();
        return { model, cores, threads, clockSpeed, architecture };
    }
    /**
     * Get the number of physical CPU cores
     */
    getPhysicalCores() {
        try {
            const cpus = os.cpus();
            const threads = cpus.length;
            // This is an approximation, as there's no direct way to get physical cores in Node.js
            // Assuming hyperthreading is enabled on most modern CPUs
            return Math.ceil(threads / 2);
        }
        catch (error) {
            this._logger.error('Error getting physical cores', error);
            return os.cpus().length;
        }
    }
    /**
     * Check if CPU meets minimum requirements
     */
    checkCpuRequirements(cpuInfo) {
        // Minimum requirements: 4 cores, 8 threads
        return cpuInfo.cores >= 4 && cpuInfo.threads >= 8;
    }
    /**
     * Get memory information
     */
    getMemoryInfo() {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const totalMemoryGB = (totalMemory / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        const freeMemoryGB = (freeMemory / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        return { totalMemory, totalMemoryGB, freeMemory, freeMemoryGB };
    }
    /**
     * Check if memory meets minimum requirements
     */
    checkMemoryRequirements(memoryInfo) {
        // Minimum requirement: 8 GB RAM (8589934592 bytes)
        return memoryInfo.totalMemory >= 8 * 1024 * 1024 * 1024;
    }
    /**
     * Get disk information
     */
    async getDiskInfo() {
        try {
            // Default values in case we can't get disk info
            let totalSpace = 0;
            let freeSpace = 0;
            if (process.platform === 'win32') {
                // Windows
                const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
                const lines = stdout.trim().split('\n').slice(1);
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 3) {
                        // Use the system drive (usually C:)
                        if (parts[0] === 'C:') {
                            freeSpace = parseInt(parts[1], 10);
                            totalSpace = parseInt(parts[2], 10);
                            break;
                        }
                    }
                }
            }
            else if (process.platform === 'darwin' || process.platform === 'linux') {
                // macOS or Linux
                const { stdout } = await execAsync('df -k /');
                const lines = stdout.trim().split('\n').slice(1);
                if (lines.length > 0) {
                    const parts = lines[0].trim().split(/\s+/);
                    if (parts.length >= 4) {
                        totalSpace = parseInt(parts[1], 10) * 1024;
                        freeSpace = parseInt(parts[3], 10) * 1024;
                    }
                }
            }
            const totalSpaceGB = (totalSpace / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
            const freeSpaceGB = (freeSpace / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
            return { totalSpace, freeSpace, totalSpaceGB, freeSpaceGB };
        }
        catch (error) {
            this._logger.error('Error getting disk info', error);
            // Return default values
            return {
                totalSpace: 0,
                freeSpace: 0,
                totalSpaceGB: 'Unknown',
                freeSpaceGB: 'Unknown'
            };
        }
    }
    /**
     * Check if disk space meets minimum requirements
     */
    checkDiskRequirements(diskInfo) {
        // Minimum requirement: 10 GB free space (10737418240 bytes)
        return diskInfo.freeSpace >= 10 * 1024 * 1024 * 1024;
    }
    /**
     * Get GPU information if available
     */
    async getGpuInfo() {
        try {
            if (process.platform === 'win32') {
                // Windows
                const { stdout } = await execAsync('wmic path win32_VideoController get name,adapterram');
                const lines = stdout.trim().split('\n').slice(1);
                if (lines.length > 0) {
                    const parts = lines[0].trim().split(/\s+/);
                    if (parts.length >= 2) {
                        const name = parts.slice(0, -1).join(' ');
                        const memory = ((parseInt(parts[parts.length - 1], 10) || 0) / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
                        // Check for CUDA
                        const cudaInfo = await this.checkCuda();
                        return {
                            available: true,
                            name,
                            memory,
                            cudaAvailable: cudaInfo.available,
                            cudaVersion: cudaInfo.version
                        };
                    }
                }
            }
            else if (process.platform === 'darwin') {
                // macOS
                const { stdout } = await execAsync('system_profiler SPDisplaysDataType');
                if (stdout.includes('Chipset Model')) {
                    const lines = stdout.split('\n');
                    let name = '';
                    for (const line of lines) {
                        if (line.includes('Chipset Model')) {
                            name = line.split(':')[1].trim();
                            break;
                        }
                    }
                    // Check for CUDA
                    const cudaInfo = await this.checkCuda();
                    return {
                        available: true,
                        name,
                        memory: 'Unknown',
                        cudaAvailable: cudaInfo.available,
                        cudaVersion: cudaInfo.version
                    };
                }
            }
            else if (process.platform === 'linux') {
                // Linux
                try {
                    const { stdout } = await execAsync('lspci | grep -i vga');
                    if (stdout) {
                        const name = stdout.split(':').slice(2).join(':').trim();
                        // Check for CUDA
                        const cudaInfo = await this.checkCuda();
                        return {
                            available: true,
                            name,
                            memory: 'Unknown',
                            cudaAvailable: cudaInfo.available,
                            cudaVersion: cudaInfo.version
                        };
                    }
                }
                catch (error) {
                    // Fallback if lspci is not available
                    this._logger.warn('lspci not available, trying alternative method');
                    try {
                        const { stdout } = await execAsync('glxinfo | grep "OpenGL renderer"');
                        if (stdout) {
                            const match = stdout.match(/OpenGL renderer string: (.*)/);
                            const name = match ? match[1].trim() : 'Unknown';
                            // Check for CUDA
                            const cudaInfo = await this.checkCuda();
                            return {
                                available: true,
                                name,
                                memory: 'Unknown',
                                cudaAvailable: cudaInfo.available,
                                cudaVersion: cudaInfo.version
                            };
                        }
                    }
                    catch (error) {
                        this._logger.warn('glxinfo not available either');
                    }
                }
            }
            // Default if no GPU found
            return { available: false };
        }
        catch (error) {
            this._logger.error('Error getting GPU info', error);
            return { available: false };
        }
    }
    /**
     * Check if CUDA is available
     */
    async checkCuda() {
        try {
            // Try to check CUDA version
            const { stdout } = await execAsync('nvcc --version');
            const match = stdout.match(/release (\d+\.\d+)/i);
            if (match) {
                return { available: true, version: match[1] };
            }
            return { available: false };
        }
        catch (error) {
            return { available: false };
        }
    }
    /**
     * Display the results in the output channel
     */
    displayResults(results) {
        // CPU section
        this._outputChannel.appendLine('CPU INFORMATION:');
        this._outputChannel.appendLine(`  Model: ${results.cpu.model}`);
        this._outputChannel.appendLine(`  Architecture: ${results.cpu.architecture}`);
        this._outputChannel.appendLine(`  Physical Cores: ${results.cpu.cores}`);
        this._outputChannel.appendLine(`  Logical Processors: ${results.cpu.threads}`);
        this._outputChannel.appendLine(`  Clock Speed: ${results.cpu.clockSpeed}`);
        this._outputChannel.appendLine(`  Meets Requirements: ${results.cpuMeetsRequirements ? 'Yes ✓' : 'No ✗'}`);
        if (!results.cpuMeetsRequirements) {
            this._outputChannel.appendLine('  Minimum Requirements: 4 cores, 8 threads');
        }
        // Memory section
        this._outputChannel.appendLine('\nMEMORY INFORMATION:');
        this._outputChannel.appendLine(`  Total RAM: ${results.memory.totalMemoryGB}`);
        this._outputChannel.appendLine(`  Free RAM: ${results.memory.freeMemoryGB}`);
        this._outputChannel.appendLine(`  Meets Requirements: ${results.memoryMeetsRequirements ? 'Yes ✓' : 'No ✗'}`);
        if (!results.memoryMeetsRequirements) {
            this._outputChannel.appendLine('  Minimum Requirements: 8 GB RAM');
        }
        // Disk section
        this._outputChannel.appendLine('\nDISK INFORMATION:');
        this._outputChannel.appendLine(`  Total Space: ${results.disk.totalSpaceGB}`);
        this._outputChannel.appendLine(`  Free Space: ${results.disk.freeSpaceGB}`);
        this._outputChannel.appendLine(`  Meets Requirements: ${results.diskMeetsRequirements ? 'Yes ✓' : 'No ✗'}`);
        if (!results.diskMeetsRequirements) {
            this._outputChannel.appendLine('  Minimum Requirements: 10 GB free space');
        }
        // GPU section
        this._outputChannel.appendLine('\nGPU INFORMATION:');
        if (results.gpu.available) {
            this._outputChannel.appendLine(`  GPU: ${results.gpu.name}`);
            if (results.gpu.memory) {
                this._outputChannel.appendLine(`  GPU Memory: ${results.gpu.memory}`);
            }
            // CUDA information
            if (results.gpu.cudaAvailable) {
                this._outputChannel.appendLine(`  CUDA Available: Yes ✓`);
                this._outputChannel.appendLine(`  CUDA Version: ${results.gpu.cudaVersion}`);
            }
            else {
                this._outputChannel.appendLine(`  CUDA Available: No ✗`);
                this._outputChannel.appendLine(`  Note: CUDA is not available. Some LLM models may run slower without GPU acceleration.`);
            }
        }
        else {
            this._outputChannel.appendLine(`  GPU: Not detected`);
            this._outputChannel.appendLine(`  Note: Running LLM models without a GPU may result in slower performance.`);
        }
        // Recommendations section
        this._outputChannel.appendLine('\nRECOMMENDATIONS:');
        if (!results.cpuMeetsRequirements) {
            this._outputChannel.appendLine('  - Consider upgrading your CPU to one with at least 4 cores and 8 threads');
        }
        if (!results.memoryMeetsRequirements) {
            this._outputChannel.appendLine('  - Add more RAM to reach at least 8GB');
        }
        if (!results.diskMeetsRequirements) {
            this._outputChannel.appendLine('  - Free up disk space to have at least 10GB available');
        }
        if (!results.gpu.available) {
            this._outputChannel.appendLine('  - Consider adding a discrete GPU for better LLM performance');
        }
        else if (results.gpu.available && !results.gpu.cudaAvailable) {
            this._outputChannel.appendLine('  - Install CUDA toolkit to enable GPU acceleration for LLM models');
        }
    }
}
exports.SystemRequirementsChecker = SystemRequirementsChecker;
//# sourceMappingURL=systemRequirements.js.map