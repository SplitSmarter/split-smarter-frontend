import translationEn from "@/src/i18n/locales/en/translation.json";
import translationFr from "@/src/i18n/locales/fr/translation.json";
import translationHi from "@/src/i18n/locales/hi/translation.json";
import translationG from "@/src/i18n/locales/g/translation.json";
import {LanguageTag, FontConfig} from "@/src/types/language";


export const resources = {
    "en": { translation: translationEn },
    "hi": { translation: translationHi },
    "fr": { translation: translationFr },
    "g": { translation: translationG },
};

export const LANGUAGE_KEY: string = "language";
export const fallbackLang: LanguageTag = "en";

export const fontMap: Record<LanguageTag | "default", FontConfig> = {
    en: {
        primary: {
            name: "Poppins",
            url: "https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrJJfedw.ttf",
        },
        secondary: {
            name: "Roboto",
            url: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf",
        },
    },
    hi: {
        primary: {
            name: "NotoSansDevanagari",
            url: "https://fonts.gstatic.com/s/notosansdevanagari/v18/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.woff2",
        },
        secondary: {
            name: "TiroDevanagariHindi",
            url: "https://fonts.gstatic.com/s/tirodevanagarihindi/v4/f0Xt0etJH4fBwf5dRj5ebueMnKg.woff2",
        },
    },
    fr: {
        primary: {
            name: "Poppins",
            url: "https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrJJfedw.ttf",
        },
        secondary: {
            name: "Roboto",
            url: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf",
        },
    },
    g: {
        primary: {
            name: "Poppins",
            url: "https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrJJfedw.ttf",
        },
        secondary: {
            name: "Roboto",
            url: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf",
        },
    },
    default: {
        primary: {
            name: "Poppins",
            url: "https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrJJfedw.ttf",
        },
        secondary: {
            name: "Roboto",
            url: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf",
        },
    },
};


export interface LanguageInfo {
    tag: LanguageTag;
    countryName: string;
    countryCode: string; // Used to match: images.flags[countryCode]
}

export const languages: Record<string, LanguageInfo> = {
    "English": { tag: "en", countryName: "United States", countryCode: "US" },
    "Hindi": { tag: "hi", countryName: "India", countryCode: "IN" },
    "French": { tag: "fr", countryName: "France", countryCode: "FR" },
    "Germany": { tag: "g", countryName: "Germany", countryCode: "DE" },
};