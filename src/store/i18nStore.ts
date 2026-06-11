// /src/store/i18nStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { LanguageTag } from "@/src/types/language";
import { LANGUAGE_KEY, fallbackLang } from "@/src/constants/language";
import { loadFontsForLanguage } from "@/src/utils/LoadFontsForLanguage";

interface I18nState {
    language: LanguageTag;
    isLoaded: boolean;
    font: {
        primary: string;
        secondary: string;
    };
    initI18n: () => Promise<void>;
    changeLanguage: (lng: LanguageTag) => Promise<void>;
}

export const i18nStore = create<I18nState>()(
    persist(
        (set, get) => ({
            language: fallbackLang,
            isLoaded: false,
            font: { primary: "System", secondary: "System" },

            initI18n: async () => {
                const currentLang = get().language;
                // Ensure i18next is synced with persisted language
                await i18n.changeLanguage(currentLang);
                const loadedFonts = await loadFontsForLanguage(currentLang);

                set({
                    font: loadedFonts,
                    isLoaded: true
                });
            },

            changeLanguage: async (lng) => {
                try {
                    await i18n.changeLanguage(lng);
                    const loadedFonts = await loadFontsForLanguage(lng);
                    set({
                        language: lng,
                        font: loadedFonts
                    });
                } catch (error) {
                    console.error("Failed to change language:", error);
                }
            },
        }),
        {
            name: LANGUAGE_KEY,
            storage: createJSONStorage(() => AsyncStorage),
            // We only want to persist the language tag, not the loading states
            partialize: (state) => ({ language: state.language }),
        }
    )
);
