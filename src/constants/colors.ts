// /src/constants/Colors.ts
export const COLORS = {
    // --- Light Theme ---
    light: {
        // --- Core Surfaces ---
        bg: {
            primary: '#F2F2F2',
            lighter: '#FFFFFF',
            darker: '#E0E0E0',
            canvas: '#FFFFFF',
            overlay: '#FFFFFF',
        },
        brand: {
            primary: '#2B8761',        // Main Green
            lighter: '#D4EDE1',        // Tinted Green surface
            darker: '#226C4E',         // Tap/Press interactive Green
        },

        // --- Text System ---
        text: {
            primary: '#2B2B2B',        // High contrast titles
            lighter: '#646464',        // Secondary descriptions
            darker: '#121212',         // Deep accent black
            placeholder: '#8C8C8C',
            contrast: '#FFFFFF',       // Clean readable white text on Green elements
            link: '#2B8761',
        },

        // --- Icon Scale ---
        icon: {
            primary: '#4D4D4D',        // Default UI Icons
            lighter: '#787878',        // Muted/Secondary decoration icons
            darker: '#1E1E1E',         // Structural headers or heavy glyphs
            brand: '#2B8761',          // Green themed status icons
        },

        // --- System Status ---
        status: {
            error: '#EF4444',
            success: '#289F32',
            decrease: '#D12E34',
            warning: '#B5AF98',
            border: '#E4E4E7',         // Standard form track limits
        }
    },

    dark: {
        // --- Core Surfaces ---
        bg: {
            primary: '#1A1A1A',
            lighter: '#1E1E1E',
            darker: '#121212',
            canvas: '#0C0C0C',
            overlay: '#1E1E1E',
        },
        brand: {
            primary: '#32966E',        // Neon-optimized legible Dark Mode Green
            lighter: '#1E372D',        // Dark deep forest backdrop
            darker: '#28785A',
        },

        // --- Text System ---
        text: {
            primary: '#EBEBEB',        // Bright readable white
            lighter: '#AAAAAA',        // Soft gray body text
            darker: '#FFFFFF',
            placeholder: '#6E6E6E',
            contrast: '#FFFFFF',       // Contrast on primary interactive frames
            link: '#4CB48C',
        },

        // --- Icon Scale ---
        icon: {
            primary: '#B4B4B4',        // Soft off-white icon base
            lighter: '#7C7C7C',        // Muted secondary icons
            darker: '#FFFFFF',         // Sharp maximum contrast accent glyphs
            brand: '#32966E',          // Vibrant mode matching green icon state
        },

        // --- System Status ---
        status: {
            error: '#F87171',          // Softer tone for reduced optical glare
            success: '#289F32',
            decrease: '#D12E34',
            warning: '#B5AF98',
            border: '#3F3F46',
        }
    },

    // --- Backwards Compatibility and Legacy Shortcuts ---
    icon_primary_light: '#4D4D4D',
    icon_primary_lighter_light: '#787878',
    icon_primary_darker_light: '#1E1E1E',
    icon_primary_dark: '#B4B4B4',
    icon_primary_lighter_dark: '#DCscale',
    icon_primary_darker_dark: '#828282',

    icon_secondary_light: '#2B8761',
    icon_secondary_lighter_light: '#559F81',
    icon_secondary_darker_light: '#226C4E',
    icon_secondary_dark: '#32966E',
    icon_secondary_lighter_dark: '#64B496',
    icon_secondary_darker_dark: '#28785A',

    golden: '#B5AF98',
    color_red_decrease: '#D12E34',
    bg_primary_dark: '#1A1A1A'
};