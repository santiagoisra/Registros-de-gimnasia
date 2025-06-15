import '@testing-library/jest-dom';

// Jest matchers
declare namespace jest {
  interface Matchers<R> {
    toHaveBeenCalledWith(...args: any[]): R;
    toHaveBeenCalled(): R;
    toHaveBeenCalledTimes(expected: number): R;
  }
}