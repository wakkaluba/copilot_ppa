import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { LLMCacheService } from '../../services/cache/llmCacheService';

suite('LLMCacheService Tests', () => {
    let llmCacheService: LLMCacheService;
    let sandbox: sinon.SinonSandbox;
    let fsExistsStub: sinon.SinonStub;
    let fsMkdirStub: sinon.SinonStub;
    let fsReadFileStub: sinon.SinonStub;
    let fsWriteFileStub: sinon.SinonStub;
    let fsUnlinkStub: sinon.SinonStub;
    let fsReaddirStub: sinon.SinonStub;
    let workspaceConfigStub: sinon.SinonStub;
    let extensionsStub: sinon.SinonStub;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Stub fs methods
        fsExistsStub = sandbox.stub(fs, 'existsSync');
        fsMkdirStub = sandbox.stub(fs, 'mkdirSync');
        fsReadFileStub = sandbox.stub(fs, 'readFileSync');
        fsWriteFileStub = sandbox.stub(fs, 'writeFileSync');
        fsUnlinkStub = sandbox.stub(fs, 'unlinkSync');
        fsReaddirStub = sandbox.stub(fs, 'readdirSync');
        
        // Stub vscode workspace configuration
        workspaceConfigStub = sandbox.stub(vscode.workspace, 'getConfiguration');
        workspaceConfigStub.returns({
            get: sandbox.stub().callsFake((key: string, defaultValue: any) => {
                if (key === 'ttlMinutes') return 60; // 1 hour
                if (key === 'enabled') return true;
                return defaultValue;
            })
        } as any);
        
        // Stub vscode.extensions.getExtension
        extensionsStub = sandbox.stub(vscode.extensions, 'getExtension');
        extensionsStub.returns({
            extensionPath: '/fake/extension/path'
        });
        
        // Stub vscode.workspace.onDidChangeConfiguration
        sandbox.stub(vscode.workspace, 'onDidChangeConfiguration').returns({
            dispose: sandbox.stub()
        });
        
        // Ensure cache directory exists
        fsExistsStub.withArgs('/fake/extension/path/cache').returns(true);
        
        // Create a fresh instance of LLMCacheService
        llmCacheService = new LLMCacheService();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('constructor should create cache directory if it does not exist', () => {
        // Reset the stubs for a fresh test
        fsExistsStub.reset();
        fsMkdirStub.reset();
        
        // Simulate cache directory does not exist
        fsExistsStub.withArgs('/fake/extension/path/cache').returns(false);
        
        // Create a new instance to trigger constructor
        new LLMCacheService();
        
        // Verify that mkdirSync was called with the correct path
        assert.strictEqual(fsMkdirStub.calledOnce, true);
        assert.strictEqual(fsMkdirStub.firstCall.args[0], '/fake/extension/path/cache');
        assert.deepStrictEqual(fsMkdirStub.firstCall.args[1], { recursive: true });
    });

    test('get should return null if cache is disabled', async () => {
        // Reset workspaceConfigStub behavior
        workspaceConfigStub.returns({
            get: sandbox.stub().callsFake((key: string, defaultValue: any) => {
                if (key === 'enabled') return false;
                return defaultValue;
            })
        } as any);
        
        // Create new instance with cache disabled
        const cacheService = new LLMCacheService();
        
        const result = await cacheService.get('prompt', 'model', {});
        
        assert.strictEqual(result, null);
    });

    test('get should return null if cache file does not exist', async () => {
        const cacheKey = crypto.createHash('md5').update(JSON.stringify({
            prompt: 'prompt',
            model: 'model',
            params: {}
        })).digest('hex');
        
        // Simulate cache file does not exist
        fsExistsStub.withArgs(path.join('/fake/extension/path/cache', `${cacheKey}.json`)).returns(false);
        
        const result = await llmCacheService.get('prompt', 'model', {});
        
        assert.strictEqual(result, null);
    });

    test('get should return null if cache entry is expired', async () => {
        const cacheKey = crypto.createHash('md5').update(JSON.stringify({
            prompt: 'prompt',
            model: 'model',
            params: {}
        })).digest('hex');
        
        const cacheFilePath = path.join('/fake/extension/path/cache', `${cacheKey}.json`);
        
        // Simulate cache file exists
        fsExistsStub.withArgs(cacheFilePath).returns(true);
        
        // Simulate expired cache entry (older than TTL)
        const timestamp = Date.now() - (61 * 60 * 1000); // 61 minutes ago
        fsReadFileStub.withArgs(cacheFilePath, 'utf8').returns(JSON.stringify({
            timestamp,
            response: 'cached response'
        }));
        
        const result = await llmCacheService.get('prompt', 'model', {});
        
        // Should delete expired cache file
        assert.strictEqual(fsUnlinkStub.calledOnce, true);
        assert.strictEqual(fsUnlinkStub.firstCall.args[0], cacheFilePath);
        
        // Should return null
        assert.strictEqual(result, null);
    });

    test('get should return cached response if entry is valid', async () => {
        const cacheKey = crypto.createHash('md5').update(JSON.stringify({
            prompt: 'prompt',
            model: 'model',
            params: {}
        })).digest('hex');
        
        const cacheFilePath = path.join('/fake/extension/path/cache', `${cacheKey}.json`);
        
        // Simulate cache file exists
        fsExistsStub.withArgs(cacheFilePath).returns(true);
        
        // Simulate valid cache entry (newer than TTL)
        const timestamp = Date.now() - (30 * 60 * 1000); // 30 minutes ago
        fsReadFileStub.withArgs(cacheFilePath, 'utf8').returns(JSON.stringify({
            timestamp,
            response: 'cached response'
        }));
        
        const result = await llmCacheService.get('prompt', 'model', {});
        
        // Should not delete cache file
        assert.strictEqual(fsUnlinkStub.called, false);
        
        // Should return cached response
        assert.strictEqual(result, 'cached response');
    });

    test('set should do nothing if cache is disabled', async () => {
        // Reset workspaceConfigStub behavior
        workspaceConfigStub.returns({
            get: sandbox.stub().callsFake((key: string, defaultValue: any) => {
                if (key === 'enabled') return false;
                return defaultValue;
            })
        } as any);
        
        // Create new instance with cache disabled
        const cacheService = new LLMCacheService();
        
        await cacheService.set('prompt', 'model', {}, 'response');
        
        // Should not write to cache
        assert.strictEqual(fsWriteFileStub.called, false);
    });

    test('set should write cache entry to file', async () => {
        const cacheKey = crypto.createHash('md5').update(JSON.stringify({
            prompt: 'prompt',
            model: 'model',
            params: {}
        })).digest('hex');
        
        const cacheFilePath = path.join('/fake/extension/path/cache', `${cacheKey}.json`);
        
        await llmCacheService.set('prompt', 'model', {}, 'response');
        
        // Should write to cache file
        assert.strictEqual(fsWriteFileStub.calledOnce, true);
        assert.strictEqual(fsWriteFileStub.firstCall.args[0], cacheFilePath);
        
        // Verify cache entry contains correct data
        const cacheEntry = JSON.parse(fsWriteFileStub.firstCall.args[1]);
        assert.strictEqual(cacheEntry.response, 'response');
        assert.ok(cacheEntry.timestamp <= Date.now());
        assert.ok(cacheEntry.timestamp > Date.now() - 1000); // Should be recent
    });

    test('clearCache should delete all cache files', () => {
        // Simulate cache directory with files
        fsReaddirStub.withArgs('/fake/extension/path/cache').returns(['file1.json', 'file2.json']);
        
        llmCacheService.clearCache();
        
        // Should delete all files
        assert.strictEqual(fsUnlinkStub.callCount, 2);
        assert.strictEqual(fsUnlinkStub.firstCall.args[0], path.join('/fake/extension/path/cache', 'file1.json'));
        assert.strictEqual(fsUnlinkStub.secondCall.args[0], path.join('/fake/extension/path/cache', 'file2.json'));
    });

    test('clearExpiredCache should only delete expired cache files', () => {
        // Simulate cache directory with files
        fsReaddirStub.withArgs('/fake/extension/path/cache').returns(['file1.json', 'file2.json', 'file3.json']);
        
        // Simulate file1 as expired
        fsReadFileStub.withArgs(path.join('/fake/extension/path/cache', 'file1.json'), 'utf8').returns(JSON.stringify({
            timestamp: Date.now() - (61 * 60 * 1000), // 61 minutes ago (expired)
            response: 'cached response'
        }));
        
        // Simulate file2 as valid
        fsReadFileStub.withArgs(path.join('/fake/extension/path/cache', 'file2.json'), 'utf8').returns(JSON.stringify({
            timestamp: Date.now() - (30 * 60 * 1000), // 30 minutes ago (valid)
            response: 'cached response'
        }));
        
        // Simulate file3 as invalid JSON
        fsReadFileStub.withArgs(path.join('/fake/extension/path/cache', 'file3.json'), 'utf8').returns('invalid json');
        
        llmCacheService.clearExpiredCache();
        
        // Should delete file1 (expired) and file3 (invalid)
        assert.strictEqual(fsUnlinkStub.callCount, 2);
        assert.strictEqual(fsUnlinkStub.firstCall.args[0], path.join('/fake/extension/path/cache', 'file1.json'));
        assert.strictEqual(fsUnlinkStub.secondCall.args[0], path.join('/fake/extension/path/cache', 'file3.json'));
    });

    test('updateTaskProgress should update task in todo.md', () => {
        // Simulate todo file exists
        fsExistsStub.withArgs('/fake/extension/path/zzztodo.md').returns(true);
        
        // Simulate todo file content
        fsReadFileStub.withArgs('/fake/extension/path/zzztodo.md', 'utf8').returns(
            '- [ ] Task 1 (0%)\n' +
            '- [/] Target Task (50%)\n' +
            '- [ ] Task 3 (0%)'
        );
        
        llmCacheService.updateTaskProgress('Target Task', 'completed', 100);
        
        // Should read todo file
        assert.strictEqual(fsReadFileStub.calledWith('/fake/extension/path/zzztodo.md', 'utf8'), true);
        
        // Should update todo file
        assert.strictEqual(fsWriteFileStub.calledWith('/fake/extension/path/zzztodo.md'), true);
        
        // Should remove completed task from todo file
        const updatedTodoContent = fsWriteFileStub.firstCall.args[1];
        assert.ok(!updatedTodoContent.includes('Target Task'));
        assert.ok(updatedTodoContent.includes('Task 1'));
        assert.ok(updatedTodoContent.includes('Task 3'));
        
        // Should write to finished file
        assert.strictEqual(fsWriteFileStub.calledWith('/fake/extension/path/finished.md'), true);
        
        // Verify finished file contains the completed task
        const finishedContent = fsWriteFileStub.secondCall.args[1];
        assert.ok(finishedContent.includes('- [X] Target Task (100%)'));
    });

    test('getTaskProgress should return task status and percentage', () => {
        // Simulate todo file exists
        fsExistsStub.withArgs('/fake/extension/path/zzztodo.md').returns(true);
        
        // Simulate todo file content
        fsReadFileStub.withArgs('/fake/extension/path/zzztodo.md', 'utf8').returns(
            '- [ ] Task 1 (0%)\n' +
            '- [/] Target Task (50%)\n' +
            '- [X] Completed Task (100%)\n' +
            '- [-] Do Not Touch Task (0%)'
        );
        
        // Test different task types
        const notStartedTask = llmCacheService.getTaskProgress('Task 1');
        assert.deepStrictEqual(notStartedTask, { status: 'not-started', percentage: 0 });
        
        const inProgressTask = llmCacheService.getTaskProgress('Target Task');
        assert.deepStrictEqual(inProgressTask, { status: 'in-progress', percentage: 50 });
        
        const completedTask = llmCacheService.getTaskProgress('Completed Task');
        assert.deepStrictEqual(completedTask, { status: 'completed', percentage: 100 });
        
        const doNotTouchTask = llmCacheService.getTaskProgress('Do Not Touch Task');
        assert.deepStrictEqual(doNotTouchTask, { status: 'do-not-touch', percentage: 0 });
        
        // Test nonexistent task
        const nonexistentTask = llmCacheService.getTaskProgress('Nonexistent Task');
        assert.strictEqual(nonexistentTask, null);
    });
});