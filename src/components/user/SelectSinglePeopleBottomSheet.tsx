import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
    Modal,
    View,
    Pressable,
    ActivityIndicator,
    Dimensions,
    FlatList,
    InteractionManager
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import { AppText } from "@/src/components/common/AppText";
import { AppInput } from "@/src/components/common/AppInput";
import { AppImage } from "@/src/components/common/AppImage";
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from "@/src/constants/colors";
import { RelationDetails } from "@/src/api/dto/user/relation";
import { GetRelationsApi } from "@/src/api/relations/relation";
import { SearchUsersApi } from "@/src/api/user/user";
import { UserSearchResponse } from "@/src/api/dto/user/user";
import { RelationWithUserType } from "@/src/api/dto/constants";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SelectSinglePeopleBottomSheetProps {
    visible: boolean;
    selectedId?: number;
    selectedType?: RelationWithUserType;
    onClose: () => void;
    onSelect: (userId: number, userType: RelationWithUserType, relations: RelationDetails[], globalUsers: UserSearchResponse[]) => void;
}

export const SelectSinglePeopleBottomSheet = ({
                                                  visible,
                                                  selectedId,
                                                  selectedType,
                                                  onClose,
                                                  onSelect
                                              }: SelectSinglePeopleBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [relations, setRelations] = useState<RelationDetails[]>([]);
    const [globalResults, setGlobalResults] = useState<UserSearchResponse[]>([]);
    const [loadingRelations, setLoadingRelations] = useState(false);
    const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

    // Prevents JS heavy tasks from blocking the native Modal opening slide animation
    const [isSheetReady, setIsSheetReady] = useState(false);

    useEffect(() => {
        if (visible) {
            InteractionManager.runAfterInteractions(() => {
                setIsSheetReady(true);
                fetchRelations();
            });
        } else {
            // 👈 FIX: Flushing local state arrays entirely to eliminate stale render caches
            setSearch('');
            setRelations([]);
            setGlobalResults([]);
            setIsSheetReady(false);
        }
    }, [visible]);

    const fetchRelations = async () => {
        setLoadingRelations(true);
        try {
            const response = await GetRelationsApi({ limit: 50 });
            if (response.data) setRelations(response.data);
        } catch (error) {
            console.error("Error fetching local relations:", error);
        } finally {
            setLoadingRelations(false);
        }
    };

    // Global Network User Search Debounce
    useEffect(() => {
        if (!search.trim()) {
            setGlobalResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearchingGlobal(true);
            try {
                const res = await SearchUsersApi({ q: search });
                if (res.data) setGlobalResults(res.data);
            } catch (error) {
                console.error("Global search error:", error);
            } finally {
                setIsSearchingGlobal(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const filteredRelations = useMemo(() => {
        if (!search.trim()) return relations;
        return relations.filter(r => r.with_user.name.toLowerCase().includes(search.toLowerCase()));
    }, [relations, search]);

    const handleSelectUser = useCallback((userId: number, userType: RelationWithUserType) => {
        onSelect(userId, userType, relations, globalResults);
        onClose();
    }, [onSelect, relations, globalResults, onClose]);

    const handleAddNewUser = () => {
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/user/add');
        }, 200);
    };

    // Build unified combined item arrays for seamless rendering in FlatList
    const combinedListData = useMemo(() => {
        if (!isSheetReady) return [];

        const list: Array<{ type: 'rel' | 'gl'; key: string; data: any }> = [];

        // 1. Map local contact network matches
        filteredRelations.forEach(item => {
            list.push({
                type: 'rel',
                key: `rel-${item.with_user.user_type}-${item.with_user.id}`,
                data: item.with_user
            });
        });

        // 2. Map global network query results if search is active
        if (search.trim().length > 0) {
            globalResults.forEach(user => {
                const globalUserType = RelationWithUserType.USER;
                const matchesLocal = relations.some(
                    r => r.with_user.id === user.id && r.with_user.user_type === globalUserType
                );
                if (!matchesLocal) {
                    list.push({
                        type: 'gl',
                        key: `gl-${globalUserType}-${user.id}`,
                        data: { ...user, user_type: globalUserType }
                    });
                }
            });
        }

        return list;
    }, [isSheetReady, filteredRelations, globalResults, search, relations]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                {/* Backdrop hit area dismiss zone */}
                <Pressable className="absolute inset-0" onPress={onClose} />

                <View
                    style={{ height: SCREEN_HEIGHT * 0.85 }}
                    className={`rounded-t-[40px] overflow-hidden flex-col ${isDark ? 'bg-[#121212]' : 'bg-[#F8F8F8]'}`}
                >
                    {/* Component Header Block */}
                    <View className="flex-row items-center justify-between py-4 px-6 border-b border-gray-500/10">
                        <Pressable onPress={onClose} className="p-2 rounded-full">
                            <Iconify icon="heroicons:chevron-left" size={24} color={isDark ? "#FFF" : "#000"} />
                        </Pressable>
                        <AppText variant="h4" className="font-bold text-text-primary text-center">
                            Select Person
                        </AppText>
                        <Pressable onPress={handleAddNewUser} className="p-2 rounded-full">
                            <Iconify icon="heroicons:user-plus" size={24} color={COLORS.icon_primary_darker_light} />
                        </Pressable>
                    </View>

                    {/* Content Frame Layout */}
                    <View className="flex-1 px-4 pt-4">
                        <View className="mb-4">
                            <AppInput
                                placeholder="Search name, email, or phone..."
                                value={search}
                                onChangeText={setSearch}
                                renderLeftIcon={(c) => <Iconify icon="heroicons:magnifying-glass" size={20} color={c} />}
                                renderRightIcon={() => isSearchingGlobal ? <ActivityIndicator size="small" color={COLORS.icon_primary_darker_light} /> : null}
                            />
                        </View>

                        {/* 👈 FIX: Loading state now registers accurately on empty component lists */}
                        {loadingRelations && combinedListData.length === 0 ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#2D6A4F" />
                            </View>
                        ) : (
                            <FlatList
                                data={combinedListData}
                                keyExtractor={(item) => item.key}
                                initialNumToRender={10}
                                maxToRenderPerBatch={10}
                                windowSize={5}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 40 }}
                                renderItem={({ item }) => {
                                    const user = item.data;
                                    const isSelected = selectedId === user.id && selectedType === user.user_type;
                                    const subtext = item.type === 'rel' ? user.user_type : "Not in your network";

                                    return (
                                        <UserRowItem
                                            user={user}
                                            isSelected={isSelected}
                                            subtext={subtext}
                                            onPress={handleSelectUser}
                                        />
                                    );
                                }}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Extracted, memoized individual list item row component
const UserRowItem = React.memo(({ user, isSelected, onPress, subtext }: any) => {
    return (
        <Pressable
            onPress={() => onPress(user.id, user.user_type)}
            className={`flex-row items-center p-3 rounded-2xl mb-2 ${
                isSelected
                    ? 'bg-bg-secondary/10 border border-bg-secondary/30'
                    : 'bg-white dark:bg-zinc-900 border border-transparent'
            }`}
        >
            <AppImage url={user.avatar?.url} size="sm" variant="circular" />
            <View className="flex-1 ml-3">
                <AppText className="font-semibold text-text-primary">{user.name}</AppText>
                <AppText variant="caption-xs" className="text-text-secondary opacity-60">{subtext}</AppText>
            </View>
            {isSelected ? (
                <Iconify icon="heroicons:check-circle-solid" size={24} color={COLORS.icon_primary_darker_light} />
            ) : (
                <Iconify icon="heroicons:check-circle" size={24} color={COLORS.icon_secondary_light} />
            )}
        </Pressable>
    );
}, (prevProps, nextProps) => {
    return prevProps.isSelected === nextProps.isSelected &&
        prevProps.user.id === nextProps.user.id &&
        prevProps.user.name === nextProps.user.name &&
        prevProps.user.avatar?.url === nextProps.user.avatar?.url &&
        prevProps.subtext === nextProps.subtext;
});

UserRowItem.displayName = 'UserRowItem';
SelectSinglePeopleBottomSheet.displayName = 'SelectSinglePeopleBottomSheet';