import { debounce, throttle, formatTime, isValidUrl, parseError } from '../../src/utils/common';

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('debounce', () => {
    test('should call the function after the specified delay', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      // Call the debounced function
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time by 250ms
      jest.advanceTimersByTime(250);
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time by another 250ms
      jest.advanceTimersByTime(250);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should reset the timer if called again before delay', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      // Call the debounced function
      debouncedFn();
      jest.advanceTimersByTime(300);
      
      // Call again
      debouncedFn();
      jest.advanceTimersByTime(300);
      expect(mockFn).not.toHaveBeenCalled();
      
      // Complete the second debounce delay
      jest.advanceTimersByTime(200);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    test('should limit function calls to once per delay period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 500);

      // Call the throttled function multiple times
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      throttledFn();
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Fast-forward time by 500ms
      jest.advanceTimersByTime(500);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('formatTime', () => {
    test('should format milliseconds into readable time string', () => {
      expect(formatTime(1000)).toBe('1s');
      expect(formatTime(60000)).toBe('1m');
      expect(formatTime(3661000)).toBe('1h 1m 1s');
      expect(formatTime(86400000)).toBe('1d');
      expect(formatTime(90061000)).toBe('1d 1h 1m 1s');
    });

    test('should handle zero and negative values', () => {
      expect(formatTime(0)).toBe('0s');
      expect(formatTime(-1000)).toBe('0s');
    });
  });

  describe('isValidUrl', () => {
    test('should validate URLs correctly', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('parseError', () => {
    test('should extract message from Error object', () => {
      const error = new Error('Test error');
      expect(parseError(error)).toBe('Test error');
    });

    test('should handle string errors', () => {
      expect(parseError('Error message')).toBe('Error message');
    });

    test('should handle unknown error types', () => {
      expect(parseError(null)).toBe('Unknown error');
      expect(parseError(undefined)).toBe('Unknown error');
      expect(parseError({ custom: 'error' })).toContain('object');
    });
  });
});
