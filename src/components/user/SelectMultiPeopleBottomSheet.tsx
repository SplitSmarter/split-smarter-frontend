import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
    Modal,
    View,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    FlatList
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import { AppText } from "@/src/components/common/AppText";
import { AppInput } from "@/src/components/common/AppInput";
import { AppImage } from "@/src/components/common/AppImage";
import { AppButton } from "@/src/components/common/AppButton";
import { themeStore } from '@/src/store/themeStore';
import { userStore } from '@/src/store/userStore';
import { COLORS } from "@/src/constants/colors";
import { RelationDetails } from "@/src/api/dto/user/relation";
import { GetRelationsApi } from "@/src/api/relations/relation";
import { SearchUsersApi } from "@/src/api/user/user";
import { UserSearchResponse } from "@/src/api/dto/user/user";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SelectedUserEntity {
    id: number;
    name: string;
    user_type: 'USER' | 'CUSTOM';
    avatar?: { url?: string } | null;
}

interface SelectMultiPeopleBottomSheetProps {
    visible: boolean;
    initialSelectedUsers?: SelectedUserEntity[];
    onClose: () => void;
    onConfirmed: (selectedUsers: SelectedUserEntity[], relations: RelationDetails[], globalUsers: UserSearchResponse[]) => void;
}

export const SelectMultiPeopleBottomSheet = ({
                                                 visible,
                                                 initialSelectedUsers = [],
                                                 onClose,
                                                 onConfirmed
                                             }: SelectMultiPeopleBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const router = useRouter();

    // UPDATED: Added target profile selection tracking hook
    const currentUser = userStore((state) => state.user);

    const [search, setSearch] = useState('');
    const [localSelectedUsers, setLocalSelectedUsers] = useState<SelectedUserEntity[]>(initialSelectedUsers);
    const [relations, setRelations] = useState<RelationDetails[]>([]);
    const [globalResults, setGlobalResults] = useState<UserSearchResponse[]>([]);
    const [loadingRelations, setLoadingRelations] = useState(false);
    const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchRelations();
            setLocalSelectedUsers(initialSelectedUsers);
        } else {
            setSearch('');
            setGlobalResults([]);
        }
    }, [visible, initialSelectedUsers]);

    const fetchRelations = async () => {
        setLoadingRelations(true);
        const response = await GetRelationsApi({ limit: 50 });
        if (response.data) setRelations(response.data);
        console.log("relations from api: ", response.data);
        setLoadingRelations(false);
    };

    useEffect(() => {
        if (!search.trim()) {
            setGlobalResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearchingGlobal(true);
            const res = await SearchUsersApi({ q: search });
            if (res.data) setGlobalResults(res.data);
            setIsSearchingGlobal(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const isUserChecked = (id: number, type: string) => {
        return localSelectedUsers.some(u => u.id === id && u.user_type === type);
    };

    const toggleUser = (user: SelectedUserEntity) => {
        setLocalSelectedUsers(prev => {
            const exists = prev.some(u => u.id === user.id && u.user_type === user.user_type);
            if (exists) {
                return prev.filter(u => !(u.id === user.id && u.user_type === user.user_type));
            } else {
                return [...prev, { id: user.id, name: user.name, user_type: user.user_type, avatar: user.avatar }];
            }
        });
    };

    const filteredRelations = useMemo(() => {
        if (!search.trim()) return relations;
        return relations.filter(r => r.with_user.name.toLowerCase().includes(search.toLowerCase()));
    }, [relations, search]);

    const computedListItems = useMemo(() => {
        const structuralItems: Array<{ id: string; rawData: SelectedUserEntity; subtext: string }> = [];

        filteredRelations.forEach(item => {
            if (item.with_user.user_type === 'CUSTOM') return;

            const isAlreadySelected = localSelectedUsers.some(
                u => u.id === item.with_user.id && u.user_type === item.with_user.user_type
            );

            if (!isAlreadySelected) {
                // UPDATED: Check identity matches logged in device state profile
                const isMe = currentUser?.id === item.with_user.id && item.with_user.user_type === 'USER';

                structuralItems.push({
                    id: `multi-rel-${item.with_user.id}-${item.with_user.user_type}`,
                    rawData: item.with_user as any,
                    subtext: isMe ? "You" : item.with_user.user_type
                });
            }
        });

        if (search.trim().length > 0) {
            globalResults.forEach(user => {
                const fallbackType = (user.user_type || 'USER') as 'USER' | 'CUSTOM';

                if (fallbackType === 'CUSTOM') return;

                const isAlreadySelected = localSelectedUsers.some(
                    u => u.id === user.id && u.user_type === fallbackType
                );
                const alreadyInRelations = relations.some(
                    r => r.with_user.id === user.id && r.with_user.user_type === fallbackType
                );

                if (!isAlreadySelected && !alreadyInRelations) {
                    // UPDATED: Standard validation mapping logic applied to search fallbacks
                    const isMe = currentUser?.id === user.id && fallbackType === 'USER';

                    structuralItems.push({
                        id: `multi-gl-${user.id}-${fallbackType}`,
                        rawData: {
                            id: user.id,
                            name: user.name,
                            user_type: fallbackType,
                            avatar: user.avatar
                        },
                        subtext: isMe ? "You" : "Not in your network"
                    });
                }
            });
        }

        return structuralItems;
    }, [filteredRelations, globalResults, search, relations, localSelectedUsers, currentUser]);

    const handleConfirmSelection = () => {
        onConfirmed(localSelectedUsers, relations, globalResults);
        onClose();
    };

    const handleAddNewUser = () => {
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/user/add');
        }, 200);
    };

    const hasSelection = localSelectedUsers.length > 0;

    const renderRowItem = useCallback(({ item }: { item: typeof computedListItems[0] }) => (
        <UserMultiRowItem
            user={item.rawData}
            isSelected={isUserChecked(item.rawData.id, item.rawData.user_type)}
            onPress={() => toggleUser(item.rawData)}
            subtext={item.subtext}
        />
    ), [localSelectedUsers]);

    const renderListFooter = useCallback(() => (
        <View className="mt-4 mb-8">
            {hasSelection ? (
                <AppButton variant="primary" onPress={handleConfirmSelection}>
                    Done ({localSelectedUsers.length})
                </AppButton>
            ) : (
                <AppButton variant="secondary" onPress={onClose}>Cancel</AppButton>
            )}
        </View>
    ), [hasSelection, localSelectedUsers, onClose, handleConfirmSelection]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                <Pressable className="absolute inset-0" onPress={onClose} />

                <View
                    style={{ height: SCREEN_HEIGHT * 0.85 }}
                    className={`rounded-t-[40px] overflow-hidden flex-col ${isDark ? 'bg-[#121212]' : 'bg-[#F8F9FA]'}`}
                >
                    <View className="flex-row items-center justify-between py-4 px-6 border-b border-gray-500/10">
                        <Pressable onPress={onClose} className="p-2">
                            <Iconify icon="heroicons:chevron-left" size={24} color={isDark ? "#FFF" : "#000"} />
                        </Pressable>
                        <AppText variant="h4" className="font-bold text-text-primary text-center">Select People</AppText>
                        <Pressable onPress={handleAddNewUser} className="p-2">
                            <Iconify icon="heroicons:user-plus" size={24} color={COLORS.icon_primary_darker_light} />
                        </Pressable>
                    </View>

                    <View className="flex-1 px-4 pt-4">
                        {/* Selected Horizontal Carousels */}
                        {hasSelection && (
                            <View className="mb-4 px-1">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {localSelectedUsers.map(user => (
                                        <View key={`multi-sel-${user.id}-${user.user_type}`} className="mr-4 items-center">
                                            <View className="relative">
                                                <AppImage url={user.avatar?.url} size="md" variant="circular" />
                                                <Pressable onPress={() => toggleUser(user)} className="absolute -top-1 -right-1 bg-red-500 rounded-full border-2 border-bg-primary">
                                                    <Iconify icon="heroicons:x-mark" size={12} color="white" />
                                                </Pressable>
                                            </View>
                                            <AppText variant="caption-xs" className="mt-1 font-medium text-text-primary">
                                                {/* UPDATED: Displays "You" in the carousel selection tracking loop */}
                                                {currentUser?.id === user.id && user.user_type === 'USER' ? "You" : user.name.split(' ')[0]}
                                            </AppText>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <AppInput
                            placeholder="Search name, email, or phone..."
                            value={search}
                            onChangeText={setSearch}
                            renderLeftIcon={(c) => <Iconify icon="heroicons:magnifying-glass" size={20} color={c} />}
                            renderRightIcon={() => isSearchingGlobal ? <ActivityIndicator size="small" color={COLORS.icon_primary_darker_light} /> : null}
                        />

                        <FlatList
                            data={computedListItems}
                            keyExtractor={(item) => item.id}
                            renderItem={renderRowItem}
                            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
                            ListFooterComponent={renderListFooter}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

SelectMultiPeopleBottomSheet.displayName = 'SelectMultiPeopleBottomSheet';

const UserMultiRowItem = React.memo(({ user, isSelected, onPress, subtext }: { user: SelectedUserEntity; isSelected: boolean; onPress: () => void; subtext: string }) => (
    <Pressable
        onPress={onPress}
        className={`flex-row items-center p-3 rounded-2xl mb-2 ${
            isSelected
                ? 'bg-bg-secondary/10 border border-bg-secondary/30'
                : 'bg-white dark:bg-zinc-900 border border-transparent'
        }`}
    >
        <AppImage url={user.avatar?.url} size="sm" variant="circular" />
        <View className="flex-1 ml-3">
            <AppText className="font-semibold text-text-primary">{user.name}</AppText>
            {/* UPDATED: Custom styling text weight rule applied if identity string matches "You" */}
            <AppText
                variant="caption-xs"
                className={`text-text-secondary ${subtext === 'You' ? 'text-bg-secondary font-bold opacity-100' : 'opacity-60'}`}
            >
                {subtext}
            </AppText>
        </View>
        {isSelected ? (
            <Iconify icon="heroicons:check-circle-solid" size={24} color={COLORS.icon_primary_darker_light} />
        ) : (
            <Iconify icon="heroicons:check-circle" size={24} color={COLORS.icon_secondary_light} />
        )}
    </Pressable>
));

UserMultiRowItem.displayName = 'UserMultiRowItem';