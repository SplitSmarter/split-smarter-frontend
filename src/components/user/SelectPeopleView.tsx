import React, {useEffect, useMemo, useState} from 'react';
import {View, Pressable, ScrollView, ActivityIndicator} from 'react-native';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppInput} from "@/src/components/common/AppInput";
import {AppText} from "@/src/components/common/AppText";
import {AppImage} from "@/src/components/common/AppImage";
import {AppButton} from "@/src/components/common/AppButton";
import {COLORS} from "@/src/constants/colors";
import {RelationDetails} from "@/src/api/dto/user/relation";
import {GetRelationsApi} from "@/src/api/relations/relation";
import {SearchUsersApi} from "@/src/api/user/user";
import {UserSearchResponse} from "@/src/api/dto/user/user";

interface SelectPeopleViewProps {
    initialSelectedIds?: number[];
    onSelectionConfirmed: (selectedIds: number[], relations: RelationDetails[], globalUsers: UserSearchResponse[]) => void;
    onCancel: () => void;
}

export const SelectPeopleView = ({
                                     initialSelectedIds = [],
                                     onSelectionConfirmed,
                                     onCancel
                                 }: SelectPeopleViewProps) => {
    const [search, setSearch] = useState('');
    const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(initialSelectedIds);
    const [relations, setRelations] = useState<RelationDetails[]>([]);
    const [globalResults, setGlobalResults] = useState<UserSearchResponse[]>([]);
    const [loadingRelations, setLoadingRelations] = useState(false);
    const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

    useEffect(() => {
        const fetchRelations = async () => {
            setLoadingRelations(true);
            const response = await GetRelationsApi({limit: 50});
            if (response.data) setRelations(response.data);
            setLoadingRelations(false);
        };
        fetchRelations();
    }, []);

    // 3. Debounced Global Search Logic - Only runs if search is NOT empty
    useEffect(() => {
        if (!search.trim()) {
            setGlobalResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearchingGlobal(true);
            const res = await SearchUsersApi({q: search});
            if (res.data) setGlobalResults(res.data);
            setIsSearchingGlobal(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const toggleUser = (userId: number) => {
        setLocalSelectedIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    // Filter Logic: Show ALL relations if search is empty, otherwise filter them
    const filteredRelations = useMemo(() => {
        if (!search.trim()) return relations;
        return relations.filter(r =>
            r.with_user.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [relations, search]);

    const hasSelection = localSelectedIds.length > 0;
    const isSearching = search.trim().length > 0;

    return (
        <View className="flex-1">
            {/* --- Selected Ribbon (Always shows if selections exist) --- */}
            {hasSelection && (
                <View className="mb-4 px-1">
                    <AppText variant="caption-xs"
                             className="font-bold mb-2 text-text-secondary uppercase tracking-widest">Selected</AppText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {localSelectedIds.map(id => {
                            const user = relations.find(r => r.with_user.id === id)?.with_user ||
                                globalResults.find(u => u.id === id);
                            if (!user) return null;
                            return (
                                <View key={`selected-${id}`} className="mr-4 items-center">
                                    <View className="relative">
                                        <AppImage url={user.avatar?.url} size="md" variant="circular"/>
                                        <Pressable
                                            onPress={() => toggleUser(id)}
                                            className="absolute -top-1 -right-1 bg-red-500 rounded-full border-2 border-bg-primary"
                                        >
                                            <Iconify icon="heroicons:x-mark" size={12} color="white"/>
                                        </Pressable>
                                    </View>
                                    <AppText variant="caption-xs" className="mt-1 font-medium text-text-primary">
                                        {user.name.split(' ')[0]}
                                    </AppText>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            <AppInput
                placeholder="Search name, email, or phone..."
                value={search}
                onChangeText={setSearch}
                renderLeftIcon={(c) => <Iconify icon="heroicons:magnifying-glass" size={20} color={c}/>}
                renderRightIcon={() => isSearchingGlobal ?
                    <ActivityIndicator size="small" color={COLORS.icon_primary_darker_light}/> : null}
            />

            <BottomSheetScrollView className="mt-4" showsVerticalScrollIndicator={false}>
                {/* --- Section: Relations (Friends) --- */}
                {filteredRelations.length > 0 ? (
                    <View className="mb-6">
                        <AppText className="font-bold mb-3 text-text-primary px-1">
                            {isSearching ? 'People you know' : 'Friends'}
                        </AppText>
                        {filteredRelations.map(item => (
                            <UserListItem
                                key={`rel-${item.with_user.id}`}
                                user={item.with_user}
                                isSelected={localSelectedIds.includes(item.with_user.id)}
                                onPress={() => toggleUser(item.with_user.id)}
                                subtext={item.with_user.user_type}
                            />
                        ))}
                    </View>
                ) : !isSearching && !loadingRelations && (
                    /* Initial Empty State (No friends at all) */
                    <View className="items-center py-10">
                        <Iconify icon="heroicons:user-plus" size={40} color={COLORS.icon_secondary_light}/>
                        <AppText className="text-text-secondary mt-2">You haven&#39;t added any friends yet.</AppText>
                    </View>
                )}

                {/* --- Section: Global Results (Only if searching) --- */}
                {isSearching && globalResults.length > 0 && (
                    <View className="mb-6">
                        <AppText className="font-bold mb-3 text-text-primary px-1">Global Search</AppText>
                        {globalResults.map(user => {
                            if (relations.some(r => r.with_user.id === user.id)) return null;
                            return (
                                <UserListItem
                                    key={`global-${user.id}`}
                                    user={user}
                                    isSelected={localSelectedIds.includes(user.id)}
                                    onPress={() => toggleUser(user.id)}
                                    subtext="Not in your network"
                                />
                            );
                        })}
                    </View>
                )}

                {/* --- Search Empty State --- */}
                {isSearching && !isSearchingGlobal && filteredRelations.length === 0 && globalResults.length === 0 && (
                    <View className="items-center py-10">
                        <Iconify icon="heroicons:face-frown" size={40} color={COLORS.icon_secondary_light}/>
                        <AppText className="text-text-secondary mt-2">No results for &#34;{search}&#34;</AppText>
                    </View>
                )}

                {/* --- Action Buttons --- */}
                <View className="mt-4 mb-10">
                    {hasSelection ? (
                        <AppButton variant="primary"
                                   onPress={() => onSelectionConfirmed(localSelectedIds, relations, globalResults)}>
                            Done ({localSelectedIds.length})
                        </AppButton>
                    ) : (
                        <AppButton variant="secondary" onPress={onCancel}>Go Back</AppButton>
                    )}
                </View>
            </BottomSheetScrollView>
        </View>
    );
};

// Extracted for cleaner code
const UserListItem = ({user, isSelected, onPress, subtext}: any) => (
    <Pressable
        onPress={onPress}
        className={`flex-row items-center p-3 rounded-2xl mb-2 ${isSelected ? 'bg-bg-secondary/10 border border-bg-secondary/30' : 'bg-white dark:bg-zinc-900 border border-transparent'}`}
    >
        <AppImage url={user.avatar?.url} size="sm" variant="circular"/>
        <View className="flex-1 ml-3">
            <AppText className="font-semibold text-text-primary">{user.name}</AppText>
            <AppText variant="caption-xs" className="text-text-secondary opacity-60">{subtext}</AppText>
        </View>
        {isSelected ? (
            <Iconify icon="heroicons:check-circle-solid" size={24} color={COLORS.icon_primary_darker_light}/>
        ) : (
            <Iconify icon="heroicons:check-circle" size={24} color={COLORS.icon_secondary_light}/>
        )}
    </Pressable>
);