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
exports.modelRecommendationService = exports.ModelRecommendationService = void 0;
var axios_1 = require("axios");
/**
 * Service for recommending LLM models based on system capabilities
 */
var ModelRecommendationService = /** @class */ (function () {
    function ModelRecommendationService() {
    }
    /**
     * Get hardware specifications of the current system
     */
    ModelRecommendationService.prototype.getHardwareSpecs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var specs;
            return __generator(this, function (_a) {
                try {
                    specs = {
                        gpu: {
                            available: false
                        },
                        ram: {
                            total: 16384, // Assume 16GB as default
                            free: 8192 // Assume 8GB free
                        },
                        cpu: {
                            cores: 8
                        }
                    };
                    // In a real implementation, we would detect CUDA/GPU here
                    try {
                        // Check for CUDA support - this is just a placeholder
                        // In reality, we would use node-gpu or similar libraries
                        specs.gpu.available = true;
                        specs.gpu.name = "Generic GPU";
                        specs.gpu.vram = 4096; // 4GB
                        specs.gpu.cudaSupport = true;
                    }
                    catch (error) {
                        console.log('No GPU detected or error detecting GPU:', error);
                    }
                    return [2 /*return*/, specs];
                }
                catch (error) {
                    console.error('Error getting hardware specs:', error);
                    throw new Error("Failed to get hardware specifications: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Check if Ollama server is running and get available models
     */
    ModelRecommendationService.prototype.checkOllamaAvailability = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get('http://localhost:11434/api/tags', {
                                timeout: 2000
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.status === 200 && response.data && response.data.models) {
                            return [2 /*return*/, response.data.models.map(function (model) { return model.name; })];
                        }
                        return [2 /*return*/, []];
                    case 2:
                        error_1 = _a.sent();
                        console.log('Ollama server not available:', error_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if LM Studio server is running and get available models
     */
    ModelRecommendationService.prototype.checkLmStudioAvailability = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get('http://localhost:1234/v1/models', {
                                timeout: 2000
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.status === 200 && response.data && response.data.data) {
                            return [2 /*return*/, response.data.data.map(function (model) { return model.id; })];
                        }
                        return [2 /*return*/, []];
                    case 2:
                        error_2 = _a.sent();
                        console.log('LM Studio server not available:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get model recommendations based on hardware specs and available models
     */
    ModelRecommendationService.prototype.getModelRecommendations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var specs, ollamaModels, lmStudioModels, baseRecommendations, recommendations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getHardwareSpecs()];
                    case 1:
                        specs = _a.sent();
                        return [4 /*yield*/, this.checkOllamaAvailability()];
                    case 2:
                        ollamaModels = _a.sent();
                        return [4 /*yield*/, this.checkLmStudioAvailability()];
                    case 3:
                        lmStudioModels = _a.sent();
                        baseRecommendations = [
                            {
                                modelName: 'llama2',
                                provider: 'ollama',
                                description: 'General purpose model with good performance across various tasks.',
                                suitability: specs.gpu.available ? 90 : 70,
                                minRequirements: {
                                    vram: 4000,
                                    ram: 8000
                                },
                                useCases: ['Code completion', 'Text generation', 'Summarization'],
                                quantization: 'Q4_0'
                            },
                            {
                                modelName: 'codellama',
                                provider: 'ollama',
                                description: 'Specialized model for code generation and understanding.',
                                suitability: specs.gpu.available ? 95 : 75,
                                minRequirements: {
                                    vram: 6000,
                                    ram: 8000
                                },
                                useCases: ['Code completion', 'Code explanation', 'Refactoring suggestions'],
                                quantization: 'Q4_0'
                            },
                            {
                                modelName: 'mistral',
                                provider: 'ollama',
                                description: 'Efficient and powerful general-purpose model.',
                                suitability: specs.gpu.available ? 88 : 82,
                                minRequirements: {
                                    vram: 4000,
                                    ram: 8000
                                },
                                useCases: ['Text generation', 'Code assistance', 'Question answering'],
                                quantization: 'Q4_0'
                            },
                            {
                                modelName: 'wizard-coder',
                                provider: 'lmstudio',
                                description: 'Specialized model for code generation with great performance.',
                                suitability: specs.gpu.available ? 93 : 78,
                                minRequirements: {
                                    vram: 4000,
                                    ram: 8000
                                },
                                useCases: ['Code generation', 'Debugging assistance', 'Code conversion'],
                                quantization: 'GPTQ'
                            }
                        ];
                        recommendations = baseRecommendations.filter(function (rec) {
                            if (rec.provider === 'ollama') {
                                return ollamaModels.includes(rec.modelName);
                            }
                            else if (rec.provider === 'lmstudio') {
                                return lmStudioModels.some(function (model) { return model.includes(rec.modelName); });
                            }
                            return true; // Include other providers by default
                        });
                        // If no models are available, return base recommendations anyway
                        return [2 /*return*/, recommendations.length > 0 ? recommendations : baseRecommendations];
                }
            });
        });
    };
    return ModelRecommendationService;
}());
exports.ModelRecommendationService = ModelRecommendationService;
// Export singleton instance
exports.modelRecommendationService = new ModelRecommendationService();
