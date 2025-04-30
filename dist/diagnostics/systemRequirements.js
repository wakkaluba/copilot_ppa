"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemRequirementsChecker = void 0;
const child_process = __importStar(require("child_process"));
const util_1 = require("util");
const SystemRequirementsService_1 = require("./services/SystemRequirementsService");
const execAsync = (0, util_1.promisify)(child_process.exec);
/**
 * System requirements checker for the Copilot PPA extension
 */
class SystemRequirementsChecker {
    service;
    constructor(logger) {
        this.service = new SystemRequirementsService_1.SystemRequirementsService(logger);
    }
    /**
     * Check if the system meets the minimum requirements for running LLMs
     */
    async checkSystemRequirements() {
        return this.service.checkSystemRequirements();
    }
}
exports.SystemRequirementsChecker = SystemRequirementsChecker;
//# sourceMappingURL=systemRequirements.js.map