import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
    explainError,
    resolveTheme,
    type ErrorExplanation,
    type Theme,
    type ThemeInput,
    type UebOnError,
} from "@universal-error-boundary/core";

export interface FallbackRenderProps {
    error: Error;
    errorInfo: ErrorInfo | null;
    explanation: ErrorExplanation;
    theme: Theme;
    reset: () => void;
}

export interface ErrorBoundaryProps {
    children: ReactNode;
    /** Bundled theme name ("light" | "dark" | "pink" | "red" | "blue"), a full custom Theme, or { base, tokens } to override a few tokens. */
    theme?: ThemeInput;
    /** Override the auto-generated title. */
    title?: string;
    /** Override the auto-generated description/suggestion text. */
    message?: string;
    /** Fully replace the default fallback UI. Can be a node or a render function for access to the error/reset. */
    fallback?: ReactNode | ((props: FallbackRenderProps) => ReactNode);
    /** Called with (error, errorInfo) on every catch — wire this to Sentry, an API call, analytics, etc. */
    onError?: UebOnError;
    /** Called after the boundary is reset (via "Try Again" or resetKeys changing). */
    onReset?: () => void;
    /** When any value in this array changes, the boundary automatically resets. */
    resetKeys?: unknown[];
    /** Show the raw error message + stack trace in the fallback UI. Defaults to true in development, false in production. */
    showDetails?: boolean;
    /** Hide the built-in "Try Again" / "Reload" action buttons. */
    hideActions?: boolean;
}

interface ErrorBoundaryState {
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

const isDev =
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV !== "production";

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null, errorInfo: null };

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });
        this.props.onError?.(error, errorInfo);
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        const { resetKeys } = this.props;
        if (
            this.state.error &&
            resetKeys &&
            prevProps.resetKeys &&
            (resetKeys.length !== prevProps.resetKeys.length ||
                resetKeys.some((key, i) => key !== prevProps.resetKeys?.[i]))
        ) {
            this.reset();
        }
    }

    reset = () => {
        this.setState({ error: null, errorInfo: null });
        this.props.onReset?.();
    };

    render() {
        const { error, errorInfo } = this.state;

        if (!error) return this.props.children;

        const theme = resolveTheme(this.props.theme);
        const explanation = explainError(error);
        const { fallback } = this.props;

        if (typeof fallback === "function") {
            return fallback({ error, errorInfo, explanation, theme, reset: this.reset });
        }
        if (fallback) return fallback;

        return (
            <DefaultFallback
                error={error}
                errorInfo={errorInfo}
                explanation={explanation}
                theme={theme}
                reset={this.reset}
                title={this.props.title}
                message={this.props.message}
                showDetails={this.props.showDetails ?? isDev}
                hideActions={this.props.hideActions}
            />
        );
    }
}

interface DefaultFallbackProps extends FallbackRenderProps {
    title?: string;
    message?: string;
    showDetails: boolean;
    hideActions?: boolean;
}

function DefaultFallback({
    error,
    errorInfo,
    explanation,
    theme,
    reset,
    title,
    message,
    showDetails,
    hideActions,
}: DefaultFallbackProps) {
    const t = theme.tokens;

    return (
        <div
            role="alert"
            style={{
                minHeight: "100%",
                width: "100%",
                boxSizing: "border-box",
                padding: 32,
                background: t.background,
                color: t.textPrimary,
                fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div style={{ maxWidth: 640, width: "100%" }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
                    {title ?? explanation.title}
                </h1>

                <p style={{ color: t.textSecondary, lineHeight: 1.5, margin: "0 0 4px" }}>
                    {message ?? explanation.description}
                </p>

                {!message && (
                    <p style={{ color: t.textSecondary, lineHeight: 1.5, margin: "0 0 20px" }}>
                        {explanation.suggestion}
                    </p>
                )}

                {showDetails && (
                    <div
                        style={{
                            background: t.codeBackground,
                            border: `1px solid ${t.border}`,
                            borderRadius: 8,
                            padding: 14,
                            marginBottom: 20,
                            maxHeight: 260,
                            overflow: "auto",
                        }}
                    >
                        <div
                            style={{
                                color: t.codeText,
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                fontSize: 13,
                                fontWeight: 600,
                                marginBottom: 8,
                            }}
                        >
                            {error.name}: {error.message}
                        </div>
                        <pre
                            style={{
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                fontSize: 12,
                                color: t.textSecondary,
                            }}
                        >
                            {error.stack}
                            {errorInfo?.componentStack ?? ""}
                        </pre>
                    </div>
                )}

                {!hideActions && (
                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            onClick={reset}
                            style={{
                                background: t.accent,
                                color: t.accentText,
                                border: "none",
                                borderRadius: 8,
                                padding: "10px 18px",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Try Again
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: "transparent",
                                color: t.textPrimary,
                                border: `1px solid ${t.border}`,
                                borderRadius: 8,
                                padding: "10px 18px",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
