import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
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
    /** Show the raw error message + stack trace in the fallback UI. Defaults to __DEV__. */
    showDetails?: boolean;
    /** Hide the built-in "Try Again" action button. */
    hideActions?: boolean;
}

interface ErrorBoundaryState {
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

declare const __DEV__: boolean | undefined;
const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;

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
        <View style={[styles.container, { backgroundColor: t.background }]}>
            <Text style={[styles.title, { color: t.textPrimary }]}>
                {title ?? explanation.title}
            </Text>

            <Text style={[styles.subtitle, { color: t.textSecondary }]}>
                {message ?? explanation.description}
            </Text>

            {!message && (
                <Text style={[styles.subtitle, { color: t.textSecondary }]}>
                    {explanation.suggestion}
                </Text>
            )}

            {showDetails && (
                <ScrollView
                    style={[
                        styles.errorBox,
                        { backgroundColor: t.codeBackground, borderColor: t.border },
                    ]}
                >
                    <Text style={[styles.errorText, { color: t.codeText }]}>
                        {error.name}: {error.message}
                    </Text>
                    <Text style={[styles.stackText, { color: t.textSecondary }]}>
                        {error.stack}
                        {errorInfo?.componentStack ?? ""}
                    </Text>
                </ScrollView>
            )}

            {!hideActions && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: t.accent }]}
                    onPress={reset}
                    accessibilityRole="button"
                >
                    <Text style={[styles.buttonText, { color: t.accentText }]}>
                        Try Again
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 8,
        lineHeight: 20,
    },
    errorBox: {
        maxHeight: 220,
        width: "100%",
        padding: 12,
        marginTop: 12,
        marginBottom: 20,
        borderRadius: 8,
        borderWidth: 1,
    },
    errorText: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 8,
    },
    stackText: {
        fontSize: 11,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 15,
    },
});
