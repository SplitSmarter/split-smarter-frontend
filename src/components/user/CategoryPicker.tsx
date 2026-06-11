import React, { useState, useEffect, useMemo } from 'react';
import { View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { AppImage } from "@/src/components/common/AppImage";
import { AppButton } from "@/src/components/common/AppButton";
import { GetGroupCategoriesApi, CreateGroupCategoryApi } from "@/src/api/group/categories";
import { GroupCategoryDetails } from "@/src/api/dto/user/group";
import { systemStore } from "@/src/store/systemStore";

enum PickerView { LIST, ADD }

export const CategoryPicker = ({ onSelect, selectedId, onBack }: any) => {
    const { defaults } = systemStore();
    const [view, setView] = useState<PickerView>(PickerView.LIST);
    const [categories, setCategories] = useState<GroupCategoryDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    // Add Category Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        const res = await GetGroupCategoriesApi();
        if (res.data) setCategories(res.data);
        setLoading(false);
    };

    useEffect(() => {
        if (view === PickerView.LIST) {
            fetchCategories();
        }
    }, [view]);

    const generatedPlaceholder = useMemo(() => {
        const name = newTitle.trim() || "this category";
        return `Track and split all ${name} related expenses`;
    }, [newTitle]);

    const handleCreateCategory = async () => {
        if (!newTitle.trim()) {
            Alert.alert("Error", "Please provide a title");
            return;
        }

        setSubmitting(true);
        const res = await CreateGroupCategoryApi({
            title: newTitle.trim(),
            // Fallback to the generated string if user didn't type a custom description
            description: newDesc.trim() || generatedPlaceholder,
            icon_asset_id: defaults.defaultGroupCategoryIconImage.id
        });

        if (res.data) {
            setNewTitle('');
            setNewDesc('');
            setView(PickerView.LIST);
        } else {
            Alert.alert("Conflict", res.message || "Failed to create category");
        }
        setSubmitting(false);
    };

    const filtered = useMemo(() =>
            categories.filter(c => c.title.toLowerCase().includes(search.toLowerCase())),
        [categories, search]);

    // --- VIEW: Add Category Form ---
    if (view === PickerView.ADD) {
        return (
            <View className="flex-1 px-4">
                <View className="items-center mb-8">
                    <View className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
                        <AppImage url={defaults.defaultGroupCategoryIconImage.url} size="full" />
                    </View>
                    <AppText variant="caption-xs" className="mt-2 text-zinc-500">Default Category Icon</AppText>
                </View>

                <View className="gap-y-4">
                    <AppInput
                        label="Title"
                        value={newTitle}
                        onChangeText={setNewTitle}
                        placeholder="e.g. Bachelor Party"
                    />
                    <AppInput
                        label="Description"
                        value={newDesc}
                        onChangeText={setNewDesc}
                        placeholder={generatedPlaceholder} // Show dynamic placeholder
                    />
                </View>

                <View className="mt-auto mb-8 pt-8 gap-y-3">
                    <AppButton
                        variant="primary"
                        className="bg-emerald-700 h-14 rounded-2xl shadow-md"
                        onPress={handleCreateCategory}
                        loading={submitting}
                    >
                        Save Category
                    </AppButton>
                    <AppButton
                        variant="secondary"
                        className="h-14 rounded-2xl"
                        onPress={() => setView(PickerView.LIST)}
                    >
                        Cancel
                    </AppButton>
                </View>
            </View>
        );
    }

    // --- VIEW: Category List ---
    return (
        <View className="flex-1 px-1">
            <AppInput
                placeholder="Search categories..."
                value={search}
                onChangeText={setSearch}
                renderLeftIcon={(c) => <Iconify icon="heroicons:magnifying-glass" size={20} color={c} />}
                className="bg-zinc-100 dark:bg-zinc-800 border-0 mb-4"
            />
            <View className="bg-zinc-50 dark:bg-zinc-900 rounded-[32px] p-6 min-h-[300px]">
                <AppText variant="h4" className="font-bold mb-6 text-text-primary">All Categories</AppText>
                {loading ? <ActivityIndicator color="#059669" size="large" className="my-10" /> : (
                    <View className="flex-row flex-wrap">
                        {filtered.map((cat) => (
                            <Pressable
                                key={cat.id}
                                onPress={() => onSelect(cat)}
                                className={`w-1/4 items-center mb-6 p-1 rounded-2xl ${selectedId === cat.id ? 'bg-emerald-100 dark:bg-emerald-900/30' : ''}`}
                            >
                                <View className="w-14 h-14 mb-2">
                                    <AppImage url={cat.icon.url} size="full" />
                                </View>
                                <AppText variant="caption-xs" className="text-center text-text-primary" numberOfLines={1}>
                                    {cat.title}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
            <View className="mt-8 mb-4 items-center gap-y-4">
                <AppButton
                    variant="primary"
                    className="bg-emerald-700 h-14 w-full rounded-2xl"
                    renderIcon={(c) => <Iconify icon="heroicons:squares-plus" size={20} color={c} />}
                    onPress={() => setView(PickerView.ADD)}
                >
                    Add New Category
                </AppButton>
                <Pressable onPress={onBack}><AppText className="text-zinc-500 font-medium">Go Back</AppText></Pressable>
            </View>
        </View>
    );
};