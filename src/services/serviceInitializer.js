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
exports.ServiceInitializer = void 0;
var ServiceInitializer = /** @class */ (function () {
    function ServiceInitializer() {
    }
    ServiceInitializer.initializeService = function (service_1, serviceId_1) {
        return __awaiter(this, arguments, void 0, function (service, serviceId, dependencies) {
            var _i, _a, _b, key, value, timeoutMs_1, error_1;
            if (dependencies === void 0) { dependencies = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        // Validate dependencies
                        for (_i = 0, _a = Object.entries(dependencies); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            if (!value) {
                                throw new Error("Missing required dependency: ".concat(key));
                            }
                        }
                        timeoutMs_1 = 10000;
                        return [4 /*yield*/, Promise.race([
                                service.initialize(),
                                new Promise(function (_, reject) {
                                    return setTimeout(function () { return reject(new Error("Service initialization timed out: ".concat(serviceId))); }, timeoutMs_1);
                                })
                            ])];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, serviceId: serviceId }];
                    case 2:
                        error_1 = _c.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_1 instanceof Error ? error_1 : new Error(String(error_1)),
                                serviceId: serviceId
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ServiceInitializer.initializeServices = function (services) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, services_1, _a, service, id, dependencies, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        results = [];
                        _i = 0, services_1 = services;
                        _b.label = 1;
                    case 1:
                        if (!(_i < services_1.length)) return [3 /*break*/, 4];
                        _a = services_1[_i], service = _a.service, id = _a.id, dependencies = _a.dependencies;
                        return [4 /*yield*/, this.initializeService(service, id, dependencies)];
                    case 2:
                        result = _b.sent();
                        results.push(result);
                        // If a service fails to initialize, we should stop
                        if (!result.success) {
                            return [3 /*break*/, 4];
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    return ServiceInitializer;
}());
exports.ServiceInitializer = ServiceInitializer;
