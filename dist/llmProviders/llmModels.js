"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMModelsManager = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const LLMModelsService_1 = require("./services/LLMModelsService");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class LLMModelsManager {
    constructor(context) {
        this.service = new LLMModelsService_1.LLMModelsService(context);
    }
    get onModelsChanged() {
        return this.service.onModelsChanged;
    }
    async initialize() {
        await this.service.initializeModels();
    }
    getLocalModels() {
        return this.service.getLocalModels();
    }
    getHuggingFaceModels() {
        return this.service.getHuggingFaceModels();
    }
    async refreshInstalledModels() {
        await this.service.refreshInstalledModels();
    }
    async downloadOllamaModel(modelId) {
        await this.service.downloadOllamaModel(modelId);
    }
    async downloadLmStudioModel(modelId) {
        await this.service.downloadLmStudioModel(modelId);
    }
    async checkOllamaStatus() {
        return this.service.checkOllamaStatus();
    }
    async checkLmStudioStatus() {
        return this.service.checkLmStudioStatus();
    }
    getOllamaInstallInstructions() {
        return this.service.getOllamaInstallInstructions();
    }
    getLmStudioInstallInstructions() {
        return this.service.getLmStudioInstallInstructions();
    }
}
exports.LLMModelsManager = LLMModelsManager;
//# sourceMappingURL=llmModels.js.map