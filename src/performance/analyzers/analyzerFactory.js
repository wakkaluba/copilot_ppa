"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzerFactory = void 0;
var typescriptAnalyzer_1 = require("./typescriptAnalyzer");
var pythonAnalyzer_1 = require("./pythonAnalyzer");
var path = require("path");
var AnalyzerFactory = /** @class */ (function () {
    function AnalyzerFactory() {
        this.analyzers = new Map();
        this.registerDefaultAnalyzers();
    }
    AnalyzerFactory.getInstance = function () {
        if (!AnalyzerFactory.instance) {
            AnalyzerFactory.instance = new AnalyzerFactory();
        }
        return AnalyzerFactory.instance;
    };
    AnalyzerFactory.prototype.getAnalyzer = function (filePath, options) {
        var extension = path.extname(filePath).toLowerCase();
        var analyzerClass = this.analyzers.get(extension) || this.analyzers.get('.*');
        if (!analyzerClass) {
            throw new Error("No analyzer found for file type: ".concat(extension));
        }
        return new analyzerClass(options);
    };
    AnalyzerFactory.prototype.registerAnalyzer = function (extensions, analyzerClass) {
        var _this = this;
        extensions.forEach(function (ext) {
            _this.analyzers.set(ext.toLowerCase(), analyzerClass);
        });
    };
    AnalyzerFactory.prototype.registerDefaultAnalyzers = function () {
        // Register TypeScript/JavaScript analyzer
        this.registerAnalyzer(['.ts', '.tsx', '.js', '.jsx'], typescriptAnalyzer_1.TypeScriptAnalyzer);
        // Register Python analyzer
        this.registerAnalyzer(['.py', '.pyw'], pythonAnalyzer_1.PythonAnalyzer);
        // Default analyzer for unknown file types
        this.registerAnalyzer(['.*'], typescriptAnalyzer_1.TypeScriptAnalyzer);
    };
    return AnalyzerFactory;
}());
exports.AnalyzerFactory = AnalyzerFactory;
