"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceContainer = void 0;
const interfaces_1 = require("./interfaces");
const config_1 = require("../config");
const statusBar_1 = require("../statusBar");
const commands_1 = require("../commands");
const telemetry_1 = require("./../utils/telemetry");
class ServiceContainer {
    context;
    logging;
    static instance;
    services = new Map();
    initialized = false;
    constructor(context, logging) {
        this.context = context;
        this.logging = logging;
    }
    static async initialize(context, logging) {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer(context, logging);
            await ServiceContainer.instance.initializeServices();
        }
        return ServiceContainer.instance;
    }
    async initializeServices() {
        if (this.initialized)
            return;
        this.logging.log('Initializing core services');
        // Initialize core services
        const config = new config_1.ConfigManager(this.context);
        const statusBar = new statusBar_1.StatusBarManager(this.context);
        const commands = new commands_1.CommandManager(this.context, config);
        const telemetry = new telemetry_1.TelemetryService();
        // Register services
        this.register(interfaces_1.Services.Config, config);
        this.register(interfaces_1.Services.StatusBar, statusBar);
        this.register(interfaces_1.Services.Commands, commands);
        this.register(interfaces_1.Services.Telemetry, telemetry);
        // Initialize services
        await Promise.all([
            config.initialize(),
            statusBar.initialize(),
            commands.initialize(),
            telemetry.initialize()
        ]);
        this.initialized = true;
    }
    get(serviceIdentifier) {
        const service = this.services.get(serviceIdentifier);
        if (!service) {
            throw new Error(`Service not found: ${serviceIdentifier.toString()}`);
        }
        return service;
    }
    register(serviceIdentifier, instance) {
        this.services.set(serviceIdentifier, instance);
    }
    async initialize() {
        await this.initializeServices();
    }
    dispose() {
        for (const service of this.services.values()) {
            if (service && typeof service.dispose === 'function') {
                service.dispose();
            }
        }
        this.services.clear();
    }
}
exports.ServiceContainer = ServiceContainer;
//# sourceMappingURL=ServiceContainer.js.map