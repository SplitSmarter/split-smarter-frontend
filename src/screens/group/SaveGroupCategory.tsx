import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAlert } from "@/src/context/alertContext";
import { saveGroupCategoryApi } from "@/src/api/group/categories";
import { SaveGroupCategoryRequest } from "@/src/interfaces/group";
import CustomText from "@/src/components/common/CustomText";

const SaveGroupCategory = () => {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [form, setForm] = useState<SaveGroupCategoryRequest>({
        title: "",
        description: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (key: keyof SaveGroupCategoryRequest, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.description.trim()) {
            showAlert("Please enter both title and description", "warning");
            return;
        }

        try {
            setLoading(true);
            const res = await saveGroupCategoryApi(form);
            showAlert(res.message, "success");
            router.back(); // Go back after saving
        } catch (err: any) {
            if (err?.message) {
                showAlert(err.message, "error");
            } else {
                showAlert("An error occurred. Please try again.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
            <CustomText className="text-3xl font-bold text-center text-black dark:text-white mb-8">
                Add Category
            </CustomText>

            {/* Title */}
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                placeholder="Category Title"
                placeholderTextColor="#888"
                value={form.title}
                onChangeText={(text) => handleChange("title", text)}
            />

            {/* Description */}
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-6 text-black dark:text-white"
                placeholder="Category Description"
                placeholderTextColor="#888"
                multiline
                value={form.description}
                onChangeText={(text) => handleChange("description", text)}
            />

            <TouchableOpacity
                onPress={handleSave}
                className={`py-3 rounded-lg ${loading ? "bg-gray-400" : "bg-green-700"}`}
                disabled={loading}
            >
                <Text className="text-white text-center font-semibold">
                    {loading ? "Saving..." : "Save Category"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.back()}
                className="mt-4"
            >
                <CustomText className="text-center text-gray-600 dark:text-gray-400">
                    Cancel
                </CustomText>
            </TouchableOpacity>
        </View>
    );
};

export default SaveGroupCategory;
