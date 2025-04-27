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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheTestHelper = void 0;
const sinon = __importStar(require("sinon"));
const fs = __importStar(require("fs"));
const vscode = __importStar(require("vscode"));
class CacheTestHelper {
    constructor() {
        this.sandbox = sinon.createSandbox();
        this.setupStubs();
    }
    setupStubs() {
        // Setup fs stubs
        this.fsStubs = {
            existsSync: this.sandbox.stub(fs, 'existsSync'),
            mkdirSync: this.sandbox.stub(fs, 'mkdirSync'),
            readFileSync: this.sandbox.stub(fs, 'readFileSync'),
            writeFileSync: this.sandbox.stub(fs, 'writeFileSync'),
            unlinkSync: this.sandbox.stub(fs, 'unlinkSync'),
            readdirSync: this.sandbox.stub(fs, 'readdirSync')
        };
        // Setup VS Code stubs
        this.workspaceConfigStub = this.sandbox.stub(vscode.workspace, 'getConfiguration');
        this.extensionsStub = this.sandbox.stub(vscode.extensions, 'getExtension');
        // Default config values
        this.workspaceConfigStub.returns({
            get: this.sandbox.stub().callsFake((key) => {
                switch (key) {
                    case 'ttlMinutes': return 60;
                    case 'enabled': return true;
                    default: return undefined;
                }
            })
        });
        // Default extension path
        this.extensionsStub.returns({
            extensionPath: '/fake/extension/path'
        });
        // Default cache directory exists
        this.fsStubs.existsSync.withArgs('/fake/extension/path/cache').returns(true);
    }
    dispose() {
        this.sandbox.restore();
    }
}
exports.CacheTestHelper = CacheTestHelper;
//# sourceMappingURL=CacheTestHelper.js.map