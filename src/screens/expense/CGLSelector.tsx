import React, { useState, useEffect } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { images } from "@/src/constants/images";
import { SelectExpenseCategoryBottomSheet } from "@/src/components/expense/SelectExpenseCategoryBottomSheet";
import { SelectGroupBottomSheet } from "@/src/components/user/SelectGroupBottomSheet";
import { systemStore } from "@/src/store/systemStore";
import { useExpenseDraftStore } from "@/src/store/expenseDraftStore";
import { GetExpenseCategoryByIdApi } from "@/src/api/expense/categories";
import { GetGroupByIdApi } from "@/src/api/group/group";
import { ExpenseCategoryResponse } from "@/src/api/dto/expense/category";
import { GroupDetails } from "@/src/api/dto/user/group";
import { Iconify } from "react-native-iconify";
import { GetUserPlaceByIdApi } from "@/src/api/user/place/location";
import { useLocationStore } from "@/src/store/locationStore";

export const CategoryGroupLocationSelector = () => {
    const router = useRouter();
    const { defaults } = systemStore();
    const draft = useExpenseDraftStore();

    // Modal Visibility States
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [groupModalVisible, setGroupModalVisible] = useState(false);

    // Hydrated Entity Payload State
    const [fullCategory, setFullCategory] = useState<ExpenseCategoryResponse | null>(null);
    const [fullGroup, setFullGroup] = useState<GroupDetails | null>(null);

    // Request Indicators
    const [catLoading, setCatLoading] = useState(false);
    const [groupLoading, setGroupLoading] = useState(false);

    const { tempLocationMode, tempSelectedMapPlaceId } = useLocationStore();

    // 1. Hydrate Category Information Profile
    useEffect(() => {
        const hydrateCategory = async () => {
            const targetId = draft.categoryId || defaults.defaultExpenseCategory?.id;
            if (!targetId || fullCategory?.id === targetId) return;
            try {
                setCatLoading(true);
                const response = await GetExpenseCategoryByIdApi(targetId);
                if (response.data) setFullCategory(response.data);
            } catch (err) {
                console.error("Failed to hydrate category payload:", err);
            } finally {
                setCatLoading(false);
            }
        };
        hydrateCategory();
    }, [draft.categoryId, defaults.defaultExpenseCategory?.id]);

    // 2. Hydrate Split Group Context
    useEffect(() => {
        const hydrateGroup = async () => {
            if (!draft.groupId) {
                setFullGroup(null);
                return;
            }
            if (fullGroup?.id === draft.groupId) return;
            try {
                setGroupLoading(true);
                const response = await GetGroupByIdApi(draft.groupId);
                if (response.data) setFullGroup(response.data);
            } catch (err) {
                console.error("Failed to hydrate group details data:", err);
            } finally {
                setGroupLoading(false);
            }
        };
        hydrateGroup();
    }, [draft.groupId]);

    // 3. Hydrate Selection Map values to Draft Store (Cleaned of PlaceSource mapping)
    useEffect(() => {
        const hydratePlaceDetails = async () => {
            if (tempLocationMode === 'place' && tempSelectedMapPlaceId) {
                try {
                    const response = await GetUserPlaceByIdApi(tempSelectedMapPlaceId);
                    if (response.data) {
                        // 👈 FIXED: Pulled out source param mapping layer perfectly
                        draft.setExpenseLocation({
                            id: String(response.data.id),
                            name: response.data.name
                        });
                        draft.setExpenseLocationMode('place');
                    }
                } catch (err) {
                    console.error("Failed hydrating specific map place coordinates details:", err);
                }
            } else if (tempLocationMode && tempLocationMode !== 'place') {
                draft.setExpenseLocationMode(tempLocationMode);
                if (tempLocationMode === 'none') draft.setExpenseLocation(undefined);
            }
        };
        hydratePlaceDetails();
    }, [tempLocationMode, tempSelectedMapPlaceId]);

    // 4. Resolve Location UI Layout dynamically against Zustand Engine values
    const locationLayout = (() => {
        const mode = draft.expenseLocationMode || 'none';
        switch (mode) {
            case 'current':
                return { source: images.CurrentLocation, label: "Current" };
            case 'place':
                return { source: images.SelectedLocation, label: draft.expenseLocation?.name || "Selected" };
            case 'none':
            default:
                return { source: images.NoLocation, label: "Add Loc" };
        }
    })();

    return (
        <View className="flex-row w-full justify-between py-4 items-start">

            {/* 1. Category View Slot */}
            <View className="flex-1 items-center justify-center">
                <Pressable onPress={() => setCategoryModalVisible(true)} className="mb-2 relative">
                    <AppImageV2
                        id={fullCategory?.id ? `cat-${fullCategory.id}` : 'cat-default'}
                        url={fullCategory?.icon?.url || defaults.defaultExpenseCategory?.asset?.url}
                        style={{ width: 56, height: 56 }}
                        className="rounded-full"
                        contentFit="cover"
                        fallbackComponent={
                            <View style={{ width: 56, height: 56 }}
                                  className="bg-emerald-50 dark:bg-gray-800 rounded-full items-center justify-center border border-gray-200 dark:border-gray-700">
                                <Iconify icon="heroicons:tag" size={24} color="#059669" />
                            </View>
                        }
                    />
                    {catLoading && (
                        <View className="absolute inset-0 items-center justify-center bg-white/60 dark:bg-black/60 rounded-full">
                            <ActivityIndicator size="small" color="#059669" />
                        </View>
                    )}
                </Pressable>
                <AppText variant="body-xs" className="text-text-primary text-center font-bold px-1" numberOfLines={1}>
                    {fullCategory?.title || "Category"}
                </AppText>
            </View>

            {/* 2. Group View Slot */}
            <View className="flex-1 items-center justify-center">
                <Pressable onPress={() => setGroupModalVisible(true)} className="mb-2 relative">
                    {fullGroup?.icon?.url ? (
                        <AppImageV2
                            id={`group-${fullGroup.id}`}
                            url={fullGroup.icon.url}
                            style={{ width: 56, height: 56 }}
                            className="rounded-full"
                            contentFit="cover"
                        />
                    ) : (
                        <View style={{ width: 56, height: 56 }}
                              className="rounded-full bg-gray-50 dark:bg-gray-900 items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                            <Iconify icon="heroicons:users" size={24} color="#9CA3AF" />
                        </View>
                    )}
                    {groupLoading && (
                        <View className="absolute inset-0 items-center justify-center bg-white/60 dark:bg-black/60 rounded-full">
                            <ActivityIndicator size="small" color="#059669" />
                        </View>
                    )}
                </Pressable>
                <AppText variant="body-xs" className="text-text-primary text-center font-bold px-1" numberOfLines={1}>
                    {fullGroup?.title || "No Group"}
                </AppText>
            </View>

            {/* 3. Location View Slot */}
            <View className="flex-1 items-center justify-center">
                <Pressable onPress={() => router.push('/(authenticated)/map/select')} className="mb-2">
                    <AppImageV2
                        id={`loc-mode-${draft.expenseLocationMode || 'none'}`}
                        url={null}
                        source={locationLayout.source}
                        style={{ width: 56, height: 56 }}
                        className="rounded-full"
                        contentFit="cover"
                    />
                </Pressable>
                <AppText
                    variant="body-xs"
                    className={`text-center font-bold px-1 ${draft.expenseLocationMode === 'place' ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-primary'}`}
                    numberOfLines={1}
                >
                    {locationLayout.label}
                </AppText>
            </View>

            {/* Bottom Sheets overlays management */}
            <SelectExpenseCategoryBottomSheet
                visible={categoryModalVisible}
                selectedId={fullCategory?.id}
                onClose={() => setCategoryModalVisible(false)}
                onSelect={(cat) => {
                    setFullCategory(cat);
                    draft.setCategoryId(cat.id);
                    setCategoryModalVisible(false);
                }}
            />

            <SelectGroupBottomSheet
                visible={groupModalVisible}
                selectedId={fullGroup?.id}
                onClose={() => setGroupModalVisible(false)}
                onSelect={(group) => {
                    setFullGroup(group);
                    draft.setGroupId(group.id);
                    setGroupModalVisible(false);
                }}
            />
        </View>
    );
};