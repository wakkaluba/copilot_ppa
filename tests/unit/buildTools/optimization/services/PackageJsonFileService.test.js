import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import { PackageJsonFileService } from '../../../../../src/buildTools/optimization/services/PackageJsonFileService';

suite('PackageJsonFileService Tests', () => {
    let service;
    let sandbox;
    let fsExistsStub;
    let fsReadFileStub;
    let fsWriteFileStub;

    setup(() => {
        sandbox = sinon.createSandbox();

        // Stub filesystem methods
        fsExistsStub = sandbox.stub(fs, 'existsSync');
        fsReadFileStub = sandbox.stub(fs.promises, 'readFile');
        fsWriteFileStub = sandbox.stub(fs.promises, 'writeFile');

        // Default package.json content
        const packageJsonContent = JSON.stringify({
            name: 'test-project',
            version: '1.0.0',
            scripts: {
                build: 'webpack --mode production',
                dev: 'webpack-dev-server'
            }
        });

        // Set default stubs behavior
        fsExistsStub.returns(true);
        fsReadFileStub.resolves(packageJsonContent);
        fsWriteFileStub.resolves();

        // Create service instance
        service = new PackageJsonFileService();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should find package.json in the specified directory', async () => {
        const filePath = await service.findPackageJson('/test/project');

        assert.ok(filePath);
        assert.ok(fsExistsStub.calledWith(path.join('/test/project', 'package.json')));
    });

    test('should find package.json in parent directories if not in current', async () => {
        // First check fails, second check passes
        fsExistsStub.onFirstCall().returns(false);
        fsExistsStub.onSecondCall().returns(true);

        const filePath = await service.findPackageJson('/test/project/src');

        assert.ok(filePath);
        assert.ok(fsExistsStub.calledWith(path.join('/test/project', 'package.json')));
    });

    test('should return null if package.json not found', async () => {
        fsExistsStub.returns(false);

        const filePath = await service.findPackageJson('/test/project');

        assert.strictEqual(filePath, null);
    });

    test('should read and parse package.json file', async () => {
        const packageJson = await service.readPackageJson('/test/project/package.json');

        assert.ok(packageJson);
        assert.strictEqual(packageJson.name, 'test-project');
        assert.strictEqual(packageJson.version, '1.0.0');
        assert.ok(packageJson.scripts);
        assert.strictEqual(packageJson.scripts.build, 'webpack --mode production');
    });

    test('should handle JSON parse errors', async () => {
        fsReadFileStub.resolves('{ invalid json }');

        try {
            await service.readPackageJson('/test/project/package.json');
            assert.fail('Expected error was not thrown');
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.ok(error.message.includes('parse'));
        }
    });

    test('should handle file read errors', async () => {
        fsReadFileStub.rejects(new Error('File not found'));

        try {
            await service.readPackageJson('/test/project/package.json');
            assert.fail('Expected error was not thrown');
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.strictEqual(error.message, 'File not found');
        }
    });

    test('should write updated package.json file', async () => {
        const packageJson = {
            name: 'test-project',
            version: '1.0.0',
            scripts: {
                build: 'webpack --mode production',
                dev: 'webpack-dev-server',
                test: 'jest'
            }
        };

        await service.writePackageJson('/test/project/package.json', packageJson);

        assert.ok(fsWriteFileStub.calledOnce);
        assert.ok(fsWriteFileStub.calledWith(
            '/test/project/package.json',
            JSON.stringify(packageJson, null, 2)
        ));
    });

    test('should handle write errors', async () => {
        fsWriteFileStub.rejects(new Error('Permission denied'));

        try {
            await service.writePackageJson('/test/project/package.json', {});
            assert.fail('Expected error was not thrown');
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.strictEqual(error.message, 'Permission denied');
        }
    });

    test('should extract scripts from package.json', async () => {
        const packageJson = {
            name: 'test-project',
            version: '1.0.0',
            scripts: {
                build: 'webpack --mode production',
                dev: 'webpack-dev-server',
                test: 'jest'
            }
        };

        const scripts = service.extractScripts(packageJson);

        assert.deepStrictEqual(scripts, {
            build: 'webpack --mode production',
            dev: 'webpack-dev-server',
            test: 'jest'
        });
    });

    test('should handle missing scripts in package.json', async () => {
        const packageJson = {
            name: 'test-project',
            version: '1.0.0'
        };

        const scripts = service.extractScripts(packageJson);

        assert.deepStrictEqual(scripts, {});
    });

    test('should update scripts in package.json', async () => {
        const packageJson = {
            name: 'test-project',
            version: '1.0.0',
            scripts: {
                build: 'webpack --mode production',
                dev: 'webpack-dev-server'
            }
        };

        const updatedScripts = {
            build: 'cross-env NODE_ENV=production webpack',
            dev: 'cross-env NODE_ENV=development webpack-dev-server',
            test: 'jest'
        };

        const updatedPackageJson = service.updateScripts(packageJson, updatedScripts);

        assert.deepStrictEqual(updatedPackageJson.scripts, updatedScripts);
    });

    test('should add scripts section if missing', async () => {
        const packageJson = {
            name: 'test-project',
            version: '1.0.0'
        };

        const scripts = {
            build: 'webpack'
        };

        const updatedPackageJson = service.updateScripts(packageJson, scripts);

        assert.deepStrictEqual(updatedPackageJson.scripts, scripts);
    });
});
