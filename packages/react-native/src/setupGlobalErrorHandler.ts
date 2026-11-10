import type { UebOnError } from "@universal-error-boundary/core";

declare const global: {
    ErrorUtils?: {
        getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
        setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
    };
};

/**
 * React error boundaries only catch errors thrown during render. Call this once (e.g. in your
 * app's entry file) to also route JS-thread errors that happen outside render — event handlers,
 * timers, unhandled logic — through the same onError callback you pass to <ErrorBoundary>.
 * It does not catch true native crashes; use a native crash reporter (Sentry, Crashlytics) for those.
 */
export function setupGlobalErrorHandler(onError: UebOnError): () => void {
    const errorUtils = global.ErrorUtils;
    if (!errorUtils) {
        return () => {};
    }

    const previousHandler = errorUtils.getGlobalHandler();

    errorUtils.setGlobalHandler((error, isFatal) => {
        onError(error, { componentStack: null, isFatal });
        previousHandler?.(error, isFatal);
    });

    return () => {
        errorUtils.setGlobalHandler(previousHandler);
    };
}
