"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityReportHtmlProvider = void 0;
/**
 * Provider for generating HTML content for security reports
 */
var SecurityReportHtmlProvider = /** @class */ (function () {
    function SecurityReportHtmlProvider(context) {
        this.context = context;
    }
    /**
     * Update code security issues report
     */
    SecurityReportHtmlProvider.prototype.updateCodeReport = function (panel, result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                panel.webview.html = this.generateCodeReportHtml(result);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update dependency vulnerabilities report
     */
    SecurityReportHtmlProvider.prototype.updateDependencyReport = function (panel, result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                panel.webview.html = this.generateDependencyReportHtml(result);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update filtered issues report
     */
    SecurityReportHtmlProvider.prototype.updateFilteredReport = function (panel, issues) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                panel.webview.html = this.generateFilteredReportHtml(issues);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update full security analysis report
     */
    SecurityReportHtmlProvider.prototype.updateFullReport = function (panel, result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                panel.webview.html = this.generateFullReportHtml(result);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Export report in different formats
     */
    SecurityReportHtmlProvider.prototype.exportReport = function (type, format) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation will vary based on format
                return [2 /*return*/, ''];
            });
        });
    };
    /**
     * Generate HTML for code security report
     */
    SecurityReportHtmlProvider.prototype.generateCodeReportHtml = function (result) {
        return "\n            <!DOCTYPE html>\n            <html lang=\"en\">\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Code Security Issues</title>\n                <style>\n                    ".concat(this.getReportStyles(), "\n                </style>\n            </head>\n            <body>\n                <div class=\"container\">\n                    <h1>Code Security Issues</h1>\n                    <div class=\"summary\">\n                        <p>Scanned ").concat(result.scannedFiles, " files</p>\n                        <p>Found ").concat(result.issues.length, " security issues</p>\n                    </div>\n                    ").concat(this.generateIssuesTable(result.issues), "\n                </div>\n                <script>\n                    ").concat(this.getReportScripts(), "\n                </script>\n            </body>\n            </html>\n        ");
    };
    /**
     * Generate HTML for dependency vulnerability report
     */
    SecurityReportHtmlProvider.prototype.generateDependencyReportHtml = function (result) {
        return "\n            <!DOCTYPE html>\n            <html lang=\"en\">\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Dependency Vulnerabilities</title>\n                <style>\n                    ".concat(this.getReportStyles(), "\n                </style>\n            </head>\n            <body>\n                <div class=\"container\">\n                    <h1>Dependency Vulnerabilities</h1>\n                    <div class=\"summary\">\n                        <p>Scanned ").concat(result.totalDependencies, " dependencies</p>\n                        <p>Found ").concat(result.vulnerabilities.length, " vulnerabilities</p>\n                    </div>\n                    ").concat(this.generateVulnerabilitiesTable(result.vulnerabilities), "\n                </div>\n                <script>\n                    ").concat(this.getReportScripts(), "\n                </script>\n            </body>\n            </html>\n        ");
    };
    /**
     * Generate HTML for filtered issues report
     */
    SecurityReportHtmlProvider.prototype.generateFilteredReportHtml = function (issues) {
        return "\n            <!DOCTYPE html>\n            <html lang=\"en\">\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Security Issues</title>\n                <style>\n                    ".concat(this.getReportStyles(), "\n                </style>\n            </head>\n            <body>\n                <div class=\"container\">\n                    <h1>Security Issues</h1>\n                    <div class=\"summary\">\n                        <p>Found ").concat(issues.length, " matching issues</p>\n                    </div>\n                    ").concat(this.generateIssuesTable(issues), "\n                </div>\n                <script>\n                    ").concat(this.getReportScripts(), "\n                </script>\n            </body>\n            </html>\n        ");
    };
    /**
     * Generate HTML for full security analysis report
     */
    SecurityReportHtmlProvider.prototype.generateFullReportHtml = function (result) {
        return "\n            <!DOCTYPE html>\n            <html lang=\"en\">\n            <head>\n                <meta charset=\"UTF-8\">\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n                <title>Security Analysis Report</title>\n                <style>\n                    ".concat(this.getReportStyles(), "\n                </style>\n            </head>\n            <body>\n                <div class=\"container\">\n                    <h1>Security Analysis Report</h1>\n                    \n                    <section class=\"overview\">\n                        <h2>Overview</h2>\n                        <div class=\"risk-score\">\n                            <h3>Overall Risk Score</h3>\n                            <div class=\"score ").concat(this.getRiskClass(result.overallRiskScore), "\">\n                                ").concat(result.overallRiskScore, "\n                            </div>\n                        </div>\n                    </section>\n\n                    <section class=\"code-issues\">\n                        <h2>Code Security Issues</h2>\n                        ").concat(this.generateIssuesTable(result.codeResult.issues), "\n                    </section>\n\n                    <section class=\"vulnerabilities\">\n                        <h2>Dependency Vulnerabilities</h2>\n                        ").concat(this.generateVulnerabilitiesTable(result.dependencyResult.vulnerabilities), "\n                    </section>\n\n                    <section class=\"recommendations\">\n                        <h2>Security Recommendations</h2>\n                        ").concat(this.generateRecommendationsTable(result.recommendationsResult.recommendations), "\n                    </section>\n                </div>\n                <script>\n                    ").concat(this.getReportScripts(), "\n                </script>\n            </body>\n            </html>\n        ");
    };
    /**
     * Generate HTML table for security issues
     */
    SecurityReportHtmlProvider.prototype.generateIssuesTable = function (issues) {
        var _this = this;
        if (issues.length === 0) {
            return '<p class="no-issues">No security issues found</p>';
        }
        return "\n            <table class=\"issues-table\">\n                <thead>\n                    <tr>\n                        <th>Severity</th>\n                        <th>Issue</th>\n                        <th>Location</th>\n                        <th>Description</th>\n                        <th>Actions</th>\n                    </tr>\n                </thead>\n                <tbody>\n                    ".concat(issues.map(function (issue) { return "\n                        <tr class=\"severity-".concat(issue.severity, "\">\n                            <td>").concat(_this.getSeverityBadge(issue.severity), "</td>\n                            <td>").concat(issue.name, "</td>\n                            <td>\n                                <a href=\"#\" onclick=\"showIssue('").concat(_this.escapeHtml(JSON.stringify(issue)), "')\">\n                                    ").concat(issue.file, ":").concat(issue.line, "\n                                </a>\n                            </td>\n                            <td>\n                                <div class=\"description\">").concat(issue.description, "</div>\n                                ").concat(issue.recommendation ? "\n                                    <div class=\"recommendation\">\n                                        Recommendation: ".concat(issue.recommendation, "\n                                    </div>\n                                ") : '', "\n                            </td>\n                            <td>\n                                ").concat(issue.hasFix ? "\n                                    <button onclick=\"applyFix('".concat(_this.escapeHtml(JSON.stringify(issue)), "')\">\n                                        Fix Issue\n                                    </button>\n                                ") : '', "\n                            </td>\n                        </tr>\n                    "); }).join(''), "\n                </tbody>\n            </table>\n        ");
    };
    /**
     * Generate HTML table for vulnerabilities
     */
    SecurityReportHtmlProvider.prototype.generateVulnerabilitiesTable = function (vulnerabilities) {
        var _this = this;
        if (vulnerabilities.length === 0) {
            return '<p class="no-issues">No vulnerabilities found</p>';
        }
        return "\n            <table class=\"vulnerabilities-table\">\n                <thead>\n                    <tr>\n                        <th>Package</th>\n                        <th>Severity</th>\n                        <th>Version</th>\n                        <th>Details</th>\n                        <th>Fix</th>\n                    </tr>\n                </thead>\n                <tbody>\n                    ".concat(vulnerabilities.map(function (vuln) { return "\n                        <tr>\n                            <td>".concat(vuln.name, "</td>\n                            <td>").concat(_this.getSeverityBadge(_this.getHighestSeverity(vuln)), "</td>\n                            <td>").concat(vuln.version, "</td>\n                            <td>\n                                ").concat(vuln.vulnerabilityInfo.map(function (info) { return "\n                                    <div class=\"vuln-info\">\n                                        <strong>".concat(info.title, "</strong>\n                                        <p>").concat(info.description, "</p>\n                                    </div>\n                                "); }).join(''), "\n                            </td>\n                            <td>\n                                ").concat(vuln.fixAvailable ? "\n                                    Update to ".concat(vuln.fixedVersion, "\n                                ") : 'No fix available', "\n                            </td>\n                        </tr>\n                    "); }).join(''), "\n                </tbody>\n            </table>\n        ");
    };
    /**
     * Generate HTML table for recommendations
     */
    SecurityReportHtmlProvider.prototype.generateRecommendationsTable = function (recommendations) {
        var _this = this;
        if (recommendations.length === 0) {
            return '<p class="no-recommendations">No recommendations available</p>';
        }
        return "\n            <table class=\"recommendations-table\">\n                <thead>\n                    <tr>\n                        <th>Priority</th>\n                        <th>Recommendation</th>\n                        <th>Impact</th>\n                        <th>Effort</th>\n                    </tr>\n                </thead>\n                <tbody>\n                    ".concat(recommendations.map(function (rec) { return "\n                        <tr class=\"severity-".concat(rec.severity, "\">\n                            <td>").concat(_this.getSeverityBadge(rec.severity), "</td>\n                            <td>\n                                <div class=\"title\">").concat(rec.title, "</div>\n                                <div class=\"description\">").concat(rec.description, "</div>\n                            </td>\n                            <td>").concat(rec.impact, "</td>\n                            <td>").concat(rec.effort, "</td>\n                        </tr>\n                    "); }).join(''), "\n                </tbody>\n            </table>\n        ");
    };
    /**
     * Get CSS styles for reports
     */
    SecurityReportHtmlProvider.prototype.getReportStyles = function () {
        return "\n            body {\n                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;\n                line-height: 1.6;\n                margin: 0;\n                padding: 20px;\n                color: var(--vscode-editor-foreground);\n                background-color: var(--vscode-editor-background);\n            }\n\n            .container {\n                max-width: 1200px;\n                margin: 0 auto;\n            }\n\n            h1, h2 {\n                color: var(--vscode-editor-foreground);\n                border-bottom: 1px solid var(--vscode-panel-border);\n                padding-bottom: 10px;\n            }\n\n            table {\n                width: 100%;\n                border-collapse: collapse;\n                margin: 20px 0;\n            }\n\n            th, td {\n                padding: 12px;\n                text-align: left;\n                border-bottom: 1px solid var(--vscode-panel-border);\n            }\n\n            th {\n                background-color: var(--vscode-editor-lineHighlightBackground);\n            }\n\n            .severity-badge {\n                padding: 4px 8px;\n                border-radius: 4px;\n                font-weight: bold;\n            }\n\n            .severity-critical { background-color: #ff0000; color: white; }\n            .severity-high { background-color: #ff4444; color: white; }\n            .severity-medium { background-color: #ffaa00; color: black; }\n            .severity-low { background-color: #ffff00; color: black; }\n\n            .description {\n                margin-bottom: 8px;\n            }\n\n            .recommendation {\n                font-style: italic;\n                color: var(--vscode-textLink-foreground);\n            }\n\n            button {\n                background-color: var(--vscode-button-background);\n                color: var(--vscode-button-foreground);\n                border: none;\n                padding: 6px 12px;\n                border-radius: 4px;\n                cursor: pointer;\n            }\n\n            button:hover {\n                background-color: var(--vscode-button-hoverBackground);\n            }\n\n            .risk-score {\n                text-align: center;\n                margin: 20px 0;\n            }\n\n            .score {\n                font-size: 48px;\n                font-weight: bold;\n                width: 100px;\n                height: 100px;\n                line-height: 100px;\n                border-radius: 50%;\n                margin: 0 auto;\n            }\n        ";
    };
    /**
     * Get JavaScript for reports
     */
    SecurityReportHtmlProvider.prototype.getReportScripts = function () {
        return "\n            const vscode = acquireVsCodeApi();\n\n            function showIssue(issueJson) {\n                const issue = JSON.parse(issueJson);\n                vscode.postMessage({\n                    command: 'showIssue',\n                    issue: issue\n                });\n            }\n\n            function applyFix(issueJson) {\n                const issue = JSON.parse(issueJson);\n                vscode.postMessage({\n                    command: 'applyFix',\n                    issue: issue\n                });\n            }\n\n            function exportReport(format) {\n                vscode.postMessage({\n                    command: 'exportReport',\n                    format: format\n                });\n            }\n        ";
    };
    /**
     * Get severity badge HTML
     */
    SecurityReportHtmlProvider.prototype.getSeverityBadge = function (severity) {
        return "<span class=\"severity-badge severity-".concat(severity, "\">").concat(severity.toUpperCase(), "</span>");
    };
    /**
     * Get risk score CSS class
     */
    SecurityReportHtmlProvider.prototype.getRiskClass = function (score) {
        if (score >= 75) {
            return 'severity-critical';
        }
        if (score >= 50) {
            return 'severity-high';
        }
        if (score >= 25) {
            return 'severity-medium';
        }
        return 'severity-low';
    };
    /**
     * Get highest severity from vulnerability info
     */
    SecurityReportHtmlProvider.prototype.getHighestSeverity = function (vulnerability) {
        var severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return vulnerability.vulnerabilityInfo.reduce(function (highest, info) {
            return severityOrder[info.severity] >
                severityOrder[highest]
                ? info.severity : highest;
        }, 'low');
    };
    /**
     * Escape HTML special characters
     */
    SecurityReportHtmlProvider.prototype.escapeHtml = function (str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    SecurityReportHtmlProvider.prototype.dispose = function () {
        // No cleanup needed
    };
    return SecurityReportHtmlProvider;
}());
exports.SecurityReportHtmlProvider = SecurityReportHtmlProvider;
