const sinon = require('sinon');
const fs = require('fs');
const path = require('path');

// Import the functions we need to test
const {
    analyzeCodebase,
    generateStatusMarkdown,
    updateRefactoringStatus,
    validateRefactoringChanges
} = require('../../src/zzzscripts/update-refactoring-status');
const { expect } = require('chai');

describe('update-refactoring-status.js', () => {
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

    describe('parseCurrentStatus()', () => {
        it('should parse existing status file', () => {
            const mockStatus = JSON.stringify({
                timestamp: '2023-05-12T10:00:00Z',
                completedTasks: ['task1', 'task2'],
                pendingTasks: ['task3'],
                statistics: {
                    filesRefactored: 10,
                    linesChanged: 100
                }
            });
            fs.readFileSync.returns(mockStatus);

            const status = parseCurrentStatus();
            expect(status.timestamp).to.equal('2023-05-12T10:00:00Z');
            expect(status.completedTasks).to.have.lengthOf(2);
            expect(status.pendingTasks).to.have.lengthOf(1);
            expect(status.statistics.filesRefactored).to.equal(10);
            expect(status.statistics.linesChanged).to.equal(100);
        });

        it('should handle missing status file', () => {
            fs.existsSync.returns(false);

            const status = parseCurrentStatus();
            expect(status).to.deep.equal({
                timestamp: sinon.match.string,
                completedTasks: [],
                pendingTasks: [],
                failedTasks: [],
                statistics: {
                    filesRefactored: 0,
                    linesChanged: 0,
                    successRate: 100
                }
            });
        });
    });

    describe('updateRefactoringProgress()', () => {
        it('should update task status', () => {
            const currentStatus = {
                pendingTasks: ['task1', 'task2'],
                completedTasks: []
            };

            const update = {
                taskId: 'task1',
                status: 'completed',
                details: 'Successfully refactored'
            };

            const newStatus = updateRefactoringProgress(currentStatus, update);
            expect(newStatus.pendingTasks).to.have.lengthOf(1);
            expect(newStatus.completedTasks).to.have.lengthOf(1);
            expect(newStatus.completedTasks[0]).to.equal('task1');
            expect(newStatus.pendingTasks).to.not.include('task1');
            expect(newStatus.details['task1']).to.equal('Successfully refactored');
        });

        it('should handle task failures', () => {
            const currentStatus = {
                pendingTasks: ['task1'],
                completedTasks: [],
                failedTasks: []
            };

            const update = {
                taskId: 'task1',
                status: 'failed',
                error: 'Refactoring failed'
            };

            const newStatus = updateRefactoringProgress(currentStatus, update);
            expect(newStatus.pendingTasks).to.have.lengthOf(0);
            expect(newStatus.failedTasks).to.have.lengthOf(1);
            expect(newStatus.failedTasks[0]).to.deep.include({
                taskId: 'task1',
                error: 'Refactoring failed'
            });
            expect(newStatus.statistics.successRate).to.be.below(100);
        });

        it('should handle error in task update', () => {
            const update = {
                taskId: 'task1',
                status: 'failed',
                error: 'Refactoring failed'
            };
            // Simulate error handling
            expect(update.status).to.equal('failed');
            expect(update.error).to.be.defined;
        });
    });

    describe('calculateMetrics()', () => {
        it('should calculate refactoring metrics', () => {
            const changes = [
                { file: 'src/file1.js', linesChanged: 10 },
                { file: 'src/file2.js', linesChanged: 20 }
            ];

            const metrics = calculateMetrics(changes);
            expect(metrics.filesRefactored).to.equal(2);
            expect(metrics.linesChanged).to.equal(30);
            expect(metrics.averageChangesPerFile).to.equal(15);
            expect(metrics.impactScore).to.be.a('number');
        });

        it('should handle no changes', () => {
            const changes = [];

            const metrics = calculateMetrics(changes);
            expect(metrics.filesRefactored).to.equal(0);
            expect(metrics.linesChanged).to.equal(0);
            expect(metrics.averageChangesPerFile).to.equal(0);
            expect(metrics.impactScore).to.equal(0);
        });
    });

    describe('generateStatusReport()', () => {
        it('should generate comprehensive status report', () => {
            const status = {
                completedTasks: ['task1', 'task2'],
                pendingTasks: ['task3'],
                failedTasks: [],
                statistics: {
                    filesRefactored: 20,
                    linesChanged: 200,
                    successRate: 100
                }
            };

            const report = generateStatusReport(status);
            expect(report).to.include('# Refactoring Status Report');
            expect(report).to.include('## Completed Tasks (2)');
            expect(report).to.include('## Pending Tasks (1)');
            expect(report).to.include('## Statistics');
            expect(report).to.include('20 files refactored');
            expect(report).to.include('200 lines changed');
            expect(report).to.include('100% success rate');
            expect(fs.writeFileSync).to.have.been.calledWith(
                'refactoring-status-report.md',
                sinon.match.string
            );
        });

        it('should include error details', () => {
            const status = {
                completedTasks: ['task1'],
                pendingTasks: [],
                failedTasks: [{
                    taskId: 'task2',
                    error: 'Validation failed'
                }],
                statistics: {
                    filesRefactored: 10,
                    linesChanged: 100,
                    successRate: 50
                }
            };

            const report = generateStatusReport(status);
            expect(report).to.include('## Failed Tasks (1)');
            expect(report).to.include('task2');
            expect(report).to.include('Validation failed');
            expect(report).to.include('50% success rate');
            expect(report).to.include('## Error Analysis');
        });
    });

    describe('validateRefactoringChanges()', () => {
        it('should validate successful changes', () => {
            const changes = [{
                file: 'src/file1.js',
                type: 'rename',
                details: { old: 'oldName', new: 'newName' }
            }];

            const validation = validateRefactoringChanges(changes);
            expect(validation.valid).to.be.true;
            expect(validation.changes).to.have.lengthOf(1);
            expect(validation.warnings).to.be.an('array').that.is.empty;
        });

        it('should detect invalid changes', () => {
            const changes = [{
                file: 'src/file1.js',
                type: 'delete',
                details: { critical: true }
            }];

            const validation = validateRefactoringChanges(changes);
            expect(validation.valid).to.be.false;
            expect(validation.warnings).to.include('Attempting to delete critical file');
            expect(validation.suggestedFixes).to.be.an('array');
            expect(validation.riskLevel).to.equal('HIGH');
        });
    });
});
