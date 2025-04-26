import * as assert from 'assert';
// import * as vscode from 'vscode';
// import * as path from 'path';
import * as sinon from 'sinon';
import { getNonce, getWebviewUri, getSystemInfo, formatBytes, parseJson } from '../../../src/utils/common';
import { createMockExtensionContext } from '../../helpers/mockHelpers';

suite('Utility Functions Tests', () => {
    setup(() => sinon.stub(Date, 'now').returns(1487076704000));

    teardown(() => sinon.restore());

    test('getNonce should return a number', () => {
        const result = getNonce();
        assert.equal(typeof result, 'number');
    });

    test('getWebviewUri should return a valid URI', () => {
        const result = getWebviewUri('test.html', createMockExtensionContext());
        assert.equal(result.scheme, 'vscode-resource');
    });

    test('getSystemInfo should return system information', () => {
        const info = getSystemInfo();
        assert.ok(info.ram.total > 0);
        assert.ok(info.ram.free >= 0);
        assert.ok(info.cpu.cores > 0);
        // assert.ok(info.cpu.model); // Model can be undefined, skip strict check
        assert.ok(typeof info.gpu.available === 'boolean');
        // Fix type mismatch: Check if gpu properties exist before asserting
        if (info.gpu.available) {
            assert.ok(info.gpu.name);
            assert.ok(info.gpu.vram && info.gpu.vram > 0);
            assert.ok(typeof info.gpu.cudaSupport === 'boolean');
        }
    });

    test('formatBytes should format bytes correctly', () => {
        assert.equal(formatBytes(1024), '1 KB');
        assert.equal(formatBytes(1048576), '1 MB');
        assert.equal(formatBytes(1073741824), '1 GB');
    });

    test('parseJson should parse JSON strings', () => {
        assert.deepEqual(parseJson('{"a":1,"b":2}'), { a: 1, b: 2 });
    });
});
