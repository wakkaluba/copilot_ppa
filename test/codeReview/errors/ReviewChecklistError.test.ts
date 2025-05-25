import { expect } from 'chai';
import { ReviewChecklistError } from '../../../src/codeReview/errors/ReviewChecklistError';

describe('ReviewChecklistError', () => {
  it('should create an error with the correct message', () => {
    const errorMessage = 'Test error message';
    const error = new ReviewChecklistError(errorMessage);
    expect(error.message).to.equal(errorMessage);
  });

  it('should have the correct name property', () => {
    const error = new ReviewChecklistError('Test error');
    expect(error.name).to.equal('ReviewChecklistError');
  });

  it('should be an instance of Error', () => {
    const error = new ReviewChecklistError('Test error');
    expect(error).to.be.instanceOf(Error);
  });

  it('should be an instance of ReviewChecklistError', () => {
    const error = new ReviewChecklistError('Test error');
    expect(error).to.be.instanceOf(ReviewChecklistError);
  });

  it('should have a stack trace', () => {
    const error = new ReviewChecklistError('Test error');
    expect(error.stack).to.be.a('string');
    expect(error.stack!.length).to.be.greaterThan(0);
  });

  it('should maintain prototype chain for instanceof checks', () => {
    const error = new ReviewChecklistError('Test error');
    expect(Object.getPrototypeOf(error)).to.equal(ReviewChecklistError.prototype);
    expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).to.equal(Error.prototype);
  });

  it('should be throwable and catchable', () => {
    function throwError(): void {
      throw new ReviewChecklistError('Test throwable error');
    }
    expect(throwError).to.throw(ReviewChecklistError);
    expect(throwError).to.throw('Test throwable error');
    try {
      throwError();
    } catch (error) {
      expect(error).to.be.instanceOf(ReviewChecklistError);
      if (error instanceof ReviewChecklistError) {
        expect(error.message).to.equal('Test throwable error');
      }
    }
  });

  it('should handle empty message', () => {
    const error = new ReviewChecklistError('');
    expect(error.message).to.equal('');
    expect(error.name).to.equal('ReviewChecklistError');
  });
});
