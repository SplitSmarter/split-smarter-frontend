import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
    Modal,
    View,
    Pressable,
    ActivityIndicator,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView, // 👈 IMPORTED
    Platform // 👈 IMPORTED
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import { AppText } from "@/src/components/common/AppText";
import { AppButton } from "@/src/components/common/AppButton";
import { AppImage } from "@/src/components/common/AppImage";
import { AppInput } from "@/src/components/common/AppInput";
import { themeStore } from '@/src/store/themeStore';
import { GetGroupCategoriesApi } from '@/src/api/group/categories';

import {GroupCategoryDetails} from "@/src/api/dto/user/addGroupCategoryRequest";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SelectGroupCategoryBottomSheetProps {
    visible: boolean;
    selectedId?: number;
    onClose: () => void;
    onSelect: (category: GroupCategoryDetails) => void;
}

export const SelectGroupCategoryBottomSheet = ({
                                                   visible,
                                                   onClose,
                                                   onSelect,
                                                   selectedId
                                               }: SelectGroupCategoryBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const router = useRouter();

    const [categories, setCategories] = useState<GroupCategoryDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (visible) {
            fetchCategories();
        } else {
            setSearchQuery('');
        }
    }, [visible]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await GetGroupCategoriesApi();
            if (response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Failed fetching group categories:", error);
        } finally { // 👈 FIXED: Cleaned up the broken label layout syntax anomaly
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddNewCategoryPress = () => {
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/group/category/add');
        }, 200);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                {/* Backdrop Click Layer */}
                <Pressable className="absolute inset-0" onPress={onClose} />

                {/* UPDATED: KeyboardAvoidingView injected directly as sheet structural root context wrapper */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="w-full"
                >
                    {/* Main Content Container Sheet */}
                    <View
                        style={{ height: SCREEN_HEIGHT * 0.80 }}
                        className={`rounded-t-[40px] overflow-hidden flex-col ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#FFFFFF]'}`}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between py-4 px-6 border-b border-gray-500/10">
                            <Pressable onPress={onClose} className="p-2 rounded-full">
                                <Iconify icon="heroicons:chevron-left" size={24} color={isDark ? "#FFF" : "#000"} />
                            </Pressable>
                            <AppText variant="h4" className="font-bold text-text-primary">Select Category</AppText>
                            <View className="w-10" />
                        </View>

                        {/* Content Core View Wrapper */}
                        <View className="flex-1 px-6 pt-4">
                            {/* Search Bar Wrapper */}
                            <View className="flex-row items-center justify-between mb-4">
                                <AppInput
                                    placeholder="Type to search"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    renderLeftIcon={(color) => (
                                        <Iconify icon="heroicons:magnifying-glass" size={20} color={color} />
                                    )}
                                />
                            </View>

                            {loading ? (
                                <View className="flex-1 justify-center">
                                    <ActivityIndicator size="large" color="#2D6A4F" />
                                </View>
                            ) : (
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: 40 }}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    <View className="bg-bg-primary-lighter rounded-3xl p-4 border border-bg-secondary-lighter">
                                        <AppText variant="body-base" className="font-bold mb-4 text-text-primary">
                                            All Categories
                                        </AppText>
                                        <View className="flex-row flex-wrap">
                                            {filteredCategories.map((item) => (
                                                <Pressable
                                                    key={item.id}
                                                    onPress={() => onSelect(item)}
                                                    className={`items-center w-1/4 mb-6 p-2 rounded-xl ${
                                                        item.id === selectedId ? 'bg-bg-secondary/10 border border-bg-secondary' : ''
                                                    }`}
                                                >
                                                    <View className="w-14 h-14 mb-2">
                                                        <AppImage
                                                            id={item.icon?.id}
                                                            url={item.icon?.url}
                                                            size="full"
                                                            backgroundColor="transparent"
                                                            variant="circular"
                                                        />
                                                    </View>
                                                    <AppText
                                                        variant="caption-xs"
                                                        className="text-center text-text-primary"
                                                        numberOfLines={1}
                                                    >
                                                        {item.title}
                                                    </AppText>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Add CTA */}
                                    <View className="items-center mt-6">
                                        <AppButton
                                            variant="primary"
                                            className="px-8 rounded-2xl h-14"
                                            onPress={handleAddNewCategoryPress}
                                            renderIcon={(color) => (
                                                <Iconify icon="heroicons:squares-plus" size={20} color={color} />
                                            )}
                                        >
                                            Add New Category
                                        </AppButton>
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

SelectGroupCategoryBottomSheet.displayName = 'SelectGroupCategoryBottomSheet';