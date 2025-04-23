import * as sinon from 'sinon';
import * as fs from 'fs';
import * as vscode from 'vscode';

export class CacheTestHelper {
    sandbox: sinon.SinonSandbox;
    fsStubs: {
        existsSync: sinon.SinonStub;
        mkdirSync: sinon.SinonStub;
        readFileSync: sinon.SinonStub;
        writeFileSync: sinon.SinonStub;
        unlinkSync: sinon.SinonStub;
        readdirSync: sinon.SinonStub;
    };
    workspaceConfigStub: sinon.SinonStub;
    extensionsStub: sinon.SinonStub;

    constructor() {
        this.sandbox = sinon.createSandbox();
        this.setupStubs();
    }

    private setupStubs() {
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
            get: this.sandbox.stub().callsFake((key: string) => {
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
