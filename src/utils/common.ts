import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Checks if a value is null or undefined
 */
export function isNullOrUndefined(value: unknown): boolean {
  return value === null || value === undefined;
}

/**
 * Safely gets a nested property from an object without throwing errors
 */
export function getNestedProperty(obj: Record<string, unknown>, path: string, defaultValue: unknown = undefined): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (isNullOrUndefined(current) || typeof current !== 'object') {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return isNullOrUndefined(current) ? defaultValue : current;
}

/**
 * Safely parse JSON without throwing errors
 */
export function safeJsonParse<T = Record<string, unknown>>(text: string, defaultValue: T = {} as T): T {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = undefined;
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Get system hardware specifications
 */
export async function getHardwareSpecs(): Promise<{
  ram: { total: number; free: number };
  cpu: { cores: number; model?: string };
  gpu: { available: boolean; name?: string; vram?: number; cudaSupport?: boolean };
}> {
  // Default return object with basic info we can get synchronously
  const result = {
    ram: {
      total: os.totalmem() / (1024 * 1024), // Convert to MB
      free: os.freemem() / (1024 * 1024)    // Convert to MB
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0]?.model
    },
    gpu: {
      available: false
    }
  };
  
  // In a real implementation, we'd use platform-specific methods to detect GPU
  // This is a placeholder that would be replaced with actual implementation
  return result;
}

/**
 * Format bytes to a human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format milliseconds into a human-readable time string
 */
export function formatTime(ms: number): string {
  if (ms <= 0) {
    return '0s';
  }
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

/**
 * Ensure a directory exists, creating it if needed
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get unique items from an array
 */
export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Parse error objects into string messages
 */
export function parseError(error: unknown): string {
  if (!error) {
    return 'Unknown error';
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return `Error: ${typeof error} ${JSON.stringify(error)}`;
}