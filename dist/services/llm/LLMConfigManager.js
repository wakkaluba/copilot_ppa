"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMConfigManager = void 0;
const events_1 = require("events");
const LLMConfigStorageService_1 = require("./services/LLMConfigStorageService");
const LLMConfigValidationService_1 = require("./services/LLMConfigValidationService");
const LLMConfigChangeTrackingService_1 = require("./services/LLMConfigChangeTrackingService");
class LLMConfigManager extends events_1.EventEmitter {
    static instance;
    storageService;
    validationService;
    changeTracker;
    constructor() {
        super();
        this.storageService = new LLMConfigStorageService_1.LLMConfigStorageService();
        this.validationService = new LLMConfigValidationService_1.LLMConfigValidationService();
        this.changeTracker = new LLMConfigChangeTrackingService_1.LLMConfigChangeTrackingService();
        this.setupEventListeners();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new LLMConfigManager();
        }
        return this.instance;
    }
    getProviderConfig(providerName) {
        return this.storageService.getConfig(providerName.toLowerCase());
    }
    getAllConfigs() {
        return this.storageService.getAllConfigs();
    }
    async updateProviderConfig(providerName, config) {
        const normalizedName = providerName.toLowerCase();
        const currentConfig = this.getProviderConfig(normalizedName) || { enabled: false };
        const newConfig = { ...currentConfig, ...config };
        await this.validationService.validateConfig(newConfig);
        await this.storageService.saveConfig(normalizedName, newConfig);
        this.emit('configChanged', {
            provider: providerName,
            config: newConfig
        });
    }
    isProviderEnabled(providerName) {
        const config = this.getProviderConfig(providerName.toLowerCase());
        return config?.enabled ?? false;
    }
    async enableProvider(providerName) {
        await this.updateProviderConfig(providerName, { enabled: true });
    }
    async disableProvider(providerName) {
        await this.updateProviderConfig(providerName, { enabled: false });
    }
    getProviderOptions(providerName) {
        const config = this.getProviderConfig(providerName.toLowerCase());
        return config?.options ?? {};
    }
    setupEventListeners() {
        this.changeTracker.onConfigurationChanged(() => {
            this.storageService.reloadConfigs();
            this.emit('configsReloaded');
        });
        this.storageService.on('configSaved', (name, config) => {
            this.emit('configChanged', { provider: name, config });
        });
    }
    dispose() {
        this.changeTracker.dispose();
        this.removeAllListeners();
    }
}
exports.LLMConfigManager = LLMConfigManager;
//# sourceMappingURL=LLMConfigManager.js.map