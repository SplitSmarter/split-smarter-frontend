// /src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources, fallbackLang, LANGUAGE_KEY } from "@/src/constants/language";
import AsyncStorage from "@react-native-async-storage/async-storage";

i18n.use(initReactI18next);

const setupI18n = async () => {
    if (i18n.isInitialized) return;
    try {

        const rawValue = await AsyncStorage.getItem(LANGUAGE_KEY);
        let resolvedLanguage = fallbackLang;

        if (rawValue) {
            try {
                // 1. Attempt to parse as Zustand JSON object
                const parsed = JSON.parse(rawValue);

                // Zustand stores data inside a 'state' key
                if (parsed?.state?.language) {
                    resolvedLanguage = parsed.state.language;
                } else {
                    // It was valid JSON, but not the expected Zustand structure
                    resolvedLanguage = parsed;
                }
            } catch (e) {
                // 2. If parsing fails, it's a legacy plain string (e.g., "en")
                // Or unquoted text. We use it as-is.
                resolvedLanguage = rawValue as any;
            }
        }

        await i18n.use(initReactI18next).init({
            compatibilityJSON: "v4",
            resources,
            lng: resolvedLanguage,
            fallbackLng: fallbackLang,
            interpolation: {
                escapeValue: false,
            },
        });
    } catch (err) {
        // Fallback to default if everything fails to prevent app from getting stuck
        console.error("[i18n] Initialization error ❌", err);
        await i18n.use(initReactI18next).init({
            compatibilityJSON: "v4",
            resources,
            lng: fallbackLang,
            fallbackLng: fallbackLang,
        });
    }
};

export { i18n, setupI18n };
