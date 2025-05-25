export interface ITestSuite {
  name: string;
  tests: unknown[];
  // Add more fields as needed
  suites?: ITestSuite[];
}

export interface ITestResult {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  suites: ITestSuite[];
}

export type TestResult = ITestResult;
// ...add more types as needed...
