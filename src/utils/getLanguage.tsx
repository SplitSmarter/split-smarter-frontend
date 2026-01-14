import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import {LanguageTag} from "@/src/types/language";
import {LANGUAGE_KEY, fallbackLang, resources} from "@/src/constants/language";

export const GetLanguage = async () => {
    let savedLanguage = (await AsyncStorage.getItem(LANGUAGE_KEY)) as LanguageTag | null;
    const systemLocale = Localization.locale?.split('-')[0];

    let language: LanguageTag = fallbackLang;

    if (savedLanguage && resources[savedLanguage as LanguageTag]) {
        language = savedLanguage as LanguageTag;
    } else if (resources[systemLocale as LanguageTag]) {
        language = systemLocale as LanguageTag;
    }
    return language;
}
