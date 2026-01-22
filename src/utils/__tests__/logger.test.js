/**
 * Tests for logger utility
 * Covers log levels, buffer management, and formatting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We need to reset modules to test logger initialization
describe('logger', () => {
    let logger

    beforeEach(async () => {
        // Reset the module cache to get fresh logger instance
        vi.resetModules()
        // Mock process.env
        vi.stubEnv('NODE_ENV', 'development')
        // Re-import logger
        const module = await import('../logger')
        logger = module.logger
        logger.clear()
    })

    afterEach(() => {
        vi.unstubAllEnvs()
    })

    describe('log methods', () => {
        it('should log debug messages', () => {
            logger.debug('Debug message')

            const logs = logger.getLogs()
            expect(logs.length).toBeGreaterThan(0)
            // Find our debug message (skip initialization logs)
            const debugLog = logs.find(l => l.message === 'Debug message')
            expect(debugLog).toBeDefined()
            expect(debugLog.level).toBe('DEBUG')
        })

        it('should log info messages', () => {
            logger.info('Info message')

            const logs = logger.getLogs()
            const infoLog = logs.find(l => l.message === 'Info message')
            expect(infoLog).toBeDefined()
            expect(infoLog.level).toBe('INFO')
        })

        it('should log warn messages', () => {
            logger.warn('Warning message')

            const logs = logger.getLogs()
            const warnLog = logs.find(l => l.message === 'Warning message')
            expect(warnLog).toBeDefined()
            expect(warnLog.level).toBe('WARN')
        })

        it('should log error messages', () => {
            logger.error('Error message')

            const logs = logger.getLogs()
            const errorLog = logs.find(l => l.message === 'Error message')
            expect(errorLog).toBeDefined()
            expect(errorLog.level).toBe('ERROR')
        })

        it('should log objects as JSON', () => {
            logger.info('Object:', { key: 'value', num: 42 })

            const logs = logger.getLogs()
            const objLog = logs.find(l => l.message.includes('Object:'))
            expect(objLog).toBeDefined()
            expect(objLog.message).toContain('"key": "value"')
        })
    })

    describe('getLogs / getLogsAsString', () => {
        it('should return copy of log buffer', () => {
            logger.info('Test')

            const logs = logger.getLogs()
            logs.push({ fake: true })

            // Original buffer should be unchanged
            expect(logger.getLogs().length).toBe(logs.length - 1)
        })

        it('should format logs as string', () => {
            logger.clear()
            logger.info('Line 1')
            logger.warn('Line 2')

            const logString = logger.getLogsAsString()

            expect(logString).toContain('[INFO] Line 1')
            expect(logString).toContain('[WARN] Line 2')
            expect(logString.split('\n').length).toBe(2)
        })
    })

    describe('clear', () => {
        it('should empty the log buffer', () => {
            logger.info('Will be cleared')
            logger.warn('Also cleared')

            logger.clear()

            expect(logger.getLogs()).toHaveLength(0)
        })
    })

    describe('setLevel', () => {
        it('should filter logs below set level', () => {
            logger.clear()
            logger.setLevel('WARN')

            logger.debug('Debug - should be filtered')
            logger.info('Info - should be filtered')
            logger.warn('Warn - should appear')
            logger.error('Error - should appear')

            const logs = logger.getLogs()
            expect(logs.length).toBe(2)
            expect(logs[0].level).toBe('WARN')
            expect(logs[1].level).toBe('ERROR')
        })

        it('should ignore invalid levels', () => {
            // This should not throw
            expect(() => {
                logger.setLevel('INVALID')
            }).not.toThrow()
        })
    })

    describe('copyToClipboard', () => {
        it('should call navigator.clipboard.writeText', async () => {
            logger.info('Test for clipboard')

            const result = await logger.copyToClipboard()

            expect(result).toBe(true)
            expect(navigator.clipboard.writeText).toHaveBeenCalled()
        })
    })

    describe('circular buffer', () => {
        it('should respect MAX_LOG_ENTRIES limit', () => {
            logger.clear()

            // Add more than MAX (500)
            for (let i = 0; i < 550; i++) {
                logger.debug(`Log ${i}`)
            }

            const logs = logger.getLogs()
            expect(logs.length).toBeLessThanOrEqual(500)

            // First log should be ~50 (oldest ones trimmed)
            expect(logs[0].message).toBe('Log 50')
        })
    })
})
