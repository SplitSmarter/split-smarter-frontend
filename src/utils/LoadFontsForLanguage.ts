import * as Font from "expo-font";
import * as FileSystem from "expo-file-system";
import { fontMap } from "@/src/constants/language";
import { LanguageTag } from "@/src/types/language";
import {Platform} from "react-native";

// /src/utils/loadFontsForLanguage.ts
export const loadFontsForLanguage = async (lang: LanguageTag) => {
    const fonts = fontMap[lang] || fontMap.default;

    if (Platform.OS === "web") {
        return { primary: fonts.primary.name, secondary: fonts.secondary.name };
    }

    const loadFont = async ({ name, url }: { name: string; url: string }) => {
        try {
            const fontFile = `${FileSystem.documentDirectory}${name}.ttf`; // Use documentDirectory for permanence
            const fileInfo = await FileSystem.getInfoAsync(fontFile);

            if (!fileInfo.exists) {
                await FileSystem.downloadAsync(url, fontFile);
            }

            await Font.loadAsync({ [name]: fontFile });
        } catch (e) {
            console.error(`Font ${name} failed to load, falling back to System`, e);
        }
    };

    await Promise.all([
        loadFont(fonts.primary),
        loadFont(fonts.secondary),
    ]);

    return { primary: fonts.primary.name, secondary: fonts.secondary.name };
};
