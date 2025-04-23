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
exports.PerformanceMetricsService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
let PerformanceMetricsService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var PerformanceMetricsService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PerformanceMetricsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        constructor(logger) {
            super();
            this.logger = logger;
        }
        async analyzeFile(document, progress) {
            try {
                const content = document.getText();
                const metrics = {
                    cyclomaticComplexity: this.calculateComplexity(content),
                    maintainabilityIndex: this.calculateMaintainability(content),
                    linesOfCode: document.lineCount,
                    functionCount: this.countFunctions(content),
                    duplicateCode: await this.detectDuplicateCode(content),
                    unusedCode: await this.detectUnusedCode(document),
                    timestamp: new Date().toISOString()
                };
                this.emit('metricsCalculated', metrics);
                return metrics;
            }
            catch (error) {
                this.handleError(new Error(`Error calculating metrics: ${error instanceof Error ? error.message : String(error)}`));
                throw error;
            }
        }
        calculateComplexity(content) {
            // Implementation details...
            return 0;
        }
        calculateMaintainability(content) {
            // Implementation details...
            return 0;
        }
        countFunctions(content) {
            // Implementation details...
            return 0;
        }
        async detectDuplicateCode(content) {
            // Implementation details...
            return 0;
        }
        async detectUnusedCode(document) {
            // Implementation details...
            return 0;
        }
        handleError(error) {
            this.logger.error('[PerformanceMetricsService]', error);
            this.emit('error', error);
        }
        dispose() {
            this.removeAllListeners();
        }
    };
    return PerformanceMetricsService = _classThis;
})();
exports.PerformanceMetricsService = PerformanceMetricsService;
//# sourceMappingURL=PerformanceMetricsService.js.map