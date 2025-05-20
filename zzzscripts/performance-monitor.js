#!/usr/bin/env node
/**
 * Script: performance-monitor.js
 * Description: Monitors Node.js process performance (CPU, memory, event loop lag) and logs metrics.
 * Alerts if thresholds are exceeded. Designed for CI integration and extensibility.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const LOG_DIR = path.resolve(__dirname, '../zzzbuild/performance');
const LOG_FILE = path.join(LOG_DIR, 'performance-metrics.log');
const INTERVAL_MS = 10000; // 10 seconds

// Thresholds (customize as needed)
const THRESHOLDS = {
  memoryRssMB: 500, // Alert if RSS > 500MB
  cpuPercent: 80,   // Alert if CPU > 80%
  eventLoopLagMs: 200 // Alert if event loop lag > 200ms
};

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function getCpuUsagePercent(startUsage, startTime) {
  const elapTime = process.hrtime(startTime);
  const elapUserMS = (process.cpuUsage().user - startUsage.user) / 1000;
  const elapS = elapTime[0] + elapTime[1] / 1e9;
  return (elapUserMS / (elapS * 1000)) * 100;
}

function getEventLoopLag(cb) {
  const start = process.hrtime();
  setImmediate(() => {
    const delta = process.hrtime(start);
    const ms = delta[0] * 1e3 + delta[1] / 1e6;
    cb(ms);
  });
}

function logMetrics(metrics) {
  const line = `${new Date().toISOString()} | RSS_MB=${metrics.memoryRssMB} | CPU=${metrics.cpuPercent.toFixed(1)}% | Lag=${metrics.eventLoopLagMs.toFixed(1)}ms${metrics.alert ? ' | ALERT: ' + metrics.alert : ''}`;
  fs.appendFileSync(LOG_FILE, line + os.EOL);
  if (metrics.alert) {
    // Print alert to console for CI pickup
    // eslint-disable-next-line no-console
    console.error('[PERF ALERT]', metrics.alert, line);
  }
}

function monitor() {
  let lastCpu = process.cpuUsage();
  let lastTime = process.hrtime();
  setInterval(() => {
    const mem = process.memoryUsage();
    const memoryRssMB = Math.round(mem.rss / 1024 / 1024);
    const cpuPercent = getCpuUsagePercent(lastCpu, lastTime);
    lastCpu = process.cpuUsage();
    lastTime = process.hrtime();
    getEventLoopLag((eventLoopLagMs) => {
      let alert = '';
      if (memoryRssMB > THRESHOLDS.memoryRssMB) {
        alert += `High memory usage (${memoryRssMB}MB). `;
      }
      if (cpuPercent > THRESHOLDS.cpuPercent) {
        alert += `High CPU usage (${cpuPercent.toFixed(1)}%). `;
      }
      if (eventLoopLagMs > THRESHOLDS.eventLoopLagMs) {
        alert += `Event loop lag (${eventLoopLagMs.toFixed(1)}ms). `;
      }
      logMetrics({ memoryRssMB, cpuPercent, eventLoopLagMs, alert: alert.trim() });
    });
  }, INTERVAL_MS);
}

function main() {
  ensureLogDir();
  // eslint-disable-next-line no-console
  console.log('Performance monitoring started. Logging to', LOG_FILE);
  monitor();
}

if (require.main === module) {
  main();
}
