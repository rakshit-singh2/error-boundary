/** Color tokens every theme must supply. Consumers can override any subset via a custom theme. */
export interface ThemeTokens {
    background: string;
    surface: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentText: string;
    danger: string;
    codeBackground: string;
    codeText: string;
}

export interface Theme {
    name: string;
    tokens: ThemeTokens;
}

/** Names of the themes bundled with the package. */
export type BuiltInThemeName = "light" | "dark" | "pink" | "red" | "blue";

/** A theme prop accepts a bundled theme name, a full custom Theme, or a partial token override merged onto a base theme. */
export type ThemeInput =
    | BuiltInThemeName
    | Theme
    | { base: BuiltInThemeName; tokens: Partial<ThemeTokens> };

export type ErrorCategory =
    | "network"
    | "chunk-load"
    | "type-error"
    | "reference-error"
    | "range-error"
    | "syntax-error"
    | "react-render"
    | "react-hook"
    | "native-module"
    | "permission"
    | "unknown";

export interface ErrorExplanation {
    category: ErrorCategory;
    title: string;
    /** Plain-language description of what likely happened. */
    description: string;
    /** A concrete, actionable suggestion for the developer or user. */
    suggestion: string;
    /** Whether this class of error is usually recoverable via a retry/reset. */
    recoverable: boolean;
}

/** Minimal shape shared by React's ErrorInfo and the info React Native error boundaries receive. */
export interface UebErrorInfo {
    componentStack?: string | null;
    isFatal?: boolean;
}

export type UebOnError = (error: Error, errorInfo: UebErrorInfo) => void;
