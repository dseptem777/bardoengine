/**
 * logger.js
 * Centralized logging system for BardoEngine
 * 
 * Features:
 * - Log levels (debug, info, warn, error)
 * - In-memory log buffer for debugging
 * - Copy logs to clipboard functionality
 * - Console output in development
 * - Tauri file logging in production (future)
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

// In-memory log buffer (circular, last N entries)
const MAX_LOG_ENTRIES = 500;
const logBuffer = [];

// Current log level (can be changed at runtime)
let currentLevel = process.env.NODE_ENV === 'development'
    ? LOG_LEVELS.DEBUG
    : LOG_LEVELS.INFO;

/**
 * Format a log entry
 */
function formatEntry(level, args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            } catch {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');

    return {
        timestamp,
        level,
        message
    };
}

/**
 * Add entry to buffer and console
 */
function log(level, levelName, ...args) {
    if (level < currentLevel) return;

    const entry = formatEntry(levelName, args);

    // Add to buffer (circular)
    logBuffer.push(entry);
    if (logBuffer.length > MAX_LOG_ENTRIES) {
        logBuffer.shift();
    }

    // Console output
    const consoleMethod = levelName.toLowerCase();
    const consoleFn = console[consoleMethod] || console.log;
    consoleFn(`[${entry.timestamp}] [${levelName}]`, ...args);
}

/**
 * The logger object with all methods
 */
export const logger = {
    debug: (...args) => log(LOG_LEVELS.DEBUG, 'DEBUG', ...args),
    info: (...args) => log(LOG_LEVELS.INFO, 'INFO', ...args),
    warn: (...args) => log(LOG_LEVELS.WARN, 'WARN', ...args),
    error: (...args) => log(LOG_LEVELS.ERROR, 'ERROR', ...args),

    /**
     * Get all logs as an array
     */
    getLogs: () => [...logBuffer],

    /**
     * Get logs formatted as a string for copying
     */
    getLogsAsString: () => {
        return logBuffer.map(entry =>
            `[${entry.timestamp}] [${entry.level}] ${entry.message}`
        ).join('\n');
    },

    /**
     * Clear the log buffer
     */
    clear: () => {
        logBuffer.length = 0;
    },

    /**
     * Set minimum log level
     */
    setLevel: (level) => {
        if (LOG_LEVELS[level] !== undefined) {
            currentLevel = LOG_LEVELS[level];
        }
    },

    /**
     * Copy logs to clipboard
     */
    copyToClipboard: async () => {
        try {
            const logs = logger.getLogsAsString();
            await navigator.clipboard.writeText(logs);
            return true;
        } catch (e) {
            console.error('Failed to copy logs:', e);
            return false;
        }
    }
};

// Add startup log
logger.info('BardoEngine Logger initialized');
logger.info(`Environment: ${process.env.NODE_ENV || 'production'}`);
logger.info(`Log level: ${Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k] === currentLevel)}`);

export default logger;
