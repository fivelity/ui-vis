/**
 * Error handling utilities for the application
 * Provides standardized error handling patterns and error reporting
 */

import { toast } from 'sonner';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorOptions {
  /** Should we show a toast notification */
  showNotification?: boolean;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Additional context for error logging/reporting */
  context?: Record<string, any>;
  /** Report to error monitoring service */
  report?: boolean;
}

/**
 * Standard application error class with additional context
 * and severity information
 */
export class AppError extends Error {
  severity: ErrorSeverity;
  context?: Record<string, any>;
  originalError?: Error;
  code?: string;

  constructor(
    message: string, 
    options?: {
      severity?: ErrorSeverity;
      context?: Record<string, any>;
      originalError?: Error;
      code?: string;
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.severity = options?.severity || 'error';
    this.context = options?.context;
    this.originalError = options?.originalError;
    this.code = options?.code;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Handle errors in a consistent way across the application
 * Includes error logging, notifications, and reporting
 */
export function handleError(
  error: Error | string,
  options: ErrorOptions = {}
): void {
  const { 
    showNotification = true,
    severity = 'error',
    context = {},
    report = true
  } = options;

  // Create standardized error object
  const errorObj = typeof error === 'string' 
    ? new AppError(error, { severity, context })
    : error;

  // Log error to console
  if (severity === 'error') {
    console.error('Application Error:', errorObj);
    if (context && Object.keys(context).length > 0) {
      console.error('Error Context:', context);
    }
  } else if (severity === 'warning') {
    console.warn('Application Warning:', errorObj);
  } else {
    console.info('Application Info:', errorObj);
  }

  // Show user notification if enabled
  if (showNotification) {
    const message = errorObj.message || 'An unexpected error occurred';
    
    if (severity === 'error') {
      toast.error(message);
    } else if (severity === 'warning') {
      toast.warning(message);
    } else {
      toast.info(message);
    }
  }

  // Send to error reporting service in production
  if (report && process.env.NODE_ENV === 'production') {
    // Integration point for error reporting services
    // Example: Sentry, LogRocket, etc.
    reportError(errorObj, context);
  }
}

/**
 * Centralized error reporting function
 * Placeholder for integration with error monitoring services
 */
function reportError(error: Error, context?: Record<string, any>): void {
  // This would be implemented with your preferred error reporting service
  // Example with Sentry:
  // Sentry.captureException(error, { extra: context });
  
  // For now, we just log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('Error Report (Would be sent to monitoring service)');
    console.error(error);
    if (context) {
      console.info('Context:', context);
    }
    console.groupEnd();
  }
}

/**
 * Try to execute a function and handle any errors
 * @param fn Function to execute
 * @param errorHandler Optional custom error handler
 * @returns Result of the function or undefined if error
 */
export async function tryCatch<T>(
  fn: () => Promise<T> | T,
  errorHandler?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    
    if (errorHandler) {
      errorHandler(error);
    } else {
      handleError(error);
    }
    
    return undefined;
  }
}

/**
 * Parse API error responses into a standardized format
 * @param error The error to parse
 * @returns A standardized error message
 */
export function parseApiError(error: any): string {
  // Handle axios/fetch errors
  if (error.response) {
    // Server responded with an error status code
    const { status, data } = error.response;
    const message = data?.message || data?.error || `Server error (${status})`;
    return message;
  } else if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your connection.';
  } else if (error.message) {
    // Something else happened while setting up the request
    return error.message;
  }
  
  // Fallback for any other type of error
  return 'An unexpected error occurred';
}
