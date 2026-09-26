import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Resolves CSS variable syntax or returns fallback hex values for React Native's StyleSheet.
 */
export const resolveCssVar = (
    cssVar: string,
    fallback: string
): string => {
    // If you are using NativeWind v4 with CSS variables on web/native
    if (typeof document !== 'undefined') {
        const varName = cssVar.replace(/^var\(--?/, '').replace(/\)$/, '');
        const val = getComputedStyle(document.documentElement).getPropertyValue(`--${varName}`).trim();
        if (val) return val;
    }
    console.log("fallback style variable found");
    return fallback;
};