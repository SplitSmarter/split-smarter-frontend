import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import {Href, useRouter} from 'expo-router';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppInput } from '@/src/components/common/AppInput';
import { AppButton } from '@/src/components/common/AppButton';
import { AppImage } from '@/src/components/common/AppImage';
import { systemStore } from '@/src/store/systemStore';
import { createCustomUserApi } from '@/src/api/user/customuser';
import { getRelationshipsApi } from '@/src/api/relations/relationship';
import { RelationshipDetails } from '@/src/api/dto/user/relation';

export default function AddCustomUserScreen() {
    const router = useRouter();
    const { defaults } = systemStore();

    // Form State
    const [name, setName] = useState('');
    const [selectedRelationId, setSelectedRelationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Relationship Data State
    const [relationships, setRelationships] = useState<RelationshipDetails[]>([]);
    const [fetchingRelations, setFetchingRelations] = useState(true);

    const addRelationshipRoute = "/(authenticated)/user/relationship/add" as Href;

    useEffect(() => {
        fetchRelations();
    }, []);

    const fetchRelations = async () => {
        try {
            const res = await getRelationshipsApi(); // Adjust API call name as per your actual file
            if (res?.data && Array.isArray(res.data)) {
                // Map the individual fields to ensure type safety and handle potential nulls
                const formattedRelations: RelationshipDetails[] = res.data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description ?? "", // Ensure it's a string if null
                    type: item.type,
                    icon: {
                        id: item.icon?.id ?? "",
                        name: item.icon?.name ?? "default_icon",
                        url: item.icon?.url ?? "",
                        extension: item.icon?.extension ?? "png"
                    },
                    created_at: item.created_at
                }));

                setRelationships(formattedRelations);

                // Optional: Auto-select the first relationship if none is selected
                if (formattedRelations.length > 0 && !selectedRelationId) {
                    setSelectedRelationId(formattedRelations[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch relationships", error);
        } finally {
            setFetchingRelations(false);
        }
    };

    const handleCreate = async () => {
        if (!name.trim() || !selectedRelationId) {
            Alert.alert("Missing Details", "Please provide a name and select a relationship.");
            return;
        }

        setLoading(true);
        try {
            const result = await createCustomUserApi({
                name: name.trim(),
                relationship_id: selectedRelationId,
                avatar_asset_id: defaults.defaultUserAvatarImage.id // Default avatar
            });

            if (result.data) {
                router.back();
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-bg-primary"
        >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-12 pb-4 flex-row items-center">
                    <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                        <Iconify icon="heroicons:chevron-left" size={24} color="rgb(var(--color-text-primary))" />
                    </Pressable>
                    <AppText variant="h3" className="font-bold text-text-primary ml-2">Add Person</AppText>
                </View>

                {/* Profile Preview */}
                <View className="items-center my-8">
                    <View className="relative">
                        <AppImage
                            id={defaults.defaultUserAvatarImage.id}
                            url={defaults.defaultUserAvatarImage.url}
                            size="xxl"
                            variant="circular"
                        />
                        <View className="absolute bottom-1 right-1 bg-bg-secondary p-2 rounded-full border-4 border-bg-primary">
                            <Iconify icon="solar:camera-add-bold" size={18} color="white" />
                        </View>
                    </View>
                    <AppText variant="body-large" className="mt-4 font-bold text-text-primary">
                        {name || "Enter Name"}
                    </AppText>
                </View>

                {/* Form Inputs */}
                <View className="px-6 gap-y-8">
                    <AppInput
                        label="Full Name"
                        placeholder="What should we call them?"
                        value={name}
                        onChangeText={setName}
                        renderLeftIcon={(color) => <Iconify icon="solar:user-bold" size={20} color={color} />}
                    />

                    {/* Relationship Selector */}
                    <View>
                        <View className="flex-row justify-between items-end mb-4 px-1">
                            <AppText variant="body-base" className="font-bold text-text-primary uppercase tracking-widest opacity-60">
                                Relationship
                            </AppText>
                            <Pressable onPress={() => router.push(addRelationshipRoute)}>
                                <AppText className="text-bg-secondary font-bold">+ Create New</AppText>
                            </Pressable>
                        </View>

                        {fetchingRelations ? (
                            <ActivityIndicator color="rgb(var(--color-bg-secondary))" />
                        ) : (
                            <View className="flex-row flex-wrap justify-between">
                                {relationships.map((rel) => (
                                    <Pressable
                                        key={rel.id}
                                        onPress={() => setSelectedRelationId(rel.id)}
                                        style={{ width: '48%' }}
                                        className={`mb-4 p-4 rounded-3xl border-2 flex-row items-center ${
                                            selectedRelationId === rel.id
                                                ? 'bg-bg-secondary border-bg-secondary'
                                                : 'bg-bg-primary-lighter border-bg-secondary-lighter/20'
                                        }`}
                                    >
                                        <AppImage id={rel.icon?.id} url={rel.icon?.url} size="sm" variant="circular" />
                                        <AppText
                                            className={`ml-3 font-semibold flex-1 ${selectedRelationId === rel.id ? 'text-white' : 'text-text-primary'}`}
                                            numberOfLines={1}
                                        >
                                            {rel.title}
                                        </AppText>
                                    </Pressable>
                                ))}

                                {/* Shortcut Card to add relationship if list is empty or for convenience */}
                                <Pressable
                                    onPress={() => router.push(addRelationshipRoute)}
                                    style={{ width: '48%' }}
                                    className="mb-4 p-4 rounded-3xl border-2 border-dashed border-bg-secondary-lighter/40 bg-transparent flex-row items-center"
                                >
                                    <View className="h-8 w-8 rounded-full bg-bg-secondary-lighter/20 items-center justify-center">
                                        <Iconify icon="solar:add-circle-bold" size={18} color="rgb(var(--color-bg-secondary))" />
                                    </View>
                                    <AppText className="ml-3 font-medium text-text-primary opacity-60">Other...</AppText>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="p-6 bg-bg-primary border-t border-bg-secondary-lighter/10">
                <AppButton
                    variant="primary"
                    size="lg"
                    loading={loading}
                    onPress={handleCreate}
                >
                    Create Custom User
                </AppButton>
            </View>
        </KeyboardAvoidingView>
    );
}