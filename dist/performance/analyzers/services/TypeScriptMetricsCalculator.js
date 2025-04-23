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
exports.TypeScriptMetricsCalculator = void 0;
const inversify_1 = require("inversify");
let TypeScriptMetricsCalculator = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TypeScriptMetricsCalculator = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TypeScriptMetricsCalculator = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        constructor(logger) {
            this.logger = logger;
        }
        calculateMetrics(content) {
            try {
                const lines = content.split('\n');
                return {
                    classCount: this.countPattern(content, /\bclass\s+\w+/g),
                    methodCount: this.countPattern(content, /\b(public|private|protected|async)?\s*\w+\s*\([^)]*\)\s*{/g),
                    importCount: this.countPattern(content, /^import\s+/gm),
                    commentRatio: this.calculateCommentRatio(content, lines),
                    averageMethodLength: this.calculateAverageMethodLength(content),
                    asyncMethodCount: this.countPattern(content, /\basync\s+/g),
                    promiseUsage: this.countPattern(content, /Promise\./g),
                    arrowFunctionCount: this.countPattern(content, /=>/g),
                    typeAnnotationCount: this.countPattern(content, /:\s*[A-Z]\w+/g),
                    eventListenerCount: this.countPattern(content, /addEventListener\(/g),
                    domManipulationCount: this.countPattern(content, /document\.|getElementById|querySelector/g)
                };
            }
            catch (error) {
                this.logger.error('Error calculating TypeScript metrics:', error);
                return {};
            }
        }
        countPattern(content, regex) {
            return (content.match(regex) || []).length;
        }
        calculateCommentRatio(content, lines) {
            const commentCount = (content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length;
            return Math.round((commentCount / lines.length) * 100);
        }
        calculateAverageMethodLength(content) {
            // ... existing implementation ...
        }
    };
    return TypeScriptMetricsCalculator = _classThis;
})();
exports.TypeScriptMetricsCalculator = TypeScriptMetricsCalculator;
//# sourceMappingURL=TypeScriptMetricsCalculator.js.map