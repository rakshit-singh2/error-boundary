import type { BuiltInThemeName, Theme, ThemeInput } from "./types";

export const lightTheme: Theme = {
    name: "light",
    tokens: {
        background: "#ffffff",
        surface: "#f5f6f8",
        border: "#e2e5ea",
        textPrimary: "#14161a",
        textSecondary: "#5b616e",
        accent: "#2952e3",
        accentText: "#ffffff",
        danger: "#d92d20",
        codeBackground: "#f0f1f4",
        codeText: "#c0242f",
    },
};

export const darkTheme: Theme = {
    name: "dark",
    tokens: {
        background: "#111318",
        surface: "#1b1e26",
        border: "#2c303a",
        textPrimary: "#f2f3f5",
        textSecondary: "#a3a8b5",
        accent: "#5c7cfa",
        accentText: "#0b0d12",
        danger: "#ff6b6b",
        codeBackground: "#0b0d12",
        codeText: "#ff8787",
    },
};

export const pinkTheme: Theme = {
    name: "pink",
    tokens: {
        background: "#fff0f6",
        surface: "#ffe0ec",
        border: "#ffb8d9",
        textPrimary: "#5c1a34",
        textSecondary: "#94436a",
        accent: "#d6336c",
        accentText: "#ffffff",
        danger: "#c2255c",
        codeBackground: "#ffdeeb",
        codeText: "#a61e4d",
    },
};

export const redTheme: Theme = {
    name: "red",
    tokens: {
        background: "#fff5f5",
        surface: "#ffe3e3",
        border: "#ffa8a8",
        textPrimary: "#5c1414",
        textSecondary: "#943f3f",
        accent: "#e03131",
        accentText: "#ffffff",
        danger: "#c92a2a",
        codeBackground: "#ffe3e3",
        codeText: "#a61e1e",
    },
};

export const blueTheme: Theme = {
    name: "blue",
    tokens: {
        background: "#f0f6ff",
        surface: "#dbe9ff",
        border: "#a5c8ff",
        textPrimary: "#0b2c5c",
        textSecondary: "#3c5f91",
        accent: "#1c6fe0",
        accentText: "#ffffff",
        danger: "#d63939",
        codeBackground: "#dceaff",
        codeText: "#1454a8",
    },
};

export const builtInThemes: Record<BuiltInThemeName, Theme> = {
    light: lightTheme,
    dark: darkTheme,
    pink: pinkTheme,
    red: redTheme,
    blue: blueTheme,
};

/** Resolves a ThemeInput (name, full theme, or base+override) into a concrete Theme. */
export function resolveTheme(input: ThemeInput | undefined): Theme {
    if (!input) return lightTheme;

    if (typeof input === "string") {
        return builtInThemes[input] ?? lightTheme;
    }

    if ("base" in input) {
        const base = builtInThemes[input.base] ?? lightTheme;
        return {
            name: `${base.name}-custom`,
            tokens: { ...base.tokens, ...input.tokens },
        };
    }

    return input;
}
