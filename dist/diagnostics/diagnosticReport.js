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
exports.DiagnosticReportGenerator = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
/**
 * Class to generate diagnostic reports for the extension
 */
class DiagnosticReportGenerator {
    constructor(logger, context, systemChecker) {
        this._requestCount = 0;
        this._errorCount = 0;
        this._lastError = null;
        this._lastErrorTime = null;
        this._responseTimeHistory = [];
        this._logger = logger;
        this._extensionContext = context;
        this._systemChecker = systemChecker;
        this._outputChannel = vscode.window.createOutputChannel('Copilot PPA Diagnostics');
        this._startTime = Date.now();
    }
    /**
     * Track a request to the LLM
     */
    trackRequest(responseTimeMs, isError = false, errorMessage) {
        this._requestCount++;
        if (responseTimeMs > 0) {
            this._responseTimeHistory.push(responseTimeMs);
            // Keep only the last 100 response times for memory efficiency
            if (this._responseTimeHistory.length > 100) {
                this._responseTimeHistory.shift();
            }
        }
        if (isError) {
            this._errorCount++;
            this._lastError = errorMessage || "Unknown error";
            this._lastErrorTime = new Date().toISOString();
        }
    }
    /**
     * Generate a diagnostic report
     */
    async generateReport() {
        this._logger.info('Generating diagnostic report');
        try {
            // Get system information
            const systemInfo = await this._getSystemInfo();
            // Get extension configuration
            const config = this._getConfiguration();
            // Get performance metrics
            const performance = this._getPerformanceMetrics();
            // Get runtime information
            const runtime = this._getRuntimeInfo();
            // Get recent logs
            const logs = this._getRecentLogs();
            // Create the report content
            const report = {
                timestamp: new Date().toISOString(),
                extension: {
                    name: vscode.extensions.getExtension('copilot-ppa')?.packageJSON.name || 'copilot-ppa',
                    version: vscode.extensions.getExtension('copilot-ppa')?.packageJSON.version || '1.0.0',
                    environment: vscode.env.appName
                },
                system: systemInfo,
                configuration: config,
                performance: performance,
                runtime: runtime,
                logs: logs
            };
            return report;
        }
        catch (error) {
            this._logger.error('Error generating diagnostic report', error);
            throw error;
        }
    }
    /**
     * Save the report to a file
     */
    async saveReportToFile(report) {
        try {
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const downloadsFolder = path.join(os.homedir(), 'Downloads');
            const filePath = path.join(downloadsFolder, `copilot-ppa-diagnostic-${timestamp}.json`);
            // Convert report to JSON string
            const reportJson = JSON.stringify(report, null, 2);
            // Write to file
            fs.writeFileSync(filePath, reportJson);
            this._logger.info(`Diagnostic report saved to ${filePath}`);
            return filePath;
        }
        catch (error) {
            this._logger.error('Error saving diagnostic report', error);
            throw error;
        }
    }
    /**
     * Display the report in a webview panel
     */
    async displayReportInWebview(report) {
        // Create and show webview panel
        const panel = vscode.window.createWebviewPanel('copilotPpaDiagnostics', 'Copilot PPA Diagnostic Report', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        // Generate HTML content
        panel.webview.html = this._generateReportHtml(report);
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'saveReport':
                    try {
                        const filePath = await this.saveReportToFile(report);
                        vscode.window.showInformationMessage(`Diagnostic report saved to ${filePath}`);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Error saving report: ${error}`);
                    }
                    break;
            }
        }, undefined, this._extensionContext.subscriptions);
    }
    /**
     * Get system information
     */
    async _getSystemInfo() {
        // Use the system requirements checker to get system info
        const cpuInfo = await this._systemChecker.getCpuInfo();
        const memoryInfo = this._systemChecker.getMemoryInfo();
        const diskInfo = await this._systemChecker.getDiskInfo();
        const gpuInfo = await this._systemChecker.getGpuInfo();
        return {
            os: `${os.type()} ${os.release()} (${os.platform()})`,
            arch: os.arch(),
            cpuInfo,
            memoryInfo,
            diskInfo,
            gpuInfo
        };
    }
    /**
     * Get extension configuration
     */
    _getConfiguration() {
        const vscodeConfig = vscode.workspace.getConfiguration();
        // Get LLM provider configuration
        const providerConfig = vscodeConfig.get('vscodeLocalLLMAgent.defaultProvider', 'ollama');
        const ollamaModel = vscodeConfig.get('vscodeLocalLLMAgent.ollamaModel', 'llama2');
        const ollamaEndpoint = vscodeConfig.get('vscodeLocalLLMAgent.ollamaEndpoint', 'http://localhost:11434');
        const lmStudioEndpoint = vscodeConfig.get('vscodeLocalLLMAgent.lmStudioEndpoint', 'http://localhost:1234');
        const cacheEnabled = vscodeConfig.get('localLLMAgent.cache.enabled', true);
        // Get other relevant settings
        const otherSettings = {};
        // Flatten copilot-ppa settings
        const copilotSettings = vscodeConfig.get('copilot-ppa');
        if (copilotSettings && typeof copilotSettings === 'object') {
            this._flattenObject(copilotSettings, otherSettings, 'copilot-ppa');
        }
        // Flatten localLLMAgent settings
        const localLLMAgentSettings = vscodeConfig.get('localLLMAgent');
        if (localLLMAgentSettings && typeof localLLMAgentSettings === 'object') {
            this._flattenObject(localLLMAgentSettings, otherSettings, 'localLLMAgent');
        }
        return {
            provider: providerConfig,
            model: providerConfig === 'ollama' ? ollamaModel : 'unknown',
            endpoint: providerConfig === 'ollama' ? ollamaEndpoint : lmStudioEndpoint,
            cacheEnabled,
            otherSettings
        };
    }
    /**
     * Helper to flatten nested objects into dot notation
     */
    _flattenObject(obj, result, prefix = '') {
        for (const key in obj) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                this._flattenObject(obj[key], result, newKey);
            }
            else {
                // Skip sensitive information like tokens
                if (!newKey.includes('token') && !newKey.includes('password') && !newKey.includes('secret')) {
                    result[newKey] = obj[key];
                }
                else {
                    result[newKey] = '*** REDACTED ***';
                }
            }
        }
    }
    /**
     * Get performance metrics
     */
    _getPerformanceMetrics() {
        const lastLatency = this._responseTimeHistory.length > 0
            ? this._responseTimeHistory[this._responseTimeHistory.length - 1]
            : null;
        const averageLatency = this._responseTimeHistory.length > 0
            ? this._responseTimeHistory.reduce((a, b) => a + b, 0) / this._responseTimeHistory.length
            : null;
        // Get peak memory usage (Node.js process)
        const memoryUsage = process.memoryUsage();
        const peakMemoryUsageMB = Math.round(memoryUsage.heapUsed / (1024 * 1024) * 100) / 100;
        return {
            lastLatencyMs: lastLatency,
            averageLatencyMs: averageLatency,
            peakMemoryUsageMB,
            responseTimeHistory: [...this._responseTimeHistory]
        };
    }
    /**
     * Get runtime information
     */
    _getRuntimeInfo() {
        const uptime = (Date.now() - this._startTime) / 1000; // in seconds
        return {
            uptime,
            requestCount: this._requestCount,
            errorCount: this._errorCount,
            lastError: this._lastError,
            lastErrorTime: this._lastErrorTime
        };
    }
    /**
     * Get recent logs
     */
    _getRecentLogs() {
        const logEntries = this._logger.getLogEntries();
        // Get the 50 most recent logs
        const recentLogs = logEntries
            .slice(-50)
            .map(entry => `[${entry.timestamp}] [${this._logLevelToString(entry.level)}] ${entry.message}`);
        // Count errors and warnings
        const errorCount = logEntries.filter(entry => entry.level === 3).length;
        const warningCount = logEntries.filter(entry => entry.level === 2).length;
        return {
            recentLogs,
            errorCount,
            warningCount
        };
    }
    /**
     * Convert log level to string
     */
    _logLevelToString(level) {
        switch (level) {
            case 0: return 'DEBUG';
            case 1: return 'INFO';
            case 2: return 'WARN';
            case 3: return 'ERROR';
            default: return 'UNKNOWN';
        }
    }
    /**
     * Generate HTML for the report webview
     */
    _generateReportHtml(report) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Copilot PPA Diagnostic Report</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    padding: 20px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                }
                h1, h2, h3 {
                    color: var(--vscode-editor-foreground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 5px;
                }
                .section {
                    margin-bottom: 30px;
                }
                .data-grid {
                    display: grid;
                    grid-template-columns: max-content 1fr;
                    gap: 8px 16px;
                    margin-bottom: 20px;
                }
                .data-label {
                    font-weight: bold;
                    color: var(--vscode-editor-foreground);
                }
                .data-value {
                    color: var(--vscode-editor-foreground);
                }
                pre {
                    background-color: var(--vscode-panel-background);
                    padding: 10px;
                    border-radius: 5px;
                    overflow: auto;
                    color: var(--vscode-editor-foreground);
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 12px;
                    border-radius: 2px;
                    cursor: pointer;
                    margin-right: 8px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .chart-container {
                    height: 200px;
                    margin: 20px 0;
                    background-color: var(--vscode-panel-background);
                    border-radius: 5px;
                    padding: 10px;
                }
                .status-ok {
                    color: #22c55e;
                }
                .status-warning {
                    color: #f59e0b;
                }
                .status-error {
                    color: #ef4444;
                }
                .tab-container {
                    margin-top: 20px;
                }
                .tab-buttons {
                    display: flex;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    margin-bottom: 16px;
                }
                .tab-button {
                    background: none;
                    border: none;
                    padding: 8px 16px;
                    margin-right: 4px;
                    cursor: pointer;
                    color: var(--vscode-foreground);
                    border-bottom: 2px solid transparent;
                }
                .tab-button.active {
                    border-bottom: 2px solid var(--vscode-button-background);
                    font-weight: bold;
                }
                .tab-content {
                    display: none;
                }
                .tab-content.active {
                    display: block;
                }
            </style>
        </head>
        <body>
            <h1>Copilot PPA Diagnostic Report</h1>
            <p>Generated: ${report.timestamp}</p>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-button active" data-tab="overview">Overview</button>
                    <button class="tab-button" data-tab="system">System</button>
                    <button class="tab-button" data-tab="config">Configuration</button>
                    <button class="tab-button" data-tab="performance">Performance</button>
                    <button class="tab-button" data-tab="logs">Logs</button>
                </div>
                
                <div id="overview" class="tab-content active">
                    <div class="section">
                        <h2>Extension Information</h2>
                        <div class="data-grid">
                            <div class="data-label">Name:</div>
                            <div class="data-value">${report.extension.name}</div>
                            
                            <div class="data-label">Version:</div>
                            <div class="data-value">${report.extension.version}</div>
                            
                            <div class="data-label">Environment:</div>
                            <div class="data-value">${report.extension.environment}</div>
                            
                            <div class="data-label">Uptime:</div>
                            <div class="data-value">${this._formatUptime(report.runtime.uptime)}</div>
                            
                            <div class="data-label">Total Requests:</div>
                            <div class="data-value">${report.runtime.requestCount}</div>
                            
                            <div class="data-label">Error Rate:</div>
                            <div class="data-value ${this._getErrorRateClass(report.runtime)}">
                                ${this._calculateErrorRate(report.runtime)}%
                            </div>
                            
                            <div class="data-label">Average Latency:</div>
                            <div class="data-value ${this._getLatencyClass(report.performance.averageLatencyMs)}">
                                ${report.performance.averageLatencyMs ? Math.round(report.performance.averageLatencyMs) + ' ms' : 'N/A'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>System Summary</h2>
                        <div class="data-grid">
                            <div class="data-label">Operating System:</div>
                            <div class="data-value">${report.system.os}</div>
                            
                            <div class="data-label">Architecture:</div>
                            <div class="data-value">${report.system.arch}</div>
                            
                            <div class="data-label">CPU:</div>
                            <div class="data-value">${report.system.cpuInfo?.model || 'Unknown'} (${report.system.cpuInfo?.cores || 0} cores)</div>
                            
                            <div class="data-label">Memory:</div>
                            <div class="data-value">${report.system.memoryInfo?.totalMemoryGB || 'Unknown'}</div>
                            
                            <div class="data-label">Free Disk Space:</div>
                            <div class="data-value">${report.system.diskInfo?.freeSpaceGB || 'Unknown'}</div>
                            
                            <div class="data-label">GPU:</div>
                            <div class="data-value">${report.system.gpuInfo?.available ? report.system.gpuInfo.name : 'Not detected'}</div>
                            
                            <div class="data-label">CUDA:</div>
                            <div class="data-value">${report.system.gpuInfo?.cudaAvailable ? 'Available (v' + report.system.gpuInfo.cudaVersion + ')' : 'Not available'}</div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Configuration Summary</h2>
                        <div class="data-grid">
                            <div class="data-label">LLM Provider:</div>
                            <div class="data-value">${report.configuration.provider}</div>
                            
                            <div class="data-label">Model:</div>
                            <div class="data-value">${report.configuration.model}</div>
                            
                            <div class="data-label">Endpoint:</div>
                            <div class="data-value">${report.configuration.endpoint}</div>
                            
                            <div class="data-label">Cache Enabled:</div>
                            <div class="data-value">${report.configuration.cacheEnabled ? 'Yes' : 'No'}</div>
                        </div>
                    </div>
                </div>
                
                <div id="system" class="tab-content">
                    <div class="section">
                        <h2>System Details</h2>
                        <h3>CPU Information</h3>
                        <div class="data-grid">
                            <div class="data-label">Model:</div>
                            <div class="data-value">${report.system.cpuInfo?.model || 'Unknown'}</div>
                            
                            <div class="data-label">Architecture:</div>
                            <div class="data-value">${report.system.cpuInfo?.architecture || 'Unknown'}</div>
                            
                            <div class="data-label">Physical Cores:</div>
                            <div class="data-value">${report.system.cpuInfo?.cores || 'Unknown'}</div>
                            
                            <div class="data-label">Logical Processors:</div>
                            <div class="data-value">${report.system.cpuInfo?.threads || 'Unknown'}</div>
                            
                            <div class="data-label">Clock Speed:</div>
                            <div class="data-value">${report.system.cpuInfo?.clockSpeed || 'Unknown'}</div>
                        </div>
                        
                        <h3>Memory Information</h3>
                        <div class="data-grid">
                            <div class="data-label">Total RAM:</div>
                            <div class="data-value">${report.system.memoryInfo?.totalMemoryGB || 'Unknown'}</div>
                            
                            <div class="data-label">Free RAM:</div>
                            <div class="data-value">${report.system.memoryInfo?.freeMemoryGB || 'Unknown'}</div>
                        </div>
                        
                        <h3>Disk Information</h3>
                        <div class="data-grid">
                            <div class="data-label">Total Space:</div>
                            <div class="data-value">${report.system.diskInfo?.totalSpaceGB || 'Unknown'}</div>
                            
                            <div class="data-label">Free Space:</div>
                            <div class="data-value">${report.system.diskInfo?.freeSpaceGB || 'Unknown'}</div>
                        </div>
                        
                        <h3>GPU Information</h3>
                        ${this._renderGpuInfo(report.system.gpuInfo)}
                    </div>
                </div>
                
                <div id="config" class="tab-content">
                    <div class="section">
                        <h2>Extension Configuration</h2>
                        <h3>LLM Provider Settings</h3>
                        <div class="data-grid">
                            <div class="data-label">Provider:</div>
                            <div class="data-value">${report.configuration.provider}</div>
                            
                            <div class="data-label">Model:</div>
                            <div class="data-value">${report.configuration.model}</div>
                            
                            <div class="data-label">Endpoint:</div>
                            <div class="data-value">${report.configuration.endpoint}</div>
                            
                            <div class="data-label">Cache Enabled:</div>
                            <div class="data-value">${report.configuration.cacheEnabled ? 'Yes' : 'No'}</div>
                        </div>
                        
                        <h3>Other Settings</h3>
                        <pre>${JSON.stringify(report.configuration.otherSettings, null, 2)}</pre>
                    </div>
                </div>
                
                <div id="performance" class="tab-content">
                    <div class="section">
                        <h2>Performance Metrics</h2>
                        <div class="data-grid">
                            <div class="data-label">Last Response Time:</div>
                            <div class="data-value ${this._getLatencyClass(report.performance.lastLatencyMs)}">
                                ${report.performance.lastLatencyMs ? report.performance.lastLatencyMs + ' ms' : 'N/A'}
                            </div>
                            
                            <div class="data-label">Average Response Time:</div>
                            <div class="data-value ${this._getLatencyClass(report.performance.averageLatencyMs)}">
                                ${report.performance.averageLatencyMs ? Math.round(report.performance.averageLatencyMs) + ' ms' : 'N/A'}
                            </div>
                            
                            <div class="data-label">Peak Memory Usage:</div>
                            <div class="data-value">
                                ${report.performance.peakMemoryUsageMB ? report.performance.peakMemoryUsageMB + ' MB' : 'N/A'}
                            </div>
                            
                            <div class="data-label">Total Requests:</div>
                            <div class="data-value">${report.runtime.requestCount}</div>
                            
                            <div class="data-label">Error Count:</div>
                            <div class="data-value ${report.runtime.errorCount > 0 ? 'status-error' : 'status-ok'}">
                                ${report.runtime.errorCount}
                            </div>
                            
                            <div class="data-label">Error Rate:</div>
                            <div class="data-value ${this._getErrorRateClass(report.runtime)}">
                                ${this._calculateErrorRate(report.runtime)}%
                            </div>
                        </div>
                        
                        <h3>Response Time History</h3>
                        <div class="chart-container" id="responseTimeChart">
                            <p>Response time data visualization would appear here in a full implementation.</p>
                        </div>
                        
                        <h3>Runtime Information</h3>
                        <div class="data-grid">
                            <div class="data-label">Uptime:</div>
                            <div class="data-value">${this._formatUptime(report.runtime.uptime)}</div>
                            
                            <div class="data-label">Last Error:</div>
                            <div class="data-value ${report.runtime.lastError ? 'status-error' : ''}">
                                ${report.runtime.lastError || 'None'}
                            </div>
                            
                            <div class="data-label">Last Error Time:</div>
                            <div class="data-value">
                                ${report.runtime.lastErrorTime || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="logs" class="tab-content">
                    <div class="section">
                        <h2>Logs</h2>
                        <div class="data-grid">
                            <div class="data-label">Error Count:</div>
                            <div class="data-value ${report.logs.errorCount > 0 ? 'status-error' : 'status-ok'}">
                                ${report.logs.errorCount}
                            </div>
                            
                            <div class="data-label">Warning Count:</div>
                            <div class="data-value ${report.logs.warningCount > 0 ? 'status-warning' : 'status-ok'}">
                                ${report.logs.warningCount}
                            </div>
                        </div>
                        
                        <h3>Recent Logs (last 50 entries)</h3>
                        <pre>${report.logs.recentLogs.join('\n')}</pre>
                    </div>
                </div>
            </div>
            
            <div>
                <button id="saveReportBtn">Save Report to File</button>
            </div>
            
            <script>
                (function() {
                    // Tab switching functionality
                    const tabButtons = document.querySelectorAll('.tab-button');
                    const tabContents = document.querySelectorAll('.tab-content');
                    
                    tabButtons.forEach(button => {
                        button.addEventListener('click', () => {
                            const tabId = button.getAttribute('data-tab');
                            
                            // Update active button
                            tabButtons.forEach(btn => btn.classList.remove('active'));
                            button.classList.add('active');
                            
                            // Update active content
                            tabContents.forEach(content => {
                                content.classList.remove('active');
                                if (content.id === tabId) {
                                    content.classList.add('active');
                                }
                            });
                        });
                    });
                    
                    // Save report button
                    const saveReportBtn = document.getElementById('saveReportBtn');
                    saveReportBtn.addEventListener('click', () => {
                        const vscode = acquireVsCodeApi();
                        vscode.postMessage({
                            command: 'saveReport'
                        });
                    });
                    
                    // In a full implementation, we would add chart visualization here
                    // using a library like Chart.js
                })();
            </script>
        </body>
        </html>
        `;
    }
    /**
     * Format uptime from seconds to human-readable format
     */
    _formatUptime(seconds) {
        if (!seconds)
            return 'N/A';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const parts = [];
        if (days > 0)
            parts.push(`${days}d`);
        if (hours > 0)
            parts.push(`${hours}h`);
        if (minutes > 0)
            parts.push(`${minutes}m`);
        if (remainingSeconds > 0 || parts.length === 0)
            parts.push(`${remainingSeconds}s`);
        return parts.join(' ');
    }
    /**
     * Calculate error rate as percentage
     */
    _calculateErrorRate(runtime) {
        if (runtime.requestCount === 0)
            return 0;
        return Math.round((runtime.errorCount / runtime.requestCount) * 100);
    }
    /**
     * Get CSS class based on error rate
     */
    _getErrorRateClass(runtime) {
        const errorRate = this._calculateErrorRate(runtime);
        if (errorRate >= 10)
            return 'status-error';
        if (errorRate >= 5)
            return 'status-warning';
        return 'status-ok';
    }
    /**
     * Get CSS class based on latency
     */
    _getLatencyClass(latencyMs) {
        if (!latencyMs)
            return '';
        if (latencyMs >= 2000)
            return 'status-error';
        if (latencyMs >= 1000)
            return 'status-warning';
        return 'status-ok';
    }
    /**
     * Render GPU information HTML
     */
    _renderGpuInfo(gpuInfo) {
        if (!gpuInfo?.available) {
            return `
            <div class="data-grid">
                <div class="data-label">GPU:</div>
                <div class="data-value">Not detected</div>
            </div>
            <p>Running LLM models without a GPU may result in slower performance.</p>
            `;
        }
        let html = `
        <div class="data-grid">
            <div class="data-label">GPU:</div>
            <div class="data-value">${gpuInfo.name || 'Unknown'}</div>
        `;
        if (gpuInfo.memory) {
            html += `
            <div class="data-label">GPU Memory:</div>
            <div class="data-value">${gpuInfo.memory}</div>
            `;
        }
        html += `
            <div class="data-label">CUDA Available:</div>
            <div class="data-value">${gpuInfo.cudaAvailable ? 'Yes' : 'No'}</div>
        `;
        if (gpuInfo.cudaAvailable && gpuInfo.cudaVersion) {
            html += `
            <div class="data-label">CUDA Version:</div>
            <div class="data-value">${gpuInfo.cudaVersion}</div>
            `;
        }
        html += '</div>';
        if (!gpuInfo.cudaAvailable) {
            html += '<p>CUDA is not available. Some LLM models may run slower without GPU acceleration.</p>';
        }
        return html;
    }
}
exports.DiagnosticReportGenerator = DiagnosticReportGenerator;
//# sourceMappingURL=diagnosticReport.js.map