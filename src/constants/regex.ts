// src/utils/validation/regex.ts

export const RegexPattern = {
    NAME: /^[\p{L}\p{M}\p{Zs}'’\-.]{2,100}$/u,
    USERNAME: /^[A-Za-z0-9_]{3,30}$/,
    EMAIL: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
    // 1 Unicode Letter, 1 Number, 8-64 chars
    PASSWORD: /^(?=.*[\p{L}])(?=.*[\p{N}]).{8,64}$/u,
    COUNTRY: /^[A-Z]{2}$/,
    CURRENCY: /^[A-Z]{3}$/,
    LANGUAGE: /^[a-z]{2}$/,
};