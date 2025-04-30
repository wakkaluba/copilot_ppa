import * as sinon from 'sinon';
export declare class CacheTestHelper {
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
    constructor();
    private setupStubs;
    dispose(): void;
}
