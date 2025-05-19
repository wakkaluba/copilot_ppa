// LogStorageConfig interface for file-based logging configuration
export interface LogStorageConfig {
  filePath: string;
  maxSizeMB: number;
  maxFiles: number;
}

// Optionally, export LogLevel and LogEntry if needed in the future
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  additionalData?: unknown[];
}
