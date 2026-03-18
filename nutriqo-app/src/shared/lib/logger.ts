/**
 * Logger utility for safe error logging
 * Prevents sensitive data leakage in logs
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  code?: string;
  context?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, code?: string, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      code,
    };

    // В development логируем детали
    if (this.isDevelopment && details) {
      entry.context = details;
      console.error(`[${entry.level.toUpperCase()}] ${message}`, entry.context);
    } else {
      // В production логируем только message и code
      console.error(`[${entry.level.toUpperCase()}] ${message}`);
    }
  }

  info(message: string): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`);
    }
  }

  warn(message: string, details?: any): void {
    console.warn(`[WARN] ${message}`);
    if (this.isDevelopment && details) {
      console.warn(details);
    }
  }

  error(message: string, code: string, details?: any): void {
    this.log('error', message, code, details);
  }

  debug(message: string, details?: any): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, details || '');
    }
  }
}

export const logger = new Logger();
