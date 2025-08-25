/**
 * Secure Logger
 * 
 * Provides logging functionality with automatic sanitization of sensitive data.
 */

import { ErrorSanitizer } from '@/security';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel): void {
    this.level = level;
  }

  static error(message: string, error?: Error): void {
    if (this.level >= LogLevel.ERROR) {
      const sanitizedMessage = ErrorSanitizer.sanitize(message);
      const sanitizedError = error ? ErrorSanitizer.sanitize(error) : undefined;
      console.error('[ERROR]', sanitizedMessage, sanitizedError || '');
    }
  }

  static warn(message: string): void {
    if (this.level >= LogLevel.WARN) {
      const sanitizedMessage = ErrorSanitizer.sanitize(message);
      console.warn('[WARN]', sanitizedMessage);
    }
  }

  static info(message: string): void {
    if (this.level >= LogLevel.INFO) {
      const sanitizedMessage = ErrorSanitizer.sanitize(message);
      console.log('[INFO]', sanitizedMessage);
    }
  }

  static debug(message: string): void {
    if (this.level >= LogLevel.DEBUG) {
      const sanitizedMessage = ErrorSanitizer.sanitize(message);
      console.log('[DEBUG]', sanitizedMessage);
    }
  }
}