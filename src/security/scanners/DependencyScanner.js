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
exports.DependencyScanner = void 0;
var child_process_1 = require("child_process");
var util_1 = require("util");
var SecurityVulnerabilityDatabase_1 = require("../database/SecurityVulnerabilityDatabase");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Scanner for checking dependencies for known vulnerabilities
 */
var DependencyScanner = /** @class */ (function () {
    function DependencyScanner(context) {
        this.context = context;
        this.npmAuditCache = new Map();
        this.cacheTimeout = 1000 * 60 * 60; // 1 hour
        this.vulnerabilityDb = new SecurityVulnerabilityDatabase_1.SecurityVulnerabilityDatabase(context);
    }
    /**
     * Check dependencies for known vulnerabilities
     */
    DependencyScanner.prototype.checkVulnerabilities = function (dependencies) {
        return __awaiter(this, void 0, void 0, function () {
            var vulnerabilities, cacheKey, cached, stdout, auditResult, _i, _a, _b, pkgName, vuln, vulnInfo, error_1, _c, _d, _e, name_1, version, vulns;
            var _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        vulnerabilities = [];
                        cacheKey = JSON.stringify(dependencies);
                        cached = this.npmAuditCache.get(cacheKey);
                        if (cached && Date.now() - ((_f = cached[0]) === null || _f === void 0 ? void 0 : _f.timestamp) < this.cacheTimeout) {
                            return [2 /*return*/, cached];
                        }
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 7, , 12]);
                        return [4 /*yield*/, execAsync('npm audit --json', {
                                maxBuffer: 1024 * 1024 * 10 // 10MB
                            })];
                    case 2:
                        stdout = (_k.sent()).stdout;
                        auditResult = JSON.parse(stdout);
                        if (!auditResult.vulnerabilities) return [3 /*break*/, 6];
                        _i = 0, _a = Object.entries(auditResult.vulnerabilities);
                        _k.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], pkgName = _b[0], vuln = _b[1];
                        if (!dependencies[pkgName]) {
                            return [3 /*break*/, 5];
                        }
                        return [4 /*yield*/, this.enrichVulnerabilityInfo(vuln)];
                    case 4:
                        vulnInfo = _k.sent();
                        vulnerabilities.push({
                            name: pkgName,
                            version: dependencies[pkgName],
                            vulnerabilityInfo: vulnInfo,
                            fixAvailable: vuln.fixAvailable || false,
                            fixedVersion: (_g = vuln.fixAvailable) === null || _g === void 0 ? void 0 : _g.version,
                            timestamp: new Date()
                        });
                        _k.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 12];
                    case 7:
                        error_1 = _k.sent();
                        console.error('Error running npm audit:', error_1);
                        _c = 0, _d = Object.entries(dependencies);
                        _k.label = 8;
                    case 8:
                        if (!(_c < _d.length)) return [3 /*break*/, 11];
                        _e = _d[_c], name_1 = _e[0], version = _e[1];
                        return [4 /*yield*/, this.vulnerabilityDb.checkPackage(name_1, version)];
                    case 9:
                        vulns = _k.sent();
                        if (vulns.length > 0) {
                            vulnerabilities.push({
                                name: name_1,
                                version: version,
                                vulnerabilityInfo: vulns,
                                fixAvailable: vulns.some(function (v) { var _a; return ((_a = v.patchedVersions) === null || _a === void 0 ? void 0 : _a.length) > 0; }),
                                fixedVersion: (_j = (_h = vulns[0]) === null || _h === void 0 ? void 0 : _h.patchedVersions) === null || _j === void 0 ? void 0 : _j[0],
                                timestamp: new Date()
                            });
                        }
                        _k.label = 10;
                    case 10:
                        _c++;
                        return [3 /*break*/, 8];
                    case 11: return [3 /*break*/, 12];
                    case 12:
                        // Update cache
                        this.npmAuditCache.set(cacheKey, vulnerabilities);
                        return [2 /*return*/, vulnerabilities];
                }
            });
        });
    };
    /**
     * Get detailed information about a specific vulnerability
     */
    DependencyScanner.prototype.getVulnerabilityDetails = function (vulnId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.vulnerabilityDb.getVulnerabilityDetails(vulnId)];
            });
        });
    };
    /**
     * Enrich vulnerability information with additional details
     */
    DependencyScanner.prototype.enrichVulnerabilityInfo = function (vuln) {
        return __awaiter(this, void 0, void 0, function () {
            var vulnInfo, _i, _a, advisory;
            var _b;
            return __generator(this, function (_c) {
                vulnInfo = [];
                for (_i = 0, _a = vuln.via || []; _i < _a.length; _i++) {
                    advisory = _a[_i];
                    if (typeof advisory === 'object') {
                        vulnInfo.push({
                            id: advisory.url || ((_b = advisory.cwe) === null || _b === void 0 ? void 0 : _b[0]) || 'UNKNOWN',
                            title: advisory.title || 'Unknown Vulnerability',
                            description: advisory.description || 'No description available',
                            severity: this.mapSeverity(advisory.severity),
                            vulnerableVersions: advisory.vulnerable_versions,
                            patchedVersions: advisory.patched_versions,
                            references: advisory.references,
                            recommendation: advisory.recommendation,
                            publishedDate: advisory.published
                        });
                    }
                }
                return [2 /*return*/, vulnInfo];
            });
        });
    };
    /**
     * Map npm audit severity to our severity levels
     */
    DependencyScanner.prototype.mapSeverity = function (severity) {
        switch (severity === null || severity === void 0 ? void 0 : severity.toLowerCase()) {
            case 'critical': return 'critical';
            case 'high': return 'high';
            case 'moderate':
            case 'medium': return 'medium';
            default: return 'low';
        }
    };
    DependencyScanner.prototype.dispose = function () {
        this.npmAuditCache.clear();
    };
    return DependencyScanner;
}());
exports.DependencyScanner = DependencyScanner;
