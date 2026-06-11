import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Iconify } from 'react-native-iconify';
import { AppText } from "@/src/components/common/AppText";
import { AppInput } from "@/src/components/common/AppInput";
import { AppButton } from "@/src/components/common/AppButton";
import { AppImage } from "@/src/components/common/AppImage";
import { themeStore } from "@/src/store/themeStore";
import { systemStore } from "@/src/store/systemStore";
import { CreateExpenseCategoryApi } from "@/src/api/expense/categories";
import {useAlert} from "@/src/context/alertContext";
import {ExpenseCategoryResponse} from "@/src/api/dto/expense/category";

interface AddCategoryFormProps {
    onBack: () => void;
    onSuccess?: (newCategory: ExpenseCategoryResponse) => void; // Added to refresh the list after creation
}

export const AddCategoryForm = ({ onBack, onSuccess }: AddCategoryFormProps) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const { defaults } = systemStore();
    const { showAlert } = useAlert();


    // State management
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Get default icon from system store
    const defaultIcon = defaults.defaultExpenseCategory?.asset;

    const handleSave = async () => {
        // 1. Prevent double-taps
        if (isSaving) return;

        // 2. Client-side Validation
        if (!name.trim()) {
            showAlert("Category name is required");
            return;
        }

        if (!defaultIcon?.id) {
            showAlert("Default icon not found");
            // Optional: use showAlert here if this is a critical system failure
            return;
        }

        setIsSaving(true);

        try {

            const response = await CreateExpenseCategoryApi({
                title: name.trim(),
                description: description.trim() || undefined,
                icon_asset_id: defaultIcon.id,
            });

            // 3. Handle Successful Business Logic
            if (response.data) {
                showAlert(response.message || "Category created successfully", "success");

                // Pass the actual new category data back to the parent
                if (onSuccess && response.data) {
                    onSuccess(response.data);
                }
                // Note: We don't call onBack() here because the parent will handle the closure
            }else {
                // 4. Handle Known API Errors (e.g., duplicate name)
                const errorMsg = response.message || "Failed to create category";
                showAlert(errorMsg, "error");
            }
        } catch (err: any) {
            // 5. Handle Critical Failures (Network down, Server 500, etc.)
            const fallbackMsg = "An unexpected error occurred. Please try again.";
            showAlert(err?.message || fallbackMsg, "error");
        } finally {
            // 6. Always clean up loading state
            setIsSaving(false);
        }
    };

    return (
        <View className="flex-1">
            {/* Header */}
            <View className="px-6 pt-2 pb-4">
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={onBack} className="p-2 rounded-full" disabled={isSaving}>
                        <Iconify icon="heroicons:chevron-left" size={24} color={isDark ? "#FFF" : "#000"} />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary">New Category</AppText>
                    <View className="w-10" />
                </View>
            </View>

            <BottomSheetScrollView
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Image Display from System Defaults */}
                <View className="items-center mb-8">
                    <View className="relative">
                        <View className={`w-24 h-24 rounded-3xl overflow-hidden border-2 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                            <AppImage
                                url={defaultIcon?.url}
                                id={defaultIcon?.id}
                                size="lg"
                                variant="square"
                            />
                        </View>
                        <Pressable
                            className="absolute bottom-[-8] right-[-8] bg-bg-secondary p-2 rounded-full border-2 border-white"
                            onPress={() => console.log("Image picker logic would go here")}
                        >
                            <Iconify icon="heroicons:pencil-square" size={14} color="white" />
                        </Pressable>
                    </View>
                    <AppText variant="caption-xs" className="mt-3 text-text-secondary">Default Icon Selected</AppText>
                </View>

                {/* Form Fields */}
                <View className="gap-y-6">
                    <AppInput
                        label="Name"
                        placeholder="Enter Name"
                        value={name}
                        onChangeText={(val) => {
                            setName(val);
                        }}
                        required={true}
                    />
                    <AppInput
                        label="Description"
                        placeholder="Enter Description"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Suggestions & Similar Sections */}
                <View className="mt-8 gap-y-4">
                    <SectionBox title="Suggestions" message="No Suggestions" isDark={isDark} />
                    <SectionBox title="Similar Categories" message="No similar categories found" isDark={isDark} />
                </View>

                {/* Save Button */}
                <View className="mt-10">
                    <AppButton
                        variant="primary"
                        className="w-full h-14 rounded-2xl"
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <ActivityIndicator color="white" /> : "Save Category"}
                    </AppButton>
                </View>
            </BottomSheetScrollView>
        </View>
    );
};

const SectionBox = ({ title, message, isDark }: { title: string, message: string, isDark: boolean }) => (
    <View className={`p-4 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
        <AppText variant="body-base" className="font-bold mb-4 text-text-primary">{title}</AppText>
        <View className="items-center py-4">
            <AppText variant="caption-xs" className="text-text-secondary italic text-center">{message}</AppText>
        </View>
    </View>
);