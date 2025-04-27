"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.PerformanceMetricsService = void 0;
var inversify_1 = require("inversify");
var ILogger_1 = require("../../../logging/ILogger");
var events_1 = require("events");
var PerformanceMetricsService = /** @class */ (function (_super) {
    __extends(PerformanceMetricsService, _super);
    function PerformanceMetricsService(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        return _this;
    }
    PerformanceMetricsService.prototype.analyzeFile = function (document, progress) {
        return __awaiter(this, void 0, void 0, function () {
            var content, metrics, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        content = document.getText();
                        _a = {
                            cyclomaticComplexity: this.calculateComplexity(content),
                            maintainabilityIndex: this.calculateMaintainability(content),
                            linesOfCode: document.lineCount,
                            functionCount: this.countFunctions(content)
                        };
                        return [4 /*yield*/, this.detectDuplicateCode(content)];
                    case 1:
                        _a.duplicateCode = _b.sent();
                        return [4 /*yield*/, this.detectUnusedCode(document)];
                    case 2:
                        metrics = (_a.unusedCode = _b.sent(),
                            _a.timestamp = new Date().toISOString(),
                            _a);
                        this.emit('metricsCalculated', metrics);
                        return [2 /*return*/, metrics];
                    case 3:
                        error_1 = _b.sent();
                        this.handleError(new Error("Error calculating metrics: ".concat(error_1 instanceof Error ? error_1.message : String(error_1))));
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PerformanceMetricsService.prototype.calculateComplexity = function (content) {
        // Implementation details...
        return 0;
    };
    PerformanceMetricsService.prototype.calculateMaintainability = function (content) {
        // Implementation details...
        return 0;
    };
    PerformanceMetricsService.prototype.countFunctions = function (content) {
        // Implementation details...
        return 0;
    };
    PerformanceMetricsService.prototype.detectDuplicateCode = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation details...
                return [2 /*return*/, 0];
            });
        });
    };
    PerformanceMetricsService.prototype.detectUnusedCode = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation details...
                return [2 /*return*/, 0];
            });
        });
    };
    PerformanceMetricsService.prototype.handleError = function (error) {
        this.logger.error('[PerformanceMetricsService]', error);
        this.emit('error', error);
    };
    PerformanceMetricsService.prototype.dispose = function () {
        this.removeAllListeners();
    };
    var _a;
    PerformanceMetricsService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object])
    ], PerformanceMetricsService);
    return PerformanceMetricsService;
}(events_1.EventEmitter));
exports.PerformanceMetricsService = PerformanceMetricsService;
