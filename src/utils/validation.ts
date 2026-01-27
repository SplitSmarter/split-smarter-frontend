// src/utils/validation/validator.ts
import { RegexPattern } from "@/src/constants/regex";
import { ValidationResult } from "@/src/types/validation";

/**
 * Enhanced password validation for specific feedback
 */
export const validatePassword = (input: string): ValidationResult => {
    const normalized = (input || "").normalize("NFKC");

    // 1. Required Check
    if (!normalized) {
        return { isValid: false, error: "common.error.required" };
    }

    // 2. Length Checks
    if (normalized.length < 8) {
        return { isValid: false, error: "common.error.length.too_short" };
    }
    if (normalized.length > 64) {
        return { isValid: false, error: "common.error.length.too_long" };
    }

    // 3. Complexity Checks (Matches Java: 1 Letter, 1 Number)
    const hasLetter = /[\p{L}]/u.test(normalized);
    const hasNumber = /[\p{N}]/u.test(normalized);

    if (!hasLetter) {
        return { isValid: false, error: "common.error.password.missing_letter" };
    }
    if (!hasNumber) {
        return { isValid: false, error: "common.error.password.missing_number" };
    }

    // Final catch-all for the primary Regex
    if (!RegexPattern.PASSWORD.test(normalized)) {
        return { isValid: false, error: "common.error.invalid_format" };
    }

    return { isValid: true, error: null };
};

/**
 * Identifier validation (Email or Username)
 */
export const validateIdentifier = (input: string): ValidationResult => {
    const normalized = (input || "").normalize("NFC").trim();

    if (!normalized) {
        return { isValid: false, error: "common.error.required" };
    }

    const isEmail = RegexPattern.EMAIL.test(normalized);
    const isUser = RegexPattern.USERNAME.test(normalized);

    if (!isEmail && !isUser) {
        // If it looks like an email (contains @) but failed regex
        if (normalized.includes("@")) {
            return { isValid: false, error: "common.error.email.invalid" };
        }

        // Otherwise, treat as username attempt
        if (normalized.length < 3) return { isValid: false, error: "common.error.username.too_short" };
        if (normalized.length > 30) return { isValid: false, error: "common.error.username.too_long" };
        return { isValid: false, error: "common.error.username.invalid_characters" };
    }

    return { isValid: true, error: null };
};

/**
 * Name validation
 */
export const validateName = (input: string): ValidationResult => {
    const normalized = (input || "").normalize("NFC").trim();

    if (!normalized) {
        return { isValid: false, error: "common.error.required" };
    }

    if (normalized.length < 2) return { isValid: false, error: "common.error.name.too_short" };
    if (normalized.length > 100) return { isValid: false, error: "common.error.name.too_long" };

    if (!RegexPattern.NAME.test(normalized)) {
        return { isValid: false, error: "common.error.name.invalid_characters" };
    }

    return { isValid: true, error: null };
};

export const validateEmail = (input: string): ValidationResult => {
    const normalized = (input || "").normalize("NFC").trim();

    // 1. Required Check
    if (!normalized) {
        return { isValid: false, error: "common.error.field.email.empty" };
    }

    // 2. Format Check using your Regex constants
    if (!RegexPattern.EMAIL.test(normalized)) {
        return { isValid: false, error: "common.error.email.invalid" };
    }

    // 3. Optional: Basic Length Check (Standard email max length is 254)
    if (normalized.length > 254) {
        return { isValid: false, error: "common.error.length.too_long" };
    }

    return { isValid: true, error: null };
};