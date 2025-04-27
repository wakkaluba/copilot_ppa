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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleAnalyzer = void 0;
var fs = require("fs");
var path = require("path");
var BundleAnalyzer = /** @class */ (function () {
    function BundleAnalyzer() {
    }
    /**
     * Analyzes bundle files in a directory
     */
    BundleAnalyzer.prototype.analyzeDirectory = function (directoryPath) {
        return __awaiter(this, void 0, void 0, function () {
            var files, totalSize, jsSize, cssSize, imageSize, otherSize, _i, files_1, file, recommendations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.scanDirectory(directoryPath)];
                    case 1:
                        files = _a.sent();
                        totalSize = 0;
                        jsSize = 0;
                        cssSize = 0;
                        imageSize = 0;
                        otherSize = 0;
                        for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                            file = files_1[_i];
                            totalSize += file.size;
                            switch (file.extension) {
                                case '.js':
                                case '.mjs':
                                    jsSize += file.size;
                                    break;
                                case '.css':
                                    cssSize += file.size;
                                    break;
                                case '.png':
                                case '.jpg':
                                case '.jpeg':
                                case '.gif':
                                case '.svg':
                                case '.webp':
                                    imageSize += file.size;
                                    break;
                                default:
                                    otherSize += file.size;
                                    break;
                            }
                        }
                        recommendations = this.generateRecommendations(files, {
                            totalSize: totalSize,
                            jsSize: jsSize,
                            cssSize: cssSize,
                            imageSize: imageSize,
                            otherSize: otherSize
                        });
                        return [2 /*return*/, {
                                totalSize: totalSize,
                                jsSize: jsSize,
                                cssSize: cssSize,
                                imageSize: imageSize,
                                otherSize: otherSize,
                                files: files,
                                recommendations: recommendations
                            }];
                }
            });
        });
    };
    BundleAnalyzer.prototype.scanDirectory = function (directoryPath) {
        return __awaiter(this, void 0, void 0, function () {
            var result, entries, _i, entries_1, entry, fullPath, subdirFiles, stats, extension;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = [];
                        entries = fs.readdirSync(directoryPath, { withFileTypes: true });
                        _i = 0, entries_1 = entries;
                        _a.label = 1;
                    case 1:
                        if (!(_i < entries_1.length)) return [3 /*break*/, 5];
                        entry = entries_1[_i];
                        fullPath = path.join(directoryPath, entry.name);
                        if (!entry.isDirectory()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.scanDirectory(fullPath)];
                    case 2:
                        subdirFiles = _a.sent();
                        result.push.apply(result, subdirFiles);
                        return [3 /*break*/, 4];
                    case 3:
                        if (entry.isFile()) {
                            stats = fs.statSync(fullPath);
                            extension = path.extname(entry.name).toLowerCase();
                            result.push({
                                path: fullPath,
                                size: stats.size,
                                extension: extension
                            });
                        }
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, result];
                }
            });
        });
    };
    BundleAnalyzer.prototype.generateRecommendations = function (files, sizes) {
        var recommendations = [];
        // Check JavaScript size
        if (sizes.jsSize > 500 * 1024) { // If JS is larger than 500KB
            // Find largest JS files
            var jsFiles = files
                .filter(function (f) { return f.extension === '.js' || f.extension === '.mjs'; })
                .sort(function (a, b) { return b.size - a.size; });
            if (jsFiles.length > 0) {
                var largestFile = jsFiles[0];
                var potentialSavings = Math.floor(largestFile.size * 0.3); // Assume 30% reduction possible
                recommendations.push({
                    title: 'Consider Code Splitting for Large JavaScript Bundles',
                    description: "The largest JavaScript file (".concat(path.basename(largestFile.path), ") is ").concat(this.formatSize(largestFile.size), ". Consider implementing code splitting to load JavaScript on demand."),
                    potentialSavings: potentialSavings
                });
            }
            recommendations.push({
                title: 'Implement Tree Shaking',
                description: 'Ensure your bundler is configured to perform tree shaking to eliminate unused code.',
                potentialSavings: Math.floor(sizes.jsSize * 0.15) // Assume 15% reduction possible
            });
        }
        // Check CSS size
        if (sizes.cssSize > 100 * 1024) { // If CSS is larger than 100KB
            recommendations.push({
                title: 'Optimize CSS',
                description: 'Consider using CSS optimization tools like PurgeCSS to remove unused styles.',
                potentialSavings: Math.floor(sizes.cssSize * 0.4) // Assume 40% reduction possible
            });
        }
        // Check image size
        if (sizes.imageSize > 1024 * 1024) { // If images are larger than 1MB
            recommendations.push({
                title: 'Optimize Images',
                description: 'Use image optimization tools or consider implementing responsive images with srcset.',
                potentialSavings: Math.floor(sizes.imageSize * 0.5) // Assume 50% reduction possible
            });
        }
        // Check for vendor bundle
        var vendorBundles = files.filter(function (f) {
            return (f.path.includes('vendor') || f.path.includes('chunk-vendors')) &&
                (f.extension === '.js' || f.extension === '.mjs');
        });
        if (vendorBundles.length > 0) {
            var totalVendorSize = vendorBundles.reduce(function (sum, file) { return sum + file.size; }, 0);
            if (totalVendorSize > 250 * 1024) { // If vendor bundle is larger than 250KB
                recommendations.push({
                    title: 'Analyze and Optimize Vendor Dependencies',
                    description: 'Your vendor bundle is large. Consider using smaller alternatives for dependencies or implement dynamic imports.',
                    potentialSavings: Math.floor(totalVendorSize * 0.25) // Assume 25% reduction possible
                });
            }
        }
        // Check for duplicate resources
        var fileNames = new Map();
        var duplicates = [];
        for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
            var file = files_2[_i];
            var name_1 = path.basename(file.path);
            if (fileNames.has(name_1)) {
                fileNames.set(name_1, fileNames.get(name_1) + 1);
                duplicates.push(name_1);
            }
            else {
                fileNames.set(name_1, 1);
            }
        }
        var uniqueDuplicates = __spreadArray([], new Set(duplicates), true);
        if (uniqueDuplicates.length > 0) {
            recommendations.push({
                title: 'Check for Duplicate Resources',
                description: "Found ".concat(uniqueDuplicates.length, " potentially duplicate resource names: ").concat(uniqueDuplicates.slice(0, 3).join(', ')).concat(uniqueDuplicates.length > 3 ? '...' : '')
            });
        }
        // General recommendations
        recommendations.push({
            title: 'Enable Compression',
            description: 'Ensure your server is configured to serve resources with gzip or brotli compression.',
            potentialSavings: Math.floor(sizes.totalSize * 0.6) // Assume 60% reduction possible with compression
        });
        if (files.some(function (f) { return f.extension === '.map'; })) {
            recommendations.push({
                title: 'Remove Source Maps in Production',
                description: 'Source maps were detected in the build output. For production, consider disabling source maps to reduce total size.'
            });
        }
        return recommendations;
    };
    BundleAnalyzer.prototype.formatSize = function (bytes) {
        if (bytes < 1024) {
            return "".concat(bytes, " B");
        }
        else if (bytes < 1024 * 1024) {
            return "".concat((bytes / 1024).toFixed(2), " KB");
        }
        else {
            return "".concat((bytes / (1024 * 1024)).toFixed(2), " MB");
        }
    };
    return BundleAnalyzer;
}());
exports.BundleAnalyzer = BundleAnalyzer;
