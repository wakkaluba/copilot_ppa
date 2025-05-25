// Tests for ReviewChecklist (TypeScript)
// Source: src/codeReview/reviewChecklist.ts
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ReviewChecklistError } from '../../../src/codeReview/errors/ReviewChecklistError';
import { ReviewChecklist } from '../../../src/codeReview/reviewChecklist';
import { ReviewChecklistService } from '../../../src/codeReview/services/ReviewChecklistService';

describe('ReviewChecklist', () => {
  let sandbox: sinon.SinonSandbox;
  let mockService: sinon.SinonStubbedInstance<ReviewChecklistService>;
  let mockContext: vscode.ExtensionContext;
  let checklist: ReviewChecklist;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockService = sandbox.createStubInstance(ReviewChecklistService);
    mockContext = { subscriptions: [] } as unknown as vscode.ExtensionContext;
    // Patch the constructor to use our mock
    (ReviewChecklist as any).prototype.service = mockService;
    checklist = new ReviewChecklist(mockContext);
    (checklist as any).service = mockService;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should construct without error', () => {
    assert.ok(checklist);
  });

  it('should get available checklists', () => {
    mockService.getAvailableChecklists.returns(['template1', 'template2']);
    const result = checklist.getAvailableChecklists();
    assert.deepStrictEqual(result, ['template1', 'template2']);
  });

  it('should handle error in getAvailableChecklists', () => {
    mockService.getAvailableChecklists.throws(new Error('fail'));
    assert.throws(() => checklist.getAvailableChecklists(), ReviewChecklistError);
  });

  it('should get a checklist by name', () => {
    mockService.getChecklist.returns([{ id: 'item1', description: 'desc' }]);
    const result = checklist.getChecklist('template1');
    assert.deepStrictEqual(result, [{ id: 'item1', description: 'desc' }]);
  });

  it('should handle error in getChecklist', () => {
    mockService.getChecklist.throws(new Error('fail'));
    assert.throws(() => checklist.getChecklist('bad'), ReviewChecklistError);
  });

  it('should create a checklist', () => {
    mockService.createChecklist.returns(true);
    const result = checklist.createChecklist('new', []);
    assert.strictEqual(result, true);
  });

  it('should handle error in createChecklist', () => {
    mockService.createChecklist.throws(new Error('fail'));
    assert.throws(() => checklist.createChecklist('bad', []), ReviewChecklistError);
  });
});
