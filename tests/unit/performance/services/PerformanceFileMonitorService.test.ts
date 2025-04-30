import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { PerformanceFileMonitorService } from '../../../../src/performance/services/PerformanceFileMonitorService';
import { createMockExtensionContext, createMockTextDocument } from '../../../helpers/mockHelpers';

suite('PerformanceFileMonitorService Tests', () => {
    let service: PerformanceFileMonitorService;
    let context: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;
    let fileSystemWatcher: vscode.FileSystemWatcher;

    setup(() => {
        sandbox = sinon.createSandbox();
        context = createMockExtensionContext();

        fileSystemWatcher = {
            onDidChange: sandbox.stub(),
            onDidCreate: sandbox.stub(),
            onDidDelete: sandbox.stub(),
            dispose: sandbox.stub()
        } as any;

        sandbox.stub(vscode.workspace, 'createFileSystemWatcher').returns(fileSystemWatcher);
        service = new PerformanceFileMonitorService(context);
    });

    teardown(() => {
        sandbox.restore();
        service.dispose();
    });

    suite('File System Watcher', () => {
        test('initializes with correct glob pattern', () => {
            assert.ok(vscode.workspace.createFileSystemWatcher.calledWith('**/*.{js,ts,jsx,tsx}'));
        });

        test('disposes watcher on service disposal', () => {
            service.dispose();
            assert.ok(fileSystemWatcher.dispose.calledOnce);
        });
    });

    suite('File Change Monitoring', () => {
        test('tracks file changes', () => {
            const onDidChange = fileSystemWatcher.onDidChange as sinon.SinonStub;
            const callback = onDidChange.firstCall.args[0];

            const uri = vscode.Uri.file('test.ts');
            callback(uri);

            const stats = service.getFileStats(uri);
            assert.ok(stats.lastModified);
            assert.strictEqual(stats.changeCount, 1);
        });

        test('tracks file creations', () => {
            const onDidCreate = fileSystemWatcher.onDidCreate as sinon.SinonStub;
            const callback = onDidCreate.firstCall.args[0];

            const uri = vscode.Uri.file('new.ts');
            callback(uri);

            const stats = service.getFileStats(uri);
            assert.ok(stats.createdAt);
        });

        test('tracks file deletions', () => {
            const onDidDelete = fileSystemWatcher.onDidDelete as sinon.SinonStub;
            const callback = onDidDelete.firstCall.args[0];

            const uri = vscode.Uri.file('deleted.ts');
            service.trackFile(uri); // Track first
            callback(uri);

            const stats = service.getFileStats(uri);
            assert.ok(stats.deletedAt);
        });
    });

    suite('Performance Metrics', () => {
        test('tracks file size changes', async () => {
            const uri = vscode.Uri.file('test.ts');
            const doc = createMockTextDocument('initial content', uri);

            service.trackFile(uri, doc);
            const stats = service.getFileStats(uri);
            assert.ok(stats.currentSize > 0);
        });

        test('tracks modification frequency', () => {
            const uri = vscode.Uri.file('test.ts');
            const onDidChange = fileSystemWatcher.onDidChange as sinon.SinonStub;
            const callback = onDidChange.firstCall.args[0];

            // Simulate multiple changes
            for (let i = 0; i < 5; i++) {
                callback(uri);
            }

            const stats = service.getFileStats(uri);
            assert.strictEqual(stats.changeCount, 5);
            assert.ok(stats.averageTimeBetweenChanges);
        });

        test('calculates change velocity', () => {
            const uri = vscode.Uri.file('test.ts');
            const onDidChange = fileSystemWatcher.onDidChange as sinon.SinonStub;
            const callback = onDidChange.firstCall.args[0];

            const clock = sandbox.useFakeTimers();

            callback(uri);
            clock.tick(1000);
            callback(uri);
            clock.tick(1000);
            callback(uri);

            const stats = service.getFileStats(uri);
            assert.ok(stats.changesPerMinute > 0);

            clock.restore();
        });
    });

    suite('File Analysis', () => {
        test('identifies frequently modified files', () => {
            const files = ['file1.ts', 'file2.ts', 'file3.ts'].map(f => vscode.Uri.file(f));
            const onDidChange = fileSystemWatcher.onDidChange as sinon.SinonStub;
            const callback = onDidChange.firstCall.args[0];

            // Simulate different modification patterns
            for (let i = 0; i < 10; i++) callback(files[0]); // High frequency
            for (let i = 0; i < 5; i++) callback(files[1]); // Medium frequency
            for (let i = 0; i < 2; i++) callback(files[2]); // Low frequency

            const hotspots = service.getHotspots();
            assert.strictEqual(hotspots[0].uri.fsPath, files[0].fsPath);
            assert.ok(hotspots[0].score > hotspots[1].score);
        });

        test('tracks file size trends', () => {
            const uri = vscode.Uri.file('test.ts');
            const sizes = [100, 150, 200, 300];

            sizes.forEach(size => {
                const doc = createMockTextDocument('x'.repeat(size), uri);
                service.trackFile(uri, doc);
            });

            const stats = service.getFileStats(uri);
            assert.ok(stats.sizeHistory.length > 0);
            assert.ok(stats.averageSizeIncrease > 0);
        });
    });

    suite('Performance Alerts', () => {
        test('detects rapid file growth', () => {
            const uri = vscode.Uri.file('test.ts');
            const sizes = [1000, 2000, 4000, 8000]; // Exponential growth

            sizes.forEach(size => {
                const doc = createMockTextDocument('x'.repeat(size), uri);
                service.trackFile(uri, doc);
            });

            const alerts = service.getPerformanceAlerts();
            assert.ok(alerts.some(a => a.type === 'rapid-growth' && a.uri.fsPath === uri.fsPath));
        });

        test('detects high change frequency', () => {
            const uri = vscode.Uri.file('test.ts');
            const onDidChange = fileSystemWatcher.onDidChange as sinon.SinonStub;
            const callback = onDidChange.firstCall.args[0];

            const clock = sandbox.useFakeTimers();

            // Simulate rapid changes
            for (let i = 0; i < 20; i++) {
                callback(uri);
                clock.tick(100); // 100ms between changes
            }

            const alerts = service.getPerformanceAlerts();
            assert.ok(alerts.some(a => a.type === 'high-frequency' && a.uri.fsPath === uri.fsPath));

            clock.restore();
        });
    });

    suite('Configuration', () => {
        test('respects file size thresholds', () => {
            service.setConfiguration({ maxFileSizeKB: 1 });
            const uri = vscode.Uri.file('large.ts');
            const doc = createMockTextDocument('x'.repeat(2000), uri);

            service.trackFile(uri, doc);
            const alerts = service.getPerformanceAlerts();
            assert.ok(alerts.some(a => a.type === 'size-threshold-exceeded'));
        });

        test('respects change frequency thresholds', () => {
            service.setConfiguration({ maxChangesPerMinute: 10 });
            const uri = vscode.Uri.file('test.ts');
            const onDidChange = fileSystemWatcher.onDidChange as sinon.SinonStub;
            const callback = onDidChange.firstCall.args[0];

            const clock = sandbox.useFakeTimers();

            // Exceed threshold
            for (let i = 0; i < 15; i++) {
                callback(uri);
                clock.tick(1000);
            }

            const alerts = service.getPerformanceAlerts();
            assert.ok(alerts.some(a => a.type === 'frequency-threshold-exceeded'));

            clock.restore();
        });
    });

    suite('Error Handling', () => {
        test('handles missing files gracefully', () => {
            const uri = vscode.Uri.file('nonexistent.ts');
            assert.doesNotThrow(() => service.getFileStats(uri));
        });

        test('handles invalid file content', () => {
            const uri = vscode.Uri.file('test.ts');
            const doc = createMockTextDocument(null as any, uri);
            assert.doesNotThrow(() => service.trackFile(uri, doc));
        });
    });
});
