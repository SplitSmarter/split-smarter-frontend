import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {LanguageTag} from "@/src/types/language";
import {resources, fallbackLang} from "@/src/constants/language";
import {GetLanguage} from "@/src/utils/getLanguage"

const setupI18n = async () => {
    try {
        let language: LanguageTag = await GetLanguage();

        await i18n.use(initReactI18next).init({
            compatibilityJSON: "v4",
            resources,
            lng: language,
            fallbackLng: fallbackLang,
            interpolation: {
                escapeValue: false,
            },
        });
    } catch (err) {
        console.error("[i18n] Initialization error ❌", err);
        throw err;
    }
};


export { i18n, setupI18n };
