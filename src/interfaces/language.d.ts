import {LanguageTag} from "@/src/types/language";

export interface I18nContextProps {
    language: LanguageTag;
    changeLanguage: (lng: LanguageTag) => Promise<void>;
    isLoaded: boolean;
    font: FontSet
}

export interface FontSet {
    primary: string;
    secondary: string;
}
