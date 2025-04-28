import { EventEmitter } from '../../src/common/eventEmitter';

describe('EventEmitter', () => {
    let emitter: EventEmitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    afterEach(() => {
        emitter.dispose();
    });

    test('should register event listeners', () => {
        const listener = jest.fn();
        emitter.on('test', listener);
        emitter.emit('test', 'data');
        expect(listener).toHaveBeenCalledWith('data');
    });

    test('should remove event listeners', () => {
        const listener = jest.fn();
        emitter.on('test', listener);
        emitter.off('test', listener);
        emitter.emit('test', 'data');
        expect(listener).not.toHaveBeenCalled();
    });

    test('should remove all listeners on dispose', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        emitter.on('event1', listener1);
        emitter.on('event2', listener2);
        
        emitter.dispose();
        
        emitter.emit('event1', 'data1');
        emitter.emit('event2', 'data2');
        
        expect(listener1).not.toHaveBeenCalled();
        expect(listener2).not.toHaveBeenCalled();
    });

    test('should return disposable from on method', () => {
        const listener = jest.fn();
        const disposable = emitter.on('test', listener);
        
        disposable.dispose();
        
        emitter.emit('test', 'data');
        expect(listener).not.toHaveBeenCalled();
    });

    test('should handle multiple listeners for same event', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        
        emitter.on('test', listener1);
        emitter.on('test', listener2);
        
        emitter.emit('test', 'data');
        
        expect(listener1).toHaveBeenCalledWith('data');
        expect(listener2).toHaveBeenCalledWith('data');
    });

    test('should not throw when emitting event with no listeners', () => {
        expect(() => {
            emitter.emit('nonexistent', 'data');
        }).not.toThrow();
    });
});
