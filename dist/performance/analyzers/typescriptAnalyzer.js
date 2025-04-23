"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptAnalyzer = void 0;
const inversify_1 = require("inversify");
const baseAnalyzer_1 = require("./baseAnalyzer");
let TypeScriptAnalyzer = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = baseAnalyzer_1.BasePerformanceAnalyzer;
    var TypeScriptAnalyzer = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TypeScriptAnalyzer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        patternAnalyzer;
        metricsCalculator;
        constructor(logger, patternAnalyzer, metricsCalculator, options) {
            super(options);
            this.logger = logger;
            this.patternAnalyzer = patternAnalyzer;
            this.metricsCalculator = metricsCalculator;
        }
        analyze(fileContent, filePath) {
            try {
                const result = this.createBaseResult(fileContent, filePath);
                const lines = fileContent.split('\n');
                // Analyze patterns and add issues
                result.issues.push(...this.patternAnalyzer.analyzeTypeScriptPatterns(fileContent, lines), ...this.analyzeArrayOperations(fileContent, lines), ...this.analyzeAsyncPatterns(fileContent, lines), ...this.analyzeMemoryUsage(fileContent, lines), ...this.analyzeDOMOperations(fileContent, lines), ...this.analyzeEventHandlers(fileContent, lines), ...this.analyzeCommonAntiPatterns(fileContent, lines));
                // Calculate and merge metrics
                result.metrics = {
                    ...result.metrics,
                    ...this.metricsCalculator.calculateMetrics(fileContent)
                };
                return result;
            }
            catch (error) {
                this.logger.error('Error analyzing TypeScript file:', error);
                return this.createErrorResult(fileContent, filePath, error);
            }
        }
        analyzeArrayOperations(fileContent, lines, result) {
            // Check for array concatenation in loops
            const arrayOpRegex = /for\s*\([^)]+\)\s*\{[^}]*?\.concat\(/gs;
            let match;
            while ((match = arrayOpRegex.exec(fileContent)) !== null) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                result.issues.push({
                    title: 'Inefficient Array Operation',
                    description: 'Array concatenation in loops creates unnecessary temporary arrays',
                    severity: 'medium',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Use array push or spread operator instead of concat',
                    solutionCode: '// Instead of:\nlet result = [];\nfor (const item of items) {\n    result = result.concat(process(item));\n}\n\n// Use:\nconst result = [];\nfor (const item of items) {\n    result.push(...process(item));\n}'
                });
            }
            // Check for indexOf in loops
            const indexOfInLoopRegex = /for\s*\([^)]+\)\s*\{[^}]*?\.indexOf\([^)]+\)/gs;
            while ((match = indexOfInLoopRegex.exec(fileContent)) !== null) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                result.issues.push({
                    title: 'Inefficient Array Search',
                    description: 'Using indexOf in loops can lead to O(n²) complexity',
                    severity: 'medium',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Use Set or Map for O(1) lookups',
                    solutionCode: '// Instead of:\nconst items = [...];\nfor (const item of data) {\n    if (items.indexOf(item) !== -1) { ... }\n}\n\n// Use:\nconst itemSet = new Set(items);\nfor (const item of data) {\n    if (itemSet.has(item)) { ... }\n}'
                });
            }
        }
        analyzeAsyncPatterns(fileContent, lines, result) {
            // Check for Promise.all usage with large arrays
            const promiseAllRegex = /Promise\.all\(\s*(\w+)\.map/g;
            let match;
            while ((match = promiseAllRegex.exec(fileContent)) !== null) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                result.issues.push({
                    title: 'Unbounded Parallel Promises',
                    description: 'Using Promise.all with map can start too many concurrent operations',
                    severity: 'medium',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Use Promise pool or limit concurrent operations',
                    solutionCode: '// Instead of:\nawait Promise.all(items.map(item => process(item)));\n\n// Use:\nconst pool = new PromisePool(items, item => process(item), { concurrency: 5 });\nawait pool.start();'
                });
            }
        }
        analyzeMemoryUsage(fileContent, lines, result) {
            // Check for closure memory leaks
            const closureLeakRegex = /setInterval\(\s*function\s*\([^)]*\)\s*\{[^}]*?this\./g;
            let match;
            while ((match = closureLeakRegex.exec(fileContent)) !== null) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                result.issues.push({
                    title: 'Potential Memory Leak',
                    description: 'Closure referencing this in setInterval can cause memory leaks',
                    severity: 'high',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Store references locally or use arrow functions',
                    solutionCode: '// Instead of:\nsetInterval(function() {\n    this.update();\n}, 1000);\n\n// Use:\nconst self = this;\nsetInterval(() => self.update(), 1000);'
                });
            }
        }
        analyzeDOMOperations(fileContent, lines, result) {
            // Check for frequent DOM updates
            const domUpdateRegex = /for\s*\([^)]+\)\s*\{[^}]*?(innerHTML|appendChild|removeChild)/g;
            let match;
            while ((match = domUpdateRegex.exec(fileContent)) !== null) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                result.issues.push({
                    title: 'Frequent DOM Updates',
                    description: 'Multiple DOM updates in a loop can cause layout thrashing',
                    severity: 'high',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Batch DOM updates or use DocumentFragment',
                    solutionCode: '// Instead of:\nfor (const item of items) {\n    container.appendChild(createNode(item));\n}\n\n// Use:\nconst fragment = document.createDocumentFragment();\nfor (const item of items) {\n    fragment.appendChild(createNode(item));\n}\ncontainer.appendChild(fragment);'
                });
            }
        }
        analyzeEventHandlers(fileContent, lines, result) {
            // Check for unbounded event listeners
            const eventListenerRegex = /addEventListener\([^)]+\)/g;
            const removeListenerRegex = /removeEventListener\([^)]+\)/g;
            const addCount = (fileContent.match(eventListenerRegex) || []).length;
            const removeCount = (fileContent.match(removeListenerRegex) || []).length;
            if (addCount > removeCount) {
                result.issues.push({
                    title: 'Potential Event Listener Leak',
                    description: 'More event listeners are added than removed',
                    severity: 'medium',
                    line: 1,
                    code: this.extractCodeSnippet(lines, 0, 3),
                    solution: 'Ensure all event listeners are properly removed',
                    solutionCode: '// Instead of:\nelement.addEventListener("click", handler);\n// ... never removed\n\n// Use:\nconst handler = (e) => { ... };\nelement.addEventListener("click", handler);\n// Later when done:\nelement.removeEventListener("click", handler);'
                });
            }
        }
        calculateTypeScriptMetrics(content) {
            const lines = content.split('\n');
            return {
                classCount: (content.match(/\bclass\s+\w+/g) || []).length,
                methodCount: (content.match(/\b(public|private|protected|async)?\s*\w+\s*\([^)]*\)\s*{/g) || []).length,
                importCount: (content.match(/^import\s+/gm) || []).length,
                commentRatio: Math.round(((content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length / lines.length) * 100),
                averageMethodLength: this.calculateAverageMethodLength(content),
                asyncMethodCount: (content.match(/\basync\s+/g) || []).length,
                promiseUsage: (content.match(/Promise\./g) || []).length,
                arrowFunctionCount: (content.match(/=>/g) || []).length,
                typeAnnotationCount: (content.match(/:\s*[A-Z]\w+/g) || []).length,
                eventListenerCount: (content.match(/addEventListener\(/g) || []).length,
                domManipulationCount: (content.match(/document\.|getElementById|querySelector/g) || []).length
            };
        }
        calculateAverageMethodLength(content) {
            const methodRegex = /\b(public|private|protected|async)?\s*\w+\s*\([^)]*\)\s*{/g;
            const methods = content.match(methodRegex);
            if (!methods)
                return 0;
            let totalLines = 0;
            let methodCount = 0;
            const lines = content.split('\n');
            methods.forEach(method => {
                const startIndex = content.indexOf(method);
                const lineIndex = this.findLineNumber(content, startIndex);
                let bracketCount = 1;
                let currentLine = lineIndex;
                while (bracketCount > 0 && currentLine < lines.length) {
                    const line = lines[currentLine];
                    bracketCount += (line.match(/{/g) || []).length;
                    bracketCount -= (line.match(/}/g) || []).length;
                    currentLine++;
                }
                totalLines += currentLine - lineIndex;
                methodCount++;
            });
            return Math.round(totalLines / methodCount);
        }
    };
    return TypeScriptAnalyzer = _classThis;
})();
exports.TypeScriptAnalyzer = TypeScriptAnalyzer;
//# sourceMappingURL=typescriptAnalyzer.js.map