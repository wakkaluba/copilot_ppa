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
exports.DependencyScanner = void 0;
const vscode = __importStar(require("vscode"));
const VulnerabilityService_1 = require("./services/VulnerabilityService");
const DependencyScanService_1 = require("./services/DependencyScanService");
const VulnerabilityReportService_1 = require("./services/VulnerabilityReportService");
const logger_1 = require("../utils/logger");
/**
 * Class responsible for scanning project dependencies for known vulnerabilities
 */
class DependencyScanner {
    static instance;
    logger;
    vulnerabilityService;
    scanService;
    reportService;
    vulnerabilityCache = new Map();
    constructor(context) {
        this.logger = logger_1.Logger.getInstance();
        this.vulnerabilityService = new VulnerabilityService_1.VulnerabilityService();
        this.scanService = new DependencyScanService_1.DependencyScanService(this.vulnerabilityService);
        this.reportService = new VulnerabilityReportService_1.VulnerabilityReportService(context);
    }
    static getInstance(context) {
        if (!DependencyScanner.instance) {
            DependencyScanner.instance = new DependencyScanner(context);
        }
        return DependencyScanner.instance;
    }
    /**
     * Scans the workspace for dependency files and checks for vulnerabilities
     */
    async scanWorkspaceDependencies(silent = false) {
        try {
            return await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Scanning dependencies for vulnerabilities...",
                cancellable: true
            }, async (progress, token) => {
                const result = await this.scanService.scanWorkspace();
                // Cache vulnerabilities for later retrieval
                result.vulnerabilities.forEach(vuln => {
                    vuln.vulnerabilityInfo.forEach(info => {
                        this.vulnerabilityCache.set(info.id, info);
                    });
                });
                if (!silent) {
                    this.reportService.updateStatusBar(result.hasVulnerabilities, result.vulnerabilities.length);
                }
                return result;
            });
        }
        catch (error) {
            this.logger.error('Error scanning workspace dependencies', error);
            throw error;
        }
    }
    /**
     * Get detailed information about a specific vulnerability
     * @param vulnId The ID of the vulnerability to retrieve details for
     * @returns Detailed vulnerability information, or undefined if not found
     */
    async getVulnerabilityDetails(vulnId) {
        return this.vulnerabilityCache.get(vulnId) ||
            await this.vulnerabilityService.getVulnerabilityDetails(vulnId);
    }
    /**
     * Shows a detailed vulnerability report
     */
    async showVulnerabilityReport() {
        try {
            const result = await this.scanWorkspaceDependencies();
            await this.reportService.showReport(result);
        }
        catch (error) {
            this.logger.error('Error showing vulnerability report', error);
            throw error;
        }
    }
    dispose() {
        this.reportService.dispose();
        this.vulnerabilityCache.clear();
    }
}
exports.DependencyScanner = DependencyScanner;
//# sourceMappingURL=dependencyScanner.js.map