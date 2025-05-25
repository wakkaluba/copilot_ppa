export interface ITestCase {
  id?: string;
  name: string;
  status?: 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  stackTrace?: string;
}

export interface ITestSuite {
  id?: string;
  name: string;
  tests: ITestCase[];
  suites?: ITestSuite[];
}

export interface ITestResult {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  suites: ITestSuite[];
  timestamp?: Date;
  success?: boolean;
  message?: string;
  details?: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  performanceMetrics?: Record<string, number>;
}

export type TestResult = ITestResult;
// ...add more types as needed...
