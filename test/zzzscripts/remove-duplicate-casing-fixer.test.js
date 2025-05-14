const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');

// Import the functions we need to test
const {
    backupFiles,
    compareFiles,
    removeDuplicateFile,
    updateOrphanedCodeReport,
    main
} = require('../../zzzscripts/remove-duplicate-casing-fixer');

describe('remove-duplicate-casing-fixer.js', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(fs, 'readFileSync');
        sandbox.stub(fs, 'writeFileSync');
        sandbox.stub(fs, 'existsSync').returns(true);
        sandbox.stub(require('glob'), 'sync');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('findDuplicateCasing()', () => {
        it('should identify files with duplicate casing', () => {
            require('glob').sync.returns([
                'src/Component.js',
                'src/component.js',
                'src/MyClass.ts',
                'src/myclass.ts'
            ]);

            const duplicates = findDuplicateCasing();
            expect(duplicates).to.have.lengthOf(2);
            expect(duplicates[0].base).to.equal('Component');
            expect(duplicates[0].files).to.include('src/Component.js');
            expect(duplicates[0].files).to.include('src/component.js');
            expect(duplicates[1].base).to.equal('MyClass');
            expect(duplicates[1].files).to.include('src/MyClass.ts');
            expect(duplicates[1].files).to.include('src/myclass.ts');
        });

        it('should handle no duplicates', () => {
            require('glob').sync.returns([
                'src/unique1.js',
                'src/unique2.js'
            ]);

            const duplicates = findDuplicateCasing();
            expect(duplicates).to.be.an('array').that.is.empty;
        });
    });

    describe('analyzeDuplicateImpact()', () => {
        it('should analyze import statements correctly', () => {
            fs.readFileSync.returns(`
                import { Component } from './Component';
                import { MyClass } from './MyClass';
            `);

            const result = analyzeDuplicateImpact('src/test.js');
            expect(result.imports).to.have.lengthOf(2);
            expect(result.imports[0]).to.include('Component');
            expect(result.imports[1]).to.include('MyClass');
            expect(result.caseMatches).to.deep.equal({
                'Component': 1,
                'MyClass': 1
            });
        });

        it('should handle files with no imports', () => {
            fs.readFileSync.returns('const x = 42;');

            const result = analyzeDuplicateImpact('src/test.js');
            expect(result.imports).to.be.an('array').that.is.empty;
            expect(result.caseMatches).to.be.an('object');
            expect(Object.keys(result.caseMatches)).to.have.lengthOf(0);
        });
    });

    describe('generateFixPlan()', () => {
        it('should create plan for fixing duplicates', () => {
            const duplicates = [
                {
                    base: 'Component',
                    files: ['Component.js', 'component.js'],
                    usages: 5
                }
            ];

            const plan = generateFixPlan(duplicates);
            expect(plan).to.be.an('array').with.lengthOf(1);
            expect(plan[0]).to.have.property('source');
            expect(plan[0]).to.have.property('target');
            expect(plan[0]).to.have.property('priority');
            expect(plan[0].source).to.equal('component.js');
            expect(plan[0].target).to.equal('Component.js');
        });

        it('should prioritize by usage count', () => {
            const duplicates = [
                {
                    base: 'util',
                    files: ['Util.js', 'util.js'],
                    usages: 2
                },
                {
                    base: 'component',
                    files: ['Component.js', 'component.js'],
                    usages: 10
                }
            ];

            const plan = generateFixPlan(duplicates);
            expect(plan).to.be.an('array').with.lengthOf(2);
            expect(plan[0].base).to.equal('component'); // Higher usage should be first
            expect(plan[0].priority).to.be.above(plan[1].priority);
        });
    });

    describe('validateCasingChanges()', () => {
        it('should validate safe casing changes', () => {
            const changes = [{
                oldPath: 'src/component.js',
                newPath: 'src/Component.js',
                imports: []
            }];

            const validation = validateCasingChanges(changes);
            expect(validation.safe).to.be.true;
            expect(validation.warnings).to.be.an('array').that.is.empty;
            expect(validation.changes).to.have.lengthOf(1);
            expect(validation.changes[0].risk).to.equal('LOW');
        });

        it('should detect risky changes', () => {
            const changes = [{
                oldPath: 'src/widely-used-component.js',
                newPath: 'src/WidelyUsedComponent.js',
                imports: ['*']
            }];

            const validation = validateCasingChanges(changes);
            expect(validation.safe).to.be.false;
            expect(validation.warnings).to.have.lengthOf.above(0);
            expect(validation.changes[0].risk).to.equal('HIGH');
            expect(validation.changes[0].warning).to.include('widely used');
        });
    });
});
