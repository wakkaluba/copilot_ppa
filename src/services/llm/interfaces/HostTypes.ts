import { EventEmitter } from 'events';

export interface HostProcessInfo {
    pid: number;
    startTime: number;
    cpuUsage?: number;
    memoryUsage?: number;
    status: 'starting' | 'running' | 'error' | 'stopped';
    errorCount: number;
    lastError?: Error;
}

export interface HostProcessEvent {
    processId: number;
    timestamp: number;
    type: 'start' | 'stop' | 'error' | 'crash';
    error?: Error;
}

export interface HostManagerEvents {
    'process:started': (info: HostProcessInfo) => void;
    'process:stopped': (info: HostProcessInfo) => void;
    'process:error': (error: Error, info: HostProcessInfo) => void;
    'process:crash': (error: Error, info: HostProcessInfo) => void;
    'health:warning': (message: string, metrics: any) => void;
    'health:critical': (error: Error, metrics: any) => void;
    'metrics:updated': (metrics: any) => void;
}
