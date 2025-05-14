const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');

describe('remove-unused-code-analyzer.js', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(fs, 'readFileSync');
        sandbox.stub(fs, 'writeFileSync');
        sandbox.stub(fs, 'existsSync').returns(true);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('analyzeUnusedCode()', () => {
        it('should detect unused exports', () => {
            const mockContent = `
                export const used = 42;
                export const unused = 0;
                console.log(used);
            `;
            fs.readFileSync.returns(mockContent);

            const result = analyzeUnusedCode('src/module.js');
            expect(result.unusedExports).to.have.lengthOf(1);
            expect(result.unusedExports[0]).to.deep.equal({
                name: 'unused',
                line: 3,
                type: 'export'
            });
            expect(result.usedExports).to.include('used');
        });

        it('should handle complex module structures', () => {
            const mockContent = `
                export { foo, bar } from './other';
                export * from './module';
                export default class Main {}
            `;
            fs.readFileSync.returns(mockContent);

            const result = analyzeUnusedCode('src/complex.js');
            expect(result.reexports).to.deep.equal(['./other', './module']);
            expect(result.hasDefaultExport).to.be.true;
            expect(result.exportNames).to.include('foo');
            expect(result.exportNames).to.include('bar');
        });
    });

    describe('trackUsagePatterns()', () => {
        it('should track direct usage', () => {
            const mockFiles = {
                'src/module.js': 'export const x = 42;',
                'src/user.js': 'import { x } from "./module"; console.log(x);'
            };

            fs.readFileSync.callsFake((file) => mockFiles[file]);

            const result = trackUsagePatterns(Object.keys(mockFiles));
            expect(result.usage['src/module.js']).to.deep.equal({
                exports: ['x'],
                usedBy: ['src/user.js']
            });
            expect(result.imports['src/user.js']).to.deep.equal({
                module: './module',
                imports: ['x']
            });
        });

        it('should track indirect usage', () => {
            const mockFiles = {
                'src/module.js': 'export const x = 42;',
                'src/middleman.js': 'export { x } from "./module";',
                'src/user.js': 'import { x } from "./middleman"; console.log(x);'
            };

            fs.readFileSync.callsFake((file) => mockFiles[file]);

            const result = trackUsagePatterns(Object.keys(mockFiles));
            expect(result.usage['src/module.js'].exports).to.include('x');
            expect(result.usage['src/middleman.js'].reexports).to.deep.equal({
                from: './module',
                exports: ['x']
            });
            expect(result.indirectUsage['src/module.js']).to.include('src/user.js');
        });
    });

    describe('validateRemoval()', () => {
        it('should validate safe removals', () => {
            const unusedExports = [{
                name: 'unused',
                file: 'src/module.js',
                references: []
            }];

            const validation = validateRemoval(unusedExports);
            expect(validation.safe).to.be.true;
            expect(validation.removable).to.have.lengthOf(1);
            expect(validation.removable[0]).to.have.property('name', 'unused');
            expect(validation.warnings).to.be.an('array').that.is.empty;
        });

        it('should detect unsafe removals', () => {
            const unusedExports = [{
                name: 'criticalFunc',
                file: 'src/core.js',
                references: ['src/dynamic.js']
            }];

            const validation = validateRemoval(unusedExports);
            expect(validation.safe).to.be.false;
            expect(validation.removable).to.be.an('array').that.is.empty;
            expect(validation.warnings).to.include('Possible dynamic usage');
            expect(validation.unsafe).to.have.lengthOf(1);
            expect(validation.unsafe[0]).to.have.property('name', 'criticalFunc');
        });
    });

    describe('generateReport()', () => {
        it('should list removable code', () => {
            const analysis = {
                safe: [{
                    name: 'unused',
                    file: 'src/module.js'
                }],
                unsafe: []
            };

            const report = generateReport(analysis);
            expect(report).to.be.a('string');
            expect(report).to.include('Unused Code Analysis Report');
            expect(report).to.include('src/module.js');
            expect(report).to.include('unused');
            expect(report).to.include('Safe to Remove');
            expect(fs.writeFileSync).to.have.been.calledWith(
                'unused-code-report.md',
                sinon.match.string
            );
        });

        it('should provide removal instructions', () => {
            const analysis = {
                safe: [{
                    name: 'unused',
                    file: 'src/module.js',
                    type: 'export'
                }],
                unsafe: [{
                    name: 'dynamic',
                    file: 'src/core.js',
                    reason: 'possible dynamic import'
                }]
            };

            const report = generateReport(analysis);
            expect(report).to.include('## Safe to Remove');
            expect(report).to.include('## Requires Manual Review');
            expect(report).to.include('possible dynamic import');
            expect(report).to.include('## Removal Instructions');
            expect(report).to.include('backup your files');
        });
    });
});
