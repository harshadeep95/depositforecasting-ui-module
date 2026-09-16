/**
 * DEPRECATED: This file is kept for backward compatibility.
 * Use error-reporting.ts instead.
 *
 * Error reporting utility - replaces Lovable error reporting.
 * In the free version, errors are logged to the browser console.
 * You can extend this to integrate with your own error tracking service
 * (e.g., Sentry, LogRocket, custom backend logging).
 */

type ErrorReportingOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    // Server-side error logging
    console.error("Server error:", error, context);
    return;
  }

  // Client-side error logging
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  const stack = error instanceof Error ? error.stack : undefined;

  const errorInfo = {
    message,
    stack,
    url: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...context,
  };

  // Log to console in development
  console.error("Error reported:", errorInfo);

  // TODO: Integrate with your error tracking service
  // Example implementations:
  // - Sentry: Sentry.captureException(error, { contexts: { app: context } })
  // - LogRocket: LogRocket.captureException(error)
  // - Custom backend: fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorInfo) })
}
