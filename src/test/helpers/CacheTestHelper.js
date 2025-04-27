"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheTestHelper = void 0;
var sinon = require("sinon");
var fs = require("fs");
var vscode = require("vscode");
var CacheTestHelper = /** @class */ (function () {
    function CacheTestHelper() {
        this.sandbox = sinon.createSandbox();
        this.setupStubs();
    }
    CacheTestHelper.prototype.setupStubs = function () {
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
            get: this.sandbox.stub().callsFake(function (key) {
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
    };
    CacheTestHelper.prototype.dispose = function () {
        this.sandbox.restore();
    };
    return CacheTestHelper;
}());
exports.CacheTestHelper = CacheTestHelper;
