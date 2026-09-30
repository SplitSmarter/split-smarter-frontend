import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { AppImage } from "@/src/components/common/AppImage";
import { AppButton } from "@/src/components/common/AppButton";
import { systemStore } from "@/src/store/systemStore";
import { SelectGroupCategoryBottomSheet } from "@/src/components/user/SelectGroupCategoryBottomsheet";
import {SelectedUserEntity} from "@/src/components/user/SelectMultiPeopleBottomSheet";
import {GroupCategoryDetails} from "@/src/api/dto/user/addGroupCategoryRequest";

interface GroupFormProps {
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (desc: string) => void;
    selectedUsers: SelectedUserEntity[];
    loading: boolean;
    onOpenSelect: () => void;
    onSubmit: () => void;
    onCancel: () => void;
    onRemoveUser: (user: SelectedUserEntity) => void;
    selectedCategory: GroupCategoryDetails | null;
    setSelectedCategory: (category: GroupCategoryDetails | null) => void;
    showCategorySheet: boolean;
    setShowCategorySheet: (show: boolean) => void;
}

export const GroupForm = React.memo(({
                                         title,
                                         setTitle,
                                         description,
                                         setDescription,
                                         selectedUsers,
                                         loading,
                                         onOpenSelect,
                                         onSubmit,
                                         onCancel,
                                         onRemoveUser,
                                         selectedCategory,
                                         setSelectedCategory,
                                         showCategorySheet,
                                         setShowCategorySheet
                                     }: GroupFormProps) => {
    const { defaults } = systemStore();

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header Identity Display Banner */}
            <View className="relative mb-6 rounded-3xl overflow-hidden h-32 bg-zinc-200">
                <AppImage url={defaults.defaultGroupBackgroundImage.url} size="full" />
                <View className="absolute inset-0 bg-black/20 flex-row items-center px-4">
                    <View className="w-16 h-16 rounded-full border-2 border-white overflow-hidden shadow-sm">
                        <AppImage url={defaults.defaultGroupIconImage.url} size="full" />
                    </View>
                    <AppText variant="h4" className="text-white ml-3 font-bold">{title || "Group Name"}</AppText>
                </View>
            </View>

            {/* Main Form Fields */}
            <View className="gap-y-3 mb-6">
                <AppInput label="Title" placeholder="Goa Trip" value={title} onChangeText={setTitle} />
                <AppInput label="Description" placeholder="Trip details" value={description} onChangeText={setDescription} />

                {/* Controlled Category Field */}
                <View>
                    <AppText className="mb-2 text-text-primary">Category</AppText>
                    <Pressable
                        onPress={() => setShowCategorySheet(true)}
                        className="flex-row items-center justify-between py-3 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-xl overflow-hidden mr-3 bg-zinc-100 dark:bg-zinc-800">
                                <AppImage
                                    url={selectedCategory?.icon?.url || defaults.defaultGroupCategory.asset.url}
                                    size="full"
                                />
                            </View>
                            <AppText className="font-medium text-text-primary">
                                {selectedCategory?.title || "Select Category"}
                            </AppText>
                        </View>
                        <Iconify icon="heroicons:chevron-down" size={20} color="#666" />
                    </Pressable>
                </View>
            </View>

            {/* Members Section Carousel layout */}
            <View className="mb-8">
                <AppText variant="h4" className="mb-4 text-text-primary">Members</AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row items-center">
                        {/* UPDATED: Directly loops objects without extra nested state lookups */}
                        {selectedUsers.map((user) => (
                            <View key={`${user.id}-${user.user_type}`} className="items-center mr-4 w-16">
                                <View className="relative">
                                    <AppImage url={user.avatar?.url} size="md" variant="circular" />
                                    <Pressable
                                        onPress={() => onRemoveUser(user)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        className="absolute -top-1 -left-1 bg-emerald-600 rounded-full border-2 border-white"
                                    >
                                        <Iconify icon="heroicons:x-mark" size={12} color="black" />
                                    </Pressable>
                                </View>
                                <AppText variant="caption-xs" className="mt-1 text-center text-text-primary" numberOfLines={1}>
                                    {user.name?.split(' ')[0] || ''}
                                </AppText>
                            </View>
                        ))}

                        <Pressable onPress={onOpenSelect} className="items-center justify-center w-16">
                            <View className="w-12 h-12 rounded-full border border-dashed border-zinc-400 items-center justify-center">
                                <Iconify icon="heroicons:user-plus" size={24} color="#666" />
                            </View>
                            <AppText variant="caption-xs" className="mt-1 text-text-primary">More</AppText>
                        </Pressable>
                    </View>
                </ScrollView>
            </View>

            {/* Submission Layout CTA Blocks */}
            <View className="gap-y-3">
                <AppButton variant="primary" className="h-14 rounded-2xl bg-emerald-700 shadow-md" onPress={onSubmit} loading={loading}>
                    Save
                </AppButton>
                <AppButton variant="secondary" className="h-14 rounded-2xl" onPress={onCancel}>
                    Cancel
                </AppButton>
            </View>

            {/* Bottom Sheet Modal Integration Overlay */}
            <SelectGroupCategoryBottomSheet
                visible={showCategorySheet}
                selectedId={selectedCategory?.id}
                onClose={() => setShowCategorySheet(false)}
                onSelect={(category: GroupCategoryDetails) => {
                    setSelectedCategory(category);
                    setShowCategorySheet(false);
                }}
            />
        </ScrollView>
    );
});

GroupForm.displayName = "GroupForm";