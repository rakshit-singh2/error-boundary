import type { ErrorExplanation } from "./types";

interface Rule {
    category: ErrorExplanation["category"];
    test: (error: Error) => boolean;
    title: string;
    description: string;
    suggestion: string;
    recoverable: boolean;
}

const rules: Rule[] = [
    {
        category: "chunk-load",
        test: (e) =>
            /ChunkLoadError/i.test(e.name) ||
            /Loading chunk [\d\w]+ failed/i.test(e.message) ||
            /Importing a module script failed/i.test(e.message),
        title: "A part of the app failed to load",
        description:
            "The app tried to lazy-load a piece of code (a route or component) but the request failed, usually because a new version was deployed while the page was open and the old bundle file is gone.",
        suggestion:
            "Reload the page to fetch the latest bundle. If it keeps happening, check your CDN/cache-busting setup for build assets.",
        recoverable: true,
    },
    {
        category: "network",
        test: (e) =>
            /NetworkError|Failed to fetch|network request failed/i.test(
                e.message
            ),
        title: "A network request failed",
        description:
            "A fetch/XHR call could not reach the server — this is usually a connectivity issue, a CORS misconfiguration, or the API being down.",
        suggestion:
            "Check connectivity and the API's availability/CORS headers. Consider showing a retry action instead of a hard crash.",
        recoverable: true,
    },
    {
        category: "react-render",
        test: (e) =>
            /Objects are not valid as a React child/i.test(e.message),
        title: "Tried to render a raw object",
        description:
            "Somewhere JSX is rendering a plain object, array, or promise directly instead of a string/number/element — React doesn't know how to display it.",
        suggestion:
            "Find the offending {value} in JSX and render value.someField, JSON.stringify(value), or a proper component instead.",
        recoverable: false,
    },
    {
        category: "react-render",
        test: (e) => /Maximum update depth exceeded/i.test(e.message),
        title: "Infinite re-render loop",
        description:
            "A setState call is running unconditionally during render or inside an effect with no proper dependency guard, causing React to re-render forever.",
        suggestion:
            "Check useEffect dependency arrays and any setState calls made directly in the render body.",
        recoverable: false,
    },
    {
        category: "react-hook",
        test: (e) =>
            /Invalid hook call|Rendered (more|fewer) hooks than during the previous render/i.test(
                e.message
            ),
        title: "Hooks were used incorrectly",
        description:
            "A hook was called conditionally, inside a loop, after an early return, or from outside a React function component — hooks must run in the same order on every render.",
        suggestion:
            "Move the hook call to the top level of the component/custom hook, unconditionally.",
        recoverable: false,
    },
    {
        category: "native-module",
        test: (e) =>
            /native module .* cannot be null|requireNativeComponent|TurboModuleRegistry/i.test(
                e.message
            ),
        title: "A native module is missing",
        description:
            "The JS side tried to call into a native module that isn't linked or registered — common after adding a native dependency without rebuilding the app, or running in Expo Go with a module that needs a custom dev client.",
        suggestion:
            "Rebuild the native app (pod install / gradle sync), or switch to an EAS/custom dev client if the library needs native code Expo Go doesn't include.",
        recoverable: false,
    },
    {
        category: "permission",
        test: (e) => /permission denied|not authorized/i.test(e.message),
        title: "A permission was denied",
        description:
            "The app tried to access a resource (camera, storage, location, an API) it doesn't have permission for.",
        suggestion:
            "Verify the permission was requested and granted before use, and check platform-specific manifest/entitlement entries.",
        recoverable: true,
    },
    {
        category: "type-error",
        test: (e) => e.name === "TypeError",
        title: "Something was undefined or the wrong type",
        description:
            "Code tried to read a property, call a function, or use a value that turned out to be undefined/null or not the type expected — e.g. `Cannot read properties of undefined`.",
        suggestion:
            "Trace the value in the error message back to where it's set; add a null/undefined check or fix the data shape feeding this component.",
        recoverable: false,
    },
    {
        category: "reference-error",
        test: (e) => e.name === "ReferenceError",
        title: "A variable or import doesn't exist",
        description:
            "Code referenced a variable, function, or import that was never defined in this scope — often a typo or a missing import.",
        suggestion: "Check the exact name in the error message for typos and confirm it's imported/declared.",
        recoverable: false,
    },
    {
        category: "range-error",
        test: (e) => e.name === "RangeError",
        title: "A value was out of the allowed range",
        description:
            "Something like an invalid array length, a number formatting call, or recursion exceeded a valid range (e.g. `Maximum call stack size exceeded`).",
        suggestion:
            "If it mentions call stack size, look for unbounded/self-referencing recursion. Otherwise check the numeric argument in the error message.",
        recoverable: false,
    },
    {
        category: "syntax-error",
        test: (e) => e.name === "SyntaxError",
        title: "Invalid syntax was evaluated",
        description:
            "Usually thrown by JSON.parse on malformed data, or a dynamically evaluated string that isn't valid JS.",
        suggestion:
            "Log the raw string being parsed/evaluated — it almost certainly isn't what the code expects.",
        recoverable: true,
    },
];

const fallback: ErrorExplanation = {
    category: "unknown",
    title: "An unexpected error occurred",
    description:
        "The app hit an error that doesn't match a known pattern. Details are in the stack trace below.",
    suggestion:
        "Check the message and component stack below, and report it if it's reproducible.",
    recoverable: true,
};

/** Turns a raw Error into a categorized, human-readable explanation for display and logging. */
export function explainError(error: Error | null | undefined): ErrorExplanation {
    if (!error) return fallback;

    for (const rule of rules) {
        try {
            if (rule.test(error)) {
                return {
                    category: rule.category,
                    title: rule.title,
                    description: rule.description,
                    suggestion: rule.suggestion,
                    recoverable: rule.recoverable,
                };
            }
        } catch {
            // A malformed error object shouldn't crash the explainer itself.
        }
    }

    return fallback;
}
