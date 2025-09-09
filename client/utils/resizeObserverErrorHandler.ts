/**
 * Utility to handle and suppress ResizeObserver loop errors
 * These errors are harmless but can clutter the console
 */

// Suppress ResizeObserver loop completed with undelivered notifications error
export const suppressResizeObserverError = () => {
  // Store original error handler
  const originalError = window.console.error;

  // Override console.error to filter out ResizeObserver errors
  window.console.error = (...args: any[]) => {
    const errorMessage = args[0];

    // Check if it's a ResizeObserver error - multiple variations
    if (
      typeof errorMessage === 'string' && (
        errorMessage.includes('ResizeObserver loop completed with undelivered notifications') ||
        errorMessage.includes('ResizeObserver loop limit exceeded') ||
        errorMessage.includes('ResizeObserver') && errorMessage.includes('loop')
      )
    ) {
      // Silently ignore this error
      return;
    }

    // For all other errors, use the original handler
    originalError.apply(window.console, args);
  };

  // Also suppress the error at the window level
  window.addEventListener('error', (event) => {
    if (
      event.message &&
      event.message.includes('ResizeObserver')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });
};

// Debounced ResizeObserver wrapper to prevent loops
export class OptimizedResizeObserver {
  private observer: ResizeObserver;
  private timeoutId: number | null = null;
  private debounceMs: number;

  constructor(callback: ResizeObserverCallback, debounceMs = 16) {
    this.debounceMs = debounceMs;
    
    this.observer = new ResizeObserver((entries, observer) => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      
      this.timeoutId = window.setTimeout(() => {
        try {
          callback(entries, observer);
        } catch (error) {
          // Suppress ResizeObserver errors
          if (
            error instanceof Error &&
            error.message.includes('ResizeObserver loop completed')
          ) {
            return;
          }
          throw error;
        }
      }, this.debounceMs);
    });
  }

  observe(target: Element, options?: ResizeObserverOptions) {
    this.observer.observe(target, options);
  }

  unobserve(target: Element) {
    this.observer.unobserve(target);
  }

  disconnect() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.observer.disconnect();
  }
}

// Initialize error suppression when module is loaded
if (typeof window !== 'undefined') {
  suppressResizeObserverError();

  // Force reinitialize after a short delay
  setTimeout(() => {
    suppressResizeObserverError();
  }, 100);
}
