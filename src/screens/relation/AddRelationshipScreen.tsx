import React, { useState } from 'react';
import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppInput } from '@/src/components/common/AppInput';
import { AppButton } from '@/src/components/common/AppButton';
import { AppImage } from '@/src/components/common/AppImage';
import { systemStore } from '@/src/store/systemStore';
import { createRelationshipApi } from '@/src/api/relations/relationship'; // Adjust path

export default function AddRelationshipScreen() {
    const router = useRouter();
    const { defaults } = systemStore();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // Default the icon to the system placeholder until an image picker is integrated
    const [selectedIcon, setSelectedIcon] = useState(defaults.defaultRelationshipImage);

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert("Required", "Please enter a title for the relationship.");
            return;
        }

        setLoading(true);
        try {
            const result = await createRelationshipApi({
                title: title.trim(),
                description: description.trim(),
                icon_asset_id: selectedIcon.id
            });

            if (result.data) {
                router.back();
            }
        } catch (error: any) {
            console.log("Error creating relationship", error);
            Alert.alert("Error", error.message || "Failed to create relationship");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-bg-primary"
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Area */}
                <View className="px-6 pt-12 pb-6 flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-10 w-10 bg-bg-primary-lighter rounded-full items-center justify-center border border-bg-secondary-lighter/20"
                    >
                        <Iconify icon="heroicons:chevron-left" size={20} color="rgb(var(--color-text-primary))" />
                    </Pressable>
                    <AppText variant="h3" className="font-bold text-text-primary">New Relationship</AppText>
                    <View className="w-10" />
                </View>

                {/* Live Preview Card */}
                <View className="px-6 mb-8">
                    <AppText variant="body-xs" className="font-bold text-text-primary opacity-50 mb-4 tracking-[2px] uppercase">Preview</AppText>
                    <View className="bg-bg-primary-lighter p-6 rounded-[32px] border border-bg-secondary-lighter/20 shadow-xl items-center">
                        <View className="mb-4">
                            <AppImage
                                url={selectedIcon.url}
                                id={selectedIcon.id}
                                size="xl"
                                variant="circular"
                                borderEnabled
                                borderColor="rgb(var(--color-bg-secondary))"
                            />
                            <View className="absolute bottom-0 right-0 bg-bg-secondary p-1.5 rounded-full border-2 border-bg-primary-lighter">
                                <Iconify icon="solar:pen-bold" size={12} color="white" />
                            </View>
                        </View>
                        <AppText variant="h3" className="font-bold text-text-primary text-center">
                            {title || "Relationship Name"}
                        </AppText>
                        <AppText variant="body-small" className="text-text-primary opacity-60 text-center mt-1">
                            {description || "Add a short description..."}
                        </AppText>
                    </View>
                </View>

                {/* Form Section */}
                <View className="px-6 gap-y-6">
                    <View>
                        <AppText variant="body-xs" className="font-bold text-text-primary opacity-50 mb-3 tracking-[2px] uppercase ml-1">Identity</AppText>
                        <AppInput
                            label="Title"
                            placeholder="e.g. Roommate, Sibling, Partner"
                            value={title}
                            onChangeText={setTitle}
                            required
                            renderLeftIcon={(color) => <Iconify icon="solar:tag-bold" size={20} color={color} />}
                        />
                    </View>

                    <AppInput
                        label="Description"
                        placeholder="What defines this relationship?"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        renderLeftIcon={(color) => <Iconify icon="solar:notes-bold" size={20} color={color} />}
                    />

                    {/* Icon Selection Placeholder */}
                    <View>
                        <AppText variant="body-base" className="font-semibold text-text-primary mb-3 ml-1">Icon Style</AppText>
                        <View className="flex-row gap-x-4">
                            <Pressable className="h-16 w-16 rounded-2xl bg-bg-primary-lighter border-2 border-bg-secondary items-center justify-center shadow-sm">
                                <AppImage id={selectedIcon.id} url={selectedIcon.url} size="md" variant="rounded" />
                            </Pressable>
                            <Pressable className="h-16 w-16 rounded-2xl bg-bg-primary-darker/20 border border-dashed border-text-primary/20 items-center justify-center">
                                <Iconify icon="solar:gallery-add-bold" size={24} color="rgb(var(--color-text-primary))" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer Button */}
            <View className="px-6 py-6 bg-bg-primary border-t border-bg-secondary-lighter/10">
                <AppButton
                    variant="primary"
                    size="lg"
                    loading={loading}
                    onPress={handleCreate}
                    renderIcon={(color) => <Iconify icon="solar:check-read-bold" size={22} color={color} />}
                >
                    Create Relationship
                </AppButton>
            </View>
        </KeyboardAvoidingView>
    );
}