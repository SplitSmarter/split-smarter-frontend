import * as FileSystem from "expo-file-system";
import { IconIdentifierType, icons, color_icons, black_icons } from "@/src/constants/icons";

export const getIcon = async (
    identifier: IconIdentifierType,
    name: string,
    url?: string
): Promise<import("react-native").ImageSourcePropType | null> => {
    const type = identifier.toLowerCase();

    // Step 1: Static imports (return as ImageSourcePropType)
    if (type === IconIdentifierType.COLOR && color_icons[name as keyof typeof color_icons]) {
        return color_icons[name as keyof typeof color_icons];
    }

    if (type === IconIdentifierType.BLACK && black_icons[name as keyof typeof black_icons]) {
        return black_icons[name as keyof typeof black_icons];
    }

    if (icons[name as keyof typeof icons]) {
        return icons[name as keyof typeof icons];
    }

    // Step 2: Local file path check
    const dirUri = `${FileSystem.documentDirectory}icons/${type}`;
    const fileUri = `${dirUri}/${name}.png`;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
        return { uri: fileUri };
    }

    // Step 3: Download from URL
    if (url) {
        try {
            const dirInfo = await FileSystem.getInfoAsync(dirUri);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
            }

            const downloadRes = await FileSystem.downloadAsync(url, fileUri);
            return { uri: downloadRes.uri };
        } catch (error) {
            console.error("Failed to download icon:", error);
            return null;
        }
    }

    // Step 4: Optional fallback
    const fallbackUri = `${FileSystem.documentDirectory}fallback.png`;
    const fallbackInfo = await FileSystem.getInfoAsync(fallbackUri);
    if (fallbackInfo.exists) {
        return { uri: fallbackUri };
    }

    return null;
};
