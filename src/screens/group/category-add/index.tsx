import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from "@/src/components/common/AppText";
import { AppInput } from "@/src/components/common/AppInput";
import { AppButton } from "@/src/components/common/AppButton";
import { AppImage } from "@/src/components/common/AppImage";
import { themeStore } from "@/src/store/themeStore";
import { COLORS } from '@/src/constants/colors';
import { systemStore } from "@/src/store/systemStore";
import { CreateGroupCategoryApi } from "@/src/api/group/categories";
import { useAlert } from "@/src/context/alertContext";

export default function AddGroupCategoryScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const { defaults } = systemStore();
    const { showAlert } = useAlert();
    const router = useRouter();

    // Form State management
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Resolve system default group icon asset reference
    const defaultIcon = defaults.defaultGroupIconImage;

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)/user/group/add');
        }
    };

    const handleSave = async () => {
        if (isSaving) return;

        if (!name.trim()) {
            showAlert("Category name is required", "error");
            return;
        }

        if (!defaultIcon?.id) {
            showAlert("Default group icon configuration not found", "error");
            return;
        }

        setIsSaving(true);

        try {
            const response = await CreateGroupCategoryApi({
                title: name.trim(),
                description: description.trim(),
                icon_asset_id: defaultIcon.id,
            });

            if (response.data) {
                showAlert(response.message || "Group category created successfully", "success");

                router.navigate({
                    pathname: '/(authenticated)/user/group/add',
                    params: { newlyCreatedGroupCategory: JSON.stringify(response.data) }
                });
            } else {
                const errorMsg = response.message || "Failed to create group category";
                showAlert(errorMsg, "error");
            }
        } catch (err: any) {
            const fallbackMsg = "An unexpected error occurred. Please try again.";
            showAlert(err?.message || fallbackMsg, "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-bg-canvas" edges={['top']}>
            {/* Header Area */}
            <View className="px-6 pt-2 pb-4 flex-row items-center justify-between">
                <Pressable onPress={handleBack} className="p-2 rounded-full" disabled={isSaving}>
                    <Iconify icon="heroicons:chevron-left" size={24} color={colors.icon.primary} />
                </Pressable>
                <AppText variant="h4" className="font-bold text-text-primary">New Group Category</AppText>
                <View className="w-10" />
            </View>

            {/* FIXED: Replaced BottomSheetView wrapper with standard scrolling primitives */}
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Avatar Display Section */}
                <View className="items-center mb-8 mt-4">
                    <View className="relative">
                        <View className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-border-input">
                            <AppImage
                                url={defaultIcon?.url}
                                id={defaultIcon?.id}
                                size="lg"
                                variant="square"
                            />
                        </View>
                        <Pressable
                            className="absolute bottom-[-8] right-[-8] bg-bg-secondary p-2 rounded-full border-2 border-bg-canvas"
                            onPress={() => console.log("Image picker workflow placeholder")}
                        >
                            <Iconify icon="heroicons:pencil-square" size={14} color="white" />
                        </Pressable>
                    </View>
                    <AppText variant="caption-xs" className="mt-3 text-text-primary-lighter">Default Icon Selected</AppText>
                </View>

                {/* Input Layout Scope */}
                <View className="gap-y-6">
                    <AppInput
                        label="Name"
                        placeholder="Enter Name"
                        value={name}
                        onChangeText={setName}
                        required={true}
                    />
                    <AppInput
                        label="Description"
                        placeholder="Enter Description"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Metadata Context Sections */}
                <View className="mt-8 gap-y-4">
                    <SectionBox title="Suggestions" message="No Suggestions" />
                    <SectionBox title="Similar Categories" message="No similar categories found" />
                </View>

                {/* Form Submission Action */}
                <View className="mt-10">
                    <AppButton
                        variant="primary"
                        className="w-full h-14 rounded-2xl"
                        onPress={handleSave}
                        disabled={isSaving}
                        loading={isSaving}
                        loadingText="Saving..."
                    >
                        Save Category
                    </AppButton>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const SectionBox = ({ title, message }: { title: string; message: string }) => (
    <View className="p-4 rounded-3xl border bg-bg-canvas border-border-input">
        <AppText variant="body-base" className="font-bold mb-4 text-text-primary">{title}</AppText>
        <View className="items-center py-4">
            <AppText variant="caption-xs" className="text-text-primary-lighter italic text-center">{message}</AppText>
        </View>
    </View>
);