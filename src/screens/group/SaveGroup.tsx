import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAlert } from "@/src/context/alertContext";
import { saveGroupApi } from "@/src/api/group/group";
import { SaveGroupRequest } from "@/src/interfaces/group";
import CustomText from "@/src/components/common/CustomText";

const SaveGroupScreen = () => {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [form, setForm] = useState<SaveGroupRequest>({
        title: "",
        description: "",
        category_id: 0,
        icon_host_type: "LOCAL", // default
        icon_name: "",
        background_image_host_type: "LOCAL", // default
        background_image_name: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (key: keyof SaveGroupRequest, value: any) => {
        setForm({ ...form, [key]: value });
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.category_id) {
            showAlert("Title and Category are required", "warning");
            return;
        }

        try {
            setLoading(true);
            const res = await saveGroupApi(form);
            showAlert(res.message, "success");
            router.back();
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
        <ScrollView className="flex-1 px-6 bg-white dark:bg-black">
            <View className="flex-1 justify-center py-8">
                <CustomText className="text-3xl font-bold text-center text-black dark:text-white mb-8">
                    Create Group
                </CustomText>

                {/* Title */}
                <TextInput
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                    placeholder="Group Title"
                    placeholderTextColor="#888"
                    value={form.title}
                    onChangeText={(text) => handleChange("title", text)}
                />

                {/* Description */}
                <TextInput
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                    placeholder="Description (optional)"
                    placeholderTextColor="#888"
                    value={form.description}
                    multiline
                    onChangeText={(text) => handleChange("description", text)}
                />

                {/* Category ID */}
                <TextInput
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                    placeholder="Category ID"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={form.category_id ? String(form.category_id) : ""}
                    onChangeText={(text) => handleChange("category_id", Number(text))}
                />

                {/* Icon Name */}
                <TextInput
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                    placeholder="Icon Name (required if LOCAL)"
                    placeholderTextColor="#888"
                    value={form.icon_name || ""}
                    onChangeText={(text) => handleChange("icon_name", text)}
                />

                {/* Background Image Name */}
                <TextInput
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-6 text-black dark:text-white"
                    placeholder="Background Image Name (required if LOCAL)"
                    placeholderTextColor="#888"
                    value={form.background_image_name || ""}
                    onChangeText={(text) => handleChange("background_image_name", text)}
                />

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    className={`py-3 rounded-lg ${loading ? "bg-gray-400" : "bg-green-700"}`}
                    disabled={loading}
                >
                    <Text className="text-white text-center font-semibold">
                        {loading ? "Saving..." : "Save Group"}
                    </Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4"
                >
                    <CustomText className="text-center text-gray-600 dark:text-gray-400">
                        Cancel
                    </CustomText>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default SaveGroupScreen;
