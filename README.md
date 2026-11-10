# Universal Error Boundary

A themeable, explainable error boundary for React and React Native, shipped as three packages:

- **`@universal-error-boundary/core`** — themes, the error-explanation engine, and shared types. Not usually installed directly.
- **`@universal-error-boundary/react`** — the boundary component for React (web).
- **`@universal-error-boundary/react-native`** — the boundary component for React Native / Expo, plus a global JS-error hook.

Both platform packages are built as ESM + CJS with `.d.ts` files, so they work equally from a TypeScript project or a plain JavaScript one — no TS toolchain required to consume them.

## Install

```bash
# React (web)
npm install @universal-error-boundary/react

# React Native
npm install @universal-error-boundary/react-native
```

`core` is pulled in automatically as a dependency of whichever platform package you install.

## Quick start — React

```jsx
import { ErrorBoundary } from "@universal-error-boundary/react";

function App() {
    return (
        <ErrorBoundary
            theme="dark"
            onError={(error, errorInfo) => {
                // send to your own backend, Sentry, LogRocket, whatever you use
                reportToAdmin({ message: error.message, stack: error.stack, componentStack: errorInfo.componentStack });
            }}
        >
            <YourApp />
        </ErrorBoundary>
    );
}
```

Plain JavaScript works exactly the same way — the package ships compiled JS + types, TypeScript is optional on the consuming side.

## Quick start — React Native

```jsx
import { ErrorBoundary, setupGlobalErrorHandler } from "@universal-error-boundary/react-native";

// optional: also catch JS-thread errors that happen outside of render
// (event handlers, timers) — error boundaries alone only catch render errors.
setupGlobalErrorHandler((error, errorInfo) => {
    reportToAdmin(error, errorInfo);
});

export default function App() {
    return (
        <ErrorBoundary theme="pink" onError={reportToAdmin}>
            <RootNavigator />
        </ErrorBoundary>
    );
}
```

## Themes

Five built-in themes: `"light"`, `"dark"`, `"pink"`, `"red"`, `"blue"`.

```jsx
<ErrorBoundary theme="blue">...</ErrorBoundary>
```

### Override a few tokens on top of a built-in theme

```jsx
<ErrorBoundary theme={{ base: "dark", tokens: { accent: "#ff2d78" } }}>
    ...
</ErrorBoundary>
```

### Fully custom theme

```jsx
import { ErrorBoundary } from "@universal-error-boundary/react";

const brandTheme = {
    name: "brand",
    tokens: {
        background: "#0e0e12",
        surface: "#1a1a22",
        border: "#2a2a35",
        textPrimary: "#f5f5f7",
        textSecondary: "#9a9aa5",
        accent: "#7c5cff",
        accentText: "#ffffff",
        danger: "#ff5c7c",
        codeBackground: "#000000",
        codeText: "#7cffb2",
    },
};

<ErrorBoundary theme={brandTheme}>...</ErrorBoundary>;
```

Every token (`background`, `surface`, `border`, `textPrimary`, `textSecondary`, `accent`, `accentText`, `danger`, `codeBackground`, `codeText`) is under the installer's control — nothing is hardcoded.

## Fully custom fallback UI

Replace the default UI entirely, with access to the error, the auto-generated explanation, the resolved theme, and a `reset()` function:

```jsx
<ErrorBoundary
    fallback={({ error, explanation, theme, reset }) => (
        <MyCustomScreen
            title={explanation.title}
            detail={explanation.description}
            color={theme.tokens.accent}
            onRetry={reset}
        />
    )}
>
    <YourApp />
</ErrorBoundary>
```

## Automatic error explanations

Every caught error is run through `explainError()`, which recognizes common categories — chunk-load failures, network errors, bad hook usage, infinite render loops, missing native modules, `TypeError`/`ReferenceError`/`RangeError`/`SyntaxError`, permission errors — and produces a human-readable title, description, and actionable suggestion, with a sensible generic fallback for anything unrecognized. You can call it yourself too:

```js
import { explainError } from "@universal-error-boundary/react"; // or /react-native

const explanation = explainError(someError);
// { category, title, description, suggestion, recoverable }
```

Or override the boundary's own copy directly:

```jsx
<ErrorBoundary title="Oops!" message="Please try again in a moment.">
```

## Reporting to your own admin/monitoring system

`onError` is called with `(error, errorInfo)` on every catch — plug in anything:

```jsx
<ErrorBoundary
    onError={(error, errorInfo) => {
        fetch("/api/errors", {
            method: "POST",
            body: JSON.stringify({ message: error.message, stack: error.stack }),
        });
    }}
>
```

## Other props

| Prop | Type | Description |
|---|---|---|
| `theme` | `ThemeName \| Theme \| { base, tokens }` | See Themes above. Default `"light"`. |
| `title` / `message` | `string` | Override the auto-explained copy. |
| `fallback` | `ReactNode \| (props) => ReactNode` | Fully replace the default UI. |
| `onError` | `(error, errorInfo) => void` | Fires on every catch. |
| `onReset` | `() => void` | Fires after the boundary resets. |
| `resetKeys` | `unknown[]` | Boundary auto-resets when any value changes (e.g. `[location.pathname]`). |
| `showDetails` | `boolean` | Show the raw stack trace. Defaults to dev-mode only. |
| `hideActions` | `boolean` | Hide the built-in "Try Again"/"Reload" buttons. |

## What error boundaries do and don't catch

Both packages only catch errors thrown during **render**, in lifecycle methods, and in constructors — this is a React limitation, not specific to this library. They do **not** catch errors in event handlers, async callbacks, or (on React Native) true native/bridge crashes. On React Native, pair `<ErrorBoundary>` with `setupGlobalErrorHandler()` for JS-thread errors outside render, and a native crash reporter (Sentry, Crashlytics) for native crashes.

## Development

```bash
npm install
npm run build       # builds core, react, react-native
npm run typecheck
```
