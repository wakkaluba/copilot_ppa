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
exports.ViteConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
class ViteConfigManager {
    /**
     * Detects Vite configuration files in the given directory
     */
    async detectConfigs(workspacePath) {
        return new Promise((resolve, reject) => {
            const patterns = [
                'vite.config.js',
                'vite.config.ts',
                'vite.config.mjs',
                'vite.*.js',
                'vite.*.ts',
                'vite.*.mjs'
            ];
            const configs = [];
            for (const pattern of patterns) {
                const matches = glob.sync(pattern, { cwd: workspacePath });
                for (const match of matches) {
                    configs.push(path.join(workspacePath, match));
                }
            }
            // Remove duplicates
            resolve([...new Set(configs)]);
        });
    }
    /**
     * Analyzes a Vite configuration file
     */
    async analyzeConfig(configPath) {
        try {
            const content = fs.readFileSync(configPath, 'utf-8');
            // Simple regex-based analysis for demonstration purposes
            const pluginMatches = Array.from(content.matchAll(/plugins\s*:\s*\[([^\]]*)\]/gs) || []);
            const buildMatch = content.match(/build\s*:\s*{([^}]*)}/s);
            const serverMatch = content.match(/server\s*:\s*{([^}]*)}/s);
            // Extract plugins
            const plugins = this.extractPlugins(pluginMatches);
            // Extract build options
            const buildOptions = this.extractBuildOptions(buildMatch ? buildMatch[1] : '');
            // Extract server options
            const serverOptions = this.extractServerOptions(serverMatch ? serverMatch[1] : '');
            // Generate optimization suggestions
            const optimizationSuggestions = this.generateOptimizationSuggestions(content, plugins, buildOptions, serverOptions);
            return {
                plugins,
                buildOptions,
                serverOptions,
                optimizationSuggestions
            };
        }
        catch (error) {
            console.error('Error analyzing Vite config:', error);
            throw error;
        }
    }
    /**
     * Generates optimization suggestions for a Vite configuration
     */
    async generateOptimizations(configPath) {
        const analysis = await this.analyzeConfig(configPath);
        return analysis.optimizationSuggestions;
    }
    extractPlugins(pluginMatches) {
        const plugins = [];
        for (const match of pluginMatches) {
            const pluginContent = match[1];
            // Extract plugin names
            const pluginNameMatches = Array.from(pluginContent.matchAll(/(\w+)\(/g));
            for (const pluginMatch of pluginNameMatches) {
                const pluginName = pluginMatch[1];
                if (!plugins.includes(pluginName)) {
                    plugins.push(pluginName);
                }
            }
        }
        return plugins;
    }
    extractBuildOptions(buildStr) {
        const options = {};
        const targetMatch = buildStr.match(/target\s*:\s*['"]([^'"]*)['"]/);
        if (targetMatch) {
            options.target = targetMatch[1];
        }
        const outDirMatch = buildStr.match(/outDir\s*:\s*['"]([^'"]*)['"]/);
        if (outDirMatch) {
            options.outDir = outDirMatch[1];
        }
        const assetsInlineLimit = buildStr.match(/assetsInlineLimit\s*:\s*(\d+)/);
        if (assetsInlineLimit) {
            options.assetsInlineLimit = parseInt(assetsInlineLimit[1], 10);
        }
        const cssCodeSplitMatch = buildStr.match(/cssCodeSplit\s*:\s*(true|false)/);
        if (cssCodeSplitMatch) {
            options.cssCodeSplit = cssCodeSplitMatch[1] === 'true';
        }
        const sourcemapMatch = buildStr.match(/sourcemap\s*:\s*(true|false|['"][^'"]*['"]\s*)/);
        if (sourcemapMatch) {
            options.sourcemap = sourcemapMatch[1] === 'true' ? true :
                sourcemapMatch[1] === 'false' ? false :
                    sourcemapMatch[1].replace(/['"]/g, '');
        }
        const minifyMatch = buildStr.match(/minify\s*:\s*(true|false|['"][^'"]*['"]\s*)/);
        if (minifyMatch) {
            options.minify = minifyMatch[1] === 'true' ? true :
                minifyMatch[1] === 'false' ? false :
                    minifyMatch[1].replace(/['"]/g, '');
        }
        return options;
    }
    extractServerOptions(serverStr) {
        const options = {};
        const portMatch = serverStr.match(/port\s*:\s*(\d+)/);
        if (portMatch) {
            options.port = parseInt(portMatch[1], 10);
        }
        const hostMatch = serverStr.match(/host\s*:\s*(true|false|['"][^'"]*['"]\s*)/);
        if (hostMatch) {
            options.host = hostMatch[1] === 'true' ? true :
                hostMatch[1] === 'false' ? false :
                    hostMatch[1].replace(/['"]/g, '');
        }
        const httpsMatch = serverStr.match(/https\s*:\s*(true|false)/);
        if (httpsMatch) {
            options.https = httpsMatch[1] === 'true';
        }
        const corsMatch = serverStr.match(/cors\s*:\s*(true|false)/);
        if (corsMatch) {
            options.cors = corsMatch[1] === 'true';
        }
        const hmrMatch = serverStr.match(/hmr\s*:\s*(true|false)/);
        if (hmrMatch) {
            options.hmr = hmrMatch[1] === 'true';
        }
        return options;
    }
    generateOptimizationSuggestions(content, plugins, buildOptions, serverOptions) {
        const suggestions = [];
        // Check for build target
        if (!buildOptions.target) {
            suggestions.push({
                title: 'Specify Build Target',
                description: 'Specify a build target for better browser compatibility',
                code: `
export default {
  // ...
  build: {
    target: 'es2015', // or 'modules' for modern browsers
    // ...other build options
  }
};`
            });
        }
        // Check for CSS code splitting
        if (buildOptions.cssCodeSplit === false) {
            suggestions.push({
                title: 'Enable CSS Code Splitting',
                description: 'Consider enabling CSS code splitting for better caching and performance',
                code: `
export default {
  // ...
  build: {
    cssCodeSplit: true,
    // ...other build options
  }
};`
            });
        }
        // Check for source maps in production
        if (buildOptions.sourcemap === true && !content.includes('process.env.NODE_ENV')) {
            suggestions.push({
                title: 'Disable Source Maps in Production',
                description: 'Consider disabling source maps in production for better performance',
                code: `
export default {
  // ...
  build: {
    sourcemap: process.env.NODE_ENV !== 'production',
    // ...other build options
  }
};`
            });
        }
        // Check for build analyzer
        if (!plugins.includes('visualizer') && !content.includes('rollup-plugin-visualizer')) {
            suggestions.push({
                title: 'Add Bundle Analyzer',
                description: 'Use rollup-plugin-visualizer to analyze your bundle size',
                code: `
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  // ...
  plugins: [
    // ...existing plugins
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
};`
            });
        }
        // Check for compression plugin
        if (!plugins.includes('compression') && !content.includes('vite-plugin-compression')) {
            suggestions.push({
                title: 'Add Compression Plugin',
                description: 'Use vite-plugin-compression to pre-compress your assets',
                code: `
import compression from 'vite-plugin-compression';

export default {
  // ...
  plugins: [
    // ...existing plugins
    compression(),
  ],
};`
            });
        }
        // Check for legacy browsers support
        if (!plugins.includes('legacy') && !content.includes('@vitejs/plugin-legacy')) {
            suggestions.push({
                title: 'Add Legacy Browsers Support',
                description: 'Use @vitejs/plugin-legacy to support older browsers',
                code: `
import legacy from '@vitejs/plugin-legacy';

export default {
  // ...
  plugins: [
    // ...existing plugins
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
};`
            });
        }
        // Check for build caching
        if (!content.includes('build.cache') && !content.includes('cache: {')) {
            suggestions.push({
                title: 'Enable Build Caching',
                description: 'Enable build caching for faster builds',
                code: `
export default {
  // ...
  build: {
    // ...other build options
    cache: true,
  },
};`
            });
        }
        return suggestions;
    }
}
exports.ViteConfigManager = ViteConfigManager;
//# sourceMappingURL=viteConfigManager.js.map