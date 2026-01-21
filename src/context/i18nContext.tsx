import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import i18n from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetLanguage } from "@/src/utils/getLanguage";
import { LanguageTag } from "@/src/types/language";
import { LANGUAGE_KEY, fallbackLang } from "@/src/constants/language";
import { I18nContextProps } from "@/src/interfaces/language";
import { loadFontsForLanguage } from "@/src/utils/LoadFontsForLanguage";

const I18nContext = createContext<I18nContextProps>({
    language: fallbackLang,
    changeLanguage: async () => {},
    isLoaded: false,
    font: {
        primary: "System",
        secondary: "System",
    },
});

interface Props {
    children: ReactNode;
}

export const I18nProvider: React.FC<Props> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageTag>(fallbackLang);
    const [isLoaded, setIsLoaded] = useState(false);
    const [font, setFont] = useState({ primary: "System", secondary: "System" });

    useEffect(() => {
        const init = async () => {
            const savedLanguage = await GetLanguage();
            setLanguage(savedLanguage);
            const loadedFonts = await loadFontsForLanguage(savedLanguage);
            setFont(loadedFonts);
            setIsLoaded(true);
        };
        init();
    }, []);

    const changeLanguage = async (lng: LanguageTag) => {
        try {
            await i18n.changeLanguage(lng);
            await AsyncStorage.setItem(LANGUAGE_KEY, lng);
            setLanguage(lng);

            const loadedFonts = await loadFontsForLanguage(lng);
            setFont(loadedFonts);
        } catch (error) {
            console.error("Failed to change language:", error);
        }
    };

    return (
        <I18nContext.Provider value={{ language, changeLanguage, isLoaded, font }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18nStore = () => useContext(I18nContext);
