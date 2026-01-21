import React, { useState } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useThemeStore } from "@/src/store/useThemeStore";
import CustomText from "@/src/components/common/CustomText";
import { Ionicons } from "@expo/vector-icons";

export const ImageUploadScreen = () => {
    const { t } = useTranslation();
    const { theme } = useThemeStore();
    const isDark = theme === "dark";

    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pickImage = async () => {
        setError(null);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                setImage(uri);
                // Here you can trigger upload logic if needed
                // await uploadImage(uri);
            }
        } catch (err: any) {
            setError(err.message || "Failed to pick image.");
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            setUploading(true);
            setError(null);

            // Create form data
            const formData = new FormData();
            formData.append("file", {
                uri,
                name: "upload.jpg",
                type: "image/jpeg",
            } as any);

            // Replace with your actual upload API endpoint
            // const response = await axiosUserInstance.post("/upload", formData, {
            //     headers: {
            //         "Content-Type": "multipart/form-data",
            //     },
            // });

            // Handle success
        } catch (err: any) {
            setError(err.message || "Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <View className={`flex-1 items-center justify-center px-6 ${isDark ? "bg-black" : "bg-white"}`}>
            <TouchableOpacity
                onPress={pickImage}
                className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mb-4"
            >
                {image ? (
                    <Image
                        source={{ uri: image }}
                        className="w-32 h-32 rounded-full"
                        resizeMode="cover"
                    />
                ) : (
                    <Ionicons
                        name="image-outline"
                        size={40}
                        color={isDark ? "white" : "gray"}
                    />
                )}
            </TouchableOpacity>

            {uploading && <ActivityIndicator size="small" />}

            <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                {t("Tap to select an image")}
            </CustomText>

            {error && (
                <CustomText className="text-red-500 text-center mt-2">
                    {error}
                </CustomText>
            )}
        </View>
    );
};

export default ImageUploadScreen;
