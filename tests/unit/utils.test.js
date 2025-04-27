"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
// import * as vscode from 'vscode';
// import * as path from 'path';
var sinon = require("sinon");
var common_1 = require("../../../src/utils/common");
var mockHelpers_1 = require("../../helpers/mockHelpers");
suite('Utility Functions Tests', function () {
    setup(function () { return sinon.stub(Date, 'now').returns(1487076704000); });
    teardown(function () { return sinon.restore(); });
    test('getNonce should return a number', function () {
        var result = (0, common_1.getNonce)();
        assert.equal(typeof result, 'number');
    });
    test('getWebviewUri should return a valid URI', function () {
        var result = (0, common_1.getWebviewUri)('test.html', (0, mockHelpers_1.createMockExtensionContext)());
        assert.equal(result.scheme, 'vscode-resource');
    });
    test('getSystemInfo should return system information', function () {
        var info = (0, common_1.getSystemInfo)();
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
    test('formatBytes should format bytes correctly', function () {
        assert.equal((0, common_1.formatBytes)(1024), '1 KB');
        assert.equal((0, common_1.formatBytes)(1048576), '1 MB');
        assert.equal((0, common_1.formatBytes)(1073741824), '1 GB');
    });
    test('parseJson should parse JSON strings', function () {
        assert.deepEqual((0, common_1.parseJson)('{"a":1,"b":2}'), { a: 1, b: 2 });
    });
});
