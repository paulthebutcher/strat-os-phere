/**
 * Logger utility that gates logging behind environment flags
 * Only logs in development/preview by default, or when explicit flags are set
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function shouldLog(level: LogLevel, flag?: string): boolean {
  if (process.env.NODE_ENV === 'production' && !flag) {
    return false
  }
  
  if (flag && process.env[flag] !== 'true') {
    return false
  }
  
  return true
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('debug', 'DEBUG_ALL')) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },
  
  error: (message: string, ...args: unknown[]) => {
    // Always log errors, but gate detailed info behind flags
    if (process.env.DEBUG_ERRORS === 'true') {
      console.error(`[ERROR] ${message}`, ...args)
    } else {
      console.error(`[ERROR] ${message}`)
    }
  },
  
  // Specialized loggers for specific subsystems
  auth: {
    debug: (message: string, ...args: unknown[]) => {
      if (shouldLog('debug', 'DEBUG_AUTH')) {
        console.debug(`[AUTH] ${message}`, ...args)
      }
    },
    info: (message: string, ...args: unknown[]) => {
      if (shouldLog('info', 'DEBUG_AUTH')) {
        console.info(`[AUTH] ${message}`, ...args)
      }
    },
  },
  
  llm: {
    debug: (message: string, ...args: unknown[]) => {
      if (shouldLog('debug', 'DEBUG_LLM')) {
        console.debug(`[LLM] ${message}`, ...args)
      }
    },
    info: (message: string, ...args: unknown[]) => {
      if (shouldLog('info', 'DEBUG_LLM')) {
        console.info(`[LLM] ${message}`, ...args)
      }
    },
  },
}

