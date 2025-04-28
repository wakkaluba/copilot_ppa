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
exports.BundleAnalyzer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class BundleAnalyzer {
    /**
     * Analyzes bundle files in a directory
     */
    async analyzeDirectory(directoryPath) {
        const files = await this.scanDirectory(directoryPath);
        // Calculate sizes
        let totalSize = 0;
        let jsSize = 0;
        let cssSize = 0;
        let imageSize = 0;
        let otherSize = 0;
        for (const file of files) {
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
        // Generate recommendations
        const recommendations = this.generateRecommendations(files, {
            totalSize,
            jsSize,
            cssSize,
            imageSize,
            otherSize
        });
        return {
            totalSize,
            jsSize,
            cssSize,
            imageSize,
            otherSize,
            files,
            recommendations
        };
    }
    async scanDirectory(directoryPath) {
        const result = [];
        // Read the directory
        const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                // Recursively scan subdirectories
                const subdirFiles = await this.scanDirectory(fullPath);
                result.push(...subdirFiles);
            }
            else if (entry.isFile()) {
                // Get file size and extension
                const stats = fs.statSync(fullPath);
                const extension = path.extname(entry.name).toLowerCase();
                result.push({
                    path: fullPath,
                    size: stats.size,
                    extension
                });
            }
        }
        return result;
    }
    generateRecommendations(files, sizes) {
        const recommendations = [];
        // Check JavaScript size
        if (sizes.jsSize > 500 * 1024) { // If JS is larger than 500KB
            // Find largest JS files
            const jsFiles = files
                .filter(f => f.extension === '.js' || f.extension === '.mjs')
                .sort((a, b) => b.size - a.size);
            if (jsFiles.length > 0) {
                const largestFile = jsFiles[0];
                const potentialSavings = Math.floor(largestFile.size * 0.3); // Assume 30% reduction possible
                recommendations.push({
                    title: 'Consider Code Splitting for Large JavaScript Bundles',
                    description: `The largest JavaScript file (${path.basename(largestFile.path)}) is ${this.formatSize(largestFile.size)}. Consider implementing code splitting to load JavaScript on demand.`,
                    potentialSavings
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
        const vendorBundles = files.filter(f => (f.path.includes('vendor') || f.path.includes('chunk-vendors')) &&
            (f.extension === '.js' || f.extension === '.mjs'));
        if (vendorBundles.length > 0) {
            const totalVendorSize = vendorBundles.reduce((sum, file) => sum + file.size, 0);
            if (totalVendorSize > 250 * 1024) { // If vendor bundle is larger than 250KB
                recommendations.push({
                    title: 'Analyze and Optimize Vendor Dependencies',
                    description: 'Your vendor bundle is large. Consider using smaller alternatives for dependencies or implement dynamic imports.',
                    potentialSavings: Math.floor(totalVendorSize * 0.25) // Assume 25% reduction possible
                });
            }
        }
        // Check for duplicate resources
        const fileNames = new Map();
        const duplicates = [];
        for (const file of files) {
            const name = path.basename(file.path);
            if (fileNames.has(name)) {
                fileNames.set(name, fileNames.get(name) + 1);
                duplicates.push(name);
            }
            else {
                fileNames.set(name, 1);
            }
        }
        const uniqueDuplicates = [...new Set(duplicates)];
        if (uniqueDuplicates.length > 0) {
            recommendations.push({
                title: 'Check for Duplicate Resources',
                description: `Found ${uniqueDuplicates.length} potentially duplicate resource names: ${uniqueDuplicates.slice(0, 3).join(', ')}${uniqueDuplicates.length > 3 ? '...' : ''}`
            });
        }
        // General recommendations
        recommendations.push({
            title: 'Enable Compression',
            description: 'Ensure your server is configured to serve resources with gzip or brotli compression.',
            potentialSavings: Math.floor(sizes.totalSize * 0.6) // Assume 60% reduction possible with compression
        });
        if (files.some(f => f.extension === '.map')) {
            recommendations.push({
                title: 'Remove Source Maps in Production',
                description: 'Source maps were detected in the build output. For production, consider disabling source maps to reduce total size.'
            });
        }
        return recommendations;
    }
    formatSize(bytes) {
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        else if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        }
        else {
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        }
    }
}
exports.BundleAnalyzer = BundleAnalyzer;
//# sourceMappingURL=bundleAnalyzer.js.map