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
exports.ServiceContainer = void 0;
var interfaces_1 = require("./interfaces");
var config_1 = require("../config");
var statusBar_1 = require("../statusBar");
var commands_1 = require("../commands");
var telemetry_1 = require("./../utils/telemetry");
var ServiceContainer = /** @class */ (function () {
    function ServiceContainer(context, logging) {
        this.context = context;
        this.logging = logging;
        this.services = new Map();
        this.initialized = false;
    }
    ServiceContainer.initialize = function (context, logging) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!ServiceContainer.instance) return [3 /*break*/, 2];
                        ServiceContainer.instance = new ServiceContainer(context, logging);
                        return [4 /*yield*/, ServiceContainer.instance.initializeServices()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, ServiceContainer.instance];
                }
            });
        });
    };
    ServiceContainer.prototype.initializeServices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, statusBar, commands, telemetry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initialized) {
                            return [2 /*return*/];
                        }
                        this.logging.log('Initializing core services');
                        config = new config_1.ConfigManager(this.context);
                        statusBar = new statusBar_1.StatusBarManager(this.context);
                        commands = new commands_1.CommandManager(this.context, config);
                        telemetry = new telemetry_1.TelemetryService();
                        // Register services
                        this.register(interfaces_1.Services.Config, config);
                        this.register(interfaces_1.Services.StatusBar, statusBar);
                        this.register(interfaces_1.Services.Commands, commands);
                        this.register(interfaces_1.Services.Telemetry, telemetry);
                        // Initialize services
                        return [4 /*yield*/, Promise.all([
                                config.initialize(),
                                statusBar.initialize(),
                                commands.initialize(),
                                telemetry.initialize()
                            ])];
                    case 1:
                        // Initialize services
                        _a.sent();
                        this.initialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    ServiceContainer.prototype.get = function (serviceIdentifier) {
        var service = this.services.get(serviceIdentifier);
        if (!service) {
            throw new Error("Service not found: ".concat(serviceIdentifier.toString()));
        }
        return service;
    };
    ServiceContainer.prototype.register = function (serviceIdentifier, instance) {
        this.services.set(serviceIdentifier, instance);
    };
    ServiceContainer.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initializeServices()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ServiceContainer.prototype.dispose = function () {
        for (var _i = 0, _a = this.services.values(); _i < _a.length; _i++) {
            var service = _a[_i];
            if (service && typeof service.dispose === 'function') {
                service.dispose();
            }
        }
        this.services.clear();
    };
    return ServiceContainer;
}());
exports.ServiceContainer = ServiceContainer;
