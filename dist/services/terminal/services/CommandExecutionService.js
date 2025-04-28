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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandExecutionService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const CommandExecutionError_1 = require("../errors/CommandExecutionError");
let CommandExecutionService = class CommandExecutionService {
    constructor(logger, outputChannel) {
        this.logger = logger;
        this.outputChannel = outputChannel;
    }
    async executeCommand(command, terminal) {
        try {
            this.logger.debug(`Executing command: ${command}`);
            terminal.sendText(command);
        }
        catch (error) {
            this.logger.error('Command execution failed:', error);
            throw new CommandExecutionError_1.CommandExecutionError(`Failed to execute command: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async executeWithOutput(command, shellType) {
        try {
            // Implementation would depend on how you want to capture output
            // Could use Node's child_process, VS Code's task API, etc.
            this.logger.debug(`Executing command with output: ${command}`);
            // Placeholder implementation
            return {
                stdout: '',
                stderr: '',
                exitCode: 0,
                success: true
            };
        }
        catch (error) {
            this.logger.error('Command execution with output failed:', error);
            throw new CommandExecutionError_1.CommandExecutionError(`Failed to execute command with output: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.CommandExecutionService = CommandExecutionService;
exports.CommandExecutionService = CommandExecutionService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, inject(ILogger_1.ILogger)),
    __param(1, inject('OutputChannel')),
    __metadata("design:paramtypes", [Object, Object])
], CommandExecutionService);
//# sourceMappingURL=CommandExecutionService.js.map