// /src/constants/Colors.ts — Full Platinum (synced with app/global.css)

/** Metallic slate header chrome (always dark) — not brand.primary (CTA fill flips in dark). */
export const PLATINUM_HEADER = {
    light: '#1E293B',
    mid: '#334155',
    dark: '#0F172A',
} as const;

export const COLORS = {
    // --- Light Theme ---
    light: {
        // --- Core Surfaces ---
        bg: {
            primary: '#F1F4F8',
            lighter: '#FFFFFF',
            darker: '#E2E8F0',
            canvas: '#FFFFFF',
            overlay: '#FFFFFF',
        },
        // Primary CTA = inverted slate (not emerald)
        brand: {
            primary: '#0F172A',
            lighter: '#D1FAE5',        // Emerald success tint (status only)
            darker: '#1E293B',         // Pressed CTA
        },

        // --- Text System ---
        text: {
            primary: '#0F172A',
            lighter: '#64748B',
            darker: '#020617',
            placeholder: '#94A3B8',
            contrast: '#FFFFFF',       // Label / icon on dark CTA
            link: '#0284C7',
        },

        // --- Icon Scale ---
        icon: {
            primary: '#475569',
            lighter: '#94A3B8',
            darker: '#1E293B',
            brand: '#10B981',          // Emerald success icons on neutral surfaces
        },

        // --- Interactive Accent ---
        accent: {
            sky: '#0284C7',
            skyBg: '#E0F2FE',
            orbIndigo: '#6366F1',
            violet: '#A855F7',
            teal: '#14B8A6',
        },

        // --- System Status ---
        status: {
            error: '#EF4444',
            success: '#10B981',
            decrease: '#EF4444',
            warning: '#D97706',
            border: '#CBD5E1',
        },
    },

    dark: {
        // --- Core Surfaces ---
        bg: {
            primary: '#07090E',
            lighter: '#1E293B',
            darker: '#0B0F17',
            canvas: '#0F172A',
            overlay: '#1E293B',
        },
        // Primary CTA = light platinum fill
        brand: {
            primary: '#F8FAFC',
            lighter: '#064E3B',        // Deep emerald success tint
            darker: '#E2E8F0',         // Pressed CTA
        },

        // --- Text System ---
        text: {
            primary: '#F8FAFC',
            lighter: '#94A3B8',
            darker: '#FFFFFF',
            placeholder: '#64748B',
            contrast: '#0F172A',       // Label / icon on light CTA
            link: '#38BDF8',
        },

        // --- Icon Scale ---
        icon: {
            primary: '#94A3B8',
            lighter: '#CBD5E1',
            darker: '#64748B',
            brand: '#10B981',
        },

        // --- Interactive Accent ---
        accent: {
            sky: '#38BDF8',
            skyBg: '#0C4A6E',
            orbIndigo: '#6366F1',
            violet: '#A855F7',
            teal: '#14B8A6',
        },

        // --- System Status ---
        status: {
            error: '#F87171',
            success: '#10B981',
            decrease: '#EF4444',
            warning: '#D97706',
            border: '#334155',
        },
    },

    // --- Backwards Compatibility and Legacy Shortcuts ---
    icon_primary_light: '#475569',
    icon_primary_lighter_light: '#94A3B8',
    icon_primary_darker_light: '#1E293B',
    icon_primary_dark: '#94A3B8',
    icon_primary_lighter_dark: '#CBD5E1',
    icon_primary_darker_dark: '#64748B',

    icon_secondary_light: '#10B981',
    icon_secondary_lighter_light: '#34D399',
    icon_secondary_darker_light: '#059669',
    icon_secondary_dark: '#10B981',
    icon_secondary_lighter_dark: '#34D399',
    icon_secondary_darker_dark: '#059669',

    golden: '#D97706',
    color_red_decrease: '#EF4444',
    bg_primary_dark: '#07090E'
};
