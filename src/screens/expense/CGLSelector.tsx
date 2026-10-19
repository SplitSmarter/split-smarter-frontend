import React, {useState, useEffect} from 'react';
import {View, Pressable} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {images} from "@/src/constants/images";
import {SelectExpenseCategoryBottomSheet} from "@/src/components/expense/SelectExpenseCategoryBottomSheet";
import {SelectGroupBottomSheet} from "@/src/components/user/SelectGroupBottomSheet";
import {SelectSavedPlaceBottomSheet} from "@/src/components/user/SelectSavedPlaceBottomSheet";
import {systemStore} from "@/src/store/systemStore";
import {useExpenseDraftStore} from "@/src/store/draft/expenseDraftStore";
import {GetExpenseCategoryByIdApi} from "@/src/api/expense/categories";
import {GetGroupByIdApi} from "@/src/api/group/group";
import {ExpenseCategoryResponse} from "@/src/api/dto/expense/category";
import {BaseGroupDetails, GroupDetails} from "@/src/api/dto/user/group";
import {GetUserPlaceByIdApi} from "@/src/api/user/place/location";
import {useLocationStore} from "@/src/store/locationStore";
import {DraftValidationErrorKey} from "@/src/interfaces/expense/draft_validation";
import { COLORS } from '@/src/constants/colors';
import { themeStore } from '@/src/store/themeStore';
import {useRegisterOverlayDismiss} from '@/src/hooks/useBackDismissStack';

export const CategoryGroupLocationSelector = () => {
    const {defaults} = systemStore();
    const draft = useExpenseDraftStore();
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    // Modal Visibility States
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [groupModalVisible, setGroupModalVisible] = useState(false);
    const [placeModalVisible, setPlaceModalVisible] = useState(false);

    useRegisterOverlayDismiss(categoryModalVisible, () => setCategoryModalVisible(false));
    useRegisterOverlayDismiss(groupModalVisible, () => setGroupModalVisible(false));
    useRegisterOverlayDismiss(placeModalVisible, () => setPlaceModalVisible(false));

    // Hydrated Entity Payload State
    const [fullCategory, setFullCategory] = useState<ExpenseCategoryResponse | null>(null);
    const [fullGroup, setFullGroup] = useState<BaseGroupDetails | GroupDetails | null>(null);

    const {tempLocationMode, tempSelectedMapPlaceId} = useLocationStore();

    const defaultCategory = defaults.defaultExpenseCategory;
    const resolvedCategoryId = draft.categoryId || defaultCategory?.id;
    const categoryIconUrl =
        fullCategory?.icon?.url ||
        (resolvedCategoryId === defaultCategory?.id ? defaultCategory?.asset?.url : undefined);
    const categoryLabel = fullCategory?.title || (defaultCategory?.id ? 'Category' : 'Select');

    // 1. Hydrate Category Information Profile (no spinner — show default/selected icon meanwhile)
    useEffect(() => {
        const hydrateCategory = async () => {
            const targetId = draft.categoryId || defaults.defaultExpenseCategory?.id;
            if (!targetId || fullCategory?.id === targetId) return;
            try {
                const response = await GetExpenseCategoryByIdApi(targetId);
                if (response.data) setFullCategory(response.data);
            } catch (err) {
                console.error("Failed to hydrate category payload:", err);
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
                const response = await GetGroupByIdApi(draft.groupId);
                if (response.data) setFullGroup(response.data);
            } catch (err) {
                console.error("Failed to hydrate group details data:", err);
            }
        };
        hydrateGroup();
    }, [draft.groupId]);

    // Re-open group picker after "Change Group" from mismatch warning
    useEffect(() => {
        if (!draft.requestOpenGroupPicker) return;
        setFullGroup(null);
        setGroupModalVisible(true);
        draft.consumeOpenGroupPickerRequest();
    }, [draft.requestOpenGroupPicker]);

    // 3. Apply one-shot map → expense location handoff (null = no pending overwrite)
    useEffect(() => {
        if (tempLocationMode == null) return;

        const hydratePlaceDetails = async () => {
            try {
                if (tempLocationMode === 'place' && tempSelectedMapPlaceId) {
                    const response = await GetUserPlaceByIdApi(tempSelectedMapPlaceId);
                    if (response.data) {
                        draft.setExpenseLocation({
                            id: String(response.data.id),
                            name: response.data.name,
                        });
                        draft.setExpenseLocationMode('place');
                    }
                } else if (tempLocationMode === 'current') {
                    draft.setExpenseLocationMode('current');
                } else if (tempLocationMode === 'none') {
                    draft.setExpenseLocationMode('none');
                    draft.setExpenseLocation(undefined);
                }
            } catch (err) {
                console.error(
                    'Failed hydrating specific map place coordinates details:',
                    err
                );
            } finally {
                useLocationStore.getState().clearTempLocationSelection();
            }
        };
        void hydratePlaceDetails();
    }, [tempLocationMode, tempSelectedMapPlaceId]);

    // 4. Resolve Location UI Layout dynamically against Zustand Engine values
    const locationLayout = (() => {
        const mode = draft.expenseLocationMode || 'none';
        switch (mode) {
            case 'current':
                return {source: images.CurrentLocation, label: "Current"};
            case 'place':
                return {source: images.SelectedLocation, label: draft.expenseLocation?.name || "Selected"};
            case 'none':
            default:
                return {source: images.NoLocation, label: "Add Loc"};
        }
    })();

    return (
        <View className="flex-row w-full justify-between py-4 items-start">

            {/* 1. Category View Slot */}
            <View className="flex-1 items-center justify-center">
                <AppText
                    variant="caption-xs"
                    className="text-text-primary-lighter text-center uppercase tracking-wide mb-2 px-1"
                    numberOfLines={1}
                >
                    Category
                </AppText>
                <Pressable onPress={() => setCategoryModalVisible(true)} className="mb-2">
                    <AppImageV2
                        id={
                            resolvedCategoryId != null
                                ? `cat-${resolvedCategoryId}`
                                : 'cat-default'
                        }
                        url={categoryIconUrl}
                        style={{width: 56, height: 56}}
                        className="rounded-full"
                        contentFit="cover"
                        fallbackComponent={
                            <EntityFallbackIcon kind="expenseCategory" size={24} color={colors.icon.primary}/>
                        }
                    />
                </Pressable>
                <AppText variant="body-xs" className="text-text-primary text-center font-bold px-1" numberOfLines={1}>
                    {categoryLabel}
                </AppText>
            </View>

            {/* 2. Group View Slot */}
            <View className="flex-1 items-center justify-center">
                <AppText
                    variant="caption-xs"
                    className="text-text-primary-lighter text-center uppercase tracking-wide mb-2 px-1"
                    numberOfLines={1}
                >
                    Group
                </AppText>
                <Pressable onPress={() => setGroupModalVisible(true)} className="mb-2">
                    <View className="h-14 w-14 overflow-hidden rounded-full">
                        <AppImageV2
                            id={`group-${fullGroup?.id ?? 'none'}`}
                            url={fullGroup?.icon?.url}
                            style={{width: '100%', height: '100%', borderRadius: 9999}}
                            contentFit="cover"
                            fallbackComponent={
                                <View
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: colors.bg.darker,
                                        borderColor: colors.status.border,
                                    }}
                                    className="items-center justify-center rounded-full border border-dashed"
                                >
                                    <EntityFallbackIcon kind="group" size={24} color={colors.icon.lighter}/>
                                </View>
                            }
                        />
                    </View>
                </Pressable>
                <AppText variant="body-xs" className="text-text-primary text-center font-bold px-1" numberOfLines={1}>
                    {fullGroup?.title || "No Group"}
                </AppText>
            </View>

            {/* 3. Location View Slot */}
            <View className="flex-1 items-center justify-center">
                <AppText
                    variant="caption-xs"
                    className="text-text-primary-lighter text-center uppercase tracking-wide mb-2 px-1"
                    numberOfLines={1}
                >
                    Location
                </AppText>
                <Pressable onPress={() => setPlaceModalVisible(true)} className="mb-2">
                    <AppImageV2
                        id={`loc-mode-${draft.expenseLocationMode || 'none'}`}
                        url={null}
                        source={locationLayout.source}
                        style={{width: 56, height: 56}}
                        className="rounded-full"
                        contentFit="cover"
                    />
                </Pressable>
                <AppText
                    variant="body-xs"
                    className={`text-center font-bold px-1 ${draft.expenseLocationMode === 'place' ? 'text-accent-sky' : 'text-text-primary'}`}
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
                    void draft.runIntegrityValidation(DraftValidationErrorKey.GROUP_MISMATCH);
                }}
            />

            <SelectSavedPlaceBottomSheet
                visible={placeModalVisible}
                selectedId={
                    draft.expenseLocationMode === 'place' && draft.expenseLocation?.id
                        ? Number(draft.expenseLocation.id)
                        : undefined
                }
                onClose={() => setPlaceModalVisible(false)}
                onSelect={(place) => {
                    if (place.id == null) return;
                    draft.setExpenseLocation({
                        id: String(place.id),
                        name: place.name,
                    });
                    draft.setExpenseLocationMode('place');
                    setPlaceModalVisible(false);
                }}
            />
        </View>
    );
};