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
exports.AnalyzerFactory = void 0;
const typescriptAnalyzer_1 = require("./typescriptAnalyzer");
const pythonAnalyzer_1 = require("./pythonAnalyzer");
const path = __importStar(require("path"));
class AnalyzerFactory {
    constructor() {
        this.analyzers = new Map();
        this.registerDefaultAnalyzers();
    }
    static getInstance() {
        if (!AnalyzerFactory.instance) {
            AnalyzerFactory.instance = new AnalyzerFactory();
        }
        return AnalyzerFactory.instance;
    }
    getAnalyzer(filePath, options) {
        const extension = path.extname(filePath).toLowerCase();
        const analyzerClass = this.analyzers.get(extension) || this.analyzers.get('.*');
        if (!analyzerClass) {
            throw new Error(`No analyzer found for file type: ${extension}`);
        }
        return new analyzerClass(options);
    }
    registerAnalyzer(extensions, analyzerClass) {
        extensions.forEach(ext => {
            this.analyzers.set(ext.toLowerCase(), analyzerClass);
        });
    }
    registerDefaultAnalyzers() {
        // Register TypeScript/JavaScript analyzer
        this.registerAnalyzer(['.ts', '.tsx', '.js', '.jsx'], typescriptAnalyzer_1.TypeScriptAnalyzer);
        // Register Python analyzer
        this.registerAnalyzer(['.py', '.pyw'], pythonAnalyzer_1.PythonAnalyzer);
        // Default analyzer for unknown file types
        this.registerAnalyzer(['.*'], typescriptAnalyzer_1.TypeScriptAnalyzer);
    }
}
exports.AnalyzerFactory = AnalyzerFactory;
//# sourceMappingURL=analyzerFactory.js.map